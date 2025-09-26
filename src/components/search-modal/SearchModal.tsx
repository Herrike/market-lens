import SearchContext from "@/contexts/SearchContext";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useCallback, useContext } from "react";
import { useStockSearch } from "@/hooks/useStocks";
import SearchModalForm from "./modal-form/SearchModalForm";
import SearchResultsList from "./results/SearchResultsList";

const SearchModal = () => {
  const { searchModalToggle, setSearchModalToggle, searchQuery } =
    useContext(SearchContext);

  // Get search results using the hook
  const { data, isLoading, error } = useStockSearch(searchQuery);

  const handleClose = useCallback(() => {
    setSearchModalToggle(false);
  }, [setSearchModalToggle]);

  return (
    <div data-testid="search-modal-wrapper">
      <Dialog
        open={searchModalToggle}
        onClose={handleClose}
        className="relative z-10"
        data-testid="search-modal-dialog"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 lg:left-72 bg-gray-500/75 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-gray-900/50"
          data-testid="search-modal-backdrop"
        />

        <div
          className="fixed inset-0 lg:left-72 z-10 w-screen lg:w-auto overflow-y-auto"
          data-testid="search-modal-container"
        >
          <div
            className="flex min-h-full items-center justify-center p-4 text-center"
            data-testid="search-modal-centered"
          >
            <DialogPanel
              transition
              className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 dark:bg-gray-800"
              data-testid="search-modal-panel"
            >
              <div data-testid="search-modal-content">
                <div
                  className="mt-3 text-center sm:mt-5"
                  data-testid="search-modal-header"
                >
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-gray-900 dark:text-white"
                    data-testid="search-modal-title"
                  >
                    Lens on Stocks
                  </DialogTitle>
                  <div className="mt-2">
                    <SearchModalForm />
                  </div>
                  <div className="mt-2">
                    <SearchResultsList
                      results={data}
                      isLoading={isLoading}
                      error={error || null}
                      query={searchQuery}
                    />
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default SearchModal;
