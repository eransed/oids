
const RES = 0
const BLK = 30
const RED = 31
const GRN = 32
const YEL = 33
const BLU = 34
const MAG = 35
const CYN = 36
const WHT = 37

function bg(fg: number) {
  return fg + 10
}

function ansi(color: number) {
  return `\x1b[1;${color}m`
}

function color2(str: string, style1: number, style2: number) {
  return `${ansi(style1)}${ansi(style2)}${str}${ansi(RES)}`
}

function getFileName(s: string): string {
  if (s.includes('\\')) {
    const arr = s.split('\\')
    return arr[arr.length - 1]
  } else if (s.includes('/')) {
    const arr = s.split('/')
    return arr[arr.length - 1]
  }
  return s
}

function fnNameLine(): string {
  const stack = new Error().stack
  if (stack) {
    const frame = stack.split('\n')[3]
    const functionName = frame.split(' ')[5]
    if (functionName.includes('<anonymous>') || frame.includes('(') === false) {
      const a = getFileName(frame).split(':')
      return a.slice(0, -2).join('')
    }
    return `${functionName}`
  }
  return '<?>'
}

function round2dec(num: number, dec = 2): number {
  const exp = Math.pow(10, dec)
  return Math.round((num + Number.EPSILON) * exp) / exp
}

function getTimeStats(): string {
  const sinceStartUs = usNow() - startTimeUs
  const sinceLastUs = usNow() - sinceLastLogUs
  sinceLastLogUs = usNow()
  return `${usPretty(sinceStartUs)}/${usPretty(sinceLastUs)}`
}

function dtstamp() {
  return `${new Date().toLocaleString('sv-SE')}`
}

export function usNow() {
  return performance.now() * 1000
}

export function usPretty(us: number): string {
  const D = 24 * 60 * 60 * 1e6
  const H = 60 * 60 * 1e6
  const M = 60 * 1e6
  const S = 1e6
  const MS = 1e3
  const mu = '\u03BC'
  if (us >= D) return `${round2dec(us / D, 2)}d`
  if (us >= H) return `${round2dec(us / H, 1)}h`
  if (us >= M) return `${round2dec(us / M, 1)}m`
  if (us >= S) return `${round2dec(us / S, 1)}s`
  if (us >= MS) return `${round2dec(us / MS, 1)}ms`
  return `${round2dec(us, 0)}${mu}s`
}

export function log(str: string): void {
  const s = getTimeStats()
  console.log(`${dtstamp()} (${s}) <${fnNameLine()}> ${str}`)
}

export function info(str: string): void {
  const s = getTimeStats()
  console.log(color2(`i ${dtstamp()} (${s}) <${fnNameLine()}>`, MAG, MAG) + ` ${str}`)
}

export function warn(str: string): void {
  const s = getTimeStats()
  console.log(color2(`w ${dtstamp()} (${s}) <${fnNameLine()}>`, YEL, YEL) + ` ${str}`)
}

export function error(str: string): void {
  const s = getTimeStats()
  console.log(color2(`e ${dtstamp()} (${s}) <${fnNameLine()}>`, WHT, bg(RED)) + ` ${str}`)
}

const startTimeUs = usNow()
let sinceLastLogUs = usNow()
