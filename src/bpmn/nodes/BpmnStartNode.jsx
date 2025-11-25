import React from 'react';
import { Handle, Position } from '@xyflow/react';
import './BpmnNodes.css';

export function BpmnStartNode({ data }) {
  return (
    <div className="bpmn-node bpmn-start">
      <div className="bpmn-start-circle">
        <div className="bpmn-start-inner" />
      </div>
      {data.label && <div className="bpmn-label">{data.label}</div>}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
