import SearchContext from "@/contexts/SearchContext";
import { useState } from "react";

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchModalToggle, setSearchModalToggle] = useState(false);
  const [selectedStock, setSelectedStock] = useState("");

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchModalToggle,
        selectedStock,
        setSearchQuery,
        setSearchModalToggle,
        setSelectedStock,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
