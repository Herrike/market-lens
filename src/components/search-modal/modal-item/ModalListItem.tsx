import type { Stock } from "@/types/api";

const ModalListItem = ({ stock }: { stock: Stock }) => {
  return (
    <li className="flex items-center justify-between gap-x-6 py-5">
      <div className="min-w-0">
        <div className="flex items-start gap-x-3">
          <p className="text-sm/6 font-semibold text-white">{stock.name}</p>
        </div>
        <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-gray-400">
          <p className="whitespace-nowrap">Symbol: {stock.symbol}</p>
          <span className="text-gray-500">&bull;</span>
          <p className="truncate">{stock.exchangeFullName}</p>
        </div>
      </div>
      <div className="flex flex-none items-center gap-x-4">
        <span className="hidden rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white inset-ring inset-ring-white/5 sm:block">
          {stock.currency}
        </span>
      </div>
    </li>
  );
};

export default ModalListItem;
