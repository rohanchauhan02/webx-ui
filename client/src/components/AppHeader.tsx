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

const AppHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 justify-between">
      <div className="flex items-center">
        <Link href="/">
          <div className="text-primary font-bold text-xl flex items-center cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M17 7L7 17M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>FlowOrchestrator</span>
          </div>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-8">
              My Workflows
              <ChevronDown className="ml-1 h-4 w-4" />
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
        <Button variant="ghost" size="icon" className="mr-2">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="mr-4">
          <Bell className="h-5 w-5" />
        </Button>
        <Avatar>
          <AvatarFallback className="bg-primary text-white">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default AppHeader;
