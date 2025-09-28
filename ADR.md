# Architecture Decision Records (ADR)

This document captures key architectural decisions made during the development of Market Lens, a React-based stock market analysis application built with modern web technologies.

**Last Updated:** September 2025  
**Status:** ✅ Implementation Complete + Bundle Optimized  
**Version:** 1.0  
**Performance:** 63% bundle size reduction (571 kB → 207 kB main bundle)

---

## Component Architecture & Memoization Strategy

### Context

Need to optimize React component performance and eliminate code duplication in sidebar navigation.

### Decision

- Extract reusable components (NavigationItem, NavigationList, SidebarLogo)
- Use `React.memo()` for static components
- Separate components into individual files for better maintainability

### Rationale

- **Performance**: Memoization prevents unnecessary re-renders when sidebar state changes
- **Maintainability**: Single source of truth for navigation logic
- **Reusability**: Components can be imported individually
- **Bundle splitting**: Separate files enable better code organization

### Implementation ✅ Complete

```tsx
// Implemented: Individual component files with proper memoization
const NavigationItem = ({ item }: { item: MenuNavigationItem }) => {
  // Context-aware navigation with Dashboard clearing functionality
};

const NavigationList = memo(() => {
  // Clean navigation list with proper TypeScript types
});

// Status: All sidebar components extracted and optimized
```

---

## Data Fetching Strategy

### Context

Choose data fetching library for Financial Modeling Prep API integration.

### Decision

Use **SWR (Stale-While-Revalidate)** for data fetching and caching.

### Rationale

- **Right-sized**: ~5kb vs TanStack Query's ~35kb
- **Perfect fit**: Read-heavy stock data application
- **Built-in features**: Caching, deduplication, revalidation
- **Stock data characteristics**: Doesn't change rapidly, benefits from caching

### Rejected Alternatives

- **Native Fetch**: Missing caching, loading states, error handling
- **TanStack Query**: Overkill for this scope, larger bundle size
- **Apollo Client**: GraphQL-focused, unnecessary complexity

### Implementation ✅ Complete

```tsx
// Financial Modeling Prep API integration with SWR
const { data, error, isLoading } = useStockSearch(searchQuery);
const { data: historyData } = useStockHistory(selectedStock);
const { data: quoteData } = useStockQuote(selectedStock);

// Features implemented:
// - Stock search with caching via localStorage
// - Historical price data (15-day lookback)
// - Real-time quote data with fallback handling
// - Free tier limitations with educational UI
```

---

## State Management Approach

### Context

Manage application state for sidebar visibility, search modal, and selected stocks.

### Decision

- **React Context** for global state (sidebar, search modal visibility)
- **Local useState** for component-specific state
- **SWR** for server state management

### Rationale

- **Simple scope**: No complex state logic requiring Redux
- **Context**: Perfect for UI state like sidebar/modal visibility
- **Separation**: Clear distinction between client state and server state
- **Performance**: Contexts are memoized and optimized

### Implementation ✅ Complete

```tsx
// UI State Management - Fully implemented
const SidebarProvider = ({ children }) => {
  // Mobile sidebar state management
};

const SearchProvider = ({ children }) => {
  // Search modal visibility, selected stock, search queries
  // Dashboard navigation context clearing
};

// Server State via SWR - Production ready
const { stock, isLoading } = useStockDetails(selectedStock);
const { data: searchResults } = useStockSearch(searchQuery);
```

---

## API Integration & Free Tier Strategy

### Context

Integrate with Financial Modeling Prep API while handling free tier limitations gracefully.

### Decision ✅ Implemented

- **Financial Modeling Prep API** for stock data
- **Free tier education** with available symbols grid
- **Graceful degradation** from historical charts to quote data
- **Smart caching** via localStorage for search results

### Rationale

- **User education**: Clear explanation of free vs paid tier capabilities
- **Fallback strategy**: Show quote data when historical data unavailable
- **Performance**: Cache search results to reduce API calls
- **UX**: Provide actionable alternatives (major indices available on free tier)

### Implementation ✅ Complete

```tsx
// Free tier symbols with educational UI
const FREE_TIER_SYMBOLS = ["^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX"];

// 402 Payment Required error handling
if (error?.status === 402) {
  return <FreeTierSuggestions />;
}

// Fallback from historical data to quote data
if (historyError) {
  const { data: quoteData } = useStockQuote(selectedStock);
}
```

---

## Modal & Layout Architecture

### Context

Handle modal positioning and layout consistency with fixed sidebar.

### Decision ✅ Implemented

- **Fixed sidebar** approach over sliding sidebar
- **Modal alignment** with main content area
- **Fixed navigation header** to prevent scroll-induced layout shifts
- **Responsive breakpoint handling** for mobile vs desktop

### Rationale

- **Visual consistency**: Modal appears over content area, not full viewport
- **Context preservation**: Users maintain sidebar visibility during search
- **Scroll stability**: Fixed header eliminates layout shifting during scroll
- **Mobile optimization**: Proper responsive behavior maintained

### Implementation ✅ Complete

```tsx
// Modal container aligned with content area
<div className="fixed inset-0 lg:left-72 z-10 w-screen lg:w-auto overflow-y-auto">

// Fixed navigation header
<div className="fixed top-0 left-0 right-0 lg:left-72 z-40 bg-white">

// Main content offset for fixed header
<main className="pt-16 pb-10">
```

---

## Bundle Optimization & Code Splitting

### Context

Initial bundle size of 571.84 kB was triggering Vite warnings (>500 kB) and impacting loading performance, especially for homepage visitors who may not need the heavy charting functionality.

### Decision ✅ Implemented

- **Dynamic imports** for Chart components (Highcharts dependency)
- **Manual chunking** strategy separating vendor libraries
- **Lazy loading** of heavy, conditional components
- **Async test handling** for dynamically imported components

### Rationale

- **Performance**: 63% reduction in initial bundle size (571 kB → 207 kB)
- **User experience**: Faster homepage loading, charts load on-demand
- **Caching**: Vendor libraries cached separately from app code
- **Maintainability**: Better separation of concerns

### Implementation ✅ Complete

```tsx
// Dynamic Chart loading with Suspense
const Chart = lazy(() => import("../chart/Chart"));

// Vite manual chunking configuration
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        react: ["react", "react-dom"],           // 11.83 kB
        charts: ["highcharts", "highcharts-react-official"], // 282.10 kB (lazy)
        ui: ["@headlessui/react", "@heroicons/react"],       // 44.69 kB
        utils: ["swr"],                          // 10.73 kB
      },
    },
  },
}

// Test updates for async components
await waitFor(() => {
  expect(screen.getByTestId("stock-chart")).toBeInTheDocument();
});
```

### Results

- **Main bundle**: 207.40 kB (was 571.84 kB) - 63% reduction
- **Charts chunk**: 282.10 kB - loads only when user selects a stock
- **All tests passing**: 207 tests including async loading scenarios
- **Zero build warnings**: Eliminated 500+ kB bundle size warnings

---

## Event Handler Optimization

### Context

Optimize event handler functions to prevent unnecessary re-renders.

### Decision

Use `useCallback` for event handlers, especially those passed as props or with dependencies.

### Rationale

- **Performance**: Prevents function recreation on every render
- **Future-proofing**: Ready for when handlers have dependencies
- **Consistency**: Good practice for all event handlers
- **Memoization**: Works well with memoized components

### Implementation

```tsx
const submitSearch = useCallback(() => {
  // Search logic
}, []);
```

---

## TypeScript Configuration

### Context

Configure TypeScript for optimal developer experience and type safety.

### Decision

- **Strict mode** enabled
- **Path mapping** with `@/*` alias for `src/*`
- **Interface definitions** for all API responses and component props

### Rationale

- **Developer experience**: Path mapping reduces relative import complexity
- **Type safety**: Strict mode catches more potential issues
- **Maintainability**: Clear interfaces for data structures

### Implementation

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Technology Stack Summary ✅ Production Ready

| Category             | Decision                | Implementation Status | Rationale                              |
| -------------------- | ----------------------- | --------------------- | -------------------------------------- |
| **Framework**        | React 19 + Vite         | ✅ Complete           | Modern, fast development               |
| **Styling**          | Tailwind CSS            | ✅ Complete           | Utility-first, indigo design system    |
| **Data Fetching**    | SWR + localStorage      | ✅ Complete           | Perfect for read-heavy stock data      |
| **State Management** | React Context + SWR     | ✅ Complete           | Right-sized for application complexity |
| **UI Components**    | Headless UI             | ✅ Complete           | Accessible, unstyled components        |
| **Icons**            | Heroicons               | ✅ Complete           | Tailwind ecosystem, consistent design  |
| **Charts**           | Highcharts React        | ✅ Complete           | Professional stock charts              |
| **API**              | Financial Modeling Prep | ✅ Complete           | Comprehensive financial data API       |
| **Type System**      | TypeScript              | ✅ Complete           | Type safety, better DX                 |
| **Build Tool**       | Vite                    | ✅ Complete           | Fast builds, modern tooling            |

---

## Implementation Achievements ✅

### Core Features Delivered

- **📱 Responsive Layout**: Mobile-first design with fixed sidebar and proper breakpoints
- **🔍 Stock Search**: Real-time search with caching and modal interface
- **📈 Interactive Charts**: Highcharts integration with 15-day historical data
- **🎯 Context Management**: Clean navigation with Dashboard/back button functionality
- **⚡ Performance**: Optimized with memoization and smart caching strategies
- **🎨 Design System**: Consistent indigo theme throughout all components
- **🚫 Error Handling**: Graceful API error handling with educational fallbacks
- **♿ Accessibility**: Proper ARIA labels, semantic HTML, and keyboard navigation

### Technical Excellence

- **Type Safety**: Full TypeScript coverage with proper interfaces
- **Code Organization**: Clean component architecture with separation of concerns
- **Performance**: Memoized components, efficient state management, and optimized bundle splitting
- **Bundle Optimization**: 63% size reduction via dynamic imports and strategic code splitting
- **User Experience**: Smooth animations, proper loading states, cursor consistency
- **API Integration**: Robust error handling for free tier limitations

---

## Future Considerations

### Enhancement Opportunities

- **Real-time Data**: WebSocket integration for live price updates
- **Portfolio Tracking**: User portfolios with localStorage persistence
- **Advanced Charts**: Technical indicators and multiple timeframes
- **Watchlists**: Save favorite stocks with notifications
- **Themes**: Light/dark mode toggle implementation

### Technical Debt Monitoring

- Additional chart types and timeframes
- Enhanced mobile experience optimizations
- Progressive Web App (PWA) capabilities
- Advanced caching strategies for offline support

---

**Status:** 🎉 **Production Ready**  
**Next Phase:** Feature enhancement and user feedback integration
