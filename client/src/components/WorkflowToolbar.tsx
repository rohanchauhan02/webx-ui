import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Clock, History, PlayCircle, MoreHorizontal, Trash, Copy, Save } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface WorkflowToolbarProps {
  workflowId: string | undefined;
  workflowName: string;
  status: "active" | "draft" | "error";
  onNameChange: (name: string) => void;
  onSave: () => void;
  onRun: () => void;
}

const WorkflowToolbar = ({ 
  workflowId, 
  workflowName, 
  status, 
  onNameChange, 
  onSave,
  onRun 
}: WorkflowToolbarProps) => {
  const [name, setName] = useState(workflowName);
  const { toast } = useToast();
  
  const runMutation = useMutation({
    mutationFn: async () => {
      if (!workflowId) return;
      const response = await apiRequest('POST', `/api/workflows/${workflowId}/run`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Workflow running",
        description: "Workflow execution started successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error running workflow",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!workflowId) return;
      await apiRequest('DELETE', `/api/workflows/${workflowId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Workflow deleted",
        description: "Workflow was deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      window.location.href = '/';
    },
    onError: (error) => {
      toast({
        title: "Error deleting workflow",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleBlur = () => {
    if (name !== workflowName) {
      onNameChange(name);
    }
  };
  
  const handleRun = () => {
    if (workflowId) {
      runMutation.mutate();
    } else {
      onRun();
    }
  };

  return (
    <div className="h-12 border-b border-gray-200 bg-white flex items-center px-4 justify-between">
      <div className="flex items-center">
        <div className="mr-4">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleBlur}
            className="border-0 text-lg font-medium focus:outline-none focus:border-b-2 focus:border-primary w-64 px-0 h-auto"
          />
        </div>
        <div className={cn(
          "flex items-center space-x-1 text-sm rounded-full px-3 py-1",
          {
            "bg-green-100 text-green-800": status === "active",
            "bg-yellow-100 text-yellow-800": status === "draft",
            "bg-red-100 text-red-800": status === "error"
          }
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full",
            {
              "bg-green-500": status === "active",
              "bg-yellow-500": status === "draft",
              "bg-red-500": status === "error"
            }
          )}></span>
          <span>{status === "active" ? "Active" : status === "draft" ? "Draft" : "Error"}</span>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={() => window.location.href = `/history?workflow=${workflowId}`}>
          <History className="mr-1 h-4 w-4" />
          History
        </Button>
        <Button variant="outline" size="sm">
          <Clock className="mr-1 h-4 w-4" />
          Schedule
        </Button>
        <Button onClick={handleRun} disabled={runMutation.isPending}>
          <PlayCircle className="mr-1 h-4 w-4" />
          Run
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Workflow
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            {workflowId && (
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => deleteMutation.mutate()}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default WorkflowToolbar;
