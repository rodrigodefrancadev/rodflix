/**
 * Helper to get a stable color from a string
 */
export const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#16a085',
    '#d35400', '#7f8c8d', '#2c3e50', '#e67e22', '#2980b9'
  ];
  return colors[Math.abs(hash) % colors.length];
};
