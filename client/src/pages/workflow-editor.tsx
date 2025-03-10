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
      
      <div className="flex-1 flex overflow-hidden">
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
      </div>
      
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
