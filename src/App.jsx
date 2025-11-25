// Корневой компонент приложения

import { BpmnComposer } from './bpmn/components/BpmnComposer';
import './App.css';

function App() {
  return (
    <div className="app">
      <BpmnComposer />
    </div>
  );
}

export default App;
