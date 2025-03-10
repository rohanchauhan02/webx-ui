import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HelpCircle, Bell, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className={isDarkMode ? 'dark' : 'light'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  return useContext(ThemeContext);
};

const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  return (
    <Button onClick={toggleDarkMode} variant="ghost" size="icon" className="mr-2">
      {isDarkMode ? '☀️' : '🌙'}
    </Button>
  );
};


const AppHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 justify-between dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center">
        <Link href="/">
          <div className="text-primary font-bold text-xl flex items-center cursor-pointer dark:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 dark:stroke-white">
              <path d="M17 7L7 17M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>FlowOrchestrator</span>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-8 dark:text-white">
              My Workflows
              <ChevronDown className="ml-1 h-4 w-4 dark:stroke-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>My Workflows</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/workflows/new">New Workflow</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/">All Workflows</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/history">Execution History</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center">
        <ThemeToggle/>
        <Button variant="ghost" size="icon" className="mr-2 dark:text-white">
          <HelpCircle className="h-5 w-5 dark:stroke-white" />
        </Button>
        <Button variant="ghost" size="icon" className="mr-4 dark:text-white">
          <Bell className="h-5 w-5 dark:stroke-white" />
        </Button>
        <Avatar>
          <AvatarFallback className="bg-primary text-white">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default AppHeader;