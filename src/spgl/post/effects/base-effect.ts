import Post from '../index'
class BaseEffect {
    // effect need scene's depth texture
    static NEED_DEPTH = 1 << 1;
    // effect need linear sampler for input color
    static NEED_LINEAR = 1 << 1;
    _flags: number;
    post: null | Post;
  constructor() {
    this.post = null;
    this._flags = 0;
  }
  _init(post:Post) {
    if (this.post !== post) {
      this.post = post;
      this.init();
    }
  }

  init(precode:string="", code:string="") {}

  release() {}

  preRender() {}

  genCode(precode:string[]|string, code:string[]|string) {}

  setupProgram(prg:WebGLProgram) {}

  resize(width:number, height:number) {}
}

export default BaseEffect;
