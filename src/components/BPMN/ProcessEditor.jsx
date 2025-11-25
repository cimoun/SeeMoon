import { useState } from 'react';
import './ProcessEditor.css';

/**
 * Компонент для редактирования структуры процесса
 */
function ProcessEditor({ processData, onProcessChange }) {
  const [localData, setLocalData] = useState(processData);

  const updateLanes = (newLanes) => {
    const updated = { ...localData, lanes: newLanes };
    setLocalData(updated);
    onProcessChange(updated);
  };

  const updateElement = (elementId, updates) => {
    const updated = {
      ...localData,
      elements: localData.elements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
    };
    setLocalData(updated);
    onProcessChange(updated);
  };

  const addElement = () => {
    const newId = `element_${Date.now()}`;
    const newElement = {
      id: newId,
      type: 'task',
      label: 'Новая задача',
      lane: localData.lanes[0] || '',
    };
    const updated = {
      ...localData,
      elements: [...localData.elements, newElement],
    };
    setLocalData(updated);
    onProcessChange(updated);
  };

  const removeElement = (elementId) => {
    const updated = {
      ...localData,
      elements: localData.elements.filter((el) => el.id !== elementId),
      flows: localData.flows.filter(
        (f) => f.from !== elementId && f.to !== elementId
      ),
    };
    setLocalData(updated);
    onProcessChange(updated);
  };

  const addFlow = () => {
    if (localData.elements.length < 2) {
      alert('Добавьте хотя бы 2 элемента для создания связи');
      return;
    }
    const newFlow = {
      from: localData.elements[0].id,
      to: localData.elements[1].id,
      label: '',
    };
    const updated = {
      ...localData,
      flows: [...localData.flows, newFlow],
    };
    setLocalData(updated);
    onProcessChange(updated);
  };

  const addLane = () => {
    const newLane = `Дорожка ${localData.lanes.length + 1}`;
    const updated = {
      ...localData,
      lanes: [...localData.lanes, newLane],
    };
    setLocalData(updated);
    onProcessChange(updated);
  };

  const removeLane = (index) => {
    const laneToRemove = localData.lanes[index];
    const updated = {
      ...localData,
      lanes: localData.lanes.filter((_, i) => i !== index),
      elements: localData.elements.map((el) => {
        if (el.lane === laneToRemove) {
          return { ...el, lane: localData.lanes[0] || '' };
        }
        return el;
      }),
    };
    setLocalData(updated);
    onProcessChange(updated);
  };

  const removeFlow = (index) => {
    const updated = {
      ...localData,
      flows: localData.flows.filter((_, i) => i !== index),
    };
    setLocalData(updated);
    onProcessChange(updated);
  };

  return (
    <div className="process-editor">
      <h3>Редактирование процесса</h3>

      <div className="editor-section">
        <h4>Дорожки (Swimlanes)</h4>
        <button onClick={addLane} className="add-btn">
          + Добавить дорожку
        </button>
        <div className="lanes-list">
          {localData.lanes.map((lane, idx) => (
            <div key={idx} className="lane-item">
              <input
                type="text"
                value={lane}
                onChange={(e) => {
                  const newLanes = [...localData.lanes];
                  newLanes[idx] = e.target.value;
                  updateLanes(newLanes);
                }}
                className="lane-input"
                placeholder="Название дорожки"
              />
              {localData.lanes.length > 1 && (
                <button
                  onClick={() => removeLane(idx)}
                  className="remove-btn"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="editor-section">
        <h4>Элементы</h4>
        <button onClick={addElement} className="add-btn">
          + Добавить элемент
        </button>
        <div className="elements-list">
          {localData.elements.map((el) => (
            <div key={el.id} className="element-item">
              <select
                value={el.type}
                onChange={(e) => updateElement(el.id, { type: e.target.value })}
                className="element-type"
              >
                <option value="startEvent">Стартовое событие</option>
                <option value="endEvent">Конечное событие</option>
                <option value="task">Задача</option>
                <option value="userTask">Пользовательская задача</option>
                <option value="serviceTask">Сервисная задача</option>
                <option value="subProcess">Подпроцесс</option>
                <option value="xorGateway">XOR шлюз</option>
                <option value="andGateway">AND шлюз</option>
              </select>
              <input
                type="text"
                value={el.label}
                onChange={(e) => updateElement(el.id, { label: e.target.value })}
                className="element-label"
                placeholder="Название"
              />
              <select
                value={el.lane}
                onChange={(e) => updateElement(el.id, { lane: e.target.value })}
                className="element-lane"
              >
                {localData.lanes.map((lane) => (
                  <option key={lane} value={lane}>
                    {lane}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeElement(el.id)}
                className="remove-btn"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="editor-section">
        <h4>Связи</h4>
        <button onClick={addFlow} className="add-btn">
          + Добавить связь
        </button>
        <div className="flows-list">
          {localData.flows.map((flow, idx) => (
            <div key={idx} className="flow-item">
              <select
                value={flow.from}
                onChange={(e) => {
                  const updated = [...localData.flows];
                  updated[idx] = { ...flow, from: e.target.value };
                  setLocalData({ ...localData, flows: updated });
                  onProcessChange({ ...localData, flows: updated });
                }}
                className="flow-select"
              >
                {localData.elements.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.label || el.id}
                  </option>
                ))}
              </select>
              <span>→</span>
              <select
                value={flow.to}
                onChange={(e) => {
                  const updated = [...localData.flows];
                  updated[idx] = { ...flow, to: e.target.value };
                  setLocalData({ ...localData, flows: updated });
                  onProcessChange({ ...localData, flows: updated });
                }}
                className="flow-select"
              >
                {localData.elements.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.label || el.id}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={flow.label || ''}
                onChange={(e) => {
                  const updated = [...localData.flows];
                  updated[idx] = { ...flow, label: e.target.value };
                  setLocalData({ ...localData, flows: updated });
                  onProcessChange({ ...localData, flows: updated });
                }}
                className="flow-label"
                placeholder="Подпись"
              />
              <button
                onClick={() => removeFlow(idx)}
                className="remove-btn"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProcessEditor;
