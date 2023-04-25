import Node from "../../../spgl/node";
import GLTFLoader from "../../../spgl/gltf/loader";
import Program from "../../../spgl/program";
import Application from "../../index";
import Config from "../../../spgl/state/config";
import _vert from "./vert.glsl?raw";
import _frag from "./frag.glsl?raw";
import { mat4, vec3, vec4 } from "gl-matrix";
const M4 = mat4.create();
const _whiteBaseColorFactor = vec4.fromValues(1.0, 1.0, 1.0, 1.0);

export interface fileOption {
  name: string;
  path: string;
  scale: number;
  position: vec3;
  rotation: vec3;
}

export default class Suzanne extends Node {
  private _initiated: boolean = false;
  gltfLoader: GLTFLoader;
  app: Application;
  root: Node;
  prg: Program;
  prgs: Program[];
  config: Config;
  options: fileOption;
  constructor(app: Application, options: fileOption) {
    super();
    this.options = options;
    this.app = app;
    const gl = this.app.app.gl;
    this.prg = new Program(gl);
    this.prgs = [];
    this.root = new Node();
    // this.root.scale[0] = this.root.scale[1] = this.root.scale[2] = 0.5;
    // this.gltfLoader = new GLTFLoader(gl, "bar.gltf", "data/bar/");
    this.gltfLoader = new GLTFLoader(gl, options.name, options.path);
    this.config = this.app.app.state
      .config()
      .enableDepthTest(true)
      .depthMask(true);
  }
  getLoadables() {
    var ls: Promise<any>[] = [];
    ls = ls.concat(this.gltfLoader.getPreLoadables());
    return ls;
  }
  init() {
    // let defs = "\nprecision lowp float;\n";
    let defs = "";
    this.prg.compile(_vert, _frag, defs);
    //
    const gltf_lib = this.gltfLoader._lib;
    const gl = this.app.app.gl;
    for (let index = 0; index < gltf_lib.meshes.length; index++) {
      defs = "";
      const element = gltf_lib.meshes[index];
      const materials = gltf_lib.materials[element.material];
      const prg = new Program(gl);
      /*
      */
      if (!materials.normalTexture) {
        defs += "#define HAS_normal 0\n";
      } else {
        defs += "#define HAS_normal 1\n";
      }
      
      if (!materials.pbrMetallicRoughness.baseColorTexture) {
        defs += "#define HAS_albedo 0\n";
      } else {
        defs += "#define HAS_albedo 1\n";
      }
      prg.compile(_vert, _frag, defs);
      element.prg = prg;
      // this.prgs.push(prg);
    }
    //
    //
    //
    //
    for (let index = 0; index < this.gltfLoader._lib.nodes.length; index++) {
      const element = this.gltfLoader._lib.nodes[index];
      this.root.add(element);
    }
    this.add(this.root);
    // this.gltfLoader.texs.getTexture("sign")!.setFilter(true, false, false);
    // const gltf_lib = this.gltfLoader._lib;
    console.warn(this.gltfLoader);
    console.warn(gltf_lib.materials);
    console.warn(this.gltfLoader.texs);
    this._initiated = true;
  }
  preRender(dt: number, time: number) {
    // this.rotateY(dt*0.3);
    // this.rotateX(dt*0.3);
    // this.rotateZ(dt*0.5);
  }
  render(dt: number, time: number) {
    if(!this._initiated) return;
    // const prg = this.prg;
    // if (prg == undefined) return;
    // //
    // this.renderColor(dt, time, prg);
    this.renderColor(dt, time);
    //
  }
  // renderColor(dt: number, time: number, prg: Program) {
  renderColor(dt: number, time: number) {
    // console.log('renderColor')
    this.app.app.state.push(this.config);
    this.app.app.state.apply();
    var camera = this.app.app.cameraP;
    // prg.use();
    //
    const gltf_lib = this.gltfLoader._lib;
    for (let index = 0; index < gltf_lib.meshes.length; index++) {
      const element = gltf_lib.meshes[index];
      const textures = this.gltfLoader.texs._list;
      const materials = gltf_lib.materials[element.material];
      const prg = element.prg;
      prg.use();
      if (prg.cameraPosition) {
        prg.cameraPosition(camera._wposition);
      }
      if (prg.modelViewMatrix) {
        this.app.app.cameraP.modelViewMatrix(M4, element._wmatrix);
        prg.modelViewMatrix(M4);
      }
      if (prg.metallicFactor) {
        prg.metallicFactor(
          gltf_lib.materials[element.material].pbrMetallicRoughness
            .metallicFactor
        );
      }
      if (prg.roughnessFactor) {
        prg.roughnessFactor(
          gltf_lib.materials[element.material].pbrMetallicRoughness
            .roughnessFactor
        );
      }
      if (prg.modelMatrix) {
        prg.modelMatrix(element._wmatrix);
      }
      if (prg.projectionMatrix) {
        camera.projectionMatrix(M4);
        prg.projectionMatrix(M4);
      }
      if (prg.uMVP) {
        camera.modelViewProjectionMatrix(M4, element._wmatrix);
        prg.uMVP(M4);
      }
      if (prg.uModelView) {
        this.app.app.cameraP.modelViewMatrix(M4, element._wmatrix);
        prg.uModelView(M4);
      }
      // console.log(materials.pbrMetallicRoughness.baseColorFactor)
      if (prg.baseColorFactor) {
        if (materials.pbrMetallicRoughness.baseColorFactor) {
          prg.baseColorFactor(materials.pbrMetallicRoughness.baseColorFactor);
        } else {
          prg.baseColorFactor(_whiteBaseColorFactor);
        }
      }
      if (prg.uAlbedo) {
        if (materials.pbrMetallicRoughness.baseColorTexture) {
          prg.uAlbedo(
            textures[materials.pbrMetallicRoughness.baseColorTexture.index]
          );
        }
      }
      if (prg.metallicRoughnessTexture) {
        if (materials.pbrMetallicRoughness.metallicRoughnessTexture) {
          prg.metallicRoughnessTexture(
            textures[
              materials.pbrMetallicRoughness.metallicRoughnessTexture.index
            ]
          );
        }
      }
      if (prg.occlusionTexture) {
        if (materials.occlusionTexture) {
          prg.occlusionTexture(
            textures[
              materials.occlusionTexture.index
            ]
          );
        }
      }
      if (prg.normalMap) {
        if (materials.normalTexture) {
          prg.normalMap(textures[materials.normalTexture.index]);
        }
      }
      if (prg.tEquirect) {
        prg.tEquirect(this.app.environment.texs.getTexture("environment"));
      }
      /*      
      console.log(element.name);
      if (!isDepthPass) {

        if (element.name == "PlaneBg" && this.videoReady) {
          this.videoTexture.fromVideo(this.video);
          if (prg.uTex) {
            prg.uTex(this.videoTexture);
          }
        } else {
          if (prg.uTex) {
            prg.uTex(
              this.gltfLoader.texs.getTexture(
                gltf_lib.materials[element.material]
              )
            );
          }
        }
      }
      */

      element.setup(prg);
      element.render();
    }
    //
    this.app.app.state.pop();
    this.app.app.state.apply();
  }
}
