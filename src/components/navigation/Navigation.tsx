import { useCallback, useContext } from "react";
import SearchContext from "@/contexts/SearchContext";
import SidebarContext from "@/contexts/SidebarContext";
import MagnifyingGlassIcon from "@heroicons/react/20/solid/esm/MagnifyingGlassIcon";
import Bars3Icon from "@heroicons/react/20/solid/esm/Bars3Icon";
import ArrowTurnDownLeftIcon from "@heroicons/react/20/solid/esm/ArrowTurnDownLeftIcon";

const Navigation = () => {
  const { setSearchModalToggle } = useContext(SearchContext);
  const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext);

  // both search input focus and enter button click should open the search modal
  const searchModalHandler = useCallback(
    (
      e: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>
    ) => {
      e.preventDefault();
      // beware! this function triggers the search modal

      setSearchModalToggle(true);
    },
    [setSearchModalToggle]
  );

  return (
    <div className="fixed top-0 left-0 right-0 lg:left-72 z-40 sm:px-4 lg:px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex h-16 items-center gap-x-4 px-4 sm:gap-x-6 ">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => !sidebarOpen && setSidebarOpen(true)}
          className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 lg:hidden dark:text-gray-400 dark:hover:text-white cursor-pointer"
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon aria-hidden="true" className="size-6" />
        </button>

        {/* Separator */}
        <div
          aria-hidden="true"
          className="h-6 w-px bg-gray-200 lg:hidden dark:bg-gray-700"
        />

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          {/* Search bar: this is a fake form */}
          <div className="flex flex-1 items-center bg-white dark:bg-gray-900 rounded-md px-3">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="size-5 text-gray-400 flex-shrink-0"
            />
            <input
              name="search"
              placeholder="Search"
              aria-label="Search"
              className="flex-1 bg-transparent px-3 py-2 text-base text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm/6 dark:text-white dark:placeholder:text-gray-500"
              onMouseDownCapture={searchModalHandler}
            />
            <button
              type="submit"
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-800"
              aria-label="Submit search"
              disabled
              onClick={(e) => {
                // This button is purely cosmetic
                e.preventDefault();
              }}
            >
              <ArrowTurnDownLeftIcon className="size-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
