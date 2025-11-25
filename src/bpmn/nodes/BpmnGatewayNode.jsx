import React from 'react';
import { Handle, Position } from '@xyflow/react';
import './BpmnNodes.css';

export function BpmnGatewayNode({ data }) {
  const gatewayType = data.elementType || 'xorGateway';
  const isXor = gatewayType.includes('xor');
  const isAnd = gatewayType.includes('and');
  
  return (
    <div className="bpmn-node bpmn-gateway">
      <div className={`bpmn-gateway-diamond ${isXor ? 'xor' : isAnd ? 'and' : 'or'}`}>
        {isXor && <span className="gateway-x">×</span>}
        {isAnd && <span className="gateway-plus">+</span>}
      </div>
      {data.label && <div className="bpmn-label bpmn-gateway-label">{data.label}</div>}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
