import React, { useMemo } from 'react';
import { useViewport } from '@xyflow/react';
import './Swimlanes.css';

const LANE_HEIGHT = 200;
const LANE_HEADER_WIDTH = 150;

export function Swimlanes({ lanes, nodes }) {
  const { x, y, zoom } = useViewport();

  // Вычисляем позиции и размеры дорожек на основе узлов
  const laneData = useMemo(() => {
    if (!lanes || lanes.length === 0 || !nodes || nodes.length === 0) {
      return [];
    }

    // Группируем узлы по дорожкам
    const nodesByLane = {};
    lanes.forEach((lane) => {
      nodesByLane[lane] = [];
    });

    nodes.forEach((node) => {
      const lane = node.data?.lane || lanes[0];
      if (nodesByLane[lane]) {
        nodesByLane[lane].push(node);
      }
    });

    // Вычисляем границы для каждой дорожки
    return lanes.map((lane, index) => {
      const laneNodes = nodesByLane[lane] || [];
      
      if (laneNodes.length === 0) {
        return {
          lane,
          y: index * LANE_HEIGHT,
          height: LANE_HEIGHT,
          minX: 0,
          maxX: 1200,
        };
      }

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      laneNodes.forEach((node) => {
        const nodeX = node.position.x;
        const nodeY = node.position.y;
        const width = 180; // NODE_WIDTH
        const height = 80; // NODE_HEIGHT

        if (nodeX < minX) minX = nodeX;
        if (nodeX + width > maxX) maxX = nodeX + width;
        if (nodeY < minY) minY = nodeY;
        if (nodeY + height > maxY) maxY = nodeY + height;
      });

      return {
        lane,
        y: minY - 40,
        height: Math.max(maxY - minY + 80, LANE_HEIGHT),
        minX: minX - 20,
        maxX: maxX + 20,
      };
    });
  }, [lanes, nodes]);

  return (
    <div className="swimlanes-overlay">
      {laneData.map((laneInfo, index) => (
        <React.Fragment key={laneInfo.lane}>
          {/* Заголовок дорожки */}
          <div
            className="swimlane-header"
            style={{
              left: `${(laneInfo.minX - LANE_HEADER_WIDTH) * zoom + x}px`,
              top: `${laneInfo.y * zoom + y}px`,
              width: `${LANE_HEADER_WIDTH * zoom}px`,
              height: `${laneInfo.height * zoom}px`,
            }}
          >
            <div className="swimlane-header-text">{laneInfo.lane}</div>
          </div>
          
          {/* Фон дорожки */}
          <div
            className={`swimlane-background ${index % 2 === 0 ? 'even' : 'odd'}`}
            style={{
              left: `${(laneInfo.minX - LANE_HEADER_WIDTH) * zoom + x}px`,
              top: `${laneInfo.y * zoom + y}px`,
              width: `${(laneInfo.maxX - laneInfo.minX + LANE_HEADER_WIDTH) * zoom}px`,
              height: `${laneInfo.height * zoom}px`,
            }}
          />
          
          {/* Разделительная линия */}
          {index < laneData.length - 1 && (
            <div
              className="swimlane-divider"
              style={{
                left: `${laneInfo.minX * zoom + x}px`,
                top: `${(laneInfo.y + laneInfo.height) * zoom + y}px`,
                width: `${(laneInfo.maxX - laneInfo.minX) * zoom}px`,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
