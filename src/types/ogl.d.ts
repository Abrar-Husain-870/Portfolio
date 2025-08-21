declare module 'ogl' {
  export class Renderer {
    constructor(options?: any)
    gl: WebGLRenderingContext & { canvas: HTMLCanvasElement }
    setSize(width: number, height: number): void
    render(options: any): void
  }
  export class Camera {
    constructor(gl: any, options?: any)
    position: { set: (x: number, y: number, z: number) => void }
    perspective(options: any): void
  }
  export class Geometry {
    constructor(gl: any, attributes: any)
  }
  export class Triangle extends Geometry {
    constructor(gl: any)
  }
  export class Program {
    constructor(gl: any, options: any)
    uniforms: Record<string, { value: any }>
  }
  export class Mesh {
    constructor(gl: any, options: any)
    position: { x: number; y: number }
    rotation: { x: number; y: number; z: number }
    mode?: any
  }
  export class Color {
    constructor(r?: number, g?: number, b?: number)
    r: number
    g: number
    b: number
  }
}
