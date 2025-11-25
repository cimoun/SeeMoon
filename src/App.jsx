import { useMemo, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import DiagramCanvas from './components/Diagram/DiagramCanvas';
import { contractApprovalSpec, examples } from './data/examples';
import { buildDiagramModel } from './utils/diagramBuilder';

function App() {
  const [specInput, setSpecInput] = useState(() => JSON.stringify(contractApprovalSpec, null, 2));
  const [spec, setSpec] = useState(contractApprovalSpec);
  const [error, setError] = useState('');

  const model = useMemo(() => buildDiagramModel(spec), [spec]);

  const handleApplySpec = () => {
    try {
      const parsed = JSON.parse(specInput);
      setSpec(parsed);
      setError('');
    } catch (parseError) {
      setError(parseError.message);
    }
  };

  const handleBeautify = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(specInput), null, 2);
      setSpecInput(formatted);
      setError('');
    } catch (parseError) {
      setError(parseError.message);
    }
  };

  const handleLoadExample = (exampleId) => {
    const preset = examples.find((item) => item.id === exampleId);
    if (!preset) return;
    setSpec(preset.spec);
    setSpecInput(JSON.stringify(preset.spec, null, 2));
    setError('');
  };

  return (
    <div className="app-shell">
      <Sidebar
        specInput={specInput}
        onChangeSpec={setSpecInput}
        onApplySpec={handleApplySpec}
        onBeautify={handleBeautify}
        onLoadExample={handleLoadExample}
        error={error}
        warnings={model.warnings}
        examples={examples}
      />
      <DiagramCanvas model={model} />
    </div>
  );
}

export default App;
