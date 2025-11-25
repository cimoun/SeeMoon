import PropTypes from 'prop-types';
import './Sidebar.css';

function Sidebar({
  specInput,
  onChangeSpec,
  onApplySpec,
  onBeautify,
  onLoadExample,
  error,
  warnings,
  examples
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <p className="sidebar__eyebrow">BPMN 2.0 · автокомпоновка</p>
        <h1>Генератор диаграмм</h1>
        <p className="sidebar__lead">
          Вставьте структурированное описание процесса (JSON) и нажмите «Сгенерировать». Мы
          разложим элементы по дорожкам, добавим подписи и сохраним нотацию.
        </p>
      </div>

      <div className="sidebar__section">
        <div className="sidebar__section-head">
          <span>Описание процесса</span>
          <div className="sidebar__section-actions">
            <button type="button" className="text-button" onClick={onBeautify}>
              Форматировать JSON
            </button>
            {examples.map((example) => (
              <button
                key={example.id}
                type="button"
                className="text-button"
                onClick={() => onLoadExample(example.id)}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
        <textarea
          className="sidebar__textarea"
          spellCheck={false}
          value={specInput}
          onChange={(event) => onChangeSpec(event.target.value)}
          aria-label="JSON структуры процесса"
        />
        <button type="button" className="primary-button" onClick={onApplySpec}>
          Сгенерировать диаграмму
        </button>
        {error && <p className="sidebar__error">Ошибка разбора: {error}</p>}
        {!!warnings.length && (
          <div className="sidebar__warnings">
            <p>Предупреждения:</p>
            <ul>
              {warnings.map((warning, index) => (
                <li key={`${warning}-${index}`}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  specInput: PropTypes.string.isRequired,
  onChangeSpec: PropTypes.func.isRequired,
  onApplySpec: PropTypes.func.isRequired,
  onBeautify: PropTypes.func.isRequired,
  onLoadExample: PropTypes.func.isRequired,
  error: PropTypes.string,
  warnings: PropTypes.arrayOf(PropTypes.string),
  examples: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  )
};

Sidebar.defaultProps = {
  error: '',
  warnings: [],
  examples: []
};

export default Sidebar;
