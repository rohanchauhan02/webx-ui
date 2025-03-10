import { useState, useCallback, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ReactFlowProvider, useNodesState, useEdgesState, addEdge, Connection, Node, Edge } from 'reactflow';
import WorkflowToolbar from '@/components/WorkflowToolbar';
import WorkflowCanvas from '@/components/WorkflowCanvas';
import NodePanel from '@/components/NodePanel';
import RecommendationModal from '@/components/RecommendationModal';
import { generateNodeId, nodeCategories } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BookOpen, GitFork, Code, LucideIcon, Settings } from 'lucide-react';

const WorkflowEditor = () => {
  const params = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const isNew = !params.id || params.id === 'new';
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [status, setStatus] = useState<'active' | 'draft' | 'error'>('draft');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  
  // Fetch workflow if editing existing one
  const { data: workflow, isLoading } = useQuery({
    queryKey: [`/api/workflows/${params.id}`],
    enabled: !isNew,
  });
  
  // Initialize workflow from data
  useEffect(() => {
    if (workflow && !isLoading) {
      setWorkflowName(workflow.name);
      setStatus(workflow.status);
      setNodes(workflow.nodes || []);
      setEdges(workflow.edges || []);
    }
  }, [workflow, isLoading, setNodes, setEdges]);
  
  // Save workflow
  const saveMutation = useMutation({
    mutationFn: async () => {
      const workflowData = {
        name: workflowName,
        nodes,
        edges,
      };
      
      if (isNew) {
        const response = await apiRequest('POST', '/api/workflows', workflowData);
        return response.json();
      } else {
        const response = await apiRequest('PUT', `/api/workflows/${params.id}`, workflowData);
        return response.json();
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Workflow saved',
        description: 'Your workflow has been saved successfully',
      });
      
      if (isNew && data.id) {
        navigate(`/workflows/${data.id}`);
      } else {
        queryClient.invalidateQueries({ queryKey: [`/api/workflows/${params.id}`] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error saving workflow',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Get workflow recommendations
  const getRecommendations = useCallback(async () => {
    try {
      if (nodes.length > 0) {
        const response = await apiRequest('POST', '/api/workflows/recommendations', { nodes, edges });
        const data = await response.json();
        setRecommendations(data);
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    }
  }, [nodes, edges]);
  
  // Handle node selection
  const onNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);
  }, []);
  
  // Handle node updates (configuration, etc.)
  const onNodeUpdate = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...data,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);
  
  // Handle connections between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({
        ...connection,
        type: 'smoothstep',
        animated: true,
      }, eds));
    },
    [setEdges]
  );
  
  // Handle drag and drop from node panel
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      
      if (!type) return;
      
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };
      
      try {
        const nodeData = JSON.parse(type);
        const newNode = {
          id: generateNodeId(),
          type: 'custom',
          position,
          data: {
            label: nodeData.name,
            type: nodeData.type,
            subtype: nodeData.subtype,
            icon: nodeData.icon,
            color: nodeData.color,
            config: {},
          },
        };
        
        setNodes((nds) => nds.concat(newNode));
        
        // Show recommendations after adding nodes
        if (nodes.length > 0) {
          getRecommendations();
        }
      } catch (error) {
        console.error('Could not parse node data', error);
      }
    },
    [setNodes, nodes.length, getRecommendations]
  );
  
  // Apply template from recommendations
  const applyTemplate = async (templateId: string) => {
    try {
      const response = await apiRequest('GET', `/api/workflows/templates/${templateId}`, {});
      const template = await response.json();
      
      setNodes(template.nodes);
      setEdges(template.edges);
      setWorkflowName(template.name);
      setShowRecommendations(false);
      
      toast({
        title: 'Template applied',
        description: `Applied template: ${template.name}`,
      });
    } catch (error) {
      toast({
        title: 'Error applying template',
        description: 'Failed to apply the selected template',
        variant: 'destructive',
      });
    }
  };
  
  // Handler for the "Run" button in the toolbar
  const handleRunWorkflow = async () => {
    if (isNew) {
      toast({
        title: 'Save required',
        description: 'Please save your workflow before running it',
      });
      return;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  const [activeTab, setActiveTab] = useState("canvas");

  return (
    <div className="flex flex-col h-full">
      <WorkflowToolbar 
        workflowId={isNew ? undefined : params.id}
        workflowName={workflowName}
        status={status}
        onNameChange={setWorkflowName}
        onSave={() => saveMutation.mutate()}
        onRun={handleRunWorkflow}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-4">
          <TabsList className="h-12">
            <TabsTrigger value="canvas" className="flex items-center gap-2 px-4">
              <Activity size={16} />
              <span>Canvas</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2 px-4">
              <GitFork size={16} />
              <span>Rule Engine</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2 px-4">
              <BookOpen size={16} />
              <span>Recommendations</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="canvas" className="flex-1 flex overflow-hidden p-0 border-none">
          <ReactFlowProvider>
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={() => setSelectedNode(null)}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
            <NodePanel
              selectedNode={selectedNode}
              onNodeSelect={setSelectedNode}
              onNodeUpdate={onNodeUpdate}
            />
          </ReactFlowProvider>
        </TabsContent>
        
        <TabsContent value="rules" className="flex-1 overflow-auto p-4 border-none">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Rule Engine</CardTitle>
                <CardDescription>
                  Define business rules that control your workflow execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Code size={18} className="text-primary" />
                      <span>Condition Builder</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create rules with conditions that trigger actions in your workflow
                    </p>
                    
                    <div className="bg-slate-50 p-4 rounded-md">
                      <p className="text-sm text-center text-slate-500">
                        Select a node from the canvas to define rules for that node
                      </p>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Settings size={18} className="text-primary" />
                      <span>Rule Configuration</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure how rules are evaluated and executed
                    </p>
                    
                    <div className="bg-slate-50 p-4 rounded-md">
                      <p className="text-sm text-center text-slate-500">
                        No rule configurations yet. Rules will be added as you build your workflow.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="recommendations" className="flex-1 overflow-auto p-4 border-none">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Workflow Recommendations</CardTitle>
                <CardDescription>
                  Get recommendations based on your workflow structure and content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <BookOpen size={18} className="text-primary" />
                      <span>Recommended Templates</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {recommendations.length > 0 ? (
                        recommendations.map((template, index) => (
                          <div 
                            key={index} 
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => applyTemplate(template.id)}
                          >
                            <div className="flex gap-3 items-center mb-2">
                              <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white bg-${template.color || 'primary'}`}>
                                <i className={template.icon || 'ri-flow-chart'}></i>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">{template.name}</h4>
                                <p className="text-xs text-gray-500">{template.nodeCount} nodes</p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600">{template.description}</p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 bg-slate-50 p-4 rounded-md">
                          <p className="text-sm text-center text-slate-500">
                            No recommendations available yet. Start building your workflow or click 
                            <button 
                              className="text-primary font-medium mx-1 hover:underline" 
                              onClick={getRecommendations}
                            >
                              here
                            </button>
                            to get recommendations.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <RecommendationModal
        open={showRecommendations}
        onClose={() => setShowRecommendations(false)}
        onSelectTemplate={applyTemplate}
        recommendations={recommendations}
      />
    </div>
  );
};

export default WorkflowEditor;
