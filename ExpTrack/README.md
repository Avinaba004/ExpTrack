# Expense Tracker Chatbot API

## Overview
This project is an expense tracker application built with Next.js using the App Router. It features a chatbot API that answers user queries related to expenses using real-time data from a database managed by Prisma.

## Features
- **Chatbot API**: Handles user questions and provides responses based on detected intents and database queries.
- **Intent Detection**: Analyzes user input to determine the intent behind their questions.
- **Financial Queries**: Supports various financial queries, including:
  - Total spending
  - Category-wise spending
  - Highest spending category
  - Month-over-month comparisons

## Project Structure
```
ExpTrack
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── chat
│   │   │   │   └── route.ts         # API route for the chatbot
│   │   │   └── middleware.ts         # Middleware for request/response handling
│   │   └── layout.tsx                # Layout component for the application
│   ├── lib
│   │   ├── db
│   │   │   └── prisma.ts             # Prisma client initialization
│   │   ├── ai
│   │   │   ├── intentDetector.ts      # Intent detection logic
│   │   │   └── queryProcessor.ts      # Database query handling
│   │   └── utils
│   │       └── helpers.ts             # Utility functions
│   ├── services
│   │   ├── expenseService.ts          # Expense-related data fetching
│   │   ├── categoryService.ts         # Category-related queries
│   │   └── chatbotService.ts          # Integration of intent detection and query processing
│   ├── types
│   │   └── index.ts                   # TypeScript types and interfaces
│   └── prisma
│       └── schema.prisma              # Database schema definition
├── public                             # Static assets
├── .env.local                         # Environment variables for local development
├── next.config.js                     # Next.js configuration
├── package.json                       # npm configuration
├── tsconfig.json                      # TypeScript configuration
└── README.md                          # Project documentation
```

## Getting Started
1. Clone the repository:
   ```
   git clone https://github.com/Avinaba004/ExpTrack.git
   ```
2. Navigate to the project directory:
   ```
   cd ExpTrack
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Set up your environment variables in `.env.local` for database connection.
5. Run the development server:
   ```
   npm run dev
   ```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.