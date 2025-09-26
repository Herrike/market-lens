# Market Lens 📈

> **Live Demo: [https://herrike.github.io/market-lens/](https://herrike.github.io/market-lens/)**

A modern React 19 application for stock market analysis with real-time data visualization and comprehensive search capabilities.

## Project Requirements

Please build a small application using the free API from Financial Modeling Prep: [financialmodelingprep.com](https://financialmodelingprep.com)

### Features

#### 1. Search for a Stock

- A search feature where the user can find a stock by name
- You can use the search behavior in our sidebar as inspiration

#### 2. Stock Detail Page

When a stock is selected, show a detailed page with:

- The stock's name and basic information
- A historical price chart, built using Highcharts
- For general layout ideas, you can look at our single security page as an example: https://rentablo.de/v2/securities?id=DE000A1TNV91&quoteProvider=ariva

### Deliverables

What we'd like from you:

- Please, deploy the ready app somewhere, so that we could see it
- Once it's ready, we'll schedule a short session where you can walk us through:
  - Your approach and how you structured the app
  - Any decisions or challenges you faced
  - Potential improvements you'd consider with more time

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   pnpm dev
   ```

3. Build for production:
   ```bash
   pnpm build
   ```

## Technologies Used

- React 18
- TypeScript
- Vite
- Financial Modeling Prep API
- Highcharts (for price charts)
