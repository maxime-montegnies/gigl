import Texture from "../texture";
import Loader from "./loader";
import TProvider from "./provider";

const genmipmap = (t:Texture) => {
  t.bind();
  t.gl.generateMipmap(t.gl.TEXTURE_2D);
  return t;
}

class TexturesLoader {
  gl: WebGLRenderingContext;
  maxCubeSize: GLenum;
  extAniso: EXT_texture_filter_anisotropic;
  maxAniso: GLenum;
  texDefs: TexDef[];
  private _lib: {}={};
  private _list: any[]=[];
  constructor(gl:WebGLRenderingContext) {
    this.gl = gl;

    

    this.maxCubeSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

    this.extAniso =
      gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
      gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") ||
      gl.getExtension("EXT_texture_filter_anisotropic");

    this.maxAniso = this.extAniso
      ? gl.getParameter(this.extAniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
      : 0;

    // this.JPGParser = new JPG(gl);

    this.texDefs = [];
  }

  createProvider():TProvider {
    var p = new TProvider(this);
    return p;
  }

  resolveUrl(path:string) {
    return path;
  }

  makeTex(url:string, smooth = true, mipmap = true, miplinear = false, aniso = 0, fmt:number, clamp:boolean) {
    
    // bbc = false;
    // bbc = true;
    var t = new Texture(this.gl, fmt);
    var def = new TexDef(
      this,
      t,
      url,
      smooth,
      mipmap,
      miplinear,
      aniso,
      clamp
    );
    this.texDefs.push(def);
    return def;
  }

  loadTex(t:Texture, mipmap:boolean, smooth:boolean, aniso:number, miplinear:boolean, url:string, clamp:boolean) {
    t.bind();
    t.setFilter(smooth, mipmap, miplinear);
    if (clamp) {
      t.clamp();
    }
    
    url = this.resolveUrl(url);
    aniso = Math.min(this.maxAniso, aniso);
    if (aniso > 0) {
      t.gl.texParameterf(
        t.gl.TEXTURE_2D,
        this.extAniso.TEXTURE_MAX_ANISOTROPY_EXT,
        aniso
      );
    }
    
    var p = Loader.load(t, url);
    if (mipmap) p = p.then(genmipmap);
    return p;
  }
}

class TexDef {
  tex: Texture;
  url: string;
  mipmap: boolean;
  smooth: boolean;
  aniso: number;
  miplinear: boolean;
  loader: TexturesLoader;
  clamp: boolean;
  lodLevel: number = 0;
  constructor(loader:TexturesLoader, t:Texture, url:string, smooth:boolean, mipmap:boolean, miplinear:boolean, aniso:number, clamp:boolean) {
    this.tex = t;
    this.url = url;
    this.mipmap = mipmap;
    this.smooth = smooth;
    this.aniso = aniso;
    this.miplinear = miplinear;
    this.loader = loader;
    this.clamp = clamp;
  }

  _load(url:string) {
    return this.loader.loadTex(
      this.tex,
      this.mipmap,
      this.smooth,
      this.aniso,
      this.miplinear,
      url,
      this.clamp
    );
  }

  load() {
    return this._load(this.url);
  }
}
export default TexturesLoader;
export {TexDef};