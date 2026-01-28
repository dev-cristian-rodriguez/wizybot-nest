import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({
    description: 'The final response from the chatbot',
    example: 'I found some phones for you. Here are 2 options: ...',
  })
  response: string;
}
