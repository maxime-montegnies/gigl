const getComponentSize = function (type: GLenum) {
  switch (type) {
    case 0x1400: //gl.BYTE:
    case 0x1401: //gl.UNSIGNED_BYTE:
      return 1;
    case 0x1402: //gl.SHORT:
    case 0x1403: //gl.UNSIGNED_SHORT:
      return 2;
    case 0x1404: //gl.INT:
    case 0x1405: //gl.UNSIGNED_INT:
    case 0x1406: //gl.FLOAT:
      return 4;
    default:
      return 0;
  }
};

function isBufferSource(val: GLsizeiptr | BufferSource): val is BufferSource {
  return (<BufferSource>val).byteLength !== undefined;
}
export { getComponentSize, isBufferSource };
