import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Data Transfer Object for chat request
// Validates the input from the API endpoint
export class ChatRequestDto {
  @ApiProperty({
    description: 'The user enquiry or question',
    example: 'I am looking for a phone',
  })
  @IsString()
  @IsNotEmpty()
  query: string;
}
