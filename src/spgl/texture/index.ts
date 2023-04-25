let _UID = 0;
const T2D = 0x0de1;

function getFilter(smooth:boolean, mipmap:boolean, miplinear:boolean) {
  return 0x2600 | +smooth | (+mipmap << 8) | (+(mipmap && miplinear) << 1);
}
class Texture {
  _uid: number;
  gl: WebGLRenderingContext;
  id: WebGLTexture;
  width: number = 0;
  height: number = 0;
  format  : GLenum = 0;
  type    : GLenum = 0;
  constructor(gl:WebGLRenderingContext, format:GLenum) {
    this._uid = _UID++;
    this.gl = gl;
    this.id = <WebGLTexture>gl.createTexture();
    this.format = format || gl.RGB;
    this.type = gl.UNSIGNED_BYTE;
    gl.bindTexture(T2D, this.id);
    this.setFilter(true);
  }
  fromImage(img:TexImageSource) {
    var gl = this.gl;
    this.width = img.width;
    this.height = img.height;
    gl.bindTexture(T2D, this.id);
    gl.texImage2D(T2D, 0, this.format, this.format, this.type, img);
  }
  fromVideo(img:HTMLVideoElement) {    
    var gl = this.gl;
    this.width = img.videoWidth;
    this.height = img.videoHeight;
    gl.bindTexture(T2D, this.id);
    gl.texImage2D(T2D, 0, this.format, this.format, this.type, img);
  }
  fromData(width:number, height:number, data:ArrayBufferView|null = null, dataType:GLenum = this.gl.UNSIGNED_BYTE) {
    var gl = this.gl;

    this.width = width;
    this.height = height;

    this.type = dataType || gl.UNSIGNED_BYTE;

    gl.bindTexture(T2D, this.id);
    gl.texImage2D( T2D, 0, this.format, width, height, 0, this.format, this.type, data );
  }
  bind(unit : number = 0) {
    var gl = this.gl;
    if (unit !== undefined) {
      gl.activeTexture(gl.TEXTURE0 + unit);
    }
    gl.bindTexture(T2D, this.id);
  }
  dispose() {
    this.gl.deleteTexture(this.id);
  }
  setFilter(smooth:boolean = false, mipmap:boolean = false, miplinear:boolean = false) {
    var gl = this.gl;
    var filter = getFilter(!!smooth, !!mipmap, !!miplinear);
    gl.texParameteri(
      T2D,
      gl.TEXTURE_MAG_FILTER,
      // filter
      getFilter(!!smooth, false, false)
    );
    gl.texParameteri(T2D, gl.TEXTURE_MIN_FILTER, filter);
  }
  repeat() {
    this.wrap(this.gl.REPEAT);
  }
  clamp() {
    this.wrap(this.gl.CLAMP_TO_EDGE);
  }
  mirror() {
    this.wrap(this.gl.MIRRORED_REPEAT);
  }
  mirrorV() {
    var gl = this.gl;
    gl.texParameteri(T2D, gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT);
  }
  repeatH() {
    var gl = this.gl;
    gl.texParameteri(T2D, gl.TEXTURE_WRAP_S, this.gl.REPEAT);
  }
  wrap(wrap: GLenum) {
    var gl = this.gl;
    gl.texParameteri(T2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(T2D, gl.TEXTURE_WRAP_T, wrap);
  }
}

export default Texture;
