import GLArrayBuffer from "../arraybuffer/arraybuffer";

class Circle extends GLArrayBuffer {
  constructor(gl:WebGLRenderingContext, radius = 1.0, segs=32) {
    const a = new Float32Array((segs + 2) << 2);

    const arc = (Math.PI * 2) / segs;
    a[2] = a[3] = 0.5;

    for (let i = 0; i <= segs + 1; i++) {
      const x = Math.cos(i * arc);
      const y = -Math.sin(i * arc);
      const j = (i + 1) << 2;
      a[j + 0] = radius * x;
      a[j + 1] = radius * y;
      a[j + 2] = x * 0.5 + 0.5;
      a[j + 3] = y * 0.5 + 0.5;
    }

    super(gl);

    this.data(a);

    this.attrib("aPosition", 2, gl.FLOAT);
    this.attrib("aTexCoord", 2, gl.FLOAT);
  }
  render() {
    this.drawTriangleFan();
  }
}

export default Circle;
