import { mat4 } from "gl-matrix";

class OrthographicLens {
  _near: number = 0.01;
  private _far: number = 10.0;
  private _xMin = -1.0;
  private _xMax = 1.0;
  private _yMin = -1.0;
  private _yMax = 1.0;
  private _proj = mat4.create();
  private _valid = false;
  private _aspect:number = 1.0;
  constructor() {}
  getProjection() {
    if (!this._valid) {
      this._updateProjection();
    }
    return this._proj;
  }

  setBound(xMin: number, xMax: number, yMin: number, yMax: number) {
    this._xMin = xMin;
    this._xMax = xMax;
    this._yMin = yMin;
    this._yMax = yMax;
    this._invalidate();
  }

  set near(v) {
    if (this._near !== v) {
      this._near = v;
      this._invalidate();
    }
  }

  get near() {
    return this._near;
  }

  set far(v) {
    if (this._far !== v) {
      this._far = v;
      this._invalidate();
    }
  }

  get far() {
    return this._far;
  }

  set aspect(v:number) {
    if (this._aspect !== v) {
      this._aspect = v;
      // this.setBound(-1*v, 1*v, -1, 1);
      this._invalidate();
    }
  }

  get aspect() {
    return this._aspect;
  }

  _updateProjection() {
    mat4.ortho(
      this._proj,
      this._xMin,
      this._xMax,
      this._yMin,
      this._yMax,
      this._near,
      this._far
    );

    this._valid = true;
  }

  _invalidate() {
    this._valid = false;
  }
}

export default OrthographicLens;
