export function findDuplicate<T>(
  items: T[],
  getKey: (item: T) => string,
): T | undefined {
  const seen = new Set<string>()
  for (const item of items) {
    const key = getKey(item)
    if (seen.has(key)) {
      return item
    }
    seen.add(key)
  }
  return undefined
}
