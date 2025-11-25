import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { BpmnStartNode } from '../nodes/BpmnStartNode';
import { BpmnEndNode } from '../nodes/BpmnEndNode';
import { BpmnTaskNode } from '../nodes/BpmnTaskNode';
import { BpmnGatewayNode } from '../nodes/BpmnGatewayNode';
import { BpmnSubProcessNode } from '../nodes/BpmnSubProcessNode';
import { Swimlanes } from './Swimlanes';
import './BpmnCanvas.css';

const nodeTypes = {
  bpmnStart: BpmnStartNode,
  bpmnEnd: BpmnEndNode,
  bpmnTask: BpmnTaskNode,
  bpmnGateway: BpmnGatewayNode,
  bpmnSubProcess: BpmnSubProcessNode,
};

export function BpmnCanvas({ nodes, edges, lanes = [] }) {
  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#333', strokeWidth: 2 },
      markerEnd: {
        type: 'arrowclosed',
        color: '#333',
      },
    }),
    []
  );

  // Обрабатываем возвратные стрелки
  const processedEdges = useMemo(() => {
    return edges.map((edge) => {
      // Если это возвратная стрелка (пунктирная), используем bezier для изогнутого пути
      if (edge.style?.strokeDasharray) {
        return {
          ...edge,
          type: 'bezier',
          style: {
            ...edge.style,
            stroke: '#666',
          },
        };
      }
      return edge;
    });
  }, [edges]);

  return (
    <div className="bpmn-canvas-container">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={processedEdges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
        >
          <Background color="#f0f0f0" gap={20} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'bpmnStart') return '#52b415';
              if (node.type === 'bpmnEnd') return '#d32f2f';
              if (node.type === 'bpmnGateway') return '#ff9800';
              return '#1976d2';
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          {lanes.length > 0 && <Swimlanes lanes={lanes} nodes={nodes} />}
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
