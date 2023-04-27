export function groupBy<T, K extends keyof T>(objects: T[], field: K): Record<K, T[]> {
  const groups: Record<string | number | symbol, T[]> = {}
  for (const item of objects) {
    const key = item[field] as keyof T
    const group = groups[key]
    if (group) {
      group.push(item)
    } else {
      groups[key] = [item]
    }
  }
  return groups
}
