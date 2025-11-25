import React from 'react';
import { Handle, Position } from '@xyflow/react';
import './BpmnNodes.css';

export function BpmnTaskNode({ data }) {
  return (
    <div className="bpmn-node bpmn-task">
      <div className="bpmn-task-rect">
        {data.label || 'Задача'}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
