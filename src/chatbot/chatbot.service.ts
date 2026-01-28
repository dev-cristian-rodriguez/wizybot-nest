import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { ProductsService } from '../products/products.service';
import { CurrencyService } from '../currency/currency.service';
import OpenAI from 'openai';

// Service that orchestrates the chatbot functionality
// Handles the complete flow: user query → function calling → final response

@Injectable()
export class ChatbotService {
  constructor(
    private openaiService: OpenAIService,
    private productsService: ProductsService,
    private currencyService: CurrencyService,
  ) {}

  // Main method to process a user query and return a chatbot response
  // Implements the function calling flow:
  // 1. Initial OpenAI call to determine if a function should be called
  // 2. Execute the function if needed
  // 3. Follow-up OpenAI call with function results to generate final response

  async processQuery(query: string): Promise<string> {
    // console.log('Processing user query:', query);

    try {
      // Step 1: Make initial call to OpenAI with function definitions
      const initialCompletion =
        await this.openaiService.createChatCompletion(query);

      const message = initialCompletion.choices[0]?.message;

      if (!message) {
        throw new Error('No response from OpenAI');
      }

      // Step 2: Check if OpenAI wants to call a function (tool)
      const toolCall = message.tool_calls?.[0];

      if (toolCall && toolCall.type === 'function') {
        // Extract function name and arguments
        const functionName: string = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments || '{}');
        const toolCallId: string = toolCall.id;

        // console.log(`Executing function: ${functionName}`, functionArgs);

        // Step 3: Execute the appropriate function
        let functionResult: any;

        if (functionName === 'searchProducts') {
          // Execute product search
          const searchQuery = functionArgs.query || query;
          // console.log('Searching products with query:', searchQuery);
          const products = await this.productsService.searchProducts(
            searchQuery,
          );

          // Format products for the LLM
          functionResult = {
            products: products.map((product) => ({
              title: product.displayTitle,
              price: product.price,
              url: product.url,
              imageUrl: product.imageUrl,
              productType: product.productType,
              variants: product.variants,
            })),
            count: products.length,
          };
          // console.log(`Found ${products.length} products`);
        } else if (functionName === 'convertCurrencies') {
          // Execute currency conversion
          // console.log(`Converting ${functionArgs.amount} ${functionArgs.fromCurrency} to ${functionArgs.toCurrency}`);
          const convertedAmount = await this.currencyService.convertCurrencies(
            functionArgs.amount,
            functionArgs.fromCurrency,
            functionArgs.toCurrency,
          );

          functionResult = {
            originalAmount: functionArgs.amount,
            fromCurrency: functionArgs.fromCurrency,
            toCurrency: functionArgs.toCurrency,
            convertedAmount: convertedAmount,
          };
          // console.log(`Conversion result: ${convertedAmount} ${functionArgs.toCurrency}`);
        } else {
          throw new Error(`Unknown function: ${functionName}`);
        }

        // Step 4: Make follow-up call with function results
        const followUpCompletion =
          await this.openaiService.createFollowUpCompletion(
            query,
            functionName,
            functionResult,
            toolCallId,
          );

        const finalMessage = followUpCompletion.choices[0]?.message;

        if (!finalMessage || !finalMessage.content) {
          throw new Error('No final response from OpenAI');
        }

        // console.log('Query processed successfully');
        return finalMessage.content;
      } else {
        // No function call needed, return the direct response
        // console.log('Direct response (no function call needed)');
        return (
          message.content || 'I apologize, but I could not generate a response.'
        );
      }
    } catch (error) {
      // Handle errors gracefully
      const errorMessage: string =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Error processing query: ${errorMessage}`);
      throw new Error(`Failed to process query: ${errorMessage}`);
    }
  }
}
