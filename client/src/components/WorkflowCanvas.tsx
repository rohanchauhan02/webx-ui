import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  NodeChange,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  Panel,
  MarkerType,
  getConnectedEdges,
  getOutgoers,
  getIncomers,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  ChevronDown, 
  Zap, 
  GitBranch, 
  Database, 
  MessageSquare, 
  Settings, 
  Cloud,
  Pencil,
  Trash2,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { nodeCategories } from '@/lib/utils';
import { BaseEdge, EdgeProps, getSmoothStepPath } from 'reactflow';

interface NodeData {
  label: string;
  type: string;
  subtype: string;
  icon: string;
  color: string;
  config: Record<string, any>;
}

// Custom edge component that shows a highlighted style when selected
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) => {
  // Get path for the edge
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Set a thicker and highlighted style when selected
  const edgeStyle = {
    strokeWidth: selected ? 3 : 2,
    stroke: selected ? '#4F46E5' : (style?.stroke as string) || '#718096',
    transition: 'stroke-width 0.2s, stroke 0.2s',
  };

  // Adjust marker style if selected
  let customMarkerEnd = markerEnd;
  if (selected && markerEnd && typeof markerEnd === 'object') {
    // Create a new marker with the selected color
    customMarkerEnd = {
      type: markerEnd.type,
      width: markerEnd.width,
      height: markerEnd.height,
      color: '#4F46E5',
    };
  }

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={customMarkerEnd}
      style={edgeStyle}
      id={id}
    />
  );
};

const nodeTypes = {
  custom: ({ data }: { data: NodeData }) => {
    const getColorClass = (color: string) => {
      switch(color) {
        case 'blue': return 'bg-blue-100 text-blue-600';
        case 'orange': return 'bg-orange-100 text-orange-600';
        case 'purple': return 'bg-purple-100 text-purple-600';
        case 'green': return 'bg-green-100 text-green-600';
        default: return 'bg-gray-100 text-gray-600';
      }
    };

    return (
      <div className="px-4 py-3 rounded-lg bg-white border border-gray-200 shadow-sm w-44">
        <div className="flex items-center mb-2">
          <div className={cn("w-8 h-8 rounded-md flex items-center justify-center mr-2", getColorClass(data.color))}>
            <i className={data.icon}></i>
          </div>
          <div className="text-sm font-medium overflow-hidden text-ellipsis">
            {data.label}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{data.type}</span>
          <span>v1.0</span>
        </div>
      </div>
    );
  },
};

// Map of edge types
const edgeTypes = {
  custom: CustomEdge,
};

interface WorkflowCanvasProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: any) => void;
  onNodeClick: (node: Node) => void;
  onPaneClick: () => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}

const WorkflowCanvas = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect, 
  onNodeClick, 
  onPaneClick,
  onDragOver,
  onDrop
}: WorkflowCanvasProps) => {
  const reactFlowInstance = useReactFlow();
  const edgeUpdateSuccessful = useRef(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [edgeMenuPosition, setEdgeMenuPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Update selected node when a node is clicked
  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null); // Deselect any edge
    setEdgeMenuPosition(null);
    onNodeClick(node);
  };
  
  // Handle edge click for showing edge context menu
  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    const rect = (event.target as Element).getBoundingClientRect();
    const centerX = (rect.left + rect.right) / 2;
    const centerY = (rect.top + rect.bottom) / 2;
    
    // Convert screen coordinates to flow coordinates
    const position = reactFlowInstance.screenToFlowPosition({
      x: centerX,
      y: centerY,
    });
    
    setSelectedEdge(edge);
    setSelectedNode(null); // Deselect any node
    setEdgeMenuPosition(position);
  }, [reactFlowInstance]);
  
  // Function to add a node in the middle of an edge
  const handleAddNodeBetween = useCallback((nodeType: any) => {
    if (!selectedEdge || !edgeMenuPosition) return;
    
    // Create a new node
    const newNodeId = `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newNode = {
      id: newNodeId,
      type: 'custom',
      position: edgeMenuPosition,
      data: {
        label: nodeType.name,
        type: nodeType.type,
        subtype: nodeType.subtype,
        icon: nodeType.icon,
        color: nodeType.color,
        config: {},
      },
    };
    
    // Create two new edges: source -> new node and new node -> target
    const sourceToNewEdge = {
      id: `edge_${Date.now()}_1`,
      source: selectedEdge.source,
      target: newNodeId,
      // Copy any style properties from the original edge
      style: selectedEdge.style,
      markerEnd: selectedEdge.markerEnd,
      animated: selectedEdge.animated,
    };
    
    const newToTargetEdge = {
      id: `edge_${Date.now()}_2`,
      source: newNodeId,
      target: selectedEdge.target,
      // Copy any style properties from the original edge
      style: selectedEdge.style,
      markerEnd: selectedEdge.markerEnd,
      animated: selectedEdge.animated,
    };
    
    // Add the new node and edges, remove the old edge
    onNodesChange([{ type: 'add', item: newNode }]);
    onEdgesChange([
      { type: 'remove', id: selectedEdge.id },
      { type: 'add', item: sourceToNewEdge },
      { type: 'add', item: newToTargetEdge },
    ]);
    
    // Clear the selection
    setSelectedEdge(null);
    setEdgeMenuPosition(null);
  }, [selectedEdge, edgeMenuPosition, onNodesChange, onEdgesChange]);

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: any) => {
    edgeUpdateSuccessful.current = true;
    onEdgesChange([
      {
        id: oldEdge.id,
        type: 'remove',
      },
    ]);
    onConnect(newConnection);
  }, [onConnect, onEdgesChange]);

  const onEdgeUpdateEnd = useCallback((_: any, edge: Edge) => {
    if (!edgeUpdateSuccessful.current) {
      onEdgesChange([
        {
          id: edge.id,
          type: 'remove',
        },
      ]);
    }
    edgeUpdateSuccessful.current = true;
  }, [onEdgesChange]);

  // Function to handle node creation from the quick add menu
  const handleAddNode = useCallback((nodeType: any) => {
    // Get the center position of the current viewport
    const { x, y, zoom } = reactFlowInstance.getViewport();
    const centerX = reactFlowInstance.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }).x;
    const centerY = reactFlowInstance.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }).y;
    
    // Create a new node
    const newNode = {
      id: `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: 'custom',
      position: { x: centerX, y: centerY },
      data: {
        label: nodeType.name,
        type: nodeType.type,
        subtype: nodeType.subtype,
        icon: nodeType.icon,
        color: nodeType.color,
        config: {},
      },
    };
    
    // Add node to canvas
    onNodesChange([{ type: 'add', item: newNode }]);
  }, [reactFlowInstance, onNodesChange]);

  return (
    <div className="h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => handleNodeClick(node)}
        onPaneClick={() => {
          setSelectedNode(null);
          setSelectedEdge(null);
          setEdgeMenuPosition(null);
          onPaneClick();
        }}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        fitView
        defaultEdgeOptions={{
          type: 'custom',
          style: { strokeWidth: 2, stroke: '#718096' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: '#718096',
          },
          animated: true,
        }}
      >
        {/* Add Node Button */}
        <Panel position="bottom-right" className="mb-10 mr-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="icon" 
                className="rounded-full shadow-lg h-14 w-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="h-6 w-6 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 max-h-[70vh] overflow-y-auto">
              {nodeCategories.map((category) => (
                <div key={category.name} className="mb-3">
                  <div className="font-medium text-sm mb-2 px-2 text-gray-700 flex items-center">
                    {category.name === "Triggers" && <Zap className="h-3 w-3 mr-1.5 text-blue-500" />}
                    {category.name === "Logic" && <GitBranch className="h-3 w-3 mr-1.5 text-orange-500" />}
                    {category.name === "API & Data" && <Database className="h-3 w-3 mr-1.5 text-green-500" />}
                    {category.name === "Communication" && <MessageSquare className="h-3 w-3 mr-1.5 text-purple-500" />}
                    {category.name === "Project Tools" && <Settings className="h-3 w-3 mr-1.5 text-gray-500" />}
                    {category.name === "Cloud Services" && <Cloud className="h-3 w-3 mr-1.5 text-blue-400" />}
                    {category.name}
                  </div>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {category.items.map((item) => (
                      <DropdownMenuItem
                        key={item.name}
                        className="flex items-center cursor-pointer px-2 py-1.5 rounded-md hover:bg-gray-100"
                        onClick={() => handleAddNode(item)}
                      >
                        <div className={cn("w-6 h-6 rounded-md flex items-center justify-center mr-2", 
                          item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          item.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                          item.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                          item.color === 'green' ? 'bg-green-100 text-green-600' :
                          item.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                          item.color === 'gray' ? 'bg-gray-800 text-white' :
                          'bg-gray-100 text-gray-600'
                        )}>
                          <i className={item.icon} style={{ fontSize: '12px' }}></i>
                        </div>
                        <span className="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Panel>
        
        {/* Node Context Menu for Edit/View/Delete */}
        <Panel position="top-right" className="mr-5 mt-5">
          <div className="flex flex-col gap-2">
            {selectedNode && (
              <>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-9 w-9 rounded-full border-gray-200 bg-white shadow-sm"
                  onClick={() => {
                    // TODO: Implement node edit logic
                    onNodeClick(selectedNode);
                  }}
                  title="Edit Node"
                >
                  <Pencil className="h-4 w-4 text-gray-600" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-9 w-9 rounded-full border-gray-200 bg-white shadow-sm"
                  onClick={() => {
                    // Delete node function
                    // TODO: Add confirmation dialog
                    onNodesChange([{
                      type: 'remove',
                      id: selectedNode.id,
                    }]);
                    onPaneClick(); // Deselect after deletion
                  }}
                  title="Delete Node"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-9 w-9 rounded-full border-gray-200 bg-white shadow-sm"
                  onClick={() => {
                    // Duplicate node function
                    const newNode = {
                      ...selectedNode,
                      id: `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                      position: {
                        x: selectedNode.position.x + 50,
                        y: selectedNode.position.y + 50,
                      },
                    };
                    onNodesChange([{ type: 'add', item: newNode }]);
                  }}
                  title="Duplicate Node"
                >
                  <Copy className="h-4 w-4 text-gray-600" />
                </Button>
              </>
            )}
          </div>
        </Panel>
        {/* Edge Context Menu for adding nodes in between */}
        {selectedEdge && edgeMenuPosition && (
          <div 
            className="absolute bg-white shadow-lg rounded-lg p-4 z-10 w-72"
            style={{ 
              left: edgeMenuPosition.x, 
              top: edgeMenuPosition.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="text-sm font-medium mb-2 text-gray-700">
              Add Node Between Connection
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {nodeCategories
                .flatMap(category => category.items)
                .filter(item => item.type !== "Triggers") // No trigger nodes in the middle
                .slice(0, 8) // Limit to 8 options for simplicity
                .map(item => (
                  <div 
                    key={item.name}
                    className="flex items-center cursor-pointer px-2 py-1.5 rounded-md hover:bg-gray-100"
                    onClick={() => handleAddNodeBetween(item)}
                  >
                    <div className={cn("w-6 h-6 rounded-md flex items-center justify-center mr-2", 
                      item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      item.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                      item.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      item.color === 'green' ? 'bg-green-100 text-green-600' :
                      item.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    )}>
                      <i className={item.icon} style={{ fontSize: '12px' }}></i>
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.name}
                    </span>
                  </div>
                ))
              }
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 text-xs"
              onClick={() => {
                setSelectedEdge(null);
                setEdgeMenuPosition(null);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
        
        <Controls />
        <Background gap={20} size={1} color="#CBD5E0" />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
