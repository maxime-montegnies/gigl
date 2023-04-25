import Node from "../../../spgl/node";
import TexturesProvider from "../../../spgl/texture-loader/provider";
import TLoader from "../../../spgl/texture-loader";
import Application from "../../index";
import Texture from "../../../spgl/texture";
import Plane from "../../assets/primitives/mesh-plane";
import Mesh from "../../assets/mesh";
import IcoSphere from "../../assets/primitives/mesh-Icosphere";
import _vert from "./vert.glsl?raw";
import _frag from "./frag.glsl?raw";
import Program from "../../../spgl/program";
import Config from "../../../spgl/state/config";
import { mat4 } from "gl-matrix";
const M4 = mat4.create();

export default class Environment {
  texs: TexturesProvider;
  mesh: Mesh;
  prg: Program;
  app: Application;
  root: Node;
  config: Config;
  constructor(app: Application) {
    const gl = app.app.gl;
    this.app = app;
    this.config = this.app.app.state.config().enableDepthTest(true).depthMask(false).enableCullface(true).cullFace(gl.FRONT);
    // this.config = this.app.app.state.config().enableCullface(true).cullFace(gl.FRONT);
    this.root = new Node();
    this.root.z=-0;
    this.root.rotateZ(Math.PI);
    this.root.scale[0]=this.root.scale[1]=this.root.scale[2]=0.6;
    const textureLoader = new TLoader(gl);
    this.prg = new Program(gl);
    this.texs = textureLoader.createProvider();
    this.mesh = new IcoSphere(gl, 2,true);
  }

  getLoadables() {
    let ls: Promise<Texture>[] = [];
    
        this.texs.makeTex(
          'environment',
          'data/panorama4.jpg',true,true,0,false
        );
        // this.texs.getTexture("environment")?.repeatH();
        this.texs.getTexture("environment")?.mirrorV();
        // this.texs.getTexture("environment")?.mirror();
    
    ls = ls.concat(this.texs.getLoadables());
    return ls;
  }
  init() {
    this.prg.compile(_vert, _frag, "\nprecision lowp float;\n");
  }
  preRender(dt: number, time: number) {
    // this.root.rotateY(dt*0.1);
    // this.root.x = Math.cos(time)*0.2-0;
  }
  render(dt: number, time: number) {
    const prg = this.prg;

    
    if (prg == undefined) return;

    this.app.app.state.push(this.config);
    this.app.app.state.apply();

    var camera = this.app.app.cameraP;
    prg.use();
    const gl = this.app.gl;
    prg.tEquirect(this.texs.getTexture("environment"));
    camera.modelViewProjectionMatrix(M4, this.root._wmatrix);
    prg.uMVP(M4);

    
      for (let i = 0; i < this.mesh.buffers.length; i++) {
        this.mesh.buffers[i].attribPointer(prg);
      }
      this.mesh.ibuffer!.bind();
      this.mesh.ibuffer!.drawTriangles();
    
      this.app.app.state.pop();
      this.app.app.state.apply();
  }
}
