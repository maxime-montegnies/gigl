import SPGLRenderer from "../renderer";
import Application from "./index";

class Renderer extends SPGLRenderer {
  application: Application;
  constructor(canvas:HTMLCanvasElement, application:Application) {
    // 
    // pixelRatio: Math.min(2.0, window.devicePixelRatio),
    const options = {
      pixelRatio: 1.0,
      hdpi: false,
      application: application,
      init: function(){
        
      },
      getContextOptions: function () {
        return {
          depth: true,
          stencil: false,
          antialias: true,
          alpha: false,
          // premultipliedAlpha: true,
          // premultipliedAlpha: true,
          preserveDrawingBuffer: true,
        };
      },

      render: function (dt:number) {
        this.application.renderHandler(dt);
      },

      resize: function () {
        this.application.resizeHandler();
      },
    };
    super(canvas, options)
    this.application = application;
  }
}

export default Renderer;