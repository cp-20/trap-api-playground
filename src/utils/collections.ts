export const groupBy = <T, K>(items: T[], keyOf: (item: T) => K): Map<K, T[]> => {
  const grouped = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = grouped.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      grouped.set(key, [item]);
    }
  }
  return grouped;
};
