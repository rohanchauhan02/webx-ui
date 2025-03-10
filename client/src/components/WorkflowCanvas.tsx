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
        <Controls />
        <Background gap={20} size={1} color="#CBD5E0" />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
