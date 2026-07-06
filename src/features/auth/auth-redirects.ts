export function getSafeCallbackUrl(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null
  }

  return value
}

export function withCallbackUrl(path: string, callbackUrl?: string | null) {
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl)

  if (!safeCallbackUrl) {
    return path
  }

  const params = new URLSearchParams({ callbackUrl: safeCallbackUrl })
  return `${path}?${params.toString()}`
}
