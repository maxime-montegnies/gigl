import GLIndexBuffer from "../arraybuffer/indexbuffer";
import GLArrayBuffer from "../arraybuffer/arraybuffer";
import Node from "../node";
import Program from "../program";
export interface iMesh {
  [key: string]: GLArrayBuffer | GLIndexBuffer;
}
class Mesh extends Node {
  gl: WebGLRenderingContext;
  buffers: GLArrayBuffer[];
  ibuffer: GLIndexBuffer;
  material?: number;
  // defaultTexture?: string;
  constructor(gl: WebGLRenderingContext, ibuffer:GLIndexBuffer, buffers: GLArrayBuffer[]) {
    super();
    this.gl = gl;
    this.ibuffer = ibuffer;
    this.buffers = buffers;
  }
  setup(prg: Program) {
    for (let i = 0; i < this.buffers.length; i++) {
      this.buffers[i].attribPointer(prg);
    }
    this.ibuffer!.bind();
  }
  render() {
    this.ibuffer!.drawTriangles();
  }
}

export default Mesh;
