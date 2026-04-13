import { RANK_CONFIG } from '../../utils/rankUtils';

const RankBadge = ({ rank, size = 'md' }) => {
  const config = RANK_CONFIG[rank] || RANK_CONFIG.NORMAL;
  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: size === 'lg' ? '6px' : '4px',
    padding: size === 'lg' ? '6px 14px' : size === 'sm' ? '2px 8px' : '4px 10px',
    borderRadius: '9999px',
    fontSize: size === 'lg' ? '14px' : size === 'sm' ? '11px' : '12px',
    fontWeight: 700,
    background: config.gradient,
    color: '#fff',
    boxShadow: `0 2px 8px ${config.color}40`,
  };

  return (
    <span style={styles}>
      {config.icon} {config.label}
    </span>
  );
};

export default RankBadge;
