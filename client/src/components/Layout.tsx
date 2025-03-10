import { ReactNode } from "react";
import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [location] = useLocation();
  
  // Don't show sidebar on 404 page
  if (location === "/404") {
    return (
      <div className="h-screen flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <AppHeader />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
