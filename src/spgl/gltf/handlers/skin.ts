import Loader from '../loader'
import GLTFUtils from '../utils';
import { iSkin } from '../utils';

var SKIN_IDX = -1;

function handleSkin(loader: Loader) {
  var json = loader.json;
  var nodes = loader.getNodeList();
  var skins: iSkin[] = [];
  if (!json.skins) return;
  for (var s = 0; s < json.skins.length; s++) {
    SKIN_IDX++;
    var skinData = json.skins[s];
    var name = skinData.name || "skin_" + SKIN_IDX;
    var uuid = SKIN_IDX;
    // get inverseBindMatrices
    var accessor = json.accessors[skinData.inverseBindMatrices];
    var inverseBindMatrices = GLTFUtils.getUnflattenDataFromAccessor(accessor, loader, false);
    // get joints
    var joints = [];
    for (var i = 0; i < skinData.joints.length; i++) {
      var jointIdx = skinData.joints[i];
      var joint = nodes[jointIdx];
      joints.push(joint);
    }
    //
    // get skeleton root node
    // var skeleton = skinData.skeleton ? nodes[skinData.skeleton] : joints[0];
    //
    // get jointsMatrices
    const flattenJointsMatrices = new Float32Array(skinData.joints.length * 16);
    const jointMatrixChunks = [];
    for (var i = 0; i < skinData.joints.length; i++) {
      jointMatrixChunks.push(new Float32Array(flattenJointsMatrices.buffer, 16 * 4 * i, 16));
    }
    //
    //
    skins.push({
      name: name,
      uuid: uuid,
      inverseBindMatrices: inverseBindMatrices,
      joints: joints,
      // skeleton: skeleton,
      flattenJointsMatrices: flattenJointsMatrices,
      jointMatrixChunks: jointMatrixChunks
    });
  }
  loader._lib.skins = skins;
}

export default handleSkin;