import Loader from '../loader'
import Node from '../../node'
import { mat4 } from 'gl-matrix';
import { quat } from 'gl-matrix';
import { vec3 } from 'gl-matrix';

let M4 = mat4.create();
let NODE_IDX = -1;
function handleNodes(loader: Loader) {
    NODE_IDX = -1;
    var json = loader.json;
    var nodeList: Node[] = [];
    var rootNodeList: Node[] = [];
    const byName: { [key: string]: Node } = {};
    function traverse(node: Node, parent: Node | null) {
        var nodeData = node.userData;
        if (parent) parent.add(node);
        if (nodeData.children) {

            for (var i = 0; i < nodeData.children.length; i++) {
                var nodeIdx = nodeData.children[i];
                var childNode = nodeList[nodeIdx];
                traverse(childNode, node)
            }

        }
    }
    function createNode(nodeData: any) {
        NODE_IDX++;
        var node = new Node();
        node.userData = nodeData;
        node.name = nodeData.name || ("node_" + NODE_IDX);
        //
        const rotation = nodeData.rotation ? quat.fromValues(nodeData.rotation[0], nodeData.rotation[1], nodeData.rotation[2], nodeData.rotation[3]) : quat.create();
        const translation = nodeData.translation || vec3.create();
        const scale = nodeData.scale || vec3.fromValues(1, 1, 1);
        //
        mat4.fromRotationTranslationScale(M4, rotation, translation, scale);
        node.setMatrix(M4);
        //
        return node;
    }
    //
    //
    //
    // creates all nodes first
    for (var i = 0; i < json.nodes.length; i++) {
        const nodeData = json.nodes[i];
        const node = createNode(nodeData);
        nodeList.push(node);
        byName[node.name] = node;
    }
    //
    for (var i = 0; i < json.scenes[0].nodes.length; i++) {
        var nodeIdx = json.scenes[0].nodes[i];
        var node = nodeList[nodeIdx];
        rootNodeList.push(node);
        traverse(node, null);
    }
    //
    loader._lib.nodeList = nodeList;
    loader._lib.nodes = rootNodeList;
    loader._lib.byName = byName;
}

export default handleNodes;