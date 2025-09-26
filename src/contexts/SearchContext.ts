import { createContext } from "react";

type SearchContextType = {
  searchQuery: string;
  searchModalToggle: boolean;
  selectedStock: string;
  setSearchQuery: (query: string) => void;
  setSearchModalToggle: (value: boolean) => void;
  setSelectedStock: (stock: string) => void;
};

const SearchContext = createContext<SearchContextType>({
  searchQuery: "",
  searchModalToggle: false,
  selectedStock: "",
  setSearchQuery: () => {},
  setSearchModalToggle: () => {},
  setSelectedStock: () => {},
});

export default SearchContext;
