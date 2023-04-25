import GLTFConsts from "./consts";
import Loader from "./loader";
import Node from '../node'

// import ArrayBuffer from '../arraybuffer/arraybuffer';

var BYTE_PER_ELEMENT_MAP: { [key: number]: number } = {
  5121: 1,
  5123: 2, // UNSIGNED_SHORT
  5126: 4, // FLOAT
};

var TYPE_SIZE_MAP: { [key: string]: number } = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT3: 9,
  MAT4: 16,
};

var attribArray;

export interface IBufferView {
  buffer: number;
  byteLength: number;
  byteOffset: number;
  target: number;
}
export interface iSkin {
  name: string;
  uuid: number;
  inverseBindMatrices: number[][];
  joints: Node[];
  // skeleton: any;
  flattenJointsMatrices: Float32Array;
  jointMatrixChunks: Float32Array[];
}
export interface iAccessor {
  bufferView: number;
  componentType: number;
  count: number;
  max: [number];
  min: [number];
  type: string;
  byteOffset: number;
}
export interface iLib {
  nodeList: Node[];
  nodes: Node[];
  materials: any[];
  meshes: any[];
  // animations: never[];
  skins: iSkin[];
  byName: { [key: string]: any };
}

function getBufferViewData(bufferView: IBufferView, loader: Loader) {
  const json = loader.json;

  const _buffer: ArrayBuffer =
    loader.binaries[json.buffers[bufferView.buffer].uri];
  const bufStart = bufferView.byteOffset || 0; //+ (accessor.byteOffset||0);
  return new Uint8Array(_buffer, bufStart, bufferView.byteLength);
}

function getDataFromAccessor(
  accessor: iAccessor,
  loader: Loader,
  isIndices: boolean = false
) {
  var json = loader.json;

  const bufferView = json.bufferViews[accessor.bufferView];
  const buffer = loader.binaries[json.buffers[bufferView.buffer].uri];

  const nbcomps = TYPE_SIZE_MAP[accessor.type];
  const byte_per_element = BYTE_PER_ELEMENT_MAP[accessor.componentType];
  const bufStart = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
  const bufEnd = bufStart + accessor.count * nbcomps * byte_per_element;
  const chunkBuffer = buffer.slice(bufStart, bufEnd);

  if (accessor.componentType === GLTFConsts.FLOAT) {
    attribArray = new Float32Array(chunkBuffer);
  } else if (
    accessor.componentType === GLTFConsts.UNSIGNED_SHORT &&
    !isIndices
  ) {
    attribArray = new Float32Array(chunkBuffer);
  } else if (
    accessor.componentType === GLTFConsts.UNSIGNED_SHORT &&
    isIndices
  ) {
    attribArray = new Uint16Array(chunkBuffer);
  } else if (accessor.componentType === GLTFConsts.BYTE) {
    attribArray = new Uint8Array(buffer, bufStart, bufEnd);
  } else if (accessor.componentType === GLTFConsts.UNSIGNED_BYTE) {
    attribArray = new Int8Array(buffer, bufStart, bufEnd);
  } else {
    throw "[GLTFUtils getDataFromAccessor] accessor componentType non-defined";
  }

  return {
    data: attribArray,
    nbcomps: nbcomps,
  };
}

function getUnflattenDataFromAccessor(
  accessor: iAccessor,
  loader: Loader,
  isIndices: boolean
) {
  var json = loader.json;
  //   var bufferView      = json.bufferViews[ accessor.bufferView ];
  var rawValues = getDataFromAccessor(accessor, loader, false).data;
  var componentSize: number = <number>getComponentSize(accessor.type);
  var formattedValues = [];

  // unflatten
  for (var i = 0; i < rawValues.length / componentSize; i++) {
    var component = [];
    for (var j = 0; j < componentSize; j++) {
      var offset = i * componentSize;
      component[j] = rawValues[offset + j];
    }
    formattedValues.push(component);
  }

  return formattedValues;
}

function getStrideFromAccessor(accessor: iAccessor, json: any) {
  var bufferView = json.bufferViews[accessor.bufferView];
  return bufferView.byteStride || 0;
}

function getComponentSize(str: string | number):number {
  return <number>GLTFConsts[str];
}

export default {
  getComponentSize: getComponentSize,
  getBufferViewData: getBufferViewData,
  getDataFromAccessor: getDataFromAccessor,
  getUnflattenDataFromAccessor: getUnflattenDataFromAccessor,
  getStrideFromAccessor: getStrideFromAccessor,
};
