import { ArrowLeftIcon } from "@heroicons/react/20/solid";

interface BackButtonProps {
  onClick: () => void;
}

const BackButton = ({ onClick }: BackButtonProps) => {
  return (
    <div
      className="mt-8 pt-6 border-t border-gray-200"
      data-testid="back-button-container"
    >
      <button
        onClick={onClick}
        data-testid="back-btn"
        className="inline-flex items-center gap-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200 cursor-pointer dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
      >
        <ArrowLeftIcon className="w-4 h-4" aria-hidden="true" />
        Back to Home
      </button>
    </div>
  );
};

export default BackButton;
