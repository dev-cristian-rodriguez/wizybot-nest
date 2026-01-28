import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

// Function schema for searchProducts tool
// Defines the structure that OpenAI will use to call the product search function

const searchProductsFunction = {
  name: 'searchProducts',
  description:
    'Search for products in the store catalog. Returns up to 2 most relevant products based on the search query.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'The search query to find relevant products (e.g., "phone", "watch", "present for dad")',
      },
    },
    required: ['query'],
  },
};

// Function schema for convertCurrencies tool
// Defines the structure that OpenAI will use to call the currency conversion function
const convertCurrenciesFunction = {
  name: 'convertCurrencies',
  description:
    'Convert an amount from one currency to another using current exchange rates.',
  parameters: {
    type: 'object',
    properties: {
      amount: {
        type: 'number',
        description: 'The amount to convert (must be a positive number)',
      },
      fromCurrency: {
        type: 'string',
        description: 'The source currency code (e.g., "USD", "EUR", "CAD")',
      },
      toCurrency: {
        type: 'string',
        description: 'The target currency code (e.g., "USD", "EUR", "CAD")',
      },
    },
    required: ['amount', 'fromCurrency', 'toCurrency'],
  },
};

// Service responsible for interacting with OpenAI's Chat Completion API
// Handles function calling setup and chat completion requests
@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    // Initialize OpenAI client with API key from configuration
    const apiKey = this.configService.get<string>('app.openaiApiKey');

    if (!apiKey) {
      throw new Error(
        'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.',
      );
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  // Gets the function definitions for OpenAI function calling
  // These functions will be available to the LLM during chat completion
  getFunctionDefinitions() {
    return [
      {
        type: 'function' as const,
        function: searchProductsFunction,
      },
      {
        type: 'function' as const,
        function: convertCurrenciesFunction,
      },
    ];
  }

  // Creates a chat completion request with function calling enabled
  // This is the initial call where the LLM decides which function to use
  async createChatCompletion(
    userMessage: string,
    conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [],
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    // Build messages array with system prompt and user message
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You are a helpful customer support and sales assistant for an online store. ' +
          'You can help customers find products and convert prices between currencies. ' +
          'When a customer asks about products, use the searchProducts function. ' +
          'When a customer asks about currency conversion, use the convertCurrencies function. ' +
          'Always be friendly, helpful, and provide clear information.',
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    console.log('messages -> ', messages);

    try {
      // Make request to OpenAI Chat Completion API with function calling
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency, can be changed to gpt-4 if needed
        messages: messages,
        tools: this.getFunctionDefinitions(),
        tool_choice: 'auto', // Let the model decide when to call functions
        temperature: 0.7, // Balance between creativity and consistency
      });

      return completion;
    } catch (error) {
      throw new Error(
        `OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Creates a follow-up chat completion after function execution
  // This call includes the function results so the LLM can generate a final response
  async createFollowUpCompletion(
    userMessage: string,
    functionName: string,
    functionResult: any,
    toolCallId: string,
    conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [],
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    // Build messages array including the original user message, assistant's tool call, and tool result
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You are a helpful customer support and sales assistant for an online store. ' +
          'You can help customers find products and convert prices between currencies. ' +
          'Always be friendly, helpful, and provide clear information.',
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
      {
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: toolCallId,
            type: 'function',
            function: {
              name: functionName,
              arguments: JSON.stringify({}), // Empty as we're providing the result
            },
          },
        ],
      },
      {
        role: 'tool',
        tool_call_id: toolCallId,
        content: JSON.stringify(functionResult),
      },
    ];

    try {
      // Make request to OpenAI Chat Completion API to generate final response
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
      });

      return completion;
    } catch (error) {
      throw new Error(
        `OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
