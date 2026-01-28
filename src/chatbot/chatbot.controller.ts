import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

// Controller for the chatbot API endpoint
// Handles HTTP requests and responses for the chatbot functionality
@ApiTags('chatbot')
@Controller('chat')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  // POST endpoint to send a query to the chatbot
  // Accepts a user enquiry and returns a chatbot response
  @Post()
  @ApiOperation({
    summary: 'Send a query to the chatbot',
    description:
      'Sends a user enquiry to the chatbot. The chatbot can search for products and convert currencies.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully received chatbot response',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request (e.g., empty query)',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal server error (e.g., API key missing, service unavailable)',
  })
  async chat(@Body() chatRequestDto: ChatRequestDto): Promise<ChatResponseDto> {
    try {
      // Process the query through the chatbot service
      const response = await this.chatbotService.processQuery(
        chatRequestDto.query,
      );

      return {
        response: response,
      };
    } catch (error) {
      // Handle different types of errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      // Check if it's a validation error (from DTO validation)
      if (errorMessage.includes('validation')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: errorMessage,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if it's an API configuration error
      if (
        errorMessage.includes('API key') ||
        errorMessage.includes('not configured')
      ) {
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Service configuration error. Please check API keys.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Generic error response
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An error occurred while processing your request.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
