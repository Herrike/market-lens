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

- **React 19** - Latest React with improved performance and features
- **TypeScript** - Type-safe development with full IDE support
- **Vite** - Fast development build tool with HMR
- **Tailwind CSS** - Utility-first styling framework
- **HeadlessUI** - Accessible UI components for React
- **Financial Modeling Prep API** - Real-time stock market data
- **Highcharts** - Interactive price charts and data visualization
- **Vitest** - Fast unit testing with 207 test coverage
- **GitHub Pages** - Automated deployment and hosting

## Key Features

✅ **Comprehensive Stock Search** - Find stocks by symbol or company name  
✅ **Real-time Price Charts** - Interactive Highcharts with historical data  
✅ **Responsive Design** - Mobile-first approach with Tailwind CSS  
✅ **Type Safety** - Full TypeScript implementation  
✅ **Robust Testing** - 207 tests with data-testid reliability strategy  
✅ **Performance Optimized** - React 19 with efficient caching and lazy loading  
✅ **Accessible UI** - WCAG compliant with HeadlessUI components

## Deployment

The application is automatically deployed to GitHub Pages at:
**[https://herrike.github.io/market-lens/](https://herrike.github.io/market-lens/)**

### Local Development

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Start dev server: `pnpm dev`
4. Run tests: `pnpm test`
5. Build for production: `pnpm build`

## Testing Strategy

- **207 comprehensive tests** covering all user flows
- **Data-testid approach** for reliable, maintainable tests
- **Vitest framework** for fast test execution
- **Component isolation** testing for better reliability

## Security Considerations

⚠️ **Important Note**: This is a **demonstration project** for portfolio purposes.

**API Key Security**: The Financial Modeling Prep API key is exposed in the client-side bundle, which is acceptable for this demo using the free tier but **not recommended for production**.

**Production Recommendations**:

- Use backend proxy servers to hide API keys
- Implement serverless functions (Vercel, Netlify)
- Utilize cloud environment variables (Railway, Amplify)
- Add user authentication and rate limiting

See [ADR-003](./docs/adr/003-api-key-security-considerations.md) for detailed security architecture decisions and production-ready alternatives.
