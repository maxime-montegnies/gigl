import Node from "../node";
import { mat4, vec3 } from "gl-matrix";
import LensOrtho from "./lens-ortho";

var IMVP = mat4.create();

class Camera extends Node {
  lens: LensOrtho;
  private _view = mat4.create();
  private _viewProj = mat4.create();
  constructor() {
    super();
    this.lens = new LensOrtho();
  }

  get view():mat4 {
    return this._view;
  }
  set view(v:mat4) {
    this._view = v;
  }

  modelViewMatrix(out: mat4, model: mat4) {
    mat4.multiply(out, model, this._view);
  }

  modelViewProjectionMatrix(out: mat4, model: mat4) {
    mat4.multiply(out, this._viewProj, model);
  }

  unproject(out: vec3, v: vec3 | number[]) {
    mat4.invert(IMVP, this._viewProj);
    vec3.transformMat4(out, <vec3>v, IMVP);
  }

  updateViewProjectionMatrix(w: number, h: number) {
    this.lens.aspect = w / h;
    mat4.multiply(this._viewProj, this.lens.getProjection(), this._view);
  }

  _computeWorldMatrix(skipParents: boolean) {
    super._computeWorldMatrix(skipParents);
    mat4.invert(this._view, this._wmatrix);
  }
}

export default Camera;
