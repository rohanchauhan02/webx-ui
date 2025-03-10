import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Clock, Filter, Search, Eye, XCircle, CheckCircle, Play } from "lucide-react";

const ExecutionHistory = () => {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedExecution, setSelectedExecution] = useState<any>(null);
  
  // Parse query params
  const params = new URLSearchParams(location.split("?")[1]);
  const workflowId = params.get("workflow");
  
  const { data: executions = [], isLoading } = useQuery({
    queryKey: [workflowId ? `/api/workflows/${workflowId}/executions` : '/api/workflow-executions'],
  });
  
  const { data: nodeExecutions = [], isLoading: isLoadingNodeExecutions } = useQuery({
    queryKey: [selectedExecution ? `/api/workflow-executions/${selectedExecution.id}/nodes` : null],
    enabled: !!selectedExecution,
  });
  
  const filteredExecutions = executions.filter((execution: any) => {
    const matchesSearch = 
      execution.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      execution.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      execution.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <Play className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-500";
      case "failed": return "text-red-500";
      case "running": return "text-blue-500";
      case "waiting": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Execution History</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by workflow name or ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <Card className="animate-pulse">
          <CardContent className="p-0">
            <div className="h-12 bg-gray-100"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 border-t border-gray-200"></div>
            ))}
          </CardContent>
        </Card>
      ) : filteredExecutions.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Execution ID</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecutions.map((execution: any) => (
                  <TableRow key={execution.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(execution.status)}
                        <span className="ml-2 capitalize">{execution.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>{execution.workflowName}</TableCell>
                    <TableCell className="font-mono text-xs">{execution.id}</TableCell>
                    <TableCell>{formatDate(execution.startedAt)}</TableCell>
                    <TableCell>{execution.duration}s</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedExecution(execution)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No executions found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== "all" 
              ? "No executions match your filters" 
              : "There are no workflow executions yet"}
          </p>
          <Button onClick={() => setLocation("/")}>
            Go to Dashboard
          </Button>
        </div>
      )}
      
      {/* Execution Details Dialog */}
      <Dialog open={!!selectedExecution} onOpenChange={(open) => !open && setSelectedExecution(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Execution Details</DialogTitle>
            <DialogDescription>
              {selectedExecution?.workflowName} - {formatDate(selectedExecution?.startedAt)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <div className="flex items-center mt-1">
                  {selectedExecution && getStatusIcon(selectedExecution.status)}
                  <span className="ml-1 capitalize">{selectedExecution?.status}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                <p className="mt-1">{selectedExecution?.duration}s</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Started At</h4>
                <p className="mt-1">{selectedExecution && formatDate(selectedExecution.startedAt)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Execution ID</h4>
                <p className="mt-1 font-mono text-xs">{selectedExecution?.id}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Node Executions</h4>
              {isLoadingNodeExecutions ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded"></div>
                  ))}
                </div>
              ) : nodeExecutions.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Node</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Started At</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nodeExecutions.map((node: any) => (
                        <TableRow key={node.id}>
                          <TableCell>{node.nodeName}</TableCell>
                          <TableCell>
                            <span className={getNodeStatusColor(node.status)}>
                              {node.status}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(node.startedAt)}</TableCell>
                          <TableCell>{node.duration}ms</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No node execution data available</p>
              )}
            </div>
            
            {selectedExecution?.error && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Error</h4>
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-800 font-mono text-xs whitespace-pre-wrap">
                  {selectedExecution.error}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedExecution(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExecutionHistory;
