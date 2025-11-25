import { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import './DiagramCanvas.css';
import StatusLegend from '../Legend/StatusLegend';
import { STATUS_TOKENS } from '../../utils/diagramBuilder';
import { exportDiagram } from '../../utils/exporters';

function DiagramCanvas({ model }) {
  const viewportRef = useRef(null);
  const { meta, lanes, nodes, flows, width, height, warnings } = model;

  const statuses = useMemo(() => {
    const list = new Map();
    nodes.forEach((node) => {
      const token = node.statusToken ?? STATUS_TOKENS.neutral;
      const key = node.statusKey ?? 'neutral';
      if (!list.has(key)) {
        list.set(key, {
          key,
          label: token.label,
          fill: token.fill,
          stroke: token.stroke
        });
      }
    });
    return Array.from(list.values());
  }, [nodes]);

  const handleExport = useCallback(
    async (format) => {
      if (!viewportRef.current) return;
      try {
        await exportDiagram(viewportRef.current, format);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Не удалось экспортировать диаграмму', error);
      }
    },
    [viewportRef]
  );

  const safeWidth = Math.max(width || 1200, 600);
  const safeHeight = Math.max(height || 600, 400);

  return (
    <section className="diagram">
      <header className="diagram__meta">
        <div>
          <p className="diagram__eyebrow">{meta?.version || 'MVP · BPMN 2.0'}</p>
          <h2>{meta?.title || 'Новая диаграмма'}</h2>
          <p>{meta?.description || 'Загрузите описание процесса, чтобы увидеть результат.'}</p>
        </div>
        <div className="diagram__actions">
          <button type="button" onClick={() => handleExport('png')}>
            PNG
          </button>
          <button type="button" onClick={() => handleExport('svg')}>
            SVG
          </button>
          <button type="button" onClick={() => handleExport('pdf')}>
            PDF
          </button>
        </div>
      </header>

      <div className="diagram__viewport" ref={viewportRef}>
        <svg
          width={safeWidth}
          height={safeHeight}
          viewBox={`0 0 ${safeWidth} ${safeHeight}`}
          role="img"
          aria-label="BPMN диаграмма"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="6"
              orient="auto"
            >
              <path d="M0,0 L12,6 L0,12 z" fill="currentColor" />
            </marker>
          </defs>

          <rect className="diagram__bg" x="0" y="0" width={safeWidth} height={safeHeight} />

          {lanes.map((lane) => (
            <g key={lane.id} className="diagram__lane">
              <rect
                x="0"
                y={lane.top}
                width={safeWidth}
                height={lane.height}
                fill="rgba(148, 163, 184, 0.08)"
              />
              <rect
                x="0"
                y={lane.top}
                width="140"
                height={lane.height}
                fill="rgba(15, 23, 42, 0.6)"
              />
              <text
                x="70"
                y={lane.centerY}
                className="diagram__lane-label"
                transform={`rotate(-90, 70, ${lane.centerY})`}
              >
                {lane.label}
              </text>
            </g>
          ))}

          {flows.map((flow) => (
            <g key={flow.id} className="diagram__flow">
              <path
                d={flow.path}
                stroke={flow.color}
                style={{ color: flow.color }}
                strokeWidth={flow.loop ? 2.2 : 1.8}
                strokeDasharray={flow.dashed ? '10 6' : undefined}
                fill="none"
                markerEnd="url(#arrowhead)"
              />
              {flow.label && (
                <g
                  transform={`translate(${flow.labelAnchor.x}, ${flow.labelAnchor.y})`}
                  className="diagram__flow-label"
                >
                  <rect
                    x={-flow.label.length * 3.5 - 8}
                    y="-14"
                    width={flow.label.length * 7 + 16}
                    height="24"
                    rx="12"
                    ry="12"
                    fill="#fff"
                    stroke={flow.color}
                    strokeWidth="0.8"
                  />
                  <text textAnchor="middle" dominantBaseline="central">
                    {flow.label}
                  </text>
                </g>
              )}
            </g>
          ))}

          {nodes.map((node) => renderNode(node))}
        </svg>
      </div>

      <footer className="diagram__footer">
        <StatusLegend statuses={statuses} />
        {!!warnings.length && (
          <div className="diagram__warnings">
            {warnings.slice(0, 3).map((warning) => (
              <span key={warning}>{warning}</span>
            ))}
          </div>
        )}
      </footer>
    </section>
  );
}

DiagramCanvas.propTypes = {
  model: PropTypes.shape({
    meta: PropTypes.object,
    lanes: PropTypes.array,
    nodes: PropTypes.array,
    flows: PropTypes.array,
    width: PropTypes.number,
    height: PropTypes.number,
    warnings: PropTypes.array
  })
};

DiagramCanvas.defaultProps = {
  model: {
    meta: {},
    lanes: [],
    nodes: [],
    flows: [],
    width: 1200,
    height: 600,
    warnings: []
  }
};

function renderNode(node) {
  const lines = wrapLabel(node.label, node.type === 'task' ? 20 : 16);
  const groupProps = { key: node.id, transform: `translate(${node.x}, ${node.y})` };
  if (node.type === 'startEvent' || node.type === 'endEvent' || node.type === 'intermediateEvent') {
    return renderEventNode(node, lines, groupProps);
  }
  if (node.type === 'xorGateway' || node.type === 'andGateway') {
    return renderGatewayNode(node, groupProps);
  }
  return renderTaskNode(node, lines, groupProps);
}

function renderTaskNode(node, lines, groupProps) {
  return (
    <g {...groupProps} className="diagram-node diagram-node--task">
      <rect
        x={-node.width / 2}
        y={-node.height / 2}
        width={node.width}
        height={node.height}
        rx="18"
        ry="18"
        fill={node.statusToken.fill}
        stroke={node.statusToken.stroke}
        strokeWidth="2"
      />
      <text className="diagram-node__label" textAnchor="middle">
        {lines.map((line, index) => (
          <tspan key={line} x="0" dy={index === 0 ? '0' : '1.2em'}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function renderEventNode(node, lines, groupProps) {
  const radius = Math.min(node.width, node.height) / 2 - 4;
  const stroke = node.statusToken.stroke;
  const fill = node.type === 'endEvent' ? stroke : '#fff';

  return (
    <g {...groupProps} className="diagram-node diagram-node--event">
      <circle r={radius} fill={fill} stroke={stroke} strokeWidth="3" />
      {node.type === 'endEvent' && <circle r={radius - 4} stroke="#fff" strokeWidth="2" fill="none" />}
      {node.type === 'intermediateEvent' && (
        <circle r={radius - 6} stroke={stroke} strokeWidth="2" fill="none" />
      )}
      {node.label && (
        <text className="diagram-node__label" textAnchor="middle" dy={radius + 24}>
          {lines.join(' ')}
        </text>
      )}
    </g>
  );
}

function renderGatewayNode(node, groupProps) {
  const half = node.width / 2.2;
  const points = [
    `0,${-half}`,
    `${half},0`,
    `0,${half}`,
    `${-half},0`
  ].join(' ');
  const symbol = node.type === 'xorGateway' ? '×' : '+';
  return (
    <g {...groupProps} className="diagram-node diagram-node--gateway">
      <polygon points={points} fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
      <text textAnchor="middle" dominantBaseline="central">
        {symbol}
      </text>
    </g>
  );
}

function wrapLabel(text, maxLength = 20) {
  if (!text) return [''];
  const words = text.split(/\s+/);
  const rows = [];
  let current = '';
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLength) {
      current = candidate;
    } else {
      if (current) rows.push(current);
      current = word;
    }
  });
  if (current) rows.push(current);
  return rows.slice(0, 4);
}

export default DiagramCanvas;
