import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CurrencyService } from './currency.service';

// Currency module that provides currency conversion functionality
// Uses Open Exchange Rates API to fetch and convert between currencies
@Module({
  imports: [ConfigModule, HttpModule],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
