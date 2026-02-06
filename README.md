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
- **Node.js** version 18 or higher (Node 22 recommended)
- **Docker & Docker Compose** (optional, for containerized setup)
- **OpenAI API key** ([Get one here](https://platform.openai.com/api-keys))
- **Open Exchange Rates API key** ([Get one here](https://openexchangerates.org/api) - free tier available)

---

## Running the Application Locally (Step by Step)

This guide is for new developers. Choose one of the two options below.

### Option A: Run with npm (Local Development)

Best for active development with hot-reload.

#### Step 1: Clone the repository
```bash
git clone <repository-url>
cd wizybot-nest
```

#### Step 2: Install dependencies
```bash
npm install
```

#### Step 3: Create environment file
```bash
cp .env.example .env
```

#### Step 4: Configure API keys
Edit `.env` and add your keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPEN_EXCHANGE_RATES_API_KEY=your_open_exchange_rates_api_key_here
```

#### Step 5: Run the application
```bash
npm run start:dev
```

The app will start at `http://localhost:3000` with hot-reload enabled.

---

### Option B: Run with Docker

Best for production-like setup or when you prefer not to install Node.js locally.

#### Step 1: Clone the repository
```bash
git clone <repository-url>
cd wizybot-nest
```

#### Step 2: Create environment file
```bash
cp .env.example .env
```

#### Step 3: Configure API keys
Edit `.env` and add your keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPEN_EXCHANGE_RATES_API_KEY=your_open_exchange_rates_api_key_here
```

#### Step 4: Start the application and database
```bash
docker compose up -d
```

This builds the app image, starts PostgreSQL, and runs the NestJS app. The API will be available at `http://localhost:3000`.

**Useful Docker commands:**
| Action | Command |
|--------|---------|
| Start everything | `docker compose up -d` |
| Stop everything | `docker compose down` |
| Start only database | `docker compose up postgres -d` |
| View logs | `docker compose logs -f app` |
| Rebuild after code changes | `docker compose up -d --build` |

---

## Running the Application (Summary)

### Development Mode (npm)
```bash
npm run start:dev
```

### Production Mode (npm)
```bash
npm run build
npm run start:prod
```

### Production Mode (Docker)
```bash
docker compose up -d
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

### Running Tests (npm)
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

### Running Tests with Docker

Use the development Docker image when you want to run tests in a container (same environment as CI).

**Step 1: Build the development image** (required once)
```bash
docker build -t wizybot-nest:dev --target development .
```

**Step 2: Run tests**
```bash
# Lint
docker run --rm wizybot-nest:dev npm run lint

# Unit tests
docker run --rm wizybot-nest:dev npm run test

# E2E tests (requires PostgreSQL running)
docker compose up postgres -d
docker run --rm --network wizybot-nest_default \
  -e POSTGRES_HOST=postgres -e POSTGRES_PORT=5432 \
  -e POSTGRES_USER=wizybot -e POSTGRES_PASSWORD=wizybot_secret -e POSTGRES_DB=wizybot_db \
  wizybot-nest:dev npm run test:e2e
```
> **Note:** If the network name differs, run `docker network ls` and use the network that matches your project folder name (e.g. `wizybot-nest_default`).

### Building
```bash
npm run build
```