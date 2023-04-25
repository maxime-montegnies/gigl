import GLArrayBuffer from "../arraybuffer/arraybuffer";

const TMP_ARRAY = new Float32Array( [
  -1, -1, 0, 0,
  1, -1, 1, 0,
  -1,  1, 0, 1,
   1,  1, 1, 1
] );

class Rect extends GLArrayBuffer {
  constructor ( gl:WebGLRenderingContext, x=-1.0, y=-1.0, w=2.0, h=2.0 ){
    
    const a = TMP_ARRAY;
    a[0]  = a[8]  = x;
    a[1]  = a[5]  = y;
    a[4]  = a[12] = x+w;
    a[9]  = a[13] = y+h;
    
    super(gl);

    this.data(a);
    
    this.attrib( 'aPosition', 2, gl.FLOAT );
    this.attrib( 'aTexCoord', 2, gl.FLOAT );
    
  }
  render (){
    this.drawTriangleStrip();
  };
}

export default Rect;