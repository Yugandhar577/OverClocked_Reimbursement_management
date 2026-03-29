function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

export function resolveMock(data, timeout = 260) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(clone(data)), timeout)
  })
}
