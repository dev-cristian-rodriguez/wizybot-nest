# Wizybot Chatbot API

A NestJS-based chatbot API that uses OpenAI's Chat Completion API with Function Calling to provide intelligent customer support. The chatbot can search for products in a catalog and convert currencies using real-time exchange rates.

## Features

- **Product Search**: Search for products in the store catalog using natural language queries
- **Currency Conversion**: Convert prices between different currencies using Open Exchange Rates API
- **OpenAI Function Calling**: Leverages OpenAI's function calling capability for intelligent tool selection
- **Swagger Documentation**: Automatic API documentation available at `/api`
- **TypeScript**: Fully typed codebase with DTOs and validation

## Prerequisites

Before running the application, ensure you have:

- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Open Exchange Rates API key ([Get one here](https://openexchangerates.org/api) - free tier available)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wizybot-nest
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPEN_EXCHANGE_RATES_API_KEY=your_open_exchange_rates_api_key_here
```

## Running the Application

### Development Mode

Run the application in development mode with hot-reload:

```bash
npm run start:dev
```

The application will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Production Mode

Build and run the application:

```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api
```

This provides an interactive interface to test the API endpoints.

## API Endpoint

### POST /chat

Send a query to the chatbot and receive a response.

**Request Body:**
```json
{
  "query": "I am looking for a phone"
}
```

**Response:**
```json
{
  "response": "I found some phones for you. Here are 2 options: ..."
}
```

## Example Requests

### Using cURL

```bash
# Search for products
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "I am looking for a phone"}'

# Search for a present
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "I am looking for a present for my dad"}'

# Ask about product price
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "How much does a watch costs?"}'

# Convert currency
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the price of the watch in Euros"}'

# Currency conversion
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "How many Canadian Dollars are 350 Euros"}'
```

## How It Works

The chatbot follows this flow:

1. **User Query**: User sends a query to the `/chat` endpoint
2. **Initial OpenAI Call**: The system calls OpenAI with the user query and available function definitions
3. **Function Detection**: OpenAI determines if a function should be called (searchProducts or convertCurrencies)
4. **Function Execution**: If needed, the appropriate function is executed:
   - `searchProducts()`: Searches the CSV file for relevant products
   - `convertCurrencies()`: Fetches exchange rates and converts the amount
5. **Final Response**: OpenAI generates a final response using the function results
6. **Response to User**: The final response is returned to the user

## Testing

Test the chatbot with the following example queries:

- "I am looking for a phone"
- "I am looking for a present for my dad"
- "How much does a watch costs?"
- "What is the price of the watch in Euros"
- "How many Canadian Dollars are 350 Euros"

## Error Handling

The API handles various error scenarios:

- **Missing API Keys**: Returns 500 error with configuration message
- **Invalid Request**: Returns 400 error for validation failures
- **Service Unavailable**: Returns 500 error if external APIs are unavailable
- **No Products Found**: Returns appropriate message when no products match the query

## Development

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

### Building

```bash
npm run build
```