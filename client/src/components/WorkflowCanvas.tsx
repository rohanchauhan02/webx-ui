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
import { Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { nodeCategories } from '@/lib/utils';

interface NodeData {
  label: string;
  type: string;
  subtype: string;
  icon: string;
  color: string;
  config: Record<string, any>;
}

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
        onNodeClick={(_, node) => onNodeClick(node)}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        fitView
        defaultEdgeOptions={{
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
        <Panel position="bottom-right" className="mb-10 mr-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="rounded-full shadow-lg h-14 w-14 bg-primary hover:bg-primary/90">
                <Plus className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {nodeCategories.map((category) => (
                <div key={category.name} className="px-2 py-1.5">
                  <div className="font-medium text-sm mb-1.5">{category.name}</div>
                  {category.items.slice(0, 4).map((item) => (
                    <DropdownMenuItem
                      key={item.name}
                      className="flex items-center cursor-pointer"
                      onClick={() => handleAddNode(item)}
                    >
                      <div className={cn("w-6 h-6 rounded flex items-center justify-center mr-2", 
                        item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        item.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                        item.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        item.color === 'green' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      )}>
                        <i className={item.icon} style={{ fontSize: '12px' }}></i>
                      </div>
                      <span className="text-sm">{item.name}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Panel>
        <Controls />
        <Background gap={20} size={1} color="#CBD5E0" />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
