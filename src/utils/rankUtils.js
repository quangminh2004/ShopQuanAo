// Rank utilities

export const RANK_CONFIG = {
  NORMAL: {
    label: 'Thường',
    color: '#9e9e9e',
    bgColor: '#f5f5f5',
    minSpending: 0,
    maxSpending: 5000000,
    discount: 0,
    icon: '👤',
    gradient: 'linear-gradient(135deg, #9e9e9e, #bdbdbd)',
  },
  DONG: {
    label: 'Đồng',
    color: '#bf6a3e',
    bgColor: '#fdf3ee',
    minSpending: 5000000,
    maxSpending: 10000000,
    discount: 0.03,
    icon: '🥉',
    gradient: 'linear-gradient(135deg, #bf6a3e, #e8956d)',
  },
  BAC: {
    label: 'Bạc',
    color: '#607d8b',
    bgColor: '#eceff1',
    minSpending: 10000000,
    maxSpending: 20000000,
    discount: 0.05,
    icon: '🥈',
    gradient: 'linear-gradient(135deg, #607d8b, #90a4ae)',
  },
  VANG: {
    label: 'Vàng',
    color: '#f9a825',
    bgColor: '#fffde7',
    minSpending: 20000000,
    maxSpending: 50000000,
    discount: 0.1,
    icon: '🥇',
    gradient: 'linear-gradient(135deg, #f9a825, #ffd54f)',
  },
  KIM_CUONG: {
    label: 'Kim Cương',
    color: '#6a1b9a',
    bgColor: '#f3e5f5',
    minSpending: 50000000,
    maxSpending: Infinity,
    discount: 0.15,
    icon: '💎',
    gradient: 'linear-gradient(135deg, #6a1b9a, #ab47bc)',
  },
};

export const getRankFromSpending = (totalSpending) => {
  if (totalSpending >= 50000000) return 'KIM_CUONG';
  if (totalSpending >= 20000000) return 'VANG';
  if (totalSpending >= 10000000) return 'BAC';
  if (totalSpending >= 5000000) return 'DONG';
  return 'NORMAL';
};

export const getNextRank = (currentRank) => {
  const ranks = ['NORMAL', 'DONG', 'BAC', 'VANG', 'KIM_CUONG'];
  const idx = ranks.indexOf(currentRank);
  if (idx === ranks.length - 1) return null;
  return ranks[idx + 1];
};

export const getRankProgress = (totalSpending, currentRank) => {
  const config = RANK_CONFIG[currentRank];
  const nextRank = getNextRank(currentRank);
  if (!nextRank) return 100;
  const nextConfig = RANK_CONFIG[nextRank];
  const range = nextConfig.minSpending - config.minSpending;
  const progress = totalSpending - config.minSpending;
  return Math.min(Math.round((progress / range) * 100), 100);
};

export const getDiscount = (rank) => {
  return RANK_CONFIG[rank]?.discount || 0;
};
