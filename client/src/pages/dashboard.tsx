import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Plus, Search, GitBranch, Clock, Play, Trash, FileEdit } from "lucide-react";

const Dashboard = () => {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: workflows = [], isLoading: isLoadingWorkflows } = useQuery({
    queryKey: ['/api/workflows'],
  });
  
  const { data: recentExecutions = [], isLoading: isLoadingExecutions } = useQuery({
    queryKey: ['/api/workflow-executions/recent'],
  });
  
  const deleteWorkflowMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/workflows/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Workflow deleted",
        description: "Workflow was deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting workflow",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const runWorkflowMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/workflows/${id}/run`, {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Workflow running",
        description: `Execution ID: ${data.executionId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workflow-executions/recent'] });
    },
    onError: (error) => {
      toast({
        title: "Error running workflow",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleDeleteWorkflow = (id: string) => {
    setWorkflowToDelete(id);
  };
  
  const confirmDeleteWorkflow = () => {
    if (workflowToDelete) {
      deleteWorkflowMutation.mutate(workflowToDelete);
      setWorkflowToDelete(null);
    }
  };
  
  const handleRunWorkflow = (id: string) => {
    runWorkflowMutation.mutate(id);
  };
  
  const filteredWorkflows = workflows.filter((workflow: any) => 
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "draft": return "bg-yellow-500";
      case "error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };
  
  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "running": return "bg-blue-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => navigate("/workflows/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search workflows..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="workflows">
        <TabsList>
          <TabsTrigger value="workflows">My Workflows</TabsTrigger>
          <TabsTrigger value="history">Recent Executions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workflows" className="mt-4">
          {isLoadingWorkflows ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-9 bg-gray-200 rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredWorkflows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkflows.map((workflow: any) => (
                <Card key={workflow.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status)}`} />
                    </div>
                    <CardDescription>Last edited: {formatDate(workflow.updatedAt || workflow.createdAt)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <GitBranch className="h-4 w-4 mr-1" />
                      <span>{workflow.nodeCount || 0} nodes</span>
                      
                      <Clock className="h-4 w-4 ml-4 mr-1" />
                      <span>{workflow.executionCount || 0} executions</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleRunWorkflow(workflow.id)}>
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/workflows/${workflow.id}`)}>
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteWorkflow(workflow.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <GitBranch className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No workflows found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? "No workflows match your search criteria" : "You haven't created any workflows yet"}
              </p>
              <Button onClick={() => navigate("/workflows/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Workflow
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          {isLoadingExecutions ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-100 flex items-center px-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-t border-gray-200 py-3 px-4 flex items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : recentExecutions.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 font-medium text-sm">
                <div>Workflow</div>
                <div>Started At</div>
                <div>Status</div>
                <div>Duration</div>
              </div>
              {recentExecutions.map((execution: any) => (
                <div key={execution.id} className="border-t border-gray-200 grid grid-cols-4 gap-4 p-4 items-center text-sm">
                  <div>{execution.workflowName}</div>
                  <div>{formatDate(execution.startedAt)}</div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${getExecutionStatusColor(execution.status)} mr-2`} />
                    <span className="capitalize">{execution.status}</span>
                  </div>
                  <div>{execution.duration}s</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No executions yet</h3>
              <p className="text-gray-500">Run a workflow to see execution history</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={workflowToDelete !== null} onOpenChange={(open) => !open && setWorkflowToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workflow and all its execution history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteWorkflow} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
