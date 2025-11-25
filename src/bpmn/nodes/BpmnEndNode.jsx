import React from 'react';
import { Handle, Position } from '@xyflow/react';
import './BpmnNodes.css';

export function BpmnEndNode({ data }) {
  return (
    <div className="bpmn-node bpmn-end">
      <div className="bpmn-end-circle">
        <div className="bpmn-end-inner" />
      </div>
      {data.label && <div className="bpmn-label">{data.label}</div>}
      <Handle type="target" position={Position.Left} />
    </div>
  );
}
