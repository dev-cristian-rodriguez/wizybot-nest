import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

// Modules imports
import { ProductsModule } from '../products/products.module';
import { CurrencyModule } from '../currency/currency.module';
import { OpenAIModule } from '../openai/openai.module';

@Module({
  imports: [ProductsModule, CurrencyModule, OpenAIModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
