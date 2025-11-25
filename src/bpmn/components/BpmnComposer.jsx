import React, { useMemo } from 'react';
import { BpmnCanvas } from './BpmnCanvas';
import { parseBpmnDescription, createContractApprovalExample } from '../parser';
import { calculateLayout } from '../layout';
import { ExportPanel } from './ExportPanel';
import './BpmnComposer.css';

export function BpmnComposer({ description = null }) {
  const bpmnDescription = description || createContractApprovalExample();

  // Парсим описание и вычисляем компоновку
  const { nodes: rawNodes, edges, lanes } = useMemo(() => {
    return parseBpmnDescription(bpmnDescription);
  }, [bpmnDescription]);

  const nodes = useMemo(() => {
    return calculateLayout(rawNodes, edges, lanes);
  }, [rawNodes, edges, lanes]);

  return (
    <div className="bpmn-composer">
      <div className="bpmn-composer-header">
        <h1>BPMN 2.0 Composer</h1>
        <ExportPanel nodes={nodes} edges={edges} lanes={lanes} />
      </div>
      <BpmnCanvas nodes={nodes} edges={edges} lanes={lanes} />
    </div>
  );
}
