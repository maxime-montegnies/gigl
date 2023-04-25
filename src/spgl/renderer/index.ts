// import raf from 'raf'
import raf from "../raf";
import { now } from "../raf";
import { caf } from "../raf";
// import now from 'right-now'
class Renderer {
  gl: WebGLRenderingContext;
  view: HTMLCanvasElement;
  width: number = 0;
  height: number = 0;
  viewWidth: number = 0;
  viewHeight: number = 0;
  pixelRatio: number;
  hdpi: boolean;
  frame: (time:number) => void;
  previousTime: number;
  private _rafId: number = 0;
  private _playing: boolean = false;
  constructor(cvs: HTMLCanvasElement, obj: any) {
    const i_pixelRatio: number =
      obj.pixelRatio !== undefined ? obj.pixelRatio : 0;
    const i_hdpi: boolean = obj.hdpi !== undefined ? obj.hdpi : true; 
    
    var opts = obj.getContextOptions();
    this.gl =(
      cvs.getContext("webgl", opts) ||
      cvs.getContext("experimental-webgl", opts) ||
      cvs.getContext("webgl")) as WebGLRenderingContext;
    if (obj.init !== undefined) this.init = obj.init;
    if (obj.render !== undefined) this.render = obj.render;
    if (obj.resize !== undefined) this.resize = obj.resize;
    if (obj.getContextOptions !== undefined)
      this.getContextOptions = obj.getContextOptions;

    this.view = cvs;

    this.pixelRatio = i_pixelRatio;
    this.hdpi = i_hdpi;

    this.frame = this._frame.bind(this);
    this.previousTime = now();

    this.init();
  }

  dispose() {
    this.stop();
  }

  play() {
    if (!this._playing) {
      this._playing = true;
      this.frame(0);
      this.previousTime = now();
      this._requestFrame();
    }
  }

  stop() {
    // raf.cancel( this._rafId );
    caf(this._rafId);
    this._playing = false;
    this._rafId = 0;
  }

  updateSize() {
    var pr = 1.0;
    if (this.pixelRatio > 0) {
      pr = this.pixelRatio;
    } else if (this.hdpi) {
      pr = window.devicePixelRatio;
    }
    // console.log(this.viewWidth , this.gl.drawingBufferWidth)
    this.view.width = pr * this.viewWidth;
    this.view.height = pr * this.viewHeight;
    this.width = this.gl.drawingBufferWidth;
    this.height = this.gl.drawingBufferHeight;
    this.resize();
  }

  _checkSize() {
    var css = getComputedStyle(this.view);
    var w = parseInt(css.getPropertyValue("width"));
    var h = parseInt(css.getPropertyValue("height"));
    if (isNaN(w) || isNaN(h) || w === 0 || h === 0) {
      return false;
    }
    if (w !== this.viewWidth || h !== this.viewHeight) {
      this.viewWidth = w;
      this.viewHeight = h;
      this.updateSize();
    }
    return true;
  }

  _requestFrame() {
    // raf.cancel( this._rafId );
    caf(this._rafId);
    this._rafId = raf(this.frame);
  }

  _frame(_time:number) {
    if (!this._playing) {
      return;
    }
    // var time = now();
    var time = _time;
    var dt = (time - this.previousTime) / 1000;
    this.previousTime = time;
    if (dt > 1 / 5 || dt < 1 / 180) {
      dt = 1 / 60;
    }
    if (this._checkSize()) {
      this.render(dt);
    }
    if (this._playing) {
      this._requestFrame();
    }
  }

  getContextOptions() {
    return undefined;
  }
  render(dt:number) {}
  resize() {}
  init() {}

  // static create (cvs, obj){
  //   const renderer = new Renderer(cvs, obj);
  //   if(obj.init !== undefined) renderer.init = obj.init;
  //   if(obj.render !== undefined) renderer.render = obj.render;
  //   if(obj.resize !== undefined) renderer.resize = obj.resize;
  //   if(obj.getContextOptions !== undefined) renderer.getContextOptions = obj.getContextOptions;
  //   return renderer;
  // }
}

export default Renderer;
