const consts:{[key:string|number]:string|number} = {
  0:     'POINTS',
  1:     'LINES',
  2:     'LINE_LOOP',
  3:     'LINE_STRIP',  
  4:     'TRIANGLES',
  5:     'TRIANGLE_STRIP',
  6:     'TRIANGLE_FAN',           
  5121:  'UNSIGNED_BYTE',      
  5123:  'UNSIGNED_SHORT',      
  5126:  'FLOAT',               
  34963: 'ELEMENT_ARRAY_BUFFER',
  34962: 'ARRAY_BUFFER',        
  35678: 'SAMPLER_2D',          
  35664: 'FLOAT_VEC2',          
  35665: 'FLOAT_VEC3',          
  35666: 'FLOAT_VEC4',          
  35676: 'FLOAT_MAT4',        
  
  'BYTE':           5120,
  'UNSIGNED_BYTE':  5121,
  'SHORT':          5122,
  'UNSIGNED_SHORT': 5123,
  'UNSIGNED_INT':   5125,
  'FLOAT':          5126,
  
  'SCALAR': 1,
  'VEC2':   2,
  'VEC3':   3,
  'VEC4':   4,
  'MAT2':   4,
  'MAT3':   9,
  'MAT4':   16
}

export default consts;