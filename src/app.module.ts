import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatbotModule } from './chatbot/chatbot.module';
import configuration from './config/configuration';

// Root application module
// Imports configuration and chatbot modules

@Module({
  imports: [
    // Environment variables and configuration
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ChatbotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
