import ModalListItem from "../modal-item/ModalListItem";
import { stocks } from "@/mocks/stocks";

const ModalList = () => {
  return (
    <ul role="list" className="divide-y divide-white/5">
      {stocks.map((stock) => {
        const stockSymbol = stock.symbol;
        return <ModalListItem key={stockSymbol} stock={stock} />;
      })}
    </ul>
  );
};

export default ModalList;
