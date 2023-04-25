import Program from "../program";
import BaseBuffer from "./basebuffer";
// import BufferUtils from "./bufferutils";
import { getComponentSize, isBufferSource } from "./bufferutils";

/*
 * GL_ARRAY_BUFFER */
const TGT = 0x8892;

interface AttributeDef {
  name: string;
  type: GLenum;
  size: number;
  offset: number;
  normalize: boolean;
  stride: number;
}

class ArrayBuffer extends BaseBuffer {
  gl: WebGLRenderingContext;
  usage: GLenum;
  buffer: WebGLBuffer | null;
  attribs: AttributeDef[];
  stride: number = 0;
  byteLength: number = 0;
  length: number = 0;
  _data: TypedArray | undefined;
  constructor(
    gl: WebGLRenderingContext,
    data?: TypedArray,
    usage: GLenum = gl.STATIC_DRAW,
    glbuffer?: WebGLBuffer
  ) {
    super();
    this.gl = gl;
    this.usage = usage;
    this.buffer = gl.createBuffer();
    this.attribs = [];

    if (data) {
      this.data(data);
    }
  }
  /**
   * Bind the underlying webgl buffer.
   */
  bind() {
    this.gl.bindBuffer(TGT, this.buffer);
  }

  /**
   * Add attribute declaration for this buffer. Once attributes declared, the buffer can be linked to
   * programs attributes using {@link ArrayBuffer#attribPointer}
   *  @param {string} name the name of the program's attribute
   *  @param {uint} size the size of the attribute (3 for a vec3)
   *  @param {GLenum} type the type of data (GL_FLOAT, GL_SHORT etc)
   *  @param {boolean} [normalize=false] indicate if the data must be normalized
   */
  attrib(name: string, size: number, type: GLenum, normalize: boolean = false) {
    this.attribs.push({
      name,
      type: 0 | type,
      size: 0 | size,
      normalize,
      offset: this.stride,
      stride: 0,
    });
    this.stride += getComponentSize(type) * size;
    this._computeLength();
    return this;
  }

  /**
   * Fill webgl buffer with the given data. You can also pass a uint  to allocate the buffer to the given size.
   *   @param {ArrayBuffer|uint} array the data to send to the buffer, or a size.
   */
  data(array: TypedArray) {
    var gl = this.gl;
    this._data = array;
    gl.bindBuffer(TGT, this.buffer);
    gl.bufferData(TGT, array, this.usage);
    gl.bindBuffer(TGT, null);
    this.byteLength = isBufferSource(array) ? array.byteLength : array;
    this._computeLength();
  }

  /**
   * Set a part of the buffer with the given data, starting a offset (in bytes)
   *  @param {typedArray} array the data to send to buffer
   *  @param {uint} offset the offset in byte where the data will be written
   */
  subData(array: BufferSource, offset: number) {
    var gl = this.gl;
    gl.bindBuffer(TGT, this.buffer);
    gl.bufferSubData(TGT, offset, array);
    gl.bindBuffer(TGT, null);
  }

  /**
   * Link given program attributes to this buffer. You should first declare attributes using {@link ArrayBuffer#attrib}
   * before calling this method.
   *   @param {Program} program the nanogl Program
   */
  attribPointer(program: Program) {
    var gl = this.gl;
    gl.bindBuffer(TGT, this.buffer);
    
    
    for (var i = 0; i < this.attribs.length; i++) {
      var attrib = this.attribs[i];

      if (program[attrib.name] !== undefined) {
        var aLocation = program[attrib.name]();
        gl.enableVertexAttribArray(aLocation);
        gl.vertexAttribPointer(
          aLocation,
          attrib.size,
          attrib.type,
          attrib.normalize,
          this.stride,
          attrib.offset
        );
      }
    }
  }
  /**
   * 
   * @param program 
   * @param ext 
   */
  attribDivisorANGLE(program: Program, ext: ANGLE_instanced_arrays, divisor:number=1) {
    var gl = this.gl;
    gl.bindBuffer(TGT, this.buffer);
    for (var i = 0; i < this.attribs.length; i++) {
      const attrib = this.attribs[i];
      if (program[attrib.name] !== undefined) {
        const aLocation = program[attrib.name]();
        ext.vertexAttribDivisorANGLE(aLocation, divisor);
      }
    }
  }

  /**
   * Shortcut to gl.drawArrays
   *   @param {GLenum} mode the type of primitive to draw (GL_TRIANGLE, GL_POINTS etc)
   *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position of the first vertex to draw
   */
  draw(mode: GLenum, count: number = this.length, offset: number = 0) {
    this.gl.drawArrays(mode, offset, 0 | count);
  }

  /**
   * Delete underlying webgl objects
   */
  dispose() {
    this.gl.deleteBuffer(this.buffer);
    // this.buffer = null;
    // this.gl = null;
  }
  _computeLength() {
    if (this.stride > 0) {
      this.length = this.byteLength / this.stride;
    }
  }
  setup(prg: Program) {
    this.bind();
    this.attribPointer(prg);
  }
  render() {
    this.drawTriangles();
  }
}

export default ArrayBuffer;
