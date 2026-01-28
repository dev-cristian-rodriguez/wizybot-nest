import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsService } from './products.service';

// Products module that provides product search functionality
// Exports ProductsService for use in other modules
@Module({
  imports: [ConfigModule],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
