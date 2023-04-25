import Texture from "../texture";

interface iLoader {
  texture: Texture;
  img: HTMLImageElement;
}
interface iLoaders {
  [key: number]: iLoader;
}
var item: { [key: string]: number };
var _loaders: iLoaders = {};

class TextureLoader {
  constructor() {}
  static load(texture: Texture, url: string):Promise<Texture> {
    releaseLoader(texture);

    const promise = new Promise<Texture>((resolve, reject) => {
      var img = new Image();
      img.onload = function () {
        textureLoaded(texture);
        resolve(texture);
      };
      img.onerror = function () {
        reject(texture);
        releaseLoader(texture);
      };
      img.crossOrigin = "anonymous";
      img.src = url;
      _loaders[texture._uid] = <iLoader>{
        texture: texture,
        img: img,
      };
    });

    return promise;
  }
}

function releaseLoader(texture: Texture) {
  var l = _loaders[texture._uid];
  if (l) {
    l.img.onload = l.img.onerror = null;
    l.img.src = "";
    // l.defer.reject( texture );
  }
  delete _loaders[texture._uid];
}

function textureLoaded(texture: Texture) {
  texture.fromImage(_loaders[texture._uid].img);
  // releaseLoader( texture );
  return texture;
}

export default TextureLoader;
