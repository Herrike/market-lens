import { useCallback, useContext } from "react";
import clsx from "clsx";
import SearchContext from "@/contexts/SearchContext";

// Types
export interface MenuNavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current?: boolean;
}

// Navigation Item Component
const NavigationItem = ({ item }: { item: MenuNavigationItem }) => {
  const {
    searchModalToggle,
    setSearchModalToggle,
    setSelectedStock,
    setSearchQuery,
  } = useContext(SearchContext);

  const handleClick = useCallback(() => {
    // Close search modal if open
    if (searchModalToggle) {
      setSearchModalToggle(false);
    }

    // Handle Dashboard click - reset to homepage by clearing context state
    if (item.name === "Dashboard") {
      setSelectedStock(""); // Clear selected stock from context
      setSearchQuery(""); // Clear search query from context as well
    }
  }, [
    searchModalToggle,
    item.name,
    setSearchModalToggle,
    setSelectedStock,
    setSearchQuery,
  ]);

  return (
    <li key={item.name}>
      <button
        onClick={handleClick}
        className={clsx(
          item.current
            ? "bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white"
            : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white",
          "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold w-full cursor-pointer",
        )}
      >
        <item.icon
          aria-hidden="true"
          className={clsx(
            item.current
              ? "text-indigo-600 dark:text-white"
              : "text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white",
            "size-6 shrink-0",
          )}
        />
        {item.name}
      </button>
    </li>
  );
};

export default NavigationItem;
