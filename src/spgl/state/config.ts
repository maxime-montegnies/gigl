export const DAT_SIZE = 51;
const EHBuffer = new Float32Array(1);
const EHIBuffer = new Uint32Array(EHBuffer.buffer);
export const DAT_MASKS = [
    1,
    512,
    1024,
    1024,
    2048,
    4096,
    4096,
    4,
    8192,
    2,
    16384,
    32768,
    256,
    65536,
    65536,
    65536,
    262144,
    131072,
    131072,
    131072,
    524288,
    524288,
    524288,
    2097152,
    1048576,
    1048576,
    1048576,
    128,
    4194304,
    4194304,
    4194304,
    4194304,
    8,
    16,
    8388608,
    8388608,
    32,
    64,
    16777216,
    33554432,
    67108864,
    67108864,
    67108864,
    67108864,
    134217728,
    134217728,
    134217728,
    134217728,
    268435456,
    268435456,
    536870912
], _DEFAULT_SET = (1 |
    2 |
    4 |
    8 |
    16 |
    128 |
    256 |
    512 |
    1024 |
    8192 |
    16384 |
    32768 |
    65536 |
    131072 |
    262144 |
    4194304 |
    8388608 |
    16777216 |
    33554432 |
    67108864 |
    268435456 |
    536870912), _DEFAULT_STATE = new Uint16Array([
    0,
    32774,
    0,
    1,
    0,
    0,
    0,
    0,
    513,
    0,
    1029,
    2305,
    0,
    519,
    0,
    65535,
    65535,
    7680,
    7680,
    7680,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0, 0, 0, 0,
    1,
    0,
    0,
    0,
    0,
    0,
    15,
    1,
    0, 0, 0, 0,
    0, 0, 0, 0,
    encodeClampedFloat(0),
    encodeClampedFloat(1),
    encodeHalf(1),
]);
function _fixSet(set:number):number {
    return (set |
        ((set & 4096) >>> 2) |
        ((set & 2048) >>> 2) |
        ((set & 524288) >>> 3) |
        ((set & 1048576) >>> 3) |
        ((set & 2097152) >>> 3));
}
function encodeClampedFloat(f:number) {
    return Math.round(f * 0xFFFF) | 0;
}
function decodeClampedFloat(s:number) {
    return (s / (+0xFFFF));
}
function decodeHalf(u16:number):number {
    var exponent = (u16 & 0x7C00) >> 10, fraction = u16 & 0x03FF;
    return (u16 >> 15 ? -1 : 1) * (exponent ?
        (exponent === 0x1F ?
            fraction ? NaN : Infinity :
            Math.pow(2, exponent - 15) * (1 + fraction / 0x400)) :
        6.103515625e-5 * (fraction / 0x400));
}
function encodeHalf(f32:number):number {
    EHBuffer[0] = f32;
    const fltInt32 = EHIBuffer[0];
    let fltInt16 = (fltInt32 >> 31) << 5;
    let tmp = (fltInt32 >> 23) & 0xff;
    tmp = (tmp - 0x70) & (((0x70 - tmp) >> 4) >> 27);
    fltInt16 = (fltInt16 | tmp) << 10;
    fltInt16 |= (fltInt32 >> 13) & 0x3ff;
    return fltInt16;
}
function getGlParameter(gl:WebGLRenderingContext, p:GLenum) {
    return gl.getParameter(p);
}

export default class GLConfig {
  _dat: Uint16Array;
  _set: number;
    constructor() {
        this._dat = new Uint16Array(51);
        this._set = 0;
    }
    static encodeHalf(f32:number):number {
        return encodeHalf(f32);
    }
    static decodeHalf(u16:number):number {
        return decodeHalf(u16);
    }
    toDefault() {
        this._dat.set(_DEFAULT_STATE);
        this._set = _DEFAULT_SET | 0;
    }
    clone() {
        const res = new GLConfig();
        res._dat.set(this._dat);
        res._set = this._set;
        return res;
    }
    patch(cfg:GLConfig, out:GLConfig) {
        var Bdat = this._dat, Bset = this._set, Adat = cfg._dat, Aset = cfg._set, Odat = out._dat, Oset = 0, sbit;
        Odat.set(Adat);
        for (var i = 0; i < (51 | 0); i++) {
            sbit = DAT_MASKS[i];
            if (0 !== (Bset & sbit)) {
                if ((0 === (Aset & sbit)) || (Bdat[i] !== Adat[i])) {
                    Oset |= sbit;
                    Odat[i] = Bdat[i];
                }
                Aset |= sbit;
                Adat[i] = Bdat[i];
            }
        }
        cfg._set = _fixSet(Aset);
        out._set = _fixSet(Oset);
    }
    setupGL(gl:WebGLRenderingContext) {
        const set = this._set, dat = this._dat;
        let i;
        if ((set & 1) !== 0) {
            dat[0] ? gl.enable(3042) : gl.disable(3042);
        }
        i = set & (512 | 2048);
        if (i !== 0) {
            if (i === (512 | 2048))
                gl.blendEquationSeparate(dat[1], dat[4]);
            else
                gl.blendEquation(dat[1]);
        }
        i = set & (1024 | 4096);
        if (i !== 0) {
            if (i === (1024 | 4096))
                gl.blendFuncSeparate(dat[3], dat[2], dat[6], dat[5]);
            else
                gl.blendFunc(dat[3], dat[2]);
        }
        if ((set & 4) !== 0) {
            dat[7] ? gl.enable(2929) : gl.disable(2929);
        }
        if ((set & 8192) !== 0) {
            gl.depthFunc(dat[8]);
        }
        if ((set & 2) !== 0) {
            dat[9] ? gl.enable(2884) : gl.disable(2884);
        }
        if ((set & 16384) !== 0) {
            gl.cullFace(dat[10]);
        }
        if ((set & 32768) !== 0) {
            gl.frontFace(dat[11]);
        }
        if ((set & 536870912) !== 0) {
            gl.lineWidth(decodeHalf(dat[50]));
        }
        if ((set & 256) !== 0) {
            dat[12] ? gl.enable(2960) : gl.disable(2960);
        }
        i = set & (65536 | 524288);
        if (i !== 0) {
            if (i === (65536 | 524288)) {
                gl.stencilFuncSeparate(1028, dat[13], dat[14], dat[15]);
                gl.stencilFuncSeparate(1029, dat[20], dat[21], dat[22]);
            }
            else {
                gl.stencilFunc(dat[13], dat[14], dat[15]);
            }
        }
        i = set & (131072 | 1048576);
        if (i !== 0) {
            if (i === (131072 | 1048576)) {
                gl.stencilOpSeparate(1028, dat[17], dat[18], dat[19]);
                gl.stencilOpSeparate(1029, dat[24], dat[25], dat[26]);
            }
            else {
                gl.stencilOp(dat[17], dat[18], dat[19]);
            }
        }
        i = set & (262144 | 2097152);
        if (i !== 0) {
            if (i === (262144 | 2097152)) {
                gl.stencilMaskSeparate(1028, dat[16]);
                gl.stencilMaskSeparate(1029, dat[23]);
            }
            else {
                gl.stencilMask(dat[16]);
            }
        }
        if ((set & 16777216) !== 0) {
            var flags = dat[38];
            gl.colorMask((flags & 1) === 1, (flags & 2) === 2, (flags & 4) === 4, (flags & 8) === 8);
        }
        if ((set & 33554432) !== 0) {
            gl.depthMask(dat[39] === 1);
        }
        if ((set & 67108864) !== 0) {
            gl.blendColor(decodeHalf(dat[40]), decodeHalf(dat[41]), decodeHalf(dat[42]), decodeHalf(dat[43]));
        }
        if ((set & 128) !== 0) {
            dat[27] ? gl.enable(3089) : gl.disable(3089);
        }
        if ((set & 4194304) !== 0) {
            gl.scissor(dat[28], dat[29], dat[30], dat[31]);
        }
        if ((set & 134217728) !== 0) {
            gl.viewport(dat[44], dat[45], dat[46], dat[47]);
        }
        if ((set & 16) !== 0) {
            dat[33] ? gl.enable(32823) : gl.disable(32823);
        }
        if ((set & 8388608) !== 0) {
            gl.polygonOffset(decodeHalf(dat[34]), decodeHalf(dat[35]));
        }
        if ((set & 268435456) !== 0) {
            gl.depthRange(decodeClampedFloat(dat[48]), decodeClampedFloat(dat[49]));
        }
    }
    fromGL(gl:WebGLRenderingContext) {
        this._set = 0;
        const enableBlend = getGlParameter(gl, 3042), enableCullface = getGlParameter(gl, 2884), enableDepthTest = getGlParameter(gl, 2929), enableDither = getGlParameter(gl, 3024), enablePolyOffset = getGlParameter(gl, 32823), enableScissor = getGlParameter(gl, 3089), enableStencil = getGlParameter(gl, 2960), blendSrcRGB = getGlParameter(gl, 32969), blendDstRGB = getGlParameter(gl, 32968), blendSrcAlpha = getGlParameter(gl, 32971), blendDstAlpha = getGlParameter(gl, 32970), blendEqRgb = getGlParameter(gl, 32777), blendEqAlpha = getGlParameter(gl, 34877), stencilFunc = getGlParameter(gl, 2962), stencilRef = getGlParameter(gl, 2967), stencilValueMask = getGlParameter(gl, 2963), stencilWriteMask = getGlParameter(gl, 2968), stencilOpFail = getGlParameter(gl, 2964), stencilOpZfail = getGlParameter(gl, 2965), stencilOpZpass = getGlParameter(gl, 2966), stencilBFunc = getGlParameter(gl, 34816), stencilBRef = getGlParameter(gl, 36003), stencilBValueMask = getGlParameter(gl, 36004), stencilBWriteMask = getGlParameter(gl, 36005), stencilBOpFail = getGlParameter(gl, 34817), stencilBOpZfail = getGlParameter(gl, 34818), stencilBOpZpass = getGlParameter(gl, 34819), polyOffsetFactor = getGlParameter(gl, 32824), polyOffsetUnits = getGlParameter(gl, 10752), scissorBox = getGlParameter(gl, 3088), colorMaskArray = getGlParameter(gl, 3107), depthWriteMask = getGlParameter(gl, 2930), blendColor = getGlParameter(gl, 32773), viewport = getGlParameter(gl, 2978), depthRange = getGlParameter(gl, 2928), lineWidth = getGlParameter(gl, 2849);
        this.enableBlend(enableBlend);
        if (blendSrcRGB !== blendSrcAlpha || blendDstRGB !== blendDstAlpha) {
            this.blendFuncSeparate(blendSrcRGB, blendDstRGB, blendSrcAlpha, blendDstAlpha);
        }
        else {
            this.blendFunc(blendSrcRGB, blendDstRGB);
        }
        if (blendEqRgb !== blendEqAlpha) {
            this.blendEquationSeparate(blendEqRgb, blendEqAlpha);
        }
        else {
            this.blendEquation(blendEqRgb);
        }
        this.enableStencil(enableStencil);
        if (stencilFunc !== stencilBFunc ||
            stencilRef !== stencilBRef ||
            stencilValueMask !== stencilBValueMask) {
            this.stencilFuncSeparate(stencilFunc, stencilRef, stencilValueMask, stencilBFunc, stencilBRef, stencilBValueMask);
        }
        else {
            this.stencilFunc(stencilFunc, stencilRef, stencilValueMask);
        }
        if (stencilOpFail !== stencilBOpFail ||
            stencilOpZfail !== stencilBOpZfail ||
            stencilOpZpass !== stencilBOpZpass) {
            this.stencilOpSeparate(stencilOpFail, stencilOpZfail, stencilOpZpass, stencilBOpFail, stencilBOpZfail, stencilBOpZpass);
        }
        else {
            this.stencilOp(stencilOpFail, stencilOpZfail, stencilOpZpass);
        }
        if (stencilWriteMask !== stencilBWriteMask) {
            this.stencilMaskSeparate(stencilWriteMask, stencilBWriteMask);
        }
        else {
            this.stencilMask(stencilWriteMask);
        }
        this.depthFunc(gl.getParameter(2932));
        this.enableDepthTest(enableDepthTest);
        this.cullFace(gl.getParameter(2885));
        this.enableCullface(enableCullface);
        this.frontFace(gl.getParameter(2886));
        this.enablePolygonOffset(enablePolyOffset);
        this.polygonOffset(polyOffsetFactor, polyOffsetUnits);
        this.enableScissor(enableScissor);
        this.scissor(scissorBox[0], scissorBox[1], scissorBox[2], scissorBox[3]);
        this.enableDither(enableDither);
        this.colorMask(colorMaskArray[0], colorMaskArray[1], colorMaskArray[2], colorMaskArray[3]);
        this.depthMask(depthWriteMask);
        this.blendColor(blendColor[0], blendColor[1], blendColor[2], blendColor[3]);
        this.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
        this.depthRange(depthRange[0], depthRange[1]);
        this.lineWidth(lineWidth);
    }
    enableBlend(flag = true) {
        this._dat[0] = +flag;
        this._set |= 1 | 0;
        return this;
    }
    blendFunc(src:GLenum, dst:GLenum) : this {
        this._dat[3] = src;
        this._dat[2] = dst;
        this._set = this._set & ~4096 | (1024);
        return this;
    }
    blendFuncSeparate(srcRgb : GLenum, dstRgb : GLenum, srcAlpha : GLenum, dstAlpha : GLenum ) : this {
        this._dat[3] = srcRgb;
        this._dat[2] = dstRgb;
        this._dat[6] = srcAlpha;
        this._dat[5] = dstAlpha;
        this._set |= 1024 | 4096;
        return this;
    }
    blendEquation(eq: GLenum):this {
        this._dat[1] = eq;
        this._set = this._set & ~2048 | (512);
        return this;
    }
    blendEquationSeparate(rgbEq: GLenum, alphaEq: GLenum):this {
        this._dat[1] = rgbEq;
        this._dat[4] = alphaEq;
        this._set |= 512 | 2048;
        return this;
    }
    blendColor(r:number, g:number, b:number, a:number ) : this {
        this._dat[40] = encodeHalf(r);
        this._dat[41] = encodeHalf(g);
        this._dat[42] = encodeHalf(b);
        this._dat[43] = encodeHalf(a);
        this._set |= 67108864 | 0;
        return this;
    }
    depthFunc(func: GLenum):this {
        this._dat[8] = func;
        this._set |= 8192 | 0;
        return this;
    }
    enableDepthTest(flag = true):this {
        this._dat[7] = +flag;
        this._set |= 4 | 0;
        return this;
    }
    depthRange(near : number, far : number):this {
        this._dat[48] = encodeClampedFloat(near);
        this._dat[49] = encodeClampedFloat(far);
        this._set |= 268435456 | 0;
        return this;
    }
    lineWidth(w:number):this {
        this._dat[50] = encodeHalf(w);
        this._set |= 536870912 | 0;
        return this;
    }
    cullFace(mode : GLenum):this {
        this._dat[10] = mode;
        this._set |= 16384 | 0;
        return this;
    }
    enableCullface(flag:boolean = true):this {
        this._dat[9] = +flag;
        this._set |= 2 | 0;
        return this;
    }
    polygonOffset(polyOffsetFactor : number, polyOffsetUnits : number):this {
        this._dat[34] = encodeHalf(polyOffsetFactor);
        this._dat[35] = encodeHalf(polyOffsetUnits);
        this._set |= 8388608 | 0;
        return this;
    }
    enablePolygonOffset(flag : boolean = true):this {
        this._dat[33] = +flag;
        this._set |= 16 | 0;
        return this;
    }
    enableScissor(flag : boolean = true):this {
        this._dat[27] = +flag;
        this._set |= 128 | 0;
        return this;
    }
    scissor(x : number, y : number, w : number, h : number):this {
        this._dat[28] = x;
        this._dat[29] = y;
        this._dat[30] = w;
        this._dat[31] = h;
        this._set |= 4194304 | 0;
        return this;
    }
    viewport(x : number, y : number, w : number, h : number):this {
        this._dat[44] = x;
        this._dat[45] = y;
        this._dat[46] = w;
        this._dat[47] = h;
        this._set |= 134217728 | 0;
        return this;
    }
    enableDither(flag : boolean = true):this {
        this._dat[32] = +flag;
        this._set |= 8 | 0;
        return this;
    }
    depthMask(flag : boolean):this {
        this._dat[39] = +flag;
        this._set |= 33554432 | 0;
        return this;
    }
    colorMask(r : boolean, g : boolean, b : boolean, a : boolean):this {
        const mask = ((r ? 1 : 0)) |
            ((g ? 1 : 0) << 1) |
            ((b ? 1 : 0) << 2) |
            ((a ? 1 : 0) << 3);
        this._dat[38] = mask;
        this._set |= 16777216 | 0;
        return this;
    }
    frontFace(dir : GLenum):this {
        this._dat[11] = dir;
        this._set |= 32768 | 0;
        return this;
    }
    enableStencil(flag = true):this {
        this._dat[12] = +flag;
        this._set |= 256 | 0;
        return this;
    }
    stencilFunc(func : GLenum, ref : number, mask : number):this {
        this._dat[13] = func;
        this._dat[14] = ref;
        this._dat[15] = mask;
        this._set = this._set & ~524288 | (65536);
        return this;
    }
    stencilOp(sfail : GLenum, dpfail : GLenum, dppass : GLenum):this {
        this._dat[17] = sfail;
        this._dat[18] = dpfail;
        this._dat[19] = dppass;
        this._set = this._set & ~1048576 | (131072);
        return this;
    }
    stencilMask(mask : number):this {
        this._dat[16] = mask;
        this._set = (this._set & ~2097152) | (262144);
        return this;
    }
    stencilFuncSeparate(func : GLenum, ref : number, mask : number, funcback : GLenum, refback : number, maskback : number):this {
        const dat = this._dat;
        dat[13] = func;
        dat[14] = ref;
        dat[15] = mask;
        dat[20] = funcback;
        dat[21] = refback;
        dat[22] = maskback;
        this._set |= 524288 | 65536;
        return this;
    }
    stencilOpSeparate(sfail : GLenum, dpfail : GLenum, dppass : GLenum, sfailback : GLenum, dpfailback : GLenum, dppassback : GLenum):this {
        const dat = this._dat;
        dat[17] = sfail;
        dat[18] = dpfail;
        dat[19] = dppass;
        dat[24] = sfailback;
        dat[25] = dpfailback;
        dat[26] = dppassback;
        this._set |= 1048576 | 131072;
        return this;
    }
    stencilMaskSeparate(mask : number, maskback : number):this {
        this._dat[16] = mask;
        this._dat[23] = maskback;
        this._set |= 2097152 | 262144;
        return this;
    }
}


/*
 * All following contstants should be inlined by uglify js
 * use  CONST  or  CONTS to force constants evaluation and inline exp by uglifyjs2
 */


/*
const enum Slots {

    BLEND_ENABLE          = 0 ,
    BLEND_EQ_C            = 1 ,    // BlendingFactorDest
    BLEND_FUNC_C_DST      = 2 ,    // Separate Blend Functions
    BLEND_FUNC_C_SRC      = 3 ,
    BLEND_EQ_A            = 4 ,    // BlendingFactorSrc   //
    BLEND_FUNC_A_DST      = 5 ,
    BLEND_FUNC_A_SRC      = 6 ,
    DEPTH_ENABLE          = 7 ,
    DEPTH_FUNC            = 8 ,    // DepthFunction
    CULL_FACE_ENABLE      = 9 ,
    CULL_MODE             = 10,    // CullFaceMode
    FACE_DIR              = 11,    // FrontFaceDirection
    STENCIL_ENABLE        = 12,
    STENCIL_FUNC          = 13,
    STENCIL_REF           = 14,
    STENCIL_VALUE_MASK    = 15,
    STENCIL_WRITEMASK     = 16,
    STENCIL_OP_FAIL       = 17,
    STENCIL_OP_ZFAIL      = 18,
    STENCIL_OP_ZPASS      = 19,
    STENCIL_B_FUNC        = 20,
    STENCIL_B_REF         = 21,
    STENCIL_B_VALUE_MASK  = 22,
    STENCIL_B_WRITEMASK   = 23,
    STENCIL_B_OP_FAIL     = 24,
    STENCIL_B_OP_ZFAIL    = 25,
    STENCIL_B_OP_ZPASS    = 26,
    SCISSOR_ENABLE        = 27,
    SCISSOR_TEST_X        = 28,    // SCISSOR_TEST
    SCISSOR_TEST_Y        = 29,    // SCISSOR_TEST
    SCISSOR_TEST_W        = 30,    // SCISSOR_TEST
    SCISSOR_TEST_H        = 31,    // SCISSOR_TEST
    DITHER_ENABLE         = 32,    //
    POLYOFF_ENABLE        = 33,
    POLYOFF_FACTOR        = 34,
    POLYOFF_UNITS         = 35,
    // COVERAGE_ENABLE       = 36,
    // ACOVERAGE_ENABLE      = 37,
    COLOR_MASK            = 38,
    DEPTH_MASK            = 39,
    BLEND_COLOR_R         = 40,
    BLEND_COLOR_G         = 41,
    BLEND_COLOR_B         = 42,
    BLEND_COLOR_A         = 43,
    VIEWPORT_X            = 44,
    VIEWPORT_Y            = 45,
    VIEWPORT_W            = 46,
    VIEWPORT_H            = 47,
    DEPTH_RANGE_NEAR      = 48,
    DEPTH_RANGE_FAR       = 49,
    LINE_WIDTH            = 50,
    
    LEN = 51,
  }
  
  export const DAT_SIZE = Slots.LEN;
  
  const enum SetsBits {
  
    BLEND_ENABLE_SET       = 1 << 0 ,
    CULL_FACE_ENABLE_SET   = 1 << 1 ,
    DEPTH_ENABLE_SET       = 1 << 2 ,
    DITHER_ENABLE_SET      = 1 << 3 ,
    POLYOFF_ENABLE_SET     = 1 << 4 ,
    COVERAGE_ENABLE_SET    = 1 << 5 ,
    ACOVERAGE_ENABLE_SET   = 1 << 6 ,
    SCISSOR_ENABLE_SET     = 1 << 7 ,
    STENCIL_ENABLE_SET     = 1 << 8 ,
    BLEND_EQ_SET           = 1 << 9 ,
    BLEND_FUNC_SET         = 1 << 10,
    BLEND_EQ_A_SET         = 1 << 11,
    BLEND_FUNC_A_SET       = 1 << 12,
    DEPTH_FUNC_SET         = 1 << 13,
    CULL_MODE_SET          = 1 << 14,
    FACE_DIR_SET           = 1 << 15,
    STENCIL_FUNC_SET       = 1 << 16,
    STENCIL_OP_SET         = 1 << 17,
    STENCIL_MASK_SET       = 1 << 18,
    STENCIL_B_FUNC_SET     = 1 << 19,
    STENCIL_B_OP_SET       = 1 << 20,
    STENCIL_B_MASK_SET     = 1 << 21,
    SCISSOR_TEST_SET       = 1 << 22,
    POLYOFF_SET            = 1 << 23,
    COLOR_MASK_SET         = 1 << 24,
    DEPTH_MASK_SET         = 1 << 25,
    BLEND_COLOR_SET        = 1 << 26,
    VIEWPORT_SET           = 1 << 27,
    DEPTH_RANGE_SET        = 1 << 28,
    LINE_WIDTH_SET         = 1 << 29,
      
  }
  
  const enum GL {
    BLEND                          = 0x0BE2,
    CULL_FACE                      = 0x0B44,
    DEPTH_TEST                     = 0x0B71,
    DITHER                         = 0x0BD0,
    POLYGON_OFFSET_FILL            = 0x8037,
    SCISSOR_TEST                   = 0x0C11,
    STENCIL_TEST                   = 0x0B90,
    BLEND_SRC_RGB                  = 0x80C9,
    BLEND_DST_RGB                  = 0x80C8,
    BLEND_SRC_ALPHA                = 0x80CB,
    BLEND_DST_ALPHA                = 0x80CA,
    BLEND_EQUATION_RGB             = 0x8009,
    BLEND_EQUATION_ALPHA           = 0x883D,
    STENCIL_FUNC                   = 0x0B92,
    STENCIL_REF                    = 0x0B97,
    STENCIL_VALUE_MASK             = 0x0B93,
    STENCIL_WRITEMASK              = 0x0B98,
    STENCIL_FAIL                   = 0x0B94,
    STENCIL_PASS_DEPTH_FAIL        = 0x0B95,
    STENCIL_PASS_DEPTH_PASS        = 0x0B96,
    STENCIL_BACK_FUNC              = 0x8800,
    STENCIL_BACK_REF               = 0x8CA3,
    STENCIL_BACK_VALUE_MASK        = 0x8CA4,
    STENCIL_BACK_WRITEMASK         = 0x8CA5,
    STENCIL_BACK_FAIL              = 0x8801,
    STENCIL_BACK_PASS_DEPTH_FAIL   = 0x8802,
    STENCIL_BACK_PASS_DEPTH_PASS   = 0x8803,
    POLYGON_OFFSET_FACTOR          = 0x8038,
    POLYGON_OFFSET_UNITS           = 0x2A00,
    SCISSOR_BOX                    = 0x0C10,
    COLOR_WRITEMASK                = 0x0C23,
    DEPTH_WRITEMASK                = 0x0B72,
    BLEND_COLOR                    = 0x8005,
    VIEWPORT                       = 0x0BA2,
    DEPTH_RANGE                    = 0x0B70,
    LINE_WIDTH                     = 0x0B21,
    // SAMPLE_ALPHA_TO_COVERAGE       = 0x809E,
    // SAMPLE_COVERAGE                = 0x80A0,
    FRONT                          = 0x0404,
    BACK                           = 0x0405,
    DEPTH_FUNC                     = 0x0B74,
    CULL_FACE_MODE                 = 0x0B45,
    FRONT_FACE                     = 0x0B46,
  }
  
  
  // half float encode/decode
  const EHBuffer = new Float32Array( 1 );
  const EHIBuffer = new Uint32Array( EHBuffer.buffer );
  
  
  export const DAT_MASKS : readonly SetsBits[] = [
        SetsBits.BLEND_ENABLE_SET,
        SetsBits.BLEND_EQ_SET,
        SetsBits.BLEND_FUNC_SET,
        SetsBits.BLEND_FUNC_SET,
        SetsBits.BLEND_EQ_A_SET,
        SetsBits.BLEND_FUNC_A_SET,
        SetsBits.BLEND_FUNC_A_SET,
  
        SetsBits.DEPTH_ENABLE_SET,
        SetsBits.DEPTH_FUNC_SET,
  
        SetsBits.CULL_FACE_ENABLE_SET,
        SetsBits.CULL_MODE_SET,
        SetsBits.FACE_DIR_SET,
  
        SetsBits.STENCIL_ENABLE_SET,
        SetsBits.STENCIL_FUNC_SET,
        SetsBits.STENCIL_FUNC_SET,
        SetsBits.STENCIL_FUNC_SET,
        SetsBits.STENCIL_MASK_SET,
        SetsBits.STENCIL_OP_SET,
        SetsBits.STENCIL_OP_SET,
        SetsBits.STENCIL_OP_SET,
        SetsBits.STENCIL_B_FUNC_SET,
        SetsBits.STENCIL_B_FUNC_SET,
        SetsBits.STENCIL_B_FUNC_SET,
        SetsBits.STENCIL_B_MASK_SET,
        SetsBits.STENCIL_B_OP_SET,
        SetsBits.STENCIL_B_OP_SET,
        SetsBits.STENCIL_B_OP_SET,
  
        SetsBits.SCISSOR_ENABLE_SET,
        SetsBits.SCISSOR_TEST_SET,
        SetsBits.SCISSOR_TEST_SET,
        SetsBits.SCISSOR_TEST_SET,
        SetsBits.SCISSOR_TEST_SET,
  
        SetsBits.DITHER_ENABLE_SET,
  
        SetsBits.POLYOFF_ENABLE_SET,
        SetsBits.POLYOFF_SET,
        SetsBits.POLYOFF_SET,
  
        SetsBits.COVERAGE_ENABLE_SET,
        SetsBits.ACOVERAGE_ENABLE_SET,
  
        SetsBits.COLOR_MASK_SET,
        SetsBits.DEPTH_MASK_SET,
  
        SetsBits.BLEND_COLOR_SET,
        SetsBits.BLEND_COLOR_SET,
        SetsBits.BLEND_COLOR_SET,
        SetsBits.BLEND_COLOR_SET,
  
        SetsBits.VIEWPORT_SET,
        SetsBits.VIEWPORT_SET,
        SetsBits.VIEWPORT_SET,
        SetsBits.VIEWPORT_SET,
  
        SetsBits.DEPTH_RANGE_SET,
        SetsBits.DEPTH_RANGE_SET,
  
        SetsBits.LINE_WIDTH_SET
      ] as const,
  
  
      //            <b >< enab  >
      // b 0001111110011000000000
      _DEFAULT_SET : number = (
        SetsBits.BLEND_ENABLE_SET      |
        SetsBits.CULL_FACE_ENABLE_SET  |
        SetsBits.DEPTH_ENABLE_SET      |
        SetsBits.DITHER_ENABLE_SET     |
        SetsBits.POLYOFF_ENABLE_SET    |
        SetsBits.SCISSOR_ENABLE_SET    |
        SetsBits.STENCIL_ENABLE_SET    |
        SetsBits.BLEND_EQ_SET          |
        SetsBits.BLEND_FUNC_SET        |
        SetsBits.DEPTH_FUNC_SET        |
        SetsBits.CULL_MODE_SET         |
        SetsBits.FACE_DIR_SET          |
        SetsBits.STENCIL_FUNC_SET      |
        SetsBits.STENCIL_OP_SET        |
        SetsBits.STENCIL_MASK_SET      |
        SetsBits.SCISSOR_TEST_SET      |
        SetsBits.POLYOFF_SET           |
        SetsBits.COLOR_MASK_SET        |
        SetsBits.DEPTH_MASK_SET        |
        SetsBits.BLEND_COLOR_SET       |
        SetsBits.DEPTH_RANGE_SET       |
        SetsBits.LINE_WIDTH_SET
      ),
  
  
      _DEFAULT_STATE = new Uint16Array([
        0,             // BLEND disabled
        32774,         // BLEND_EQ_C            :   FUNC_ADD
        0,             // BLEND_FUNC_C_DST      :   ZERO
        1,             // BLEND_FUNC_C_SRC      :   ONE
        0,             // BLEND_EQ_A            :   --
        0,             // BLEND_FUNC_A_DST      :   --
        0,             // BLEND_FUNC_A_SRC      :   --
  
        0,             // DEPTH disabled
        513,           // DEPTH_FUNC            :   gl.LESS
  
        0,             // CULL_FACE disabled
        1029,          // CULL_MODE             :   gl.BACK
        2305,          // FACE_DIR              :   gl.CCW
  
        0,             // STENCIL disabled
        519,           // STENCIL_FUNC          :   gl.ALWAYS
        0,             // STENCIL_REF           :   0x0
        65535,         // STENCIL_VALUE_MASK    :   0xFFFF
        65535,         // STENCIL_WRITEMASK     :   0xFFFF
        7680,          // STENCIL_OP_FAIL       :   gl.KEEP
        7680,          // STENCIL_OP_ZFAIL      :   gl.KEEP
        7680,          // STENCIL_OP_ZPASS      :   gl.KEEP
        0,             // STENCIL_B_FUNC        :   --
        0,             // STENCIL_B_REF         :   --
        0,             // STENCIL_B_VALUE_MASK  :   --
        0,             // STENCIL_B_WRITEMASK   :   --
        0,             // STENCIL_B_OP_FAIL     :   --
        0,             // STENCIL_B_OP_ZFAIL    :   --
        0,             // STENCIL_B_OP_ZPASS    :   --
  
        0,             // SCISSOR enabled
        0, 0, 0,  0,   // SCISSOR_TEST          :   h
  
        1,             // DITHER enabled
        0,             // POLYOFF enabled
        0,             // POLYOFF factor
        0,             // POLYOFF units
  
        0,             // COVERAGE enabled
        0,             // ACOVERAGE enabled
  
        15,            // color mask 1111,
        1,             // write to depth
  
        0, 0, 0, 0,    // blend color
  
        0, 0, 0, 0,    // viewport
  
        // depthRange
        encodeClampedFloat(0),
        encodeClampedFloat(1),
  
        // lineWidth
        encodeHalf(1),
  
      ]);
  
  
  
  
  // avoid set inconsistency for '*separate' configs
  function _fixSet( set:number ):number{
    return (set |
        (( set & SetsBits.BLEND_FUNC_A_SET   ) >>> 2 ) |
        (( set & SetsBits.BLEND_EQ_A_SET     ) >>> 2 ) |
        (( set & SetsBits.STENCIL_B_FUNC_SET ) >>> 3 ) |
        (( set & SetsBits.STENCIL_B_OP_SET   ) >>> 3 ) |
        (( set & SetsBits.STENCIL_B_MASK_SET ) >>> 3 )
      );
  }
  
  
  
  function encodeClampedFloat(f:number):number{
    return Math.round(f*0xFFFF)|0;
  }
  
  function decodeClampedFloat(s:number):number{
    return (s/(+0xFFFF));
  }
  
  
  // http://stackoverflow.com/questions/5678432/decompressing-half-precision-floats-in-javascript
  //
  function decodeHalf (u16:number):number {
      var exponent = (u16 & 0x7C00) >> 10,
          fraction = u16 & 0x03FF;
      return (u16 >> 15 ? -1 : 1) * (
          exponent ?
          (
              exponent === 0x1F ?
              fraction ? NaN : Infinity :
              Math.pow(2, exponent - 15) * (1 + fraction / 0x400)
          ) :
          6.103515625e-5 * (fraction / 0x400)
      );
  }
  
  
  
  
  // http://stackoverflow.com/questions/3026441/float32-to-float16
  //
  
  
  function encodeHalf(f32:number){
    EHBuffer[0] = f32;
    const fltInt32 = EHIBuffer[0];
  
    let fltInt16 = (fltInt32 >> 31) << 5;
    let tmp = (fltInt32 >> 23) & 0xff;
    tmp = (tmp - 0x70) & (( (0x70 - tmp) >> 4) >> 27);
    fltInt16 = (fltInt16 | tmp) << 10;
    fltInt16 |= (fltInt32 >> 13) & 0x3ff;
    return fltInt16;
  }
  
  
  function getGlParameter( gl:WebGLRenderingContext, p:GLenum ){
    return gl.getParameter( p );
  };
  
  
  
  export default class GLConfig {
  
    static encodeHalf(f32:number) : number{
      return encodeHalf(f32);
    }
    
    static decodeHalf(u16:number) : number{
      return decodeHalf(u16);
    }
  
  
    readonly _dat: Uint16Array;
    _set: number;
  
    constructor(){
      this._dat = new Uint16Array( Slots.LEN );
      this._set = 0;
    }
    
    
    
      
    toDefault(){
      this._dat.set( _DEFAULT_STATE );
      this._set = _DEFAULT_SET|0;
    }
  
  
    clone() : GLConfig {
      const res = new GLConfig();
      res._dat.set( this._dat );
      res._set = this._set;
      return res;
    }
  
    
    // patch
    // ============
    // Apply this config on top of cfg input.
    // create a out config to apply in order to go from "cfg" state to "this" state
    
    patch( cfg:GLConfig, out:GLConfig ){
      var Bdat = this._dat,
          Bset = this._set,
          Adat = cfg._dat,
          Aset = cfg._set,
          Odat = out._dat,
          Oset = 0,
          sbit;
          
      Odat.set( Adat );
  
      for( var i = 0; i < (Slots.LEN|0); i++ )
      {
        sbit = DAT_MASKS[ i ];
        // The target (B) config change the current prop
        if( 0 !== ( Bset & sbit ) )
        {
          // if the initial (A) config never set the prop, mark set in output
          // if the target value is different from the initial value, mark set in output
          if( (0 === ( Aset & sbit )) || (Bdat[ i ] !== Adat[ i ]) ) {
            Oset |= sbit;
            Odat[ i ] = Bdat[ i ];
          }
  
          Aset |= sbit;
          Adat[ i ] = Bdat[ i ];
  
        }
      }
      cfg._set = _fixSet( Aset );
      out._set = _fixSet( Oset );
    }
  
  
    setupGL( gl:WebGLRenderingContext ){
      const set = this._set,
            dat = this._dat;
      let i : number;
  
  
      // blend enabled
  
      if ( (set & SetsBits.BLEND_ENABLE_SET) !== 0 ) {
        dat[ Slots.BLEND_ENABLE ] ? gl.enable( GL.BLEND ) : gl.disable( GL.BLEND );
      }
  
  
      // Blend Equation
  
      i = set & (SetsBits.BLEND_EQ_SET|SetsBits.BLEND_EQ_A_SET);
  
      if ( i !== 0 ) {
        if( i === (SetsBits.BLEND_EQ_SET|SetsBits.BLEND_EQ_A_SET) )
          gl.blendEquationSeparate( dat[ Slots.BLEND_EQ_C ], dat[ Slots.BLEND_EQ_A ] );
        else
          gl.blendEquation( dat[ Slots.BLEND_EQ_C ] );
      }
  
  
      // Blend Function
  
  
      i = set & (SetsBits.BLEND_FUNC_SET|SetsBits.BLEND_FUNC_A_SET);
  
      if ( i !== 0 ){
        if( i === (SetsBits.BLEND_FUNC_SET|SetsBits.BLEND_FUNC_A_SET) )
          gl.blendFuncSeparate( dat[ Slots.BLEND_FUNC_C_SRC ], dat[ Slots.BLEND_FUNC_C_DST ], dat[ Slots.BLEND_FUNC_A_SRC ], dat[ Slots.BLEND_FUNC_A_DST ] );
        else
          gl.blendFunc( dat[ Slots.BLEND_FUNC_C_SRC ], dat[ Slots.BLEND_FUNC_C_DST ] );
      }
  
  
      // depth Function
  
      if ( (set & SetsBits.DEPTH_ENABLE_SET) !== 0 ){
        dat[ Slots.DEPTH_ENABLE ] ? gl.enable( GL.DEPTH_TEST ) : gl.disable( GL.DEPTH_TEST );
      }
  
      if ( (set & SetsBits.DEPTH_FUNC_SET) !== 0 ){
        gl.depthFunc( dat[ Slots.DEPTH_FUNC ] );
      }
  
  
      // culling mode (front/back/front_and_back)
  
  
      if ( (set & SetsBits.CULL_FACE_ENABLE_SET) !== 0 ){
        dat[ Slots.CULL_FACE_ENABLE ] ? gl.enable( GL.CULL_FACE ) : gl.disable( GL.CULL_FACE );
      }
      if ( (set & SetsBits.CULL_MODE_SET) !== 0 ){
        gl.cullFace( dat[ Slots.CULL_MODE ] );
      }
  
      // face direction (cw/ccw)
      if ( (set & SetsBits.FACE_DIR_SET) !== 0 ){
        gl.frontFace( dat[ Slots.FACE_DIR ] );
      }
  
          // face direction (cw/ccw)
      if ( (set & SetsBits.LINE_WIDTH_SET) !== 0 ){
        gl.lineWidth( decodeHalf( dat[ Slots.LINE_WIDTH ] ) );
      }
  
  
      // Stencil enabled
  
      if ( (set & SetsBits.STENCIL_ENABLE_SET) !== 0 ){
        dat[ Slots.STENCIL_ENABLE ] ? gl.enable( GL.STENCIL_TEST ) : gl.disable( GL.STENCIL_TEST );
      }
  
     // Stencil Function
      i = set & (SetsBits.STENCIL_FUNC_SET|SetsBits.STENCIL_B_FUNC_SET);
  
      if ( i !== 0 )  {
        if( i === (SetsBits.STENCIL_FUNC_SET|SetsBits.STENCIL_B_FUNC_SET) ){
          gl.stencilFuncSeparate( GL.FRONT, dat[ Slots.STENCIL_FUNC ], dat[ Slots.STENCIL_REF ], dat[ Slots.STENCIL_VALUE_MASK ] );
          gl.stencilFuncSeparate( GL.BACK, dat[ Slots.STENCIL_B_FUNC ], dat[ Slots.STENCIL_B_REF ], dat[ Slots.STENCIL_B_VALUE_MASK ] );
        } else {
          gl.stencilFunc( dat[ Slots.STENCIL_FUNC ], dat[ Slots.STENCIL_REF ], dat[ Slots.STENCIL_VALUE_MASK ] );
        }
      }
  
      // Stencil Op
      i = set & (SetsBits.STENCIL_OP_SET|SetsBits.STENCIL_B_OP_SET);
  
      if ( i !== 0 ){
        if( i === (SetsBits.STENCIL_OP_SET|SetsBits.STENCIL_B_OP_SET) ){
          gl.stencilOpSeparate( GL.FRONT, dat[ Slots.STENCIL_OP_FAIL ], dat[ Slots.STENCIL_OP_ZFAIL ], dat[ Slots.STENCIL_OP_ZPASS ] );
          gl.stencilOpSeparate( GL.BACK, dat[ Slots.STENCIL_B_OP_FAIL ], dat[ Slots.STENCIL_B_OP_ZFAIL ], dat[ Slots.STENCIL_B_OP_ZPASS ]  );
        } else {
          gl.stencilOp( dat[ Slots.STENCIL_OP_FAIL ], dat[ Slots.STENCIL_OP_ZFAIL ], dat[ Slots.STENCIL_OP_ZPASS ] );
        }
      }
  
  
      // Stencil Op
      i = set & (SetsBits.STENCIL_MASK_SET|SetsBits.STENCIL_B_MASK_SET);
  
      if ( i !== 0 ){
  
        if( i === (SetsBits.STENCIL_MASK_SET|SetsBits.STENCIL_B_MASK_SET) ){
          gl.stencilMaskSeparate( GL.FRONT, dat[ Slots.STENCIL_WRITEMASK ] );
          gl.stencilMaskSeparate( GL.BACK, dat[ Slots.STENCIL_B_WRITEMASK] );
        } else {
          gl.stencilMask( dat[ Slots.STENCIL_WRITEMASK ] );
        }
      }
  
      if ( (set & SetsBits.COLOR_MASK_SET) !== 0 ){
        var flags = dat[ Slots.COLOR_MASK ];
        gl.colorMask(
          (flags & 1) === 1,
          (flags & 2) === 2,
          (flags & 4) === 4,
          (flags & 8) === 8
        );
      }
  
      if ( (set & SetsBits.DEPTH_MASK_SET) !== 0 ){
        gl.depthMask( dat[ Slots.DEPTH_MASK ] === 1 );
      }
  
  
  
      if ( (set & SetsBits.BLEND_COLOR_SET) !== 0 ){
        gl.blendColor(
          decodeHalf( dat[ Slots.BLEND_COLOR_R ] ),
          decodeHalf( dat[ Slots.BLEND_COLOR_G ] ),
          decodeHalf( dat[ Slots.BLEND_COLOR_B ] ),
          decodeHalf( dat[ Slots.BLEND_COLOR_A ] )
        );
      }
  
      if ( (set & SetsBits.SCISSOR_ENABLE_SET) !== 0 ){
        dat[ Slots.SCISSOR_ENABLE ] ? gl.enable( GL.SCISSOR_TEST ) : gl.disable( GL.SCISSOR_TEST );
      }
  
      if ( (set & SetsBits.SCISSOR_TEST_SET) !== 0 ){
        gl.scissor(
          dat[ Slots.SCISSOR_TEST_X ],
          dat[ Slots.SCISSOR_TEST_Y ],
          dat[ Slots.SCISSOR_TEST_W ],
          dat[ Slots.SCISSOR_TEST_H ]
        );
      }
  
      if ( (set & SetsBits.VIEWPORT_SET) !== 0 ){
        gl.viewport(
          dat[ Slots.VIEWPORT_X ],
          dat[ Slots.VIEWPORT_Y ],
          dat[ Slots.VIEWPORT_W ],
          dat[ Slots.VIEWPORT_H ]
        );
      }
  
  
      if ( (set & SetsBits.POLYOFF_ENABLE_SET) !== 0 ){
        dat[ Slots.POLYOFF_ENABLE ] ? gl.enable( GL.POLYGON_OFFSET_FILL ) : gl.disable( GL.POLYGON_OFFSET_FILL );
      }
  
      if ( (set & SetsBits.POLYOFF_SET) !== 0 ){
        gl.polygonOffset(
          decodeHalf( dat[ Slots.POLYOFF_FACTOR ] ),
          decodeHalf( dat[ Slots.POLYOFF_UNITS ] )
        );
      }
  
  
      if ( (set & SetsBits.DEPTH_RANGE_SET) !== 0 ){
        gl.depthRange(
          decodeClampedFloat( dat[ Slots.DEPTH_RANGE_NEAR ] ),
          decodeClampedFloat( dat[ Slots.DEPTH_RANGE_FAR ] )
        );
      }
  
  
  
    }
  
  
  
  
  
  
    // todo refator -> straight copy to dat and set
    fromGL( gl : WebGLRenderingContext ){
      this._set = 0;
  
      const enableBlend       = getGlParameter( gl, GL.BLEND ),
            enableCullface    = getGlParameter( gl, GL.CULL_FACE ),
            enableDepthTest   = getGlParameter( gl, GL.DEPTH_TEST ),
            enableDither      = getGlParameter( gl, GL.DITHER ),
            enablePolyOffset  = getGlParameter( gl, GL.POLYGON_OFFSET_FILL ),
            // enableACoverage   = getP( gl, GL.SAMPLE_ALPHA_TO_COVERAGE ),
            // enableCoverage    = getP( gl, GL.SAMPLE_COVERAGE ),
            enableScissor     = getGlParameter( gl, GL.SCISSOR_TEST ),
            enableStencil     = getGlParameter( gl, GL.STENCIL_TEST ),
  
            blendSrcRGB       = getGlParameter( gl, GL.BLEND_SRC_RGB ),
            blendDstRGB       = getGlParameter( gl, GL.BLEND_DST_RGB ),
            blendSrcAlpha     = getGlParameter( gl, GL.BLEND_SRC_ALPHA ),
            blendDstAlpha     = getGlParameter( gl, GL.BLEND_DST_ALPHA ),
            blendEqRgb        = getGlParameter( gl, GL.BLEND_EQUATION_RGB ),
            blendEqAlpha      = getGlParameter( gl, GL.BLEND_EQUATION_ALPHA ),
            stencilFunc       = getGlParameter( gl, GL.STENCIL_FUNC ),
            stencilRef        = getGlParameter( gl, GL.STENCIL_REF ),
            stencilValueMask  = getGlParameter( gl, GL.STENCIL_VALUE_MASK ),
            stencilWriteMask  = getGlParameter( gl, GL.STENCIL_WRITEMASK ),
            stencilOpFail     = getGlParameter( gl, GL.STENCIL_FAIL ),
            stencilOpZfail    = getGlParameter( gl, GL.STENCIL_PASS_DEPTH_FAIL ),
            stencilOpZpass    = getGlParameter( gl, GL.STENCIL_PASS_DEPTH_PASS ),
            stencilBFunc      = getGlParameter( gl, GL.STENCIL_BACK_FUNC ),
            stencilBRef       = getGlParameter( gl, GL.STENCIL_BACK_REF ),
            stencilBValueMask = getGlParameter( gl, GL.STENCIL_BACK_VALUE_MASK ),
            stencilBWriteMask = getGlParameter( gl, GL.STENCIL_BACK_WRITEMASK ),
            stencilBOpFail    = getGlParameter( gl, GL.STENCIL_BACK_FAIL ),
            stencilBOpZfail   = getGlParameter( gl, GL.STENCIL_BACK_PASS_DEPTH_FAIL ),
            stencilBOpZpass   = getGlParameter( gl, GL.STENCIL_BACK_PASS_DEPTH_PASS ),
  
            polyOffsetFactor  = getGlParameter( gl, GL.POLYGON_OFFSET_FACTOR ),
            polyOffsetUnits   = getGlParameter( gl, GL.POLYGON_OFFSET_UNITS ),
            scissorBox        = getGlParameter( gl, GL.SCISSOR_BOX ),
            colorMaskArray    = getGlParameter( gl, GL.COLOR_WRITEMASK ),
            depthWriteMask    = getGlParameter( gl, GL.DEPTH_WRITEMASK ),
            blendColor        = getGlParameter( gl, GL.BLEND_COLOR ),
            viewport          = getGlParameter( gl, GL.VIEWPORT ),
            depthRange        = getGlParameter( gl, GL.DEPTH_RANGE ),
            lineWidth         = getGlParameter( gl, GL.LINE_WIDTH );
  
  
  
  
      this.enableBlend( enableBlend );
  
      if( blendSrcRGB !== blendSrcAlpha || blendDstRGB !== blendDstAlpha ) {
        this.blendFuncSeparate(
          blendSrcRGB,
          blendDstRGB,
          blendSrcAlpha,
          blendDstAlpha
        );
      } else {
        this.blendFunc(
          blendSrcRGB,
          blendDstRGB
        );
      }
  
      if( blendEqRgb !== blendEqAlpha ) {
        this.blendEquationSeparate(
          blendEqRgb,
          blendEqAlpha
        );
      } else {
        this.blendEquation(
          blendEqRgb
        );
      }
  
  
  
      this.enableStencil( enableStencil );
      if( stencilFunc      !== stencilBFunc     ||
          stencilRef       !== stencilBRef      ||
          stencilValueMask !== stencilBValueMask ) {
        this.stencilFuncSeparate(
          stencilFunc,
          stencilRef,
          stencilValueMask,
          stencilBFunc,
          stencilBRef,
          stencilBValueMask
        );
      } else {
        this.stencilFunc(
          stencilFunc,
          stencilRef,
          stencilValueMask
        );
  
      }
  
      if( stencilOpFail  !== stencilBOpFail   ||
          stencilOpZfail !== stencilBOpZfail  ||
          stencilOpZpass !== stencilBOpZpass ) {
        this.stencilOpSeparate(
          stencilOpFail,
          stencilOpZfail,
          stencilOpZpass,
          stencilBOpFail,
          stencilBOpZfail,
          stencilBOpZpass
        );
      } else {
        this.stencilOp(
          stencilOpFail,
          stencilOpZfail,
          stencilOpZpass
        );
      }
  
      if( stencilWriteMask !== stencilBWriteMask ){
        this.stencilMaskSeparate( stencilWriteMask, stencilBWriteMask );
      } else {
        this.stencilMask( stencilWriteMask );
      }
  
  
      // DEPTH
      // -----
  
      this.depthFunc(
        gl.getParameter( GL.DEPTH_FUNC )
      );
  
      this.enableDepthTest( enableDepthTest );
  
      // FACE CULLING
      // ------------
      this.cullFace(
        gl.getParameter( GL.CULL_FACE_MODE )
      );
  
      this.enableCullface( enableCullface );
  
      this.frontFace(
        gl.getParameter( GL.FRONT_FACE )
      );
  
  
      // POLYGON_OFFSET
  
      this.enablePolygonOffset( enablePolyOffset  );
  
      this.polygonOffset( polyOffsetFactor, polyOffsetUnits );
  
      // SCISSOR
  
      this.enableScissor   ( enableScissor     );
      this.scissor(
        scissorBox[0],
        scissorBox[1],
        scissorBox[2],
        scissorBox[3]
      );
      // DITHER
      // ------
  
      this.enableDither    ( enableDither      );
  
      this.colorMask( colorMaskArray[0], colorMaskArray[1], colorMaskArray[2], colorMaskArray[3] );
  
      this.depthMask( depthWriteMask );
      //this.enableACoverage ( enableACoverage   );
      //this.enableCoverage  ( enableCoverage    );
  
      this.blendColor(
        blendColor[0],
        blendColor[1],
        blendColor[2],
        blendColor[3]
      );
  
      this.viewport(
        viewport[0],
        viewport[1],
        viewport[2],
        viewport[3]
      );
  
      this.depthRange(
        depthRange[0],
        depthRange[1]
      );
  
      this.lineWidth( lineWidth );
  
    }
  
  
    enableBlend( flag : boolean = true ): this {
      this._dat[ Slots.BLEND_ENABLE ] = +flag;
      this._set |= SetsBits.BLEND_ENABLE_SET|0;
      return this;
    }
  
      // enums
      //   ZERO
      //   ONE
      //   SRC_COLOR
      //   ONE_MINUS_SRC_COLOR
      //   SRC_ALPHA
      //   ONE_MINUS_SRC_ALPHA
      //   DST_ALPHA
      //   ONE_MINUS_DST_ALPHA
      //   DST_COLOR
      //   ONE_MINUS_DST_COLOR
      //   SRC_ALPHA_SATURATE
    
    blendFunc( src:GLenum, dst:GLenum ) : this {
      this._dat[ Slots.BLEND_FUNC_C_SRC ] = src;
      this._dat[ Slots.BLEND_FUNC_C_DST ] = dst;
      this._set = this._set & ~SetsBits.BLEND_FUNC_A_SET | (SetsBits.BLEND_FUNC_SET);
      return this;
    }
  
    
      // enums
      //   ZERO
      //   ONE
      //   SRC_COLOR
      //   ONE_MINUS_SRC_COLOR
      //   SRC_ALPHA
      //   ONE_MINUS_SRC_ALPHA
      //   DST_ALPHA
      //   ONE_MINUS_DST_ALPHA
      //   DST_COLOR
      //   ONE_MINUS_DST_COLOR
      //   SRC_ALPHA_SATURATE
    
    blendFuncSeparate( srcRgb : GLenum, dstRgb : GLenum, srcAlpha : GLenum, dstAlpha : GLenum ) : this {
      this._dat[ Slots.BLEND_FUNC_C_SRC ] = srcRgb;
      this._dat[ Slots.BLEND_FUNC_C_DST ] = dstRgb;
      this._dat[ Slots.BLEND_FUNC_A_SRC ] = srcAlpha;
      this._dat[ Slots.BLEND_FUNC_A_DST ] = dstAlpha;
      this._set |= SetsBits.BLEND_FUNC_SET | SetsBits.BLEND_FUNC_A_SET;
      return this;
    }
  
    blendEquation( eq : GLenum ) : this {
      this._dat[ Slots.BLEND_EQ_C ] = eq;
      this._set = this._set & ~SetsBits.BLEND_EQ_A_SET | (SetsBits.BLEND_EQ_SET);
      return this;
    }
  
      // enums
      //   FUNC_ADD
      //   FUNC_SUBTRACT
      //   FUNC_REVERSE_SUBTRACT
    blendEquationSeparate ( rgbEq : GLenum, alphaEq : GLenum ) : this {
      this._dat[ Slots.BLEND_EQ_C] = rgbEq;
      this._dat[ Slots.BLEND_EQ_A ] = alphaEq;
      this._set |= SetsBits.BLEND_EQ_SET | SetsBits.BLEND_EQ_A_SET;
      return this;
    }
  
    
      // blendColor
      //   r g b a  as Float [0.0, 1.0]
    
    blendColor( r:number, g:number, b:number, a:number ) : this {
      this._dat[ Slots.BLEND_COLOR_R ] = encodeHalf( r );
      this._dat[ Slots.BLEND_COLOR_G ] = encodeHalf( g );
      this._dat[ Slots.BLEND_COLOR_B ] = encodeHalf( b );
      this._dat[ Slots.BLEND_COLOR_A ] = encodeHalf( a );
      this._set |= SetsBits.BLEND_COLOR_SET|0;
      return this;
    }
  
  
  
    
      // enums
      //   NEVER
      //   LESS
      //   EQUAL
      //   LEQUAL
      //   GREATER
      //   NOTEQUAL
      //   GEQUAL
      //   ALWAYS
    
    depthFunc( func : GLenum ) : this {
      this._dat[ Slots.DEPTH_FUNC ] = func;
      this._set |= SetsBits.DEPTH_FUNC_SET|0;
      return this;
    }
  
  
    enableDepthTest( flag : boolean = true ) : this {
      this._dat[ Slots.DEPTH_ENABLE ] = +flag;
      this._set |= SetsBits.DEPTH_ENABLE_SET|0;
      return this;
    }
  
    depthRange ( near : number, far : number ) : this {
      this._dat[ Slots.DEPTH_RANGE_NEAR ] = encodeClampedFloat( near );
      this._dat[ Slots.DEPTH_RANGE_FAR ]  = encodeClampedFloat( far );
      this._set |= SetsBits.DEPTH_RANGE_SET|0;
      return this;
    }
  
    lineWidth( w : number ) : this {
      this._dat[ Slots.LINE_WIDTH ] = encodeHalf( w );
      this._set |= SetsBits.LINE_WIDTH_SET|0;
      return this;
    }
  
  
  
    // enums
    //   FRONT
    //   BACK
    //   FRONT_AND_BACK
    
    cullFace ( mode : GLenum ) : this {
      this._dat[ Slots.CULL_MODE ] = mode;
      this._set |= SetsBits.CULL_MODE_SET|0;
      return this;
    }
  
    enableCullface( flag : boolean = true ) : this {
      this._dat[ Slots.CULL_FACE_ENABLE ] = +flag;
      this._set |= SetsBits.CULL_FACE_ENABLE_SET|0;
      return this;
    }
  
  
  
    // polygon offset
    //
    polygonOffset( polyOffsetFactor : number, polyOffsetUnits : number ) : this {
      this._dat[ Slots.POLYOFF_FACTOR] = encodeHalf( polyOffsetFactor );
      this._dat[ Slots.POLYOFF_UNITS ] = encodeHalf( polyOffsetUnits );
      this._set |= SetsBits.POLYOFF_SET|0;
      return this;
    }
  
    enablePolygonOffset( flag : boolean = true ) : this {
      this._dat[ Slots.POLYOFF_ENABLE ] = +flag;
      this._set |= SetsBits.POLYOFF_ENABLE_SET|0;
      return this;
    }
  
  
  
    // SCISSOR
    // --------
  
    enableScissor   ( flag : boolean = true ) : this {
      this._dat[ Slots.SCISSOR_ENABLE ] = +flag;
      this._set |= SetsBits.SCISSOR_ENABLE_SET|0;
      return this;
    }
  
    scissor( x : number, y : number, w : number, h : number ) : this {
      this._dat[ Slots.SCISSOR_TEST_X ] = x;
      this._dat[ Slots.SCISSOR_TEST_Y ] = y;
      this._dat[ Slots.SCISSOR_TEST_W ] = w;
      this._dat[ Slots.SCISSOR_TEST_H ] = h;
      this._set |= SetsBits.SCISSOR_TEST_SET|0;
      return this;
    }
  
    // VIEWPORT
    // --------
  
    viewport( x : number, y : number, w : number, h : number ) : this {
      this._dat[ Slots.VIEWPORT_X ] = x;
      this._dat[ Slots.VIEWPORT_Y ] = y;
      this._dat[ Slots.VIEWPORT_W ] = w;
      this._dat[ Slots.VIEWPORT_H ] = h;
      this._set |= SetsBits.VIEWPORT_SET|0;
      return this;
    }
  
  
    enableDither( flag : boolean = true ) : this {
      this._dat[ Slots.DITHER_ENABLE ] = +flag;
      this._set |= SetsBits.DITHER_ENABLE_SET|0;
      return this;
    }
  
    depthMask( flag : boolean ) : this {
      this._dat[ Slots.DEPTH_MASK ] = +flag;
      this._set |= SetsBits.DEPTH_MASK_SET|0;
      return this;
    }
  
    colorMask( r : boolean, g : boolean, b : boolean, a : boolean ) : this {
      const mask =
        ((r?1:0)   ) |
        ((g?1:0)<<1) |
        ((b?1:0)<<2) |
        ((a?1:0)<<3);
  
      this._dat[ Slots.COLOR_MASK ] = mask;
      this._set |= SetsBits.COLOR_MASK_SET|0;
      return this;
    }
  
  
    // enableACoverage ( flag ){
    //   this._dat[ ACOVERAGE_ENABLE ] = flag|0;
    //   this._set |= ACOVERAGE_ENABLE_SET|0;
    // }
  
    // enableCoverage  ( flag ){
    //   this._dat[ COVERAGE_ENABLE ] = flag|0;
    //   this._set |= COVERAGE_ENABLE_SET|0;
    // }
  
  
  
  
  
  
      // enums
      //   CW
      //   CCW
    frontFace ( dir : GLenum ) : this {
      this._dat[ Slots.FACE_DIR ] = dir;
      this._set |= SetsBits.FACE_DIR_SET|0;
      return this;
    }
  
      // Stencils
  
    enableStencil( flag : boolean = true ) : this {
      this._dat[ Slots.STENCIL_ENABLE ] = +flag;
      this._set |= SetsBits.STENCIL_ENABLE_SET|0;
      return this;
    }
  
    stencilFunc ( func : GLenum, ref : number, mask : number ) : this {
      this._dat[ Slots.STENCIL_FUNC       ] = func;
      this._dat[ Slots.STENCIL_REF        ] = ref;
      this._dat[ Slots.STENCIL_VALUE_MASK ] = mask;
      this._set = this._set & ~SetsBits.STENCIL_B_FUNC_SET | (SetsBits.STENCIL_FUNC_SET);
      return this;
    }
  
    stencilOp ( sfail : GLenum, dpfail : GLenum, dppass : GLenum ) : this {
      this._dat[ Slots.STENCIL_OP_FAIL ] = sfail;
      this._dat[ Slots.STENCIL_OP_ZFAIL] = dpfail;
      this._dat[ Slots.STENCIL_OP_ZPASS ] = dppass;
      this._set = this._set & ~SetsBits.STENCIL_B_OP_SET | (SetsBits.STENCIL_OP_SET);
      return this;
    }
  
    stencilMask ( mask : number ) : this {
      this._dat[ Slots.STENCIL_WRITEMASK ] = mask;
      this._set = (this._set & ~SetsBits.STENCIL_B_MASK_SET) | (SetsBits.STENCIL_MASK_SET);
      return this;
    }
  
  
  
    stencilFuncSeparate ( func : GLenum, ref : number, mask : number, funcback : GLenum, refback : number, maskback : number ) : this {
      const dat = this._dat;
      dat[ Slots.STENCIL_FUNC         ] = func;
      dat[ Slots.STENCIL_REF          ] = ref;
      dat[ Slots.STENCIL_VALUE_MASK   ] = mask;
      dat[ Slots.STENCIL_B_FUNC       ] = funcback;
      dat[ Slots.STENCIL_B_REF        ] = refback;
      dat[ Slots.STENCIL_B_VALUE_MASK ] = maskback;
      this._set |= SetsBits.STENCIL_B_FUNC_SET | SetsBits.STENCIL_FUNC_SET;
      return this;
    }
  
    stencilOpSeparate ( sfail : GLenum, dpfail : GLenum, dppass : GLenum, sfailback : GLenum, dpfailback : GLenum, dppassback : GLenum ) : this {
      const dat = this._dat;
      dat[ Slots.STENCIL_OP_FAIL    ] = sfail;
      dat[ Slots.STENCIL_OP_ZFAIL   ] = dpfail;
      dat[ Slots.STENCIL_OP_ZPASS   ] = dppass;
      dat[ Slots.STENCIL_B_OP_FAIL  ] = sfailback;
      dat[ Slots.STENCIL_B_OP_ZFAIL ] = dpfailback;
      dat[ Slots.STENCIL_B_OP_ZPASS ] = dppassback;
      this._set |= SetsBits.STENCIL_B_OP_SET | SetsBits.STENCIL_OP_SET;
      return this;
    }
  
    stencilMaskSeparate ( mask : number, maskback : number ) : this {
      this._dat[ Slots.STENCIL_WRITEMASK   ] = mask;
      this._dat[ Slots.STENCIL_B_WRITEMASK ] = maskback;
      this._set |= SetsBits.STENCIL_B_MASK_SET | SetsBits.STENCIL_MASK_SET;
      return this;
    }
  
  }
  */