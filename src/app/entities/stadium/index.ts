import Application from "../../index";
import Node from "../../../spgl/node";
import Rect from "../../../spgl/primitives-2d/rect";
import bg_vert from "./vert.glsl?raw";
import bg_frag from "./frag.glsl?raw";
import Program from "../../../spgl/program";
import { mat4, quat, vec2, vec3 } from "gl-matrix";
import TextureProvider from "../../../spgl/texture-loader/provider";
import Texture from "../../../spgl/texture";
import Mesh from "../../assets/mesh";
import Config from "../../../spgl/state/config";
const M4 = mat4.create();

var UNLOADED = 1,
  LOADING = 2,
  LOADED = 3;

class BallSettings {
  position: vec2;
  positionOnStage: vec2;
  velocity: vec2;
  e: number;
  mass: number;
  radius: number;
  area: number;
  rotation: number;
  rotation_target: number;
  constructor(x: number, y: number, radius: number, e: number, mass: number) {
    this.positionOnStage = vec2.fromValues(x, y); //m
    this.position = vec2.fromValues(x, y); //m
    this.velocity = vec2.fromValues(0, 0); // m/s
    this.e = -e; // has no units
    this.mass = mass; //kg
    this.radius = radius; //m
    this.area = (Math.PI * radius * radius) / 10000; //m^2
    this.rotation = 0;
    this.rotation_target = 0;
  }
}
class Stadium extends Node {
  _state: number;
  mesh?: Mesh;
  meshs: Mesh[] = [];
  texs: TextureProvider;
  prg: Program;
  app: Application;
  config: Config;
  radius = 176 / 2;
  ballSettings: BallSettings;
  constructor(app: Application, uid: string = "") {
    super();
    const gl = app.gl;
    this.app = app;
    this.prg = new Program(this.app.gl);
    // this.setScale(0.006);

    // this.setScale(0.25);
    // this.setScale(2);
    // this.setScale(1000);
    this.z = 250;
    this.z = 0;
    //
    this.ballSettings = new BallSettings(0, 0, 176 / 2, 0.7, 10);
    //
    this.texs = app.app.texs.createProvider();
    // this.texs = app.textureProvider;
    this.texs.makeTex(
      "ball_n",
      "data/ball_n.png",
      false,
      false,
      0,
      true,
      this.app.gl.RGB,
      true
    );
    this.texs.makeTex(
      "ball_a",
      "data/ball_a.png",
      true,
      false,
      16,
      false,
      this.app.gl.RGB,
      true
    );
    this.texs.makeTex(
      "matcap",
      "data/matcap-3.jpg",
      true,
      false,
      16,
      true,
      this.app.gl.RGB,
      true
    );
    this._state = UNLOADED;
    this.config = this.app.app.state
      .config()
      .enableDepthTest()
      .enableCullface(true)
      .cullFace(gl.BACK);
  }

  init() {
    //
    this.prg.compile(bg_vert, bg_frag, "\nprecision lowp float;\n");
  }
  preRender(dt: number, time: number) {
    // this.x = Math.sin(time)*this.app.renderer.width*0.1
    // this.y = this.app.renderer.height*0.65
    // this.x = Math.sin(time) * 500 * 0.1;
    // this.y = Math.cos(time) *500 * 0.1;
    // this.z = Math.sin(time) *90;
    this.rotateY(dt);
    this.rotateX(dt);
    this.rotateZ(dt);
  }
  render(dt: number, time: number) {
    const prg = this.prg;
    if (prg == undefined) return;
    if (this._state !== LOADED) return;
    if (this.meshs.length == 0) return;
    // console.log("render");

    this.app.app.state.push(this.config);
    this.app.app.state.apply();

    let camera = this.app.app.camera;

    prg.use();
    if (prg.uTex) {
      prg.uTex(this.texs.getTexture("ball_a"));
    }
    if (prg.uTexMC) {
      prg.uTexMC(this.texs.getTexture("matcap"));
    }
    if (prg.uTexN) {
      prg.uTexN(this.texs.getTexture("ball_n"));
    }
    prg.uTime(time);
    for (let index = 0; index < this.meshs.length; index++) {
      const element = this.meshs[index];
      if (prg.uMVP) {
        this.app.app.camera.modelViewProjectionMatrix(M4, element._wmatrix);
        prg.uMVP(M4);
      }
      if (prg.uModelView) {
        this.app.app.cameraP.modelViewMatrix(M4, element._wmatrix);
        prg.uModelView(M4);
      }
      if (prg.uV) prg.uV(this.app.app.cameraP._view);
      element.setup(prg);
      element.render();
    }
    this.app.app.state.pop();
    this.app.app.state.apply();
  }
  loadJson(url: string) {
    const self = this;
    const promise: Promise<string> = new Promise((resolve, reject) => {
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          self._loadBinaries(data);
          resolve(data);
        })
        .catch((error) => {
          reject("Error Json");
        });
    });
    return promise;
  }
  getLoadables() {
    console.log("getLoadables");
    var ls: Promise<Texture | string>[] = [];
    if (this._state === UNLOADED) {
      var sceneUrl = <string>this.getGltfUrl();
      ls = ls.concat(this.loadJson(sceneUrl));
      ls = ls.concat(this.texs.getLoadables());
      this._state = LOADING;
    }
    return ls;
  }
  getDirectory() {
    return "data/";
  }
  getGltfUrl() {
    return this.getDirectory() + "Fussball.gltf";
  }
  _loadBinaries(json: any) {
    var binaries: { [key: string]: ArrayBuffer } = {};
    var parse = this._parse.bind(this);
    let ls: Promise<ArrayBuffer>[] = [];
    for (var i = 0; i < json.buffers.length; i++) {
      ls = ls.concat(_loadBinary(this.getDirectory() + json.buffers[i].uri));
    }
    return Promise.all(ls).then(
      () => {
        parse(json, binaries);
      },
      () => {
        console.warn("error Loading Assets");
      }
    );
    function _loadBinary(uri: string) {
      const promise: Promise<ArrayBuffer> = new Promise((resolve, reject) => {
        fetch(uri)
          .then((response) => response.arrayBuffer())
          .then((data: ArrayBuffer) => {
            binaries[uri] = data;
            resolve(data);
          })
          .catch((error) => {
            reject("Error Binary");
          });
      });
      return promise;
    }
  }

  _parse(json: any, binaries: { [key: string]: ArrayBuffer }) {
    for (let index = 0; index < json.meshes.length; index++) {
      const element = json.meshes[index];
      const bufferIndices = json.bufferViews[element.primitives[0].indices];
      const bufferNormals =
        json.bufferViews[element.primitives[0].attributes.NORMAL];
      const bufferTangent =
        json.bufferViews[element.primitives[0].attributes.TANGENT];
      const bufferUv =
        json.bufferViews[element.primitives[0].attributes.TEXCOORD_0];
      const bufferPosition =
        json.bufferViews[element.primitives[0].attributes.POSITION];
      const bufferUri = this.getDirectory() + json.buffers[0].uri;
      const mesh = new Mesh(this.app.gl, {
        index: new Int16Array(
          binaries[bufferUri].slice(
            bufferIndices.byteOffset,
            bufferIndices.byteOffset + bufferIndices.byteLength
          )
        ),
        vertices: new Float32Array(
          binaries[bufferUri].slice(
            bufferPosition.byteOffset,
            bufferPosition.byteOffset + bufferPosition.byteLength
          )
        ),
        uvs: new Float32Array(
          binaries[bufferUri].slice(
            bufferUv.byteOffset,
            bufferUv.byteOffset + bufferUv.byteLength
          )
        ),
        normals: new Float32Array(
          binaries[bufferUri].slice(
            bufferNormals.byteOffset,
            bufferNormals.byteOffset + bufferNormals.byteLength
          )
        ),
        tangents: new Float32Array(
          binaries[bufferUri].slice(
            bufferTangent.byteOffset,
            bufferTangent.byteOffset + bufferTangent.byteLength
          )
        ),
        joints: null,
        weights: null,
        is2D: false,
      });
      for (let index2 = 0; index2 < json.nodes.length; index2++) {
        const element2 = json.nodes[index2];
        if (element.name == element2.name) {
          if (element2.translation) {
            mesh.x = element2.translation[0];
            mesh.y = element2.translation[1];
            mesh.z = element2.translation[2];
          }
        }
      }
      this.add(mesh);
      this.meshs.push(mesh);
    }
    this._postParse();
  }

  _postParse() {
    this._state = LOADED;
  }
}

export default Stadium;
