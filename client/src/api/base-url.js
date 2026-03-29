const explicitApiUrl = import.meta.env.VITE_API_URL?.trim()
const API_URL_STORAGE_KEY = 'overclocked.api-url'

function readStoredApiUrl() {
  if (typeof window === 'undefined') {
    return ''
  }

  try {
    return window.localStorage.getItem(API_URL_STORAGE_KEY)?.trim() ?? ''
  } catch {
    return ''
  }
}

function writeStoredApiUrl(url) {
  if (typeof window === 'undefined' || !url) {
    return
  }

  try {
    window.localStorage.setItem(API_URL_STORAGE_KEY, url)
  } catch {
    // Ignore storage failures in private or restricted browser contexts.
  }
}

function buildCandidates() {
  if (explicitApiUrl) {
    return [explicitApiUrl]
  }

  const storedApiUrl = readStoredApiUrl()
  const host =
    typeof window !== 'undefined' && window.location.hostname
      ? window.location.hostname
      : 'localhost'

  return [...new Set([
    storedApiUrl,
    `http://${host}:3000`,
    `http://${host}:3001`,
    'http://localhost:3001',
    'http://localhost:3000',
  ])]
    .filter(Boolean)
}

const apiCandidates = buildCandidates()
let activeApiUrl = apiCandidates[0] ?? ''

export function getApiUrl() {
  return activeApiUrl
}

export function getApiCandidates() {
  return apiCandidates
}

export function setActiveApiUrl(url) {
  if (url) {
    activeApiUrl = url
    writeStoredApiUrl(url)
  }
}

export async function retryWithNextApiUrl(error, client) {
  const originalRequest = error?.config
  if (!originalRequest || error?.response) {
    throw error
  }

  const attempted = new Set(
    [originalRequest.baseURL, activeApiUrl].filter(Boolean).map((value) => String(value)),
  )
  const remainingCandidates = apiCandidates.filter((candidate) => !attempted.has(candidate))

  if (!remainingCandidates.length) {
    throw error
  }

  let lastError = error

  for (const candidate of remainingCandidates) {
    try {
      const response = await client.request({
        ...originalRequest,
        baseURL: candidate,
      })
      setActiveApiUrl(candidate)
      return response
    } catch (candidateError) {
      lastError = candidateError
      if (candidateError?.response) {
        throw candidateError
      }
    }
  }

  throw lastError
}
