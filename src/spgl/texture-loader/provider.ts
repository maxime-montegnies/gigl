import TexturesLoader from "./index";
import Texture from "../texture";
import {TexDef} from "./index";

interface iDlib {
    [key: string]: TexDef;
}
interface iLib {
    [key: string]: Texture;
}
class TexturesProvider {
  private _lib: iLib = {};
  lib: TexturesLoader;
  private _defs: TexDef[] = [];
  public _list: Texture[] = [];
  private _dlib: iDlib = {};
  constructor(lib: TexturesLoader) {
    this.lib = lib;
  }

  
  register(def:TexDef, name:string) {
    if (this._lib[name] === undefined) {
      this._dlib[name] = def;
      this._lib[name] = def.tex;
      this._defs.push(def);
      this._list.push(def.tex);
    } else {
      // Texture already exist
      console.log("Texture already exist");
      const oldDef = this._dlib[name];
      const oldTex = this._lib[name];
      const i1 = this._defs.indexOf(oldDef);
      const i2 = this._list.indexOf(oldDef.tex);
      this._dlib[name] = def;
      this._lib[name] = def.tex;
      this._defs[i1]=def;
      this._list[i2]=def.tex;
    }
  }

  getTexture(name: string) {
    var t = this._lib[name];
    if (t === undefined) {
      // throw new Error('texture "' + name + '" not found.');
      console.log('texture "' + name + '" not found.');
      return undefined;
    }
    return t;
  }

  getTextureDef(name: string) {
    var t = this._dlib[name];
    if (t === undefined) {
      throw new Error('texture def"' + name + '" not found.');
    }
    return t;
  }

  makeTex(
    name: string,
    url: string,
    smooth = true,
    mipmap = false,
    aniso = 16,
    miplinear = true,
    fmt: number = 6408,
    clamp: boolean = true
  ) {
    var def = this.lib.makeTex(
      url,
      smooth,
      mipmap,
      miplinear,
      aniso,
      fmt,
      clamp
    );
    this.register(def, name);
  }

  getLoadables() {
    return this._defs.map(function (def) {
      return def.load();
    });
  }
  loadTexture(name:string){
    this._dlib[name].load();
  }

  dispose() {
    // TODO : implement
  }
}

export default TexturesProvider;
