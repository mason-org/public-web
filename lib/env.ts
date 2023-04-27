export function requiredEnv(env: string): string {
  const value = process.env[env]
  if (value == null) {
    throw new Error(`$${env} is not set.`)
  }
  return value
}
