import Mesh from "../mesh";
class Plane extends Mesh {
  constructor(gl: WebGLRenderingContext, w: number, h: number) {
    w = (w === undefined) ? 2.0 : w;
    h = (h === undefined) ? 2.0 : h;
    // =============================================
    const data_index = new Int16Array([
      0, 1, 2,
      0, 3, 1,
    ]);
    // =============================================
    const data_vertices = new Float32Array([
      -w, -h, 0,
      w, h, 0,
      -w, h, 0,
      w, -h, 0
    ]);
    // =============================================
    const data_uvs = new Float32Array([
      0, 1,
      1, 0,
      0, 0,
      1, 1
    ]);
    // =============================================
    super(gl, {
      index: data_index, 
      vertices: data_vertices, 
      uvs: data_uvs, 
      normals: null, 
      tangents: null, 
      is2D: false, 
      joints: null,
      weights: null
    })
  }
}

export default Plane;
