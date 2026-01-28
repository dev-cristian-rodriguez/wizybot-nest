import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openExchangeRatesApiKey: process.env.OPEN_EXCHANGE_RATES_API_KEY || '',
  port: parseInt(process.env.PORT || '3000', 10),
  csvFilePath: process.env.CSV_FILE_PATH || 'src/products/products_list.csv',
}));
