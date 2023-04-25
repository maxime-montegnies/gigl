import GLIndexBuffer from "../../spgl/arraybuffer/indexbuffer";
import GLArrayBuffer from "../../spgl/arraybuffer/arraybuffer";
import Node from "../../spgl/node";
import Program from "../../spgl/program";
import { mat2d } from "gl-matrix";
import { vec2 } from "gl-matrix";
export interface iMesh {
  index: Int16Array;
  vertices: Float32Array;
  uvs: Float32Array | null;
  normals: Float32Array | null;
  tangents: Float32Array | null;
  joints: Int8Array | null;
  weights: Float32Array | null;
  is2D: boolean;
}
const V2 = vec2.create();
class Mesh extends Node {
  gl: WebGLRenderingContext;
  buffers: GLArrayBuffer[];
  ibuffer: GLIndexBuffer;
  constructor(gl: WebGLRenderingContext, data: iMesh) {
    super();
    this.gl = gl;
    // =============================================
    this.buffers = [];
    // =============================================
    this.ibuffer = new GLIndexBuffer(gl, gl.UNSIGNED_SHORT);
    this.ibuffer.data(data.index);
    // =============================================
    const buffer_vertex = new GLArrayBuffer(gl);
    buffer_vertex.data(data.vertices);
    if (data.is2D) {
      buffer_vertex.attrib("aPosition", 2, gl.FLOAT);
    } else {
      buffer_vertex.attrib("aPosition", 3, gl.FLOAT);
    }
    this.buffers.push(buffer_vertex);
    // =============================================
    if (data.uvs) {
      const buffer_uv = new GLArrayBuffer(gl);
      buffer_uv.data(data.uvs);
      buffer_uv.attrib("aTexCoord", 2, gl.FLOAT);
      this.buffers.push(buffer_uv);
    }
    // =============================================
    if (data.normals) {
      const buffer_normal = new GLArrayBuffer(gl);
      buffer_normal.data(data.normals);
      buffer_normal.attrib("aNormal", 3, gl.FLOAT);
      this.buffers.push(buffer_normal);
    }
    // =============================================
    if (data.tangents) {
      const buffer_tangent = new GLArrayBuffer(gl);
      buffer_tangent.data(data.tangents);
      buffer_tangent.attrib("aTangent", 3, gl.FLOAT);
      this.buffers.push(buffer_tangent);
    }
    // =============================================
    if (data.joints) {
      const buffer_joints = new GLArrayBuffer(gl);
      buffer_joints.data(data.joints);
      buffer_joints.attrib("aJoint", 4, gl.UNSIGNED_BYTE);
      this.buffers.push(buffer_joints);
    }
    // =============================================
    if (data.weights) {
      const buffer_weights = new GLArrayBuffer(gl);
      buffer_weights.data(data.weights);
      buffer_weights.attrib("aWeight", 4, gl.FLOAT);
      this.buffers.push(buffer_weights);
    }
    // =============================================
  }
  setup(prg: Program) {
    for (let i = 0; i < this.buffers.length; i++) {
      this.buffers[i].attribPointer(prg);
    }
    this.ibuffer.bind();
  }
  render() {
    this.ibuffer.drawTriangles();
  }
}

export default Mesh;
