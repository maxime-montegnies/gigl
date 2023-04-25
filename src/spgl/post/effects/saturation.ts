import BaseEffect from './base-effect';
import frag_precode from '../glsl/saturation_pre.frag';
import frag_code from '../glsl/saturation.frag';
import Program from '../../program';
class Saturation extends BaseEffect {
    tint: number[];
    amount: number;
    private _preCode: string;
    private _code: string;
    constructor ( amount:number ){
        super();
        
        this.tint          = [1, 1, 1];
        this.amount        = amount;
        
        this._preCode = frag_precode.replace("#define GLSLIFY 1", "");
        this._code    = frag_code.replace("#define GLSLIFY 1", "");
    }

    genCode ( precode:string[], code:string[] ) {
        precode.push( this._preCode );
        code.   push( this._code );
      }
      
      
      setupProgram ( prg:Program ) {
        var a     = this.amount,
            tint  = this.tint;
        
        
        prg.uSaturation(
          tint[0]*a,
          tint[1]*a,
          tint[2]*a
        );
      
      }
}





export default Saturation;