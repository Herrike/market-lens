import { memo } from "react";
import navigation from "@/config/navigation-menu";
import NavigationItem from "./NavigationItem";

// Navigation List Component
// Memoized because navigation items are static and don't change during app lifecycle
// Prevents re-rendering the entire navigation when sidebar context changes (open/close)
const NavigationList = memo(() => (
  <nav className="flex flex-1 flex-col">
    <ul role="list" className="flex flex-1 flex-col gap-y-7">
      <li>
        <ul role="list" className="-mx-2 space-y-1">
          {navigation.map((item) =>
            !item.hidden ? <NavigationItem key={item.name} item={item} /> : null
          )}
        </ul>
      </li>
    </ul>
  </nav>
));

NavigationList.displayName = "NavigationList";

export default NavigationList;
