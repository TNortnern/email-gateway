export default defineEventHandler(() => {
  return {
    ok: true,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }
})
