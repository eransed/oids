export class HSL {
 h: number
 s: number
 l: number
 rgb: RGB

 constructor(hex: string) {
  this.rgb = new RGB(hex)
  this.rgb.r /= 255
  this.rgb.g /= 255
  this.rgb.b /= 255

  const max = Math.max(this.rgb.r, this.rgb.g, this.rgb.b)
  const min = Math.min(this.rgb.r, this.rgb.g, this.rgb.b)
  this.h = (max + min) / 2
  this.s = (max + min) / 2
  this.l = (max + min) / 2

  if (max == min) {
   this.h = this.s = 0 // achromatic
  } else {
   const d = max - min
   this.s = this.l > 0.5 ? d / (2 - max - min) : d / (max + min)

   switch (max) {
    case this.rgb.r:
     this.h = (this.rgb.g - this.rgb.b) / d + (this.rgb.g < this.rgb.b ? 6 : 0)
     break
    case this.rgb.g:
     this.h = (this.rgb.b - this.rgb.r) / d + 2
     break
    case this.rgb.b:
     this.h = (this.rgb.r - this.rgb.g) / d + 4
     break
   }

   this.h /= 6
  }
 }

 toHex(): string {
  const h = this.h
  const s = this.s
  let l = this.l
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
   const k = (n + h / 30) % 12
   const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
   return Math.round(255 * color)
    .toString(16)
    .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
 }
}

export class RGB {
 r: number
 g: number
 b: number
 constructor(hex: string) {
  this.r = parseInt(hex.substring(1, 2), 16)
  this.g = parseInt(hex.substring(3, 2), 16)
  this.b = parseInt(hex.substring(5, 2), 16)
 }
}

export function greyScale(brightness: number): string {
 const h = Math.floor(brightness).toString(16)
 return `#${h}${h}${h}`
}

export function randomColor(r: string, g: string, b: string): string {
 return '#' + r[Math.floor(Math.random() * r.length)] + g[Math.floor(Math.random() * g.length)] + b[Math.floor(Math.random() * b.length)]
}

export function randomGreen(): string {
 const r = '012345'
 const g = '6789ABCDEF'
 const b = '012345'
 return randomColor(r, g, b)
}

export function randomLightGreen(): string {
 const r = '678'
 const g = 'ABCDEF'
 const b = '678'
 return randomColor(r, g, b)
}

export function randomBlue(): string {
 const r = '012345'
 const g = '012345'
 const b = '6789ABCDEF'
 return randomColor(r, g, b)
}

export function randomRed(): string {
 const r = '6789ABCDEF'
 const g = '012345'
 const b = '012345'
 return randomColor(r, g, b)
}

export function randomAnyColor(): string {
 const r = '0123456789ABCDEF'
 const g = '0123456789ABCDEF'
 const b = '0123456789ABCDEF'
 return randomColor(r, g, b)
}

export function randomAnyLightColor(): string {
 const r = 'BCDEF'
 const g = 'BCDEF'
 const b = 'BCDEF'
 return randomColor(r, g, b)
}
