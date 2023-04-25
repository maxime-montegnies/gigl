import GLArrayBuffer from "../arraybuffer/arraybuffer";

class CircleOutline extends GLArrayBuffer {
  constructor(gl:WebGLRenderingContext, radius = 1.0, segs = 32, thickness = 0.1) {

    super(gl);

    const a = new Float32Array((segs + 1) * 10);
    const inner = radius - thickness;
    const tcMult = (inner / radius) * 0.5;
    const arc = (Math.PI * 2) / segs;

    for (let i = 0; i <= segs + 1; i++) {
      const x = Math.cos(i * arc);
      const y = -Math.sin(i * arc);
      const j = i * 10;
      a[j + 0] = radius * x;
      a[j + 1] = radius * y;
      a[j + 2] = x * 0.5 + 0.5;
      a[j + 3] = y * 0.5 + 0.5;

      a[j + 5] = inner * x;
      a[j + 6] = inner * y;
      a[j + 7] = x * tcMult + 0.5;
      a[j + 8] = y * tcMult + 0.5;

      a[j + 4] = 1;
      a[j + 9] = 0;
    }

    this.data(a);

    this.attrib("aPosition", 2, gl.FLOAT);
    this.attrib("aTexCoord", 2, gl.FLOAT);
    this.attrib("aSide", 1, gl.FLOAT);
  }
  render() {
    this.drawTriangleStrip();
  }
}

export default CircleOutline;
