type LocalStorageValue<T> = {
  key: string;
  serialize: (value: T) => string;
  deserialize: (raw: string) => T | null;
};

export const createLocalStorageValue = <T>({
  key,
  serialize,
  deserialize,
}: LocalStorageValue<T>) => ({
  read: (): T | null => {
    const raw = localStorage.getItem(key);
    return raw ? deserialize(raw) : null;
  },
  write: (value: T): void => {
    localStorage.setItem(key, serialize(value));
  },
  clear: (): void => {
    localStorage.removeItem(key);
  },
});
