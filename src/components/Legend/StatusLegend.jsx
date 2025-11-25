import PropTypes from 'prop-types';
import './StatusLegend.css';

function StatusLegend({ statuses }) {
  if (!statuses.length) return null;
  return (
    <div className="status-legend">
      {statuses.map((status) => (
        <div className="status-legend__item" key={status.key}>
          <span
            className="status-legend__swatch"
            style={{
              background: status.fill,
              borderColor: status.stroke
            }}
          />
          <span>{status.label}</span>
        </div>
      ))}
    </div>
  );
}

StatusLegend.propTypes = {
  statuses: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      fill: PropTypes.string.isRequired,
      stroke: PropTypes.string.isRequired
    })
  )
};

StatusLegend.defaultProps = {
  statuses: []
};

export default StatusLegend;
