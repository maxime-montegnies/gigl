import Texture from "../texture";
import Fbo from "../fbo";

var T_FLAG = 128;

/**
 * Create a classic nanogl Fbo, with depth texture as depth attachment, take same param as Nanogl Fbo.
 * If opts.depth  is false Fbo is untouched
 * @param {WebGLRenderingContext} gl      the webgl context this Fbo belongs to
 * @param {Object} [opts]
 * @param {boolean} [opts.depth=false] if true, a depth renderbuffer is attached
 * @param {boolean} [opts.stencil=false] if true, a stencil renderbuffer is attached
 * @param {GLenum|GLenum[]} [opts.type=GL_UNSIGNED_BYTE] the pixel type of the Fbo, can be gl.UNSIGNED_BYTE, gl.FLOAT, half.HALF_FLOAT_OES etc. you can also provide an array of types used as cascaded fallbacks
 * @param {GLenum} [opts.format=GL_RGB] the internal pixel format.
 *
 */
interface iOpts {
  depth: boolean | undefined;
  stencil: boolean | undefined;
  type: GLenum | GLenum[] | undefined;
  format: GLenum | undefined;
}
function create(gl: WebGLRenderingContext, opts: iOpts) {
  // create a basic Fbo and replace his attachment by extended one
  var fbo = new Fbo(gl, opts);
  if (fbo.attachment.flags & 1) {
    var att = fbo.attachment;
    fbo.attachment = new DepthStencilAttachment(
      fbo,
      fbo.attachment.flags | T_FLAG
    );
    att.dispose();
  }
  return fbo;
}



// const flag = true; 

//---------------------------------
//         Depth/Stencil Attachment
//---------------------------------
class DepthStencilAttachment {
  fbo: Fbo;
  buffer: null | WebGLRenderbuffer | Texture;
  flags: number;
  private _depthTexExt: null | any;
  constructor(fbo: Fbo, flags: number) {
    this.fbo = fbo;
    this.flags = flags;
    this.buffer = null;
    this._depthTexExt = null;

    var gl = fbo.gl;

    // activate extension and
    // discard depthTex if extension unavailable
    if (this.flags & T_FLAG) {
      this._depthTexExt =
        gl.getExtension("WEBGL_depth_texture") ||
        gl.getExtension("WEBKIT_WEBGL_depth_texture") ||
        gl.getExtension("MOZ_WEBGL_depth_texture");

      if (this._depthTexExt === null) {
        this.flags = this.flags & ~T_FLAG;
      }
    }
  }

  _init() {
    var gl = this.fbo.gl;
    var attType = this.flags & 3;
    var depth = null;
    
    if (this.flags & T_FLAG) {
        
      depth = new Texture(gl, getTextureFormat(gl, attType));
      depth.fromData(
        this.fbo.width,
        this.fbo.height,
        null,
        getTextureInternalFormat(gl, attType)
      );
      
      if (gl.getError() === gl.INVALID_VALUE) {
        // depth texture not supported
        this.flags = this.flags & ~T_FLAG;
        depth.dispose();
        this._allocate();
        return;
      }

      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        getAttachmentType(gl, attType),
        gl.TEXTURE_2D,
        depth.id,
        0
      );
    } else if (attType) {
      depth = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        getAttachmentType(gl, attType),
        gl.RENDERBUFFER,
        depth
      );
    }

    
    this.buffer = depth;
  }

  isDepthTexture() {
    return (this.flags & T_FLAG) !== 0;
  }

  _allocate() {
    var gl = this.fbo.gl;
    if (this.flags & T_FLAG) {
      (this.buffer as Texture).fromData(
        this.fbo.width,
        this.fbo.height,
        null,
        getTextureInternalFormat(gl, this.flags & 3)
      );
    } else if (this.flags & 3) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.buffer);
      gl.renderbufferStorage(
        gl.RENDERBUFFER,
        getAttachmentFormat(gl, this.flags & 3),
        this.fbo.width,
        this.fbo.height
      );
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
  }

  dispose() {
    if (this.buffer) {
      if (this.flags & T_FLAG) {
        (this.buffer as Texture).dispose();
      } else {
        this.fbo.gl.deleteRenderbuffer(this.buffer);
      }
    }
    this.buffer = null;
    this._depthTexExt = null;
  }

  clearBits() {
    return (this.flags & 1 ? 0x0100 : 0) | (this.flags & 2 ? 0x0400 : 0);
  }
}


//---------------------------------
//                        Utilities
//---------------------------------

// renderbuffer format
function getAttachmentFormat(gl: WebGLRenderingContext, type: number) {
  switch (type) {
    case 1:
      return 0x81a5; // DEPTH_COMPONENT16;
    case 2:
      return 0x8d48; // STENCIL_INDEX8;
    case 3:
      return 0x84f9; // DEPTH_STENCIL;
    default:
      throw new Error("unknown attachment type " + type);
  }
}

// depth texture format
function getTextureFormat(gl: WebGLRenderingContext, type: number) {
  switch (type) {
    case 1:
      return 0x1902; // DEPTH_COMPONENT;
    case 3:
      return 0x84f9; // DEPTH_STENCIL;
    default:
      throw new Error("unknown texture type " + type);
  }
}

// depth texture internal format
function getTextureInternalFormat(gl: WebGLRenderingContext, type: number) {
  switch (type) {
    case 1:
      return 0x1405; // UNSIGNED_INT;
    case 3:
      return 0x84fa; // UNSIGNED_INT_24_8_WEBGL (WEBGL_depth_texture extension)
    default:
      throw new Error("unknown texture type " + type);
  }
}

function getAttachmentType(gl: WebGLRenderingContext, type: number) {
  switch (type) {
    case 1:
      return 0x8d00; // DEPTH_ATTACHMENT
    case 2:
      return 0x8d20; // STENCIL_ATTACHMENT;
    case 3:
      return 0x821a; // DEPTH_STENCIL_ATTACHMENT;
    default:
      throw new Error("unknown attachment type " + type);
  }
}

export default {
  create: create,
};
