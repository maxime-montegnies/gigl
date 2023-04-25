import Loader from "../loader";
import Mesh from "../mesh";
import GLTFUtils from "../utils";
import GLIndexBuffer from "../../arraybuffer/indexbuffer";
import { vec4 } from 'gl-matrix';

var ATTRIBS_NAME_MAP: { [key: string]: string } = {
  POSITION: "aPosition",
  NORMAL: "aNormal",
  TANGENT: "aTangent",
  TEXCOORD_0: "aTexCoord",
  TEXCOORD_1: "aTexCoord2",
  TEXCOORD: "aTexCoord",
  JOINTS_0: "aJoint",
  WEIGHTS_0: "aWeight",
};

function processAttribute(attrib: string, accessordId: number, loader: Loader) {
  var json = loader.json;
  var accessor = json.accessors[accessordId];
  var buffer = loader.getArrayBufferForAccessor(accessor);
  buffer.attribs.push({
    name: <string>ATTRIBS_NAME_MAP[attrib],
    type: <GLenum>accessor.componentType,
    size: GLTFUtils.getComponentSize(accessor.type),
    normalize: <boolean>accessor.normalized || false,
    offset: <number>accessor.byteOffset || 0,
    stride: 0,
  });

  return buffer;
}

function handleMeshes(loader: Loader) {
  var json = loader.json;
  const meshes: any[] = [];
  for (let index = 0; index < json.meshes.length; index++) {
    const element = json.meshes[index];
    const prim = element.primitives[0];
    const meshData: { [key: string]: any } = {};
    //
    // indices
    const accessorIdx = prim.indices;
    const accessor = json.accessors[accessorIdx];
    const bufferView = json.bufferViews[accessor.bufferView];
    const indicesData = GLTFUtils.getBufferViewData(bufferView, loader);
    const indexBuffer = new GLIndexBuffer(
      loader.gl,
      accessor.componentType,
      indicesData
    );
    const attributes = [];
    // attribs
    for (let attrib in prim.attributes) {
      var accessordId = prim.attributes[attrib];
      attributes.push(processAttribute(attrib, accessordId, loader));
    }
    const mesh = new Mesh(loader.gl, indexBuffer, attributes);
    mesh.material = prim.material;
    mesh.name = element.name;
    meshes.push(mesh);
    // Node Parent
    for (let i = 0; i < json.nodes.length; i++) {
      if (json.nodes[i].mesh != undefined) {        
        if(json.nodes[i].mesh==index){
            loader._lib.byName[json.nodes[i].name].add(mesh);
        }        
      }
    }
  }
  loader._lib.meshes = meshes;


  // Materials
  
  const materials = [];
  if (json.materials) {
    const materialTexture = [];
    for (let i = 0; i < json.materials.length; i++) {
      console.log(json.materials[i])
      /*
      const textureIndex = json.materials[i].pbrMetallicRoughness.baseColorTexture.index;
      const texture = json.textures[textureIndex];
      const image = json.images[texture.source];
      */
      // materials[i] = image.name;
      materials[i] = json.materials[i];
      if(materials[i].pbrMetallicRoughness) {
        if (materials[i].pbrMetallicRoughness.metallicFactor == undefined) {
          materials[i].pbrMetallicRoughness.metallicFactor = 1.0;
        }
        if (materials[i].pbrMetallicRoughness.roughnessFactor == undefined) {
          materials[i].pbrMetallicRoughness.roughnessFactor = 1.0;
        }
        if (materials[i].pbrMetallicRoughness.baseColorFactor == undefined) {
          materials[i].pbrMetallicRoughness.baseColorFactor = vec4.fromValues(1.0,1.0,1.0,1.0);
        }
      }
      
      // mesh.material = prim.material;
    }
  }
  loader._lib.materials = materials;
}

export default handleMeshes;
