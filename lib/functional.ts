export function groupBy<T>(objects: T[], field: keyof T): T[][] {
  const groups: { [key in keyof T]?: T[] } = {}
  for (const item of objects) {
    const key = item[field] as keyof T
    const group = groups[key]
    if (group) {
      group.push(item)
    } else {
      groups[key] = [item]
    }
  }
  return Object.values(groups)
}
