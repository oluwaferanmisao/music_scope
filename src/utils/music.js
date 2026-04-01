const MUSICAL_KEYS = ['C', 'C# / Db', 'D', 'D# / Eb', 'E', 'F', 'F# / Gb', 'G', 'G# / Ab', 'A', 'A# / Bb', 'B']

export function formatMusicalKey(keyNumber, mode) {
  if (typeof keyNumber !== 'number' || keyNumber < 0 || keyNumber > 11) {
    return 'Unknown key'
  }

  const scale = mode === 1 ? 'Major' : 'Minor'
  return `${MUSICAL_KEYS[keyNumber]} ${scale}`
}

export function formatTimeSignature(signature) {
  if (!signature) {
    return 'Unknown'
  }

  return `${signature}/4`
}

export function formatDuration(ms) {
  if (!ms) {
    return '--:--'
  }

  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

export function normalizeEnergy(value) {
  if (typeof value !== 'number') {
    return 0
  }

  return Math.round(value * 100)
}
