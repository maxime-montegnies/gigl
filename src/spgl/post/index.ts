import Program from "../program";
import Fbo from "../depth-texture/fbo";
import GLArrayBuffer from "../arraybuffer/arraybuffer";
import Texture from "../texture";

import main_frag from "./glsl/main.frag";
import main_vert from "./glsl/main.vert";

import Effect from "./effects/base-effect";
import BaseEffect from "./effects/base-effect";

import MFbo from "../fbo";


class Post {
  gl: WebGLRenderingContext;
    private _effects: Effect[] = [];
    private _flags: number = 0;
    private _shaderInvalid: boolean = true;
    renderWidth = 1;
    renderHeight = 1;

    bufferWidth = 1;
    bufferHeight = 1;
    // enabled = true;
    enabled = false;
    mipmap: boolean;
    hasDepthTexture = false
    float_texture_ext: OES_texture_float | null;
    halfFloat: OES_texture_half_float | null;
    halfFloat_l: OES_texture_float_linear | null;
    mainFbo: MFbo;
    mainFbo2: MFbo;
    depthFbo: any;
    prg: Program;
    fsPlane: GLArrayBuffer;
  constructor(gl: WebGLRenderingContext, mipmap: boolean) {
    this.gl = gl;


    this.mipmap = mipmap === undefined ? false : mipmap;
    

    this.float_texture_ext = gl.getExtension("OES_texture_float");
    this.halfFloat = gl.getExtension("OES_texture_half_float");
    this.float_texture_ext = gl.getExtension("OES_texture_half_float_linear");
    this.halfFloat_l = gl.getExtension("OES_texture_float_linear");

    
    this.mainFbo = this.genFbo();
    this.mainFbo2 = this.genFbo();
    // this.depthFbo = this.genDepthFbo();
    
    // test fbo's mipmaping capability
    if (this.mipmap) {
      this.mainFbo.color.bind();
      gl.generateMipmap(gl.TEXTURE_2D);

      var err = gl.getError();
      if (err) {
        this.mipmap = false;
        // this fbo is now fu*** up, need to create a fresh one
        this.mainFbo.dispose();
        this.mainFbo = this.genFbo();
      }
    }

    this.mainFbo.color.setFilter(false, this.mipmap, false);
    this.mainFbo2.color.setFilter(false, this.mipmap, false);

    this.prg = new Program(gl);

    var fsData = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
    this.fsPlane = new GLArrayBuffer(gl, fsData);
    this.fsPlane.attrib("aTexCoord0", 2, gl.FLOAT);
  }

  dispose () {
    this.mainFbo.dispose();
    this.mainFbo2.dispose();
    this.fsPlane.dispose();
    this.prg.dispose();
  }

  _needDepth ():any {
    return (this._flags & Effect.NEED_DEPTH) !== 0;
  }

  _needLinear () {
    return (this._flags & Effect.NEED_LINEAR) !== 0;
  }

  genFbo () {
    var gl = this.gl;

    var ctxAttribs = gl.getContextAttributes()!;
    var types = [gl.UNSIGNED_BYTE];
    // if( this.halfFloat ){
    //   types.unshift( this.halfFloat.HALF_FLOAT_OES );
    // }

    var fbo = Fbo.create(gl, {
      depth: ctxAttribs.depth,
      stencil: ctxAttribs.stencil,
      type: types,
      format: ctxAttribs.alpha ? gl.RGBA : gl.RGB,
    });
    // format: ctxAttribs.alpha ? gl.RGBA : gl.RGB,

    // force attachment allocation
    fbo.resize(4, 4);
    
    
    fbo.color.bind();
    fbo.color.clamp();
    
    if ((this.hasDepthTexture = fbo.attachment.isDepthTexture())) {
        var depth = fbo.attachment.buffer!;
        (depth as Texture).bind();
        (depth as Texture).clamp();
        (depth as Texture).setFilter(false, false, false);
    }

    return fbo;
  }

  genDepthFbo () {
    // depth only FBO
    // alert("genDepthFbo");
    var fbo = Fbo.create(this.gl, {
      depth: true,
      format: this.gl.RGB,
      type : undefined,
      stencil : undefined
    });
    fbo.color.bind();
    fbo.color.setFilter(false, false, false);
    fbo.color.clamp();
    return fbo;
  }

  add (effect:BaseEffect) {
    
    
    if (this._effects.indexOf(effect) === -1) {
      this._effects.push(effect);
      effect._init(this);
      effect.resize(this.renderWidth, this.renderHeight);
      this._flags |= effect._flags;
      this._shaderInvalid = true;
    }
  }

  remove (effect:BaseEffect) {
    var i = this._effects.indexOf(effect);
    if (i > -1) {
      this._effects.splice(i, 1);
      effect.release();
      effect.post = null;
      this._shaderInvalid = true;

      if (effect._flags !== 0) {
        this._flags = 0;
        for (var i = 0; i < this._effects.length; i++) {
          this._flags |= effect._flags;
        }
      }
    }
  }

  resize (width:number, height:number) {
    this.bufferWidth = width;
    this.bufferHeight = height;

    
    

    this.mainFbo.resize(this.bufferWidth, this.bufferHeight);
    this.mainFbo2.resize(this.bufferWidth, this.bufferHeight);


    for (var i = 0; i < this._effects.length; i++) {
      this._effects[i].resize(width, height);
    }
  }

  preRender (width:number, height:number) {
    var gl = this.gl;

    this.renderWidth = width;
    this.renderHeight = height;

    if (this.enabled) {
      var bufferWidth = this.mipmap ? nextPOT(width) : width;
      var bufferHeight = this.mipmap ? nextPOT(height) : height;
        
        
        
      if (
        this.bufferWidth !== bufferWidth ||
        this.bufferHeight !== bufferHeight
      ) {
        this.resize(bufferWidth, bufferHeight);
      }
    }
  }

  needDepthPass () {
    return this.enabled && this._needDepth() && !this.hasDepthTexture;
  }

  bindDepth () {
    if (!this.needDepthPass()) {
    //   return false;
    }
    // alert("bindDepth")
    var gl = this.gl;
    this.depthFbo.bind();
    gl.viewport(0, 0, this.renderWidth, this.renderHeight);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    return true;
  }
  
  bindColor0 () {
    var gl = this.gl;
    this.mainFbo2.bind();
    
    
    gl.viewport(0, 0, this.renderWidth, this.renderHeight);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    this.mainFbo2.clear();
  }
  bindColor () {
    
    
    var gl = this.gl;

    if (this.enabled) {
      this.mainFbo.bind();
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    gl.viewport(0, 0, this.renderWidth, this.renderHeight);
    gl.clearColor(5.5/100, 6.3/100, 11.4/100, 1.0);
    gl.clearColor(26/255, 47/255, 67/255, 1.0);
    // gl.clearColor(1, 1, 1, 1.0); 
    // just clear, main fbo or screen one
    this.mainFbo.clear();

    
  }

  render (toFbo:MFbo|undefined) {
    if (!this.enabled) {
      return;
    }

    var gl = this.gl;

    // mipmap mainFbo here
    this.mainFbo.color.bind();
    if (this.mipmap) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    for (var i = 0; i < this._effects.length; i++) {
      this._effects[i].preRender();
    }

    if (toFbo !== undefined) {
      toFbo.resize(this.renderWidth, this.renderHeight);
      toFbo.bind();
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.renderWidth, this.renderHeight);
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (this._shaderInvalid) {
      this.buildProgram();
    }

    this.prg.use();

    for (var i = 0; i < this._effects.length; i++) {
      this._effects[i].setupProgram(this.prg);
    }

    this.prg.tInput(this.mainFbo.color);

    if (this._needDepth()) {
      if (this.hasDepthTexture) this.prg.tDepth(this.mainFbo.attachment.buffer);
      else this.prg.tDepth(this.depthFbo.color);
    }

    this.fillScreen(this.prg);
  }

  fillScreen (prg:Program, fullframe:boolean = false) {
    if (fullframe === true) {
      prg.uViewportScale(1, 1);
    } else {
      prg.uViewportScale(
        this.renderWidth / this.bufferWidth,
        this.renderHeight / this.bufferHeight
      );
    }

    prg.uViewportScale2(
        this.renderWidth / this.bufferWidth,
        this.renderHeight / this.bufferHeight
      );

    this.fsPlane.attribPointer(prg);
    this.fsPlane.drawTriangleStrip();
  }

  buildProgram () {
    
    var code : string[]|string = [],
      precode : string[]|string = [];

    var effects = this._effects;
    
    
    for (var i = 0; i < effects.length; i++) {
        effects[i].genCode(precode, code);
    }
    

    code = code.join("\n");
    precode = precode.join("\n");

    
    

    var frag = main_frag.replace("{{@precode}}", precode).replace("{{@code}}", code);
    

    var vert = main_vert;

    
   
    var depthTex =
      this._needDepth() && this.mainFbo.attachment.isDepthTexture();
    var defs = "\n";
    defs += "precision highp float;\n";
    defs += "#define NEED_DEPTH " + (0 | this._needDepth()) + "\n";
    defs += "#define TEXTURE_DEPTH " + (0 | depthTex) + "\n";

    this.prg.compile(vert, frag, defs);

    
    this._shaderInvalid = false;
    
    this.mainFbo.color.bind();
    
    
    this.mainFbo.color.setFilter(true, this.mipmap, this._needLinear());
    this.mainFbo2.color.setFilter(true, this.mipmap, true);
    // this.mainFbo2.color.setFilter(this._needLinear(), this.mipmap, false);

  }
}


// ----------------
// utilities
// ----------------

var MAX_POT = 4096;

function nextPOT(n:number) {
  var p = 1;

  while (p < n) p <<= 1;

  if (p > MAX_POT) p = MAX_POT;

  return p;
}

export default Post;
