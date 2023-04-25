import Node from "../node";
import { mat4 } from "gl-matrix";
import GLArrayBuffer from "../arraybuffer/arraybuffer";
import GLTFUtils from "./utils";
import { iAccessor } from "./utils";
import { iLib } from "./utils";
import handleSkin from "./handlers/skin";
import handleMeshes from "./handlers/meshes";
import handleNodes from "./handlers/nodes";
import TLoader from "../texture-loader";
import TextureProvider from "../texture-loader/provider";
import Texture from "../texture";

class Loader {
  json: any;
  binaries: { [key: string]: ArrayBuffer } = {};
  fileName: string;
  directoryName: string;
  _lib: iLib;
  buffers: { [key: string]: GLArrayBuffer } = {};
  gl: WebGLRenderingContext;
  texs: TextureProvider;
  private changedTexture :{[key:string]:string} = {}
  constructor(
    gl: WebGLRenderingContext,
    fileName: string,
    directoryName: string
  ) {
    this.gl = gl;
    this.fileName = fileName;
    const textureLoader = new TLoader(gl);
    this.texs = textureLoader.createProvider();
    this.directoryName = directoryName;
    this._lib = {
      nodeList: [],
      nodes: [],
      materials: [],
      meshes: [],
      // animations: [],
      skins: [],
      byName: {},
    };
  }
  getPreLoadables() {
    var ls: Promise<string | ArrayBuffer | Texture>[] = [];
    ls.push(this.loadJson());
    return ls;
  }
  getLoadables() {
    return this._loadBinaries();
  }
  changeTexture(name:string, value:string){
    this.changedTexture[name] = value;
  }
  loadJson() {
    const self = this;
    const promise: Promise<string | ArrayBuffer | Texture> = new Promise(
      (resolve, reject) => {
        fetch(this.directoryName + this.fileName)
          .then((response) => response.json())
          .then((data) => {
            self.json = data;
            Promise.all(self._loadBinaries()).then(
              () => {
                Promise.all(self._loadTextures()).then(
                  () => {
                    resolve(data);
                  },
                  () => {
                    console.warn("Error");
                  }
                );
              },
              () => {
                console.warn("Error");
              }
            );
          })
          .catch((error) => {
            reject("Error Json");
          });
      }
    );
    return promise;
  }
  _loadTextures() {
    let ls: Promise<Texture>[] = [];
    if (this.json.images) {
      for (var i = 0; i < this.json.images.length; i++) {
        this.texs.makeTex(
          this.json.images[i].name,
          this.directoryName + (this.changedTexture[this.json.images[i].name] ? this.changedTexture[this.json.images[i].name] : this.json.images[i].uri),true, true, 0, false, 6408,false
        );
      }
    }
    ls = ls.concat(this.texs.getLoadables());
    return ls;
  }
  _loadBinaries() {
    var binaries: { [key: string]: ArrayBuffer } = {};
    const self = this;
    var parse = this._parse.bind(this);
    let ls: Promise<ArrayBuffer>[] = [];
    for (var i = 0; i < this.json.buffers.length; i++) {
      ls = ls.concat(_loadBinary(this.json.buffers[i].uri));
    }
    Promise.all(ls).then(parse.bind(this), () => {
      console.warn("error Loading Assets");
      throw new Error("Method not implemented.");
    });
    return ls;

    function _loadBinary(uri: string) {
      const promise: Promise<ArrayBuffer> = new Promise((resolve, reject) => {
        fetch(self.directoryName + uri)
          .then((response) => response.arrayBuffer())
          .then((data: ArrayBuffer) => {
            self.binaries[uri] = data;
            resolve(data);
          })
          .catch((error) => {
            console.warn("Error Binary");
            reject("Error Binary");
          });
      });
      return promise;
    }
  }
  _parse() {
    handleNodes(this);
    handleSkin(this);
    handleMeshes(this);
    // console.warn(this._lib);
  }

  getArrayBufferForAccessor(accessor: iAccessor) {
    var id = accessor.bufferView;
    var bufferView = this.json.bufferViews[id];
    if (!this.buffers[id]) {
      var buffer = new GLArrayBuffer(this.gl);
      var data = GLTFUtils.getBufferViewData(bufferView, this);
      buffer.data(data);
      buffer.stride = GLTFUtils.getStrideFromAccessor(accessor, this.json) || 0;
      buffer.length = accessor.count;
      buffer._computeLength();
      this.buffers[id] = buffer;
    }

    return this.buffers[id];
  }
  getNodeList() {
    return this._lib.nodeList;
  }
  getNodes() {
    return this._lib.nodes;
  }
  getMeshes() {
    return this._lib.meshes;
  }

  getSkins() {
    return this._lib.skins;
  }

  updateSkin(node: Node) {
    if (this._lib.skins[0].joints.length == 0) return;
    for (var i = 0; i < this._lib.skins[0].joints.length; i++) {
      // compute jointMatrix
      var meshMatrix = node._wmatrix;
      var jointTransform = this._lib.skins[0].joints[i]._wmatrix;
      var inverseBindMatrix = this._lib.skins[0].inverseBindMatrices[i];
      var matrixChunk = this._lib.skins[0].jointMatrixChunks[i];
      //
      
      mat4.invert(matrixChunk, meshMatrix);
      // mat4.mul(matrixChunk, matrixChunk, mat4.invert(matrixChunk, this._lib.nodes[0]._wmatrix)); 
      mat4.mul(matrixChunk, matrixChunk, jointTransform);
      mat4.mul(matrixChunk, matrixChunk, <mat4>inverseBindMatrix); 
      ;
      // mat4.mul(matrixChunk,matrixChunk, this._lib.nodes[0]._wmatrix);
      // mat4.invert(matrixChunk, meshMatrix);
    }
  }
}

export default Loader;
