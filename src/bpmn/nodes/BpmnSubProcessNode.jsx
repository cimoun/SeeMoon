import React from 'react';
import { Handle, Position } from '@xyflow/react';
import './BpmnNodes.css';

export function BpmnSubProcessNode({ data }) {
  return (
    <div className="bpmn-node bpmn-subprocess">
      <div className="bpmn-subprocess-rect">
        <div className="bpmn-subprocess-label">{data.label || 'Подпроцесс'}</div>
        <div className="bpmn-subprocess-indicator">+</div>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
