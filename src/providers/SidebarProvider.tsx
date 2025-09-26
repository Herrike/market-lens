import SideBarContext from "@/contexts/SidebarContext";
import { useState } from "react";

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SideBarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </SideBarContext.Provider>
  );
};
