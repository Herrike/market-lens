import { createContext } from "react";

type SidebarContextType = {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
};

const SideBarContext = createContext<SidebarContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

export default SideBarContext;
