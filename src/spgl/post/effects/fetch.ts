import BaseEffect from './base-effect';
import frag_code from '../glsl/fetch.frag';
class Fetch extends BaseEffect {
    private _code: string;
    constructor (){
        super();
        this._code    = frag_code.replace("#define GLSLIFY 1", "");
    }
    genCode ( precode:string[], code:string[] ) {
        code.   push( this._code )
      }
}

export default Fetch;