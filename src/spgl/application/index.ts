import Node from "../node";
import GLConfig from "../state/config";
import Renderer from "./renderer";
// import TLoader from './assets/textures-loader';
import TLoader from "../texture-loader";
import CameraOrtho from "../camera/camera-ortho";
import CameraPerspective from "../camera/camera-perspective";
import GLState from "../state/state";
import { quat, vec3 } from "gl-matrix";
const camera_focus = vec3.fromValues(0, 0, 0);
const camera_location = vec3.fromValues(0, 0, 501.0); 
const cameraP_location = vec3.fromValues(0, 0, 1.0);
class Application {
  view: HTMLCanvasElement;
  renderer: Renderer;
  root = new Node();
  cameras = new Node();
  stage = new Node();
  gl: WebGLRenderingContext;
  texs: TLoader;
  camera = new CameraOrtho();
  cameraP = new CameraPerspective();
  time: number = 0;
  state: GLState;
  initialCfg: GLConfig;
  constructor(canvas: HTMLCanvasElement) {
    if (canvas === undefined) {
      this.view = document.createElement("canvas");
    } else {
      this.view = canvas;
    }
    this.renderer = new Renderer(this.view, this);
    this.gl = this.renderer.gl;
    const gl = this.gl;
    this.texs = new TLoader(gl);
    // this.cameraP.lens.fov = Math.PI/5;
    this.cameraP.lens.fov = 39.6/180*Math.PI;
    // this.cameraP.lens.fov = 90.6/180*Math.PI;
    this.camera.lens.near = 0.1;
    this.camera.lens.far = 10.0+camera_location[2];
    this.cameraP.lens.near = 0.25;
    this.cameraP.lens.far = 2.0+110.0;
    this.root.name = "root";
    this.stage.name = "stage";
    this.root.add(this.stage);
    this.root.add(this.cameras);
    this.cameras.add(this.camera);
    this.cameras.add(this.cameraP);

    this.state = new GLState(gl);
    this.initialCfg = this.state
      .config()
      .enableBlend()
      .blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      .enableCullface(true)
      .cullFace(gl.BACK);
    this.clear();
  }
  resizeHandler() {
    // this.camera.x = -0.5 * this.renderer.width;
    // this.camera.y = -0.5 * this.renderer.height;
    console.log(this.renderer.width)
    const scale = 1.0;
    this.camera.lens.setBound(
      -0.5 * this.renderer.width * scale,
      0.5 * this.renderer.width * scale,
      0.5 * this.renderer.height * scale,
      -0.5 * this.renderer.height * scale
    );
    this.camera.position = camera_location;
    vec3.set(this.camera.scale, 1,1,1) 
    // quat.fromEuler(this.camera.rotation, 0, 0, 0);
    this.cameras.position = cameraP_location;    
    // this.cameraP.position = cameraP_location;    
    // quat.fromEuler(this.cameraP.rotation, 0, 0, 0);
    // this.cameraP.lookAt(camera_focus);
    // this.cameraP.lookAt(this.stage.position);
    this.cameraP.updateViewProjectionMatrix(
      this.renderer.width,
      this.renderer.height
    );
    this.camera.updateViewProjectionMatrix(
      this.renderer.width,
      this.renderer.height
    );

    
    // this.stage.x = 0.5;
    // this.stage.y = 0;
    this.resize(this.renderer.width, this.renderer.height);
  }
  preRenderHandler(dt: number) {
    // camera_location[0] = Math.cos(this.time)*10.10
    const t = this.time*0.3;
    // this.cameras.x = Math.sin(this.time)*0.50
    // // this.cameras.z = 0
    // this.cameras.y = Math.cos(this.time)*0.20
    /*
    */
   const radius = 1.2+Math.sin(t*3)*0.5*0
    this.cameras.x = Math.sin(t)*radius
    // this.cameras.z = Math.sin(t)*0.10
    this.cameras.z = Math.cos(t)*radius
    // this.cameraP.rotateY(-Math.cos(t)*0.005);
    quat.fromEuler(
      this.cameraP.rotation,
      0,
      t*180/Math.PI*1.0+Math.PI*0.0,
      0
      );
    // quat.fromEuler(
    //   this.cameraP.rotation,
    //   -this.cameras.y*45.0,
    //   this.cameras.x*45.0,
    //   0
    // );
    this.cameraP.invalidate();
    // this.cameraP.y = 0
    // this.cameraP.z = 1.0+Math.cos(this.time)*1.0
    // this.cameraP.lens.fov = (39.6+Math.cos(this.time)*10.0)/180*Math.PI;
    this.cameraP.updateViewProjectionMatrix(
      this.renderer.width,
      this.renderer.height
    );
    // this.camera.updateViewProjectionMatrix(
    //   this.renderer.width,
    //   this.renderer.height
    // );
    // this.cameraP.invalidate()
    this.preRender(dt, this.time);
  }
  clear() {
    const gl = this.gl;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.clearColor(1.0, 1.0, 1.0, 0.0);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, this.renderer.width, this.renderer.height);
  }
  renderHandler(dt: number) {
    // this.dt = dt;
    this.time += dt;
    // =======================
    // PRE RENDER
    // =======================
    this.preRenderHandler(dt);
    // ====================
    // CLEAR
    // ====================
    this.clear();
    // ====================
    // RENDER
    // ====================
    this.root.updateWorldMatrix();
    this.renderScene(dt);
  }
  renderScene(dt: number) {
    this.state.push(this.initialCfg);
    this.state.apply();
    this.render(dt, this.time);
    this.state.pop();
    this.postRender(dt, this.time);
  }
  // ====================
  // ABSTRACT
  // ====================
  preRender(dt: number, time: number) { }
  resize(width: number, height: number) { }
  render(dt: number, time: number) { }
  postRender(dt: number, time: number) { }
}
export default Application;
