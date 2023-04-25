import Texture from "../../texture";
import Program from "../../program";
import Fbo from "../../fbo";
import BaseEffect from "./base-effect";

import frag_precode from "../glsl/bloom_pre.frag";
import frag_code from "../glsl/bloom.frag";
import prc_frag from "../glsl/bloom_process.frag";
import prc_vert from "../glsl/main.vert";

// var TEX_SIZE = 128;
// var TEX_SIZE = 256;
var TEX_SIZE = 512; 
// var TEX_SIZE = 128;
// var TEX_SIZE = 1024;
// var TEX_SIZE = 2048;




class Bloom extends BaseEffect {
  color: any;
  size: number;
  sizeFix: number;
  bloomTargets: Fbo[];
  bloomSamples: number;
  bloomKernel: null | Float32Array;
  private _preCode: string;
  private _code: string;
  prcPrg?: Program | null;
  constructor(color: any, size: number) {
    super();


    // this._flags = BaseEffect.NEED_DEPTH | BaseEffect.NEED_LINEAR;
    // this._flags = BaseEffect.NEED_DEPTH;

    this.color = color;
    this.size = size;
    this.sizeFix = 1.0;

    //   this.bloomTextures = [];
    this.bloomTargets = [];
    this.bloomSamples = 0;
    this.bloomKernel = null;

    this._preCode = frag_precode.replace("#define GLSLIFY 1", "");
    this._code = frag_code.replace("#define GLSLIFY 1", "");
  }

  resize(width:number, height:number) {
    this.sizeFix = 1 / (width / TEX_SIZE / 8);
    
  }

  init(precode: string, code: string) {
    var gl = this.post!.gl;

    var float_texture_ext = gl.getExtension("OES_texture_float");
    var halfFloat = gl.getExtension("OES_texture_half_float");
    var maxFuniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

    var types = [gl.FLOAT, gl.UNSIGNED_BYTE];
    if (halfFloat) {
      types.unshift(halfFloat.HALF_FLOAT_OES);
    }

    for (var i = 0; i < 2; ++i) {
      this.bloomTargets[i] = new Fbo(gl, {
        type: types,
        format: gl.RGB,
      });

      
      this.bloomTargets[i].resize(TEX_SIZE, TEX_SIZE);
      

      this.bloomTargets[i].color.setFilter(true, false, false);
      this.bloomTargets[i].color.clamp();
    }
    

    for (this.bloomSamples = 64; this.bloomSamples + 16 >= maxFuniforms; ) {
      this.bloomSamples /= 2;
    } 
    this.bloomSamples = 16;

    this.bloomKernel = new Float32Array(this.bloomSamples * 4);

    var defs = "\n";
    defs += "precision highp float;\n";
    defs += "#define BLOOM_SAMPLES " + this.bloomSamples + "\n";

    this.prcPrg = new Program(gl);
    this.prcPrg.compile(
      prc_vert.replace("#define GLSLIFY 1", ""),
      prc_frag.replace("#define GLSLIFY 1", ""),
      defs
    );
    
  }

  release() {
    this.prcPrg!.dispose();
    this.prcPrg = null;
    for (var i = 0; i < 2; ++i) {
      this.bloomTargets[i].dispose();
    }

    this.bloomTargets = [];
  }

  genCode(precode: string[], code: string[]) {
    precode.push(this._preCode);
    code.push(this._code);
  }

  preRender() {

    
    this.computeKernel();

    this.bloomTargets[0].bind();
    this.bloomTargets[0].clear();
    this.prcPrg!.use();
    this.prcPrg!.tDepthColor(this.post!.mainFbo2.color);
    // this.prcPrg!.yolo(0.0);
    this.prcPrg!.tInput(this.post!.mainFbo.color);
    this.prcPrg!.uKernel(this.bloomKernel);
    // this.post!.fillScreen(this.prcPrg!);
    this.post!.fillScreen(this.prcPrg!); 
    
    this.transposeKernel();
    
    this.bloomTargets[1].bind();
    this.bloomTargets[1].clear();
    // this.prcPrg!.yolo(1.0); 
    this.prcPrg!.tDepthColor(this.post!.mainFbo2.color);
    this.prcPrg!.tInput(this.bloomTargets[0].color);
    this.prcPrg!.uKernel(this.bloomKernel);
    // this.post!.fillScreen(this.prcPrg!, true);
    this.post!.fillScreen(this.prcPrg!, true); 
  }

  setupProgram(prg: Program) {
    var c = this.color;

    prg.uBloomColor(c[0], c[1], c[2]);
    prg.t2(this.post!.mainFbo2.color);

    prg.tBloom(this.bloomTargets[1].color);
  }

  computeKernel() {
    var kernel = this.bloomKernel;

    var SQRT_PI = Math.sqrt(Math.PI);

    for (var c = 0, sample = 0; sample < this.bloomSamples; ++sample) {
      var i = sample * 4;

      var delta = (2 * sample) / (this.bloomSamples - 1) - 1;
      var density = 4.0 * delta;

      // normal_dens
      density = Math.exp((-density * density) / 2.0) / SQRT_PI;
      c += density;

      kernel![i + 0] = delta * this.size * this.sizeFix;
      kernel![i + 1] = 0;
      kernel![i + 2] = density;
      kernel![i + 3] = 0;
      
    }

    for (sample = 0; sample < this.bloomSamples; ++sample) {
      kernel![4 * sample + 2] /= c;
    }

    

  }

  transposeKernel() {
    var kernel = this.bloomKernel;

    var ratio = this.post!.renderWidth / this.post!.renderHeight;

    for (var sample = 0; sample < this.bloomSamples; ++sample) {
      var i = sample << 2;
      kernel![i + 1] = kernel![i] * ratio;
      kernel![i] = 0;
    }
  }
}

export default Bloom;
