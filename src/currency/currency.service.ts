import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Interface for Open Exchange Rates API response
interface ExchangeRatesResponse {
  rates: Record<string, number>;
  base: string;
  timestamp: number;
}

// Service responsible for currency conversion using Open Exchange Rates API
// Handles fetching exchange rates and converting amounts between currencies
@Injectable()
export class CurrencyService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://openexchangerates.org/api';
  private exchangeRatesCache: Record<string, number> | null = null;
  private cacheTimestamp: number = 0;
  private readonly cacheTTL = 3600000; // 1 hour in milliseconds

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    // Get API key from configuration
    this.apiKey =
      this.configService.get<string>('app.openExchangeRatesApiKey') || '';

    if (!this.apiKey) {
      console.warn(
        'Open Exchange Rates API key not configured. Currency conversion will be unavailable.',
      );
    }
  }

  // Converts an amount from one currency to another
  // Fetches latest exchange rates if cache is expired or missing
  async convertCurrencies(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    if (!this.apiKey) {
      throw new Error('Open Exchange Rates API key is not configured');
    }

    // Normalize currency codes to uppercase
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    // Validate amount
    if (isNaN(amount) || amount < 0) {
      throw new Error('Invalid amount. Amount must be a positive number.');
    }

    // If same currency, return amount as-is
    if (from === to) {
      return amount;
    }

    // Get exchange rates (from cache or API)
    const rates = await this.getExchangeRates();

    // console.log(`Converting ${amount} ${from} to ${to}`);

    // Check if both currencies are available
    if (!rates[from]) {
      throw new Error(`Source currency '${from}' not found in exchange rates`);
    }
    if (!rates[to]) {
      throw new Error(`Target currency '${to}' not found in exchange rates`);
    }

    // Open Exchange Rates API returns rates relative to USD
    // To convert from any currency to any currency:
    // 1. Convert from source currency to USD
    // 2. Convert from USD to target currency
    const amountInUSD = from === 'USD' ? amount : amount / rates[from];
    const convertedAmount =
      to === 'USD' ? amountInUSD : amountInUSD * rates[to];

    const result = Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
    // console.log(`Currency conversion: ${amount} ${from} = ${result} ${to}`);

    return result;
  }

  // Fetches exchange rates from Open Exchange Rates API
  // Implements caching to reduce API calls (1 hour TTL)
  private async getExchangeRates(): Promise<Record<string, number>> {
    const now = Date.now();

    // Return cached rates if still valid
    if (this.exchangeRatesCache && now - this.cacheTimestamp < this.cacheTTL) {
      // console.log('Using cached exchange rates');
      return this.exchangeRatesCache;
    }

    // console.log('Fetching latest exchange rates from API');
    try {
      // Fetch latest exchange rates from API
      const response = await firstValueFrom(
        this.httpService.get<ExchangeRatesResponse>(
          `${this.baseUrl}/latest.json`,
          {
            params: {
              app_id: this.apiKey,
            },
          },
        ),
      );

      // Update cache
      this.exchangeRatesCache = response.data.rates;
      this.cacheTimestamp = now;

      // console.log('Exchange rates updated, cache refreshed');
      return this.exchangeRatesCache;
    } catch (error) {
      // If API call fails but we have cached data, use cache
      if (this.exchangeRatesCache) {
        console.warn(
          'Failed to fetch latest exchange rates, using cached data',
        );
        return this.exchangeRatesCache;
      }

      // If no cache available, throw error
      throw new Error(
        `Failed to fetch exchange rates: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
