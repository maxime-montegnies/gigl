import { getComponentSize, isBufferSource } from './bufferutils';
import BaseBuffer from "./basebuffer";

/* GL_ELEMENT_ARRAY_BUFFER */
var TGT = 0x8893;

/**
 * @class
 * @implements {Drawable}
 * @param {WebGLRenderingContext} gl      then webgl context this ArrayBuffer belongs to
 * @param {GLenum} [type=GL_UNSIGNED_SHORT]  the inetger type of the indices (GL_UNSIGNED_BYTE, GL_UNSIGNED_INT etc)
 * @param {TypedArray|uint} [data]   optional data to copy to buffer, or the size (in bytes)
 * @param {GLenum} [usage=GL_STATIC_DRAW] the usage hint for this buffer.
 *
 */
class IndexBuffer extends BaseBuffer {
  readonly gl: WebGLRenderingContext;
  buffer: WebGLBuffer | null;
  usage: GLenum;
  type: number = 0;
  typeSize: number = 0;
  size: number = 0;
  constructor(gl:WebGLRenderingContext, type:GLenum=gl.UNSIGNED_SHORT, data?: GLsizeiptr | BufferSource, usage:GLenum = gl.STATIC_DRAW) {
    super();
    this.gl = gl;
    this.buffer = gl.createBuffer();
    this.usage = usage;

    this.setType(type);

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
   *  Change the type of internal type of the IndexBuffer
   *  @param {GLenum} type  the integer type of the indices (GL_UNSIGNED_BYTE, GL_UNSIGNED_INT etc)
   */
  setType(type:GLenum) {
    this.type = type;
    this.typeSize = getComponentSize(type);
  }

  /**
   * Fill webgl buffer with the given data. You can also pass a uint  to allocate the buffer to the given size.
   *   @param {TypedArray|uint} array the data to send to the buffer, or a size.
   */
  data(array:BufferSource | GLsizeiptr) {
    var gl = this.gl;
    gl.bindBuffer(TGT, this.buffer);
    gl.bufferData(TGT, array as any, this.usage);
    gl.bindBuffer(TGT, null);
    this.size = isBufferSource(array) ? array.byteLength : array;
    // this.size = array.byteLength === undefined ? array : array.byteLength;
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
   * Delete underlying webgl objects
   */
  dispose() {
    this.gl.deleteBuffer(this.buffer);
    this.buffer = null;
    // this.gl = null;
  }

  /**
   * Shortcut to gl.drawArrays
   *   @param {GLenum} mode the type of primitive to draw (GL_TRIANGLE, GL_POINTS etc)
   *   @param {uint} [count] the number of indices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position of the first index to draw
   */
  draw(mode: number, count: number = this.size / this.typeSize, offset: number = 0) {
    count = count === undefined ? this.size / this.typeSize : count;
    this.gl.drawElements(mode, count, this.type, offset);
  }
}

export default IndexBuffer;
