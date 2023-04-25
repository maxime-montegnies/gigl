import ApplicationSpg from "../spgl/application";
//

/*
import TWEEN from "@tweenjs/tween.js";

import GamePlay from "./gameplay";
import Points from "./entities/points";
import Grass from "./entities/grass";
import Ball from "./entities/ball";
import Arrows from "./entities/arrows";
import Player from "./entities/player";
*/
// import Stadium from "./entities/stadium";
import Suzanne, { fileOption } from "./entities/suzanne";
//
import Texture from "../spgl/texture";
import TextureProvider from "../spgl/texture-loader/provider";
import PostProcess from "./entities/post-process";
import Post from "../spgl/post";
import { vec3, mat4, quat, vec2 } from "gl-matrix";
import Config from "../spgl/state/config";
import Node from "../spgl/node";
import Environment from "./entities/environment/environment";

/*
import JuggleApp from "../index";
//
import Stats from "stats.js";
import { AppState, InputType } from "./types";
import Controls from "./controls";
*/

/*
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.querySelector("#ui>div")!.prepend(stats.dom);
stats.dom.style.position = "absolute"
stats.dom.style.right = "0px"
stats.dom.style.left = "auto"
*/

const objects: fileOption[] = [
  {
    name: "ball.gltf",
    path: "data/ball/",
    scale:0.2,
    position: vec3.fromValues(0.0,0.0,0.0),
    rotation: vec3.fromValues(0.0,0.0,0.0),
  },
  // {
  //   name: "bar.gltf",
  //   path: "data/bar/",
  //  scale:0.5,
  //  position: vec3.fromValues(0.0,0.0,0.0),
  //  rotation: vec3.fromValues(30.0,0.0,0.0),
  // },
  // {
  //   name: "scene.gltf",
  //   path: "data/new_balance/",
  //  scale:0.115,
  //  position: vec3.fromValues(0.0,0.0,0.0),
  //  rotation: vec3.fromValues(0.0,-90.0,0.0),
  // },
  // {
  //   name: "drill.gltf",
  //   path: "data/drill/",
  //  scale:0.5,
  //  position: vec3.fromValues(0.0,0.0,0.0),
  //  rotation: vec3.fromValues(0.0,-90.0,0.0),
  // },
  // {
  //   name: "car.gltf",
  //   path: "data/car/",
  //  scale:0.2,
  //  position: vec3.fromValues(0.0,-0.2,0.0),
  //  rotation: vec3.fromValues(0.0,-90.0,0.0),
  // },
  // {
  //   name: "iPad.gltf",
  //   path: "data/iPad/",
  //  scale:4.5,
  //  position: vec3.fromValues(0.0,0.0,0.0),
  //  rotation: vec3.fromValues(0.0,-90.0,0.0),
  // },
  // {
  //   name: "ipad_pro.gltf",
  //   path: "data/ipad_pro/",
  //  scale:0.02,
  //  position: vec3.fromValues(0.0,0.0,0.0),
  //  rotation: vec3.fromValues(0.0,-90.0,0.0),
  // },
  // {
  //   name: "ipad_mini.gltf",
  //   path: "data/ipad_mini/",
  //  scale:0.65,
  //  position: vec3.fromValues(0.0,0.0,0.0),
  //  rotation: vec3.fromValues(0.0,-90.0,0.0),
  // },
  // {
  //   name: "yolo.gltf",
  //   path: "data/yolo/",
  //  scale:0.5,
  //  position: vec3.fromValues(0.0,0.0,0.0),
  //  rotation: vec3.fromValues(0.0,-90.0,0.0),
  // },
  // {
  //   name: "helmet.gltf",
  //   path: "data/helmet/",
  //  scale:3.0,
  //  position: vec3.fromValues(0.0,-0.25,0.0),
  //  rotation: vec3.fromValues(0.0,0.0,0.0),
  // },
/*
  {
    name: "drill.gltf",
    path: "data/drill/",
   scale:0.5,
   position: vec3.fromValues(0.0,0.2,0.0),
   rotation: vec3.fromValues(0.0,-90.0,0.0),
  },
  {
    name: "drill.gltf",
    path: "data/drill/",
   scale:0.5,
   position: vec3.fromValues(0.0,0.4,0.0),
   rotation: vec3.fromValues(0.0,-90.0,0.0),
  },
  {
    name: "drill.gltf",
    path: "data/drill/",
   scale:0.5,
   position: vec3.fromValues(0.0,-0.2,0.0),
   rotation: vec3.fromValues(0.0,-90.0,0.0),
  },
  {
    name: "drill.gltf",
    path: "data/drill/",
   scale:0.5,
   position: vec3.fromValues(0.0,-0.4,0.0),
   rotation: vec3.fromValues(0.0,-90.0,0.0),
  },
*/
];

class Application {
  textureProvider: TextureProvider;
  app: ApplicationSpg;
  isPlaying = false;
  _renderParticles = false;
  // balls: Ball[]=[];
  // arrows: Arrows;
  // player_1: Player;
  // player_2: Player;
  // player?: Player;
  // stadium: Stadium;
  objects: Suzanne[];
  environment: Environment;
  // points: Points;
  // grass: Grass;
  // gamePlay: GamePlay;
  //
  postProcess: PostProcess;
  post: Post;
  // stadiumContainer: Node;
  camOffset = vec3.create();
  camRotate = vec2.create();
  camScale = 1.0;
  stageBounds = vec3.create();
  gl: WebGLRenderingContext;
  // private _state: AppState = AppState.INTRO;
  // mainApp: JuggleApp;
  // constructor(canvas: HTMLCanvasElement, loader: HTMLElement, mainApp:JuggleApp) {
  constructor(canvas: HTMLCanvasElement) {
    // this.loader = loader;

    this.app = new ApplicationSpg(canvas);
    // this.mainApp = mainApp;

    this.gl = this.app.gl;
    this.gl.getExtension("OES_standard_derivatives");
    this.gl.getExtension("EXT_shader_texture_lod");

    this.app.resize = this.resize.bind(this);
    this.app.render = this.render.bind(this);
    this.app.preRender = this.preRender.bind(this);
    this.app.postRender = this.postRender.bind(this);
    //
    this.textureProvider = this.app.texs.createProvider();
    //
    /*
    const ball = new Ball(this);
    this.balls.push(ball)
    this.arrows  = new Arrows(this.app);
    this.player_1 = new Player(this.app, "player_1");
    this.player_2 = new Player(this.app, "player_2");
    this.gamePlay = new GamePlay(this);
    //
    */
    // this.stadium = new Stadium(this.app);
    this.objects = [];
    for (let index = 0; index < objects.length; index++) {
      this.objects.push(new Suzanne(this, objects[index]));
    }
    this.environment = new Environment(this);
    // this.stadium = new Stadium(this);
    // this.stadiumContainer = new Node();
    /*
    this.points = new Points(this.app);
    this.grass = new Grass(this.app);
    //
    */

    // this.app.stage.add(this.stadiumContainer);
    // this.stadiumContainer.add(this.stadium);
    let index = 0;
    for (const key in this.objects) {
      this.app.stage.add(this.objects[key]);
      this.objects[key].scale[0]=this.objects[key].scale[1]=this.objects[key].scale[2] = objects[index].scale;
      this.objects[key].position = objects[index].position;
      quat.fromEuler(
        this.objects[key].rotation,
        objects[index].rotation[0],
        objects[index].rotation[1],
        objects[index].rotation[2]
        );
      index++;
    }
    this.app.cameras.add(this.environment.root);
    /*
    //
    
    this.stadiumContainer.add(this.points);
    this.stadiumContainer.add(this.grass);
    // this.app.stage.add(this.ball);
    this.playerAndBall.add(ball);
    this.playerAndBall.add(this.player_1);
    this.playerAndBall.add(this.player_2);

    // this.app.stage.add(this.player_1);
    // this.app.stage.add(this.player_2);
    // this.player_1.setScale(0.04)
    // this.player_2.setScale(0.04)
    //
    */
    this.postProcess = new PostProcess(this.app);
    this.post = this.postProcess.post;
  }

  //
  // abstract
  onLoaded() {}
  onLoadProgress(p: number) {}
  onReady() {}
  //
  /*
  get state(): AppState {
    return this._state;
  }
  set state(s: AppState) {
    this._state = s;
    const scalePlayers = (value: number) => {
      new TWEEN.Tween({ x: this.player_1.scale[0] })
        .to({ x: value }, 700)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate((e) => {
          this.player_1.setScale(e.x);
          this.player_2.setScale(e.x);
        })
        .start();
    }
    switch (this._state) {
      case AppState.SELECT_TEAM:
        scalePlayers(0.9);
        const coords = { x1: this.player_1.x, x2: this.player_2.x };
        new TWEEN.Tween(coords)
          .to(
            {
              x1: -0.5 * (this.app.renderer.width / 2) + (this.app.renderer.width / 2) * 0.05,
              x2: 0.5 * (this.app.renderer.width / 2) - (this.app.renderer.width / 2) * 0.05,
            },
            700
          )
          .easing(TWEEN.Easing.Exponential.InOut)
          .onUpdate((e) => {
            this.player_1.x = e.x1;
            this.player_2.x = e.x2;
          })
          .start();

        break;
      case AppState.SELECT_MODE:
        scalePlayers(0.9);
        break;
      case AppState.GAME:
        scalePlayers(1);
        break;
      case AppState.RESULT:
        this.MakeSnapShot()
        break;
      default:
        break;
    }
    this.gamePlay.state = this._state;
  }
  */

  play() {
    this.app.renderer.play();
    this.isPlaying = true;
  }
  stop() {
    this.app.renderer.stop();
    this.isPlaying = false;
  }
  resize(width: number, height: number) {
    /*
    this.gamePlay.resize(width, height);    
    */
    const vec_1 = vec3.fromValues(1, 1, -1);
    const vec_2 = vec3.fromValues(1, 1, 1);
    const vec = vec3.create();
    this.app.cameraP.unproject(vec_1, vec_1);
    this.app.cameraP.unproject(vec_2, vec_2);
    const distance = vec_2[2] - vec_1[2];
    const stageZ = -0.1;
    const coef = (stageZ - vec_1[2]) / distance;
    vec3.scale(vec_1, vec_1, 1 - coef);
    vec3.scale(vec_2, vec_2, coef);
    vec3.add(vec, vec_1, vec_2);
    this.stageBounds = vec;
    // Refresh state
    /*
    this.state = this.state;
    */
    console.log("Resize");

    return;
  }
  renderColor(dt: number, time: number) {
    /*
    for (let index = 0; index < this.balls.length; index++) {
      this.balls[index].render(dt, time);
    }
    // this.ball.render(dt, time);
    if (this.player_1.z > this.player_2.z) {
      this.player_2.render(dt, time);
      this.player_1.render(dt, time);
    } else {
      this.player_1.render(dt, time);
      this.player_2.render(dt, time);
    }
    this.arrows.render(dt, time);
    */
    //  this.stadium.render(dt, time);
    this.environment.render(dt, time);
    for (const key in this.objects) {
      this.objects[key].render(dt, time);
    }
  }
  renderColorBlurred(dt: number, time: number) {
    // this.stadium.render(dt, time);
    /*
    this.grass.render(dt, time);
    this.points.render(dt, time);
    */
  }
  render(dt: number, time: number) {
    this.gl.viewport(0, 0, this.app.renderer.width, this.app.renderer.height);
    this.gl.clearColor(0.14, 0.14, 0.14, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.renderColor(dt, time);
    return;
    this.post.preRender(this.app.renderer.width, this.app.renderer.height);

    this.post.bindColor0();
    /*
    this.stadium.renderDepth(dt, time);
    this.points.renderDepth(dt, time);
    */

    this.post.bindColor();
    //
    this.renderColorBlurred(dt, time);

    this.post.render(undefined);
    this.renderColor(dt, time);
  }
  preRender(dt: number, time: number) {
    /*
    stats.begin();

    TWEEN.update();

    this.gamePlay.tick(dt, time);
    */
    this.postProcess.preRender();
    // this.stadium.preRender(dt, time);
    for (const key in this.objects) {
      this.objects[key].preRender(dt, time);
    }
    this.environment.preRender(dt, time);
    /*
    this.grass.preRender(dt, time);
    this.points.preRender(dt, time);
    
    this.arrows.preRender(dt, time);

    // this.ball.preRender(dt, time);
    for (let index = 0; index < this.balls.length; index++) {
      this.balls[index].preRender(dt, time);
    }

    this.player_2.preRender(dt, time);
    this.player_1.preRender(dt, time);

    this.player_1.z = 210;
    this.player_2.z = 220;

    this.stadiumContainer.setScale(this.camScale);
    this.stadiumContainer.z = this.camOffset[2];
    this.stadiumContainer.y = this.camOffset[1] - this.stageBounds[1];
    // this.app.stage.z = 0.291811;
    */
  }
  postRender(dt: number, time: number) {
    // stats.end();
  }
  //
  /*
  set renderParticles(value: boolean) {
    this._renderParticles = value;
    this.points.intensityTarget = this._renderParticles ? 1 : 0;
  }
  get renderParticles(): boolean {
    return this._renderParticles;
  }
  */
  //
  //
  //
  //
  load() {
    let ls: Promise<Texture | string | ArrayBuffer>[] = [];
    const self = this;
    // for (let index = 0; index < this.balls.length; index++) {
    //   ls = ls.concat(this.balls[index].getLoadables());
    // }
    // ls = ls.concat(this.grass.getLoadables());
    // ls = ls.concat(this.player_1.getLoadables());
    // ls = ls.concat(this.player_2.getLoadables());
    // ls = ls.concat(this.points.getLoadables());
    // ls = ls.concat(this.stadium.getLoadables());
    ls = ls.concat(this.environment.getLoadables());
    for (const key in this.objects) {
      ls = ls.concat(this.objects[key].getLoadables());
    }
    // ls = ls.concat(this.arrows.getLoadables());
    let incLoad = 0;
    ls.map((p) => {
      p.then(() => {
        self._onLoadProgress(++incLoad / ls.length);
      });
    });
    return Promise.all(ls).then(self._onLoaded.bind(self), () => {
      console.warn("error Loaading Assets");
    });
  }
  _onLoadProgress(p: number) {
    console.log("_onLoadProgress", p);
    // this.loader.innerHTML = Math.round(p * 100) + " %";
    this.onLoadProgress(p);
  }
  _onReady() {
    console.log("_onReady");
    this.app.resizeHandler();
    this.onReady();
  }
  _onLoaded() {
    /*
    this.player_1.init();
    this.player_2.init();
    for (let index = 0; index < this.balls.length; index++) {
      this.balls[index].init();
    }
    this.points.init();
    this.arrows.init();
    this.grass.init();
    */
    // this.stadium.init();
    for (const key in this.objects) {
      this.objects[key].init();
    }
    this.environment.init();
    // this.loader.remove();
    requestAnimationFrame(this._onReady.bind(this));
    this.onLoaded();
    return;
  }
  /*
  selectPlayer(playerNumber: number) {
    this.player = playerNumber == 1 ? this.player_1 : this.player_2;
    this.gamePlay.player = this.player;
    const playerOut: Player = playerNumber == 1 ? this.player_2 : this.player_1;
    const coordsDest =
      playerNumber == 1
        ? { x1: 0, x2: this.app.renderer.width }
        : { x1: 0, x2: -this.app.renderer.width };

    const coords = { x1: this.player.x, x2: playerOut.x };
    const tween = new TWEEN.Tween(coords)
      .to(coordsDest, 700)
      .easing(TWEEN.Easing.Exponential.InOut)
      .onUpdate((e) => {
        this.player!.x = e.x1;
        playerOut.x = e.x2;
      })
      .start();
  }
  */
  //
  MakeSnapShot() {
    const oc = document.createElement("canvas");
    const octx = oc.getContext("2d")!;
    oc.width = this.app.renderer.view.width;
    oc.height = this.app.renderer.view.height;
    octx.drawImage(this.app.renderer.view, 0, 0, oc.width, oc.height);
    // var imgData = octx.getImageData(0, 0, oc.width, oc.height);
    const img = <HTMLImageElement>document.getElementById("juggle-result-img");
    img.src = oc.toDataURL();
  }
  /*
  ExtraBall() {
    const ball = new Ball(this);
    ball.getLoadables();
    ball.init();
    this.playerAndBall.add(ball);
    this.balls.push(ball);
  }
  */
}
export default Application;
