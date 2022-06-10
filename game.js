import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/FBXLoader.js";
import { RGBELoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/RGBELoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";
import { collisionVec } from "./collision.js";
import { treeVec } from "./collision.js";
import { lowPolyTreeVec } from "./collision.js";
import { antennaVec } from "./collision.js";
import { Stats } from "./FPS.js";
import { checkpointVec } from "./collision.js";
import { barrelVec } from "./collision.js";
import { GUI } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/libs/dat.gui.module.js";
import { MyParticleSystem } from "./particles.js";
//import settings selected from menu
var graphicStrorage = localStorage.getItem("graphic");
var difficultyLevel = localStorage.getItem("difficulty");
/* #region Variables*/
var goal, keys, follow;
var collisionVec2 = [];
var temp = new THREE.Vector3();
var dir = new THREE.Vector3();
var a = new THREE.Vector3();
var b = new THREE.Vector3();
var coronaSafetyDistance = 2.6;
var speed = 0.0;
var groundID = "";
var porscheID = "";
var wheel1ID = "";
var wheel2ID = "";
var wheel3ID = "";
var wheel4ID = "";
var Onlap = false;
let laps = 0;
let win = false;
let lose = false;
let difficultyValue = 1;
let globalBarrelVec = [];
let collisionBarrelVec = [];

let accelerate = 0;
let left = 0;
let right = 0;
let deccelerate = 0;
let gear = "0";
let reverse = 0;
let fpv = false;
let Vee = 8;
var space = 0;
var orbitcam = false;
var counter = 0;
let end = new Date();
let endTime = 0;
var laptimes = [];
let checkpointcount = 0;
let EasytimetoComplete = 24100;
let MediumtimetoComplete = 20100;
let HardtimetoComplete = 17200;
let timetoComplete = 2000;
let difficulty = difficultyLevel;
let shadowQuality = 3000; //shadow map size = 1024*3000
let shadowDistance = 500; //draw distance = 500 units
let drawDistance = 500; //draw distance = 500 units
let foliageCount = 1; //full
let reflections = true; //reflections on
let updatespersecond = 30; //twice per second 60/30=2

let graphicsSetting = graphicStrorage; //change graphics settings high medium low or lowest
console.log(graphicsSetting);
console.log(difficulty);
let particles = null;
let previousRAF = null;

/* #endregion */

/* #region Difficulty*/

if (difficulty == "hard") {
  timetoComplete = HardtimetoComplete;
  difficultyValue = 2;
} else if (difficulty == "medium") {
  timetoComplete = MediumtimetoComplete;
  difficultyValue = 3;
} else if (difficulty == "easy") {
  timetoComplete = EasytimetoComplete;
  difficultyValue = 5;
} else {
  timetoComplete = 10000000000;
}
if (graphicsSetting == "high") {
} else if (graphicsSetting == "medium") {
  shadowQuality = 1500;
  shadowDistance = 200;
  drawDistance = 400;
  foliageCount = 1;
  reflections = true;
  updatespersecond = 30;
} else if (graphicsSetting == "low") {
  shadowQuality = 1000;
  shadowDistance = 125;
  drawDistance = 250;
  foliageCount = 2;
  reflections = true;
  updatespersecond = 60; //once per second
} else if (graphicsSetting == "lowest") {
  shadowQuality = 100;
  shadowDistance = 75;
  drawDistance = 200;
  foliageCount = 4; //1/4 normal count
  reflections = false;
  updatespersecond = 60; //once per second
}

/* #endregion Difficulty*/

// creates a stats element on screen to tell performance figures
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

//instantiates a new renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

//creates a new orbit camera that can be switched to by pressing 'p'
const camera1 = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
const controls = new OrbitControls(camera1, renderer.domElement);

//controls.update() must be called after any manual changes to the camera's transform
camera1.position.set(0, 20, 100);
controls.update();

//loader for the ground materials that texture the plane
const textureLoader = new THREE.TextureLoader();
const grassBaseColor = textureLoader.load(
  "./assets/GrassTexture/Stylized_Grass_001_basecolor.jpg"
);
const grassDisp = textureLoader.load(
  "./assets/GrassTexture/Stylized_Grass_001_height.png"
);
const grassNorm = textureLoader.load(
  "./assets/GrassTexture/Stylized_Grass_001_normal.jpg"
);
const grassOcc = textureLoader.load(
  "./assets/GrassTexture/Stylized_Grass_001_ambientOcclusion.jpg"
);
const grassRough = textureLoader.load(
  "./assets/GrassTexture/Stylized_Grass_001_roughness.jpg"
);

//gets a baseline start time for the first lap of the race
let start = new Date();
let startTime = start.getTime();

let startTimeleft = new Date();

//instantiates a shadowMap and uses PCFSoftShadowMap for higher quality shadoes
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

//appends the renderer to the window
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//instantiates a follow camera for a third person perspective of the car
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  20000
);
camera.position.set(0, 1.3, 0);
const scene = new THREE.Scene();
camera.lookAt(0, 0, 0);

//instantiates a fixed driver camera for a drivers perspective
const driverCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  20000
);
driverCamera.position.set(0.3, 1.3, 0);
driverCamera.lookAt(0, 1.3, 10);

//default camera is set the third person
let Playercamera = camera;

//instantitates a soft light to minorly illuminate the scene
const light = new THREE.AmbientLight(0x0f0f0f); // soft white light
scene.add(light);

//adds a directional light in order to cast shadows in the scene
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(180, 100, 300);
directionalLight.target.position.set(180, 0, 200);
directionalLight.castShadow = true;

//Set up shadow properties for the light
directionalLight.shadow.mapSize.width = 1024 * shadowQuality; // default
directionalLight.shadow.mapSize.height = 1024 * shadowQuality; // default
var d = 450;
directionalLight.shadow.camera.left = -d;
directionalLight.shadow.camera.right = d;
directionalLight.shadow.camera.top = d / 2;
directionalLight.shadow.camera.bottom = -d / 2;
directionalLight.shadow.bias = -0.0001;
scene.add(directionalLight);

//adds exponential fog to the scene to add atmosphere
scene.fog = new THREE.FogExp2(0xdfe9f3, 0.0002);

// creates a sphere to be cloned that will assist in marking places for models to be added
const collisionSphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 16),
  new THREE.MeshBasicMaterial({ color: "red" })
);

//sets wrapping parameters to repeat texture accross plane
grassBaseColor.wrapS = THREE.RepeatWrapping;
grassBaseColor.wrapT = THREE.RepeatWrapping;
grassBaseColor.repeat.set(300, 300);

//creates the plane with parameters loaded earlier and repeated texture
const planeGeometry = new THREE.PlaneGeometry(1500, 1000, 1, 1); // create a plane
const planeMaterial = new THREE.MeshStandardMaterial({
  map: grassBaseColor,
  normalMap: grassNorm,
  displacementMap: grassDisp,
  displacementScale: 0.01,
  aoMap: grassOcc,
  //roughnessMap:grassRough,
  //roughness:0.01
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
renderer.outputEncoding = THREE.sRGBEncoding;

//instantiates an array to store faces of skybox
let materialArray = [];

//load textures of skybox
let texture_ft = new THREE.TextureLoader().load(
  "./assets/Skybox/yonder_ft.jpg"
);
let texture_bk = new THREE.TextureLoader().load(
  "./assets/Skybox/yonder_bk.jpg"
);
let texture_up = new THREE.TextureLoader().load(
  "./assets/Skybox/yonder_up.jpg"
);
let texture_dn = new THREE.TextureLoader().load(
  "./assets/Skybox/yonder_dn.jpg"
);
let texture_rt = new THREE.TextureLoader().load(
  "./assets/Skybox/yonder_rt.jpg"
);
let texture_lf = new THREE.TextureLoader().load(
  "./assets/Skybox/yonder_lf.jpg"
);

//push skybox textures into material array
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

//tells the textures to render on backside of face
for (let i = 0; i < 6; i++) {
  materialArray[i].side = THREE.BackSide;
}

//covers interior faces of box with skybox
let skyboxGeo = new THREE.BoxGeometry(7000, 7000, 7000);
let skybox = new THREE.Mesh(skyboxGeo, materialArray);
scene.add(skybox);

//create groups that objects are added to
//porsche group for main car model, wheels are added to this model
const porsche = new THREE.Group();

//wheel groups created for steering of car animation
const FrontLeftGroup = new THREE.Group();
const FrontRightGroup = new THREE.Group();
const progressBar = document.getElementById("progress-bar");

const loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = function (item, loaded, total) {
  progressBar.value = (loaded / total) * 100;
}; // called when an item has been loaded

const progressBarContainer = document.querySelector(".progress-bar-container");
loadingManager.onLoad = function () {
  progressBarContainer.style.display = "none";
}; // called when all items have been loaded

//instantiates a new loader to load hdri pack
const rgbeLoader = new RGBELoader(loadingManager);

//initializes models that are about to be loaded
let FrontRightWheel;
let FrontLeftWheel;
let RearLeftWheel;
let RearRightWheel;
let car;
let track;
globalBarrelVec = formatbarrelVec();
//instantiates a new gltf loader to load models
const loader = new GLTFLoader(loadingManager);

/* #region Functions/Methods */

// Function to Request an Animation Frame (RAF)

function RAF() {
  requestAnimationFrame((t) => {
    // If this is the first animation frame, then set the previous animation frame to the current frame t
    if (previousRAF === null) {
      previousRAF = t;
    }
    RAF();
    // Render next frame
    renderer.render(scene, Playercamera);
    Step(t - previousRAF);
    previousRAF = t;
  });
}
// // Function to Request an Animation Frame (RAF)

// function RAF() {
//   console.log("Entered RAF()");
//   setInterval(function () {
//     renderer.render(scene, Playercamera);
//     Step(3);
//   }, 100);
// }

//Process a moving to the next animation frame
function Step(timeElapsed) {
  // console.log("ENtered Step() ParticleSystemDEMO.Step()");
  const timeElapsedNew = timeElapsed * 0.001;

  particles.Step(timeElapsedNew);
}
//load hdri pack
rgbeLoader.load("./assets/MR_INT-003_Kitchen_Pierre.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;

  //if graphics settings allow set universal environment to hdri pack, helps with illumination and reflections
  if (reflections) {
    scene.environment = texture;
  }

  //load porsche model and traverse each node to enable shadows
  loader.load("./assets/porschecar/car1.gltf", function (gltf) {
    const model = gltf.scene;
    car = model;
    gltf.scene.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    porsche.add(car);
    //save porsche uuid so that it will always be rendered on screen
    porscheID = car.uuid;
  });

  //load racetrack and traverse every node to enable shadows
  loader.load("./assets/qwqe/scene1.gltf", function (gltf) {
    const grassmodel = gltf.scene;
    track = grassmodel;
    gltf.scene.traverse(function (node) {
      if (node.isMesh) {
        node.receiveShadow = true;
      }
    });
    scene.add(track);
    track.scale.set(200, 1, 200);
    track.translateY(0.01);
    //save track uuid so that it will always be rendered on screen
    groundID = track.uuid;
  });
});

//load porsche wheels and add them to respective groups and locations
loader.load("./assets/porschecar/wheel.gltf", function (gltf) {
  const FrontRightmodel = gltf.scene;
  FrontRightWheel = FrontRightmodel;
  FrontRightWheel.position.y += 0.35;
  FrontRightGroup.add(FrontRightWheel);
  wheel1ID = FrontRightGroup.uuid;
  porsche.add(FrontRightGroup);
});

loader.load("./assets/porschecar/wheel.gltf", function (gltf) {
  const FrontLeftmodel = gltf.scene;
  FrontLeftWheel = FrontLeftmodel;
  FrontLeftWheel.rotation.y = Math.PI;
  FrontLeftWheel.position.y += 0.35;
  FrontLeftGroup.add(FrontLeftWheel);
  wheel2ID = FrontLeftGroup.uuid;
  porsche.add(FrontLeftGroup);
});
loader.load("./assets/porschecar/wheel.gltf", function (gltf) {
  const RearRightmodel = gltf.scene;
  RearRightWheel = RearRightmodel;
  RearRightWheel.position.z -= 1;
  RearRightWheel.position.x -= 0.9;
  RearRightWheel.position.y += 0.35;
  porsche.add(RearRightWheel);
  wheel3ID = RearRightWheel.uuid;
});
loader.load("./assets/porschecar/wheel.gltf", function (gltf) {
  const RearLeftmodel = gltf.scene;
  RearLeftWheel = RearLeftmodel;
  RearLeftWheel.rotation.y = Math.PI;
  RearLeftWheel.position.z -= 1;
  RearLeftWheel.position.x += 0.9;
  RearLeftWheel.position.y += 0.35;
  porsche.add(RearLeftWheel);
  wheel4ID = RearLeftWheel.uuid;
});

//load tree model, enable shadows on each node and place trees in correct positions
loader.load("./assets/maple_tree/scene.gltf", function (gltf) {
  gltf.scene.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  const tree = gltf.scene;
  tree.castShadow = true;
  var newvec = formatTreeVec();
  tree.scale.set(0.01, 0.01, 0.01);
  //if foliage count = 2 then half the amount of trees are rendered
  for (var i = 0; i < newvec.length; i += foliageCount) {
    var newcube = tree.clone();
    newcube.position.set(newvec[i].x, newvec[i].y, newvec[i].z);
    var rand = getRandomInt(5, 15) / 15;
    var rot = getRandomInt(-314, 314) / 100;
    newcube.scale.set(rand, rand, rand);
    newcube.rotateY(rot);
    scene.add(newcube);
  }
  //scene.add(treeGroup)
});

//load daisies same as before, enable shadows and place in correct location
loader.load("./assets/daisies/scene.gltf", function (gltf) {
  const tree = gltf.scene;
  tree.castShadow = true;
  var newvec = formatTreeVec();
  tree.scale.set(0.01, 0.01, 0.01);
  for (var i = 0; i < newvec.length; i += foliageCount * 3) {
    var newcube = tree.clone();
    newcube.position.set(newvec[i].x, newvec[i].y, newvec[i].z);
    var rand = getRandomInt(5, 15) / 15;
    var rot = getRandomInt(-314, 314) / 100;
    newcube.scale.set(rand * 3, 0.2, rand * 3);
    newcube.rotateY(rot);
    scene.add(newcube);
  }
  //scene.add(treeGroup)
});

//load low poly trees, add shadows and place
loader.load("./assets/cgv_models1.glb", function (gltf) {
  gltf.scene.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  const polytree = gltf.scene;
  polytree.castShadow = true;
  var newvec = formatLowPolyTreeVec();
  for (var i = 0; i < newvec.length; i++) {
    var newcube = polytree.clone();
    newcube.position.set(newvec[i].x, newvec[i].y, newvec[i].z);
    var rand = getRandomInt(5, 15) / 20;
    var rot = getRandomInt(-314, 314) / 100;
    newcube.scale.set(rand, rand, rand);
    newcube.rotateY(rot);
    scene.add(newcube);
  }
});

//load and place antenna, start line and billboard
loader.load("./assets/starting_line/scene.gltf", function (gltf) {
  const start = gltf.scene;
  gltf.scene.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  start.rotateY((Math.PI / 2) * 1.05);
  start.translateZ(-40);
  start.translateX(-4.5);
  start.translateY(1.2);
  start.scale.set(0.08, 0.05, 0.05);
  scene.add(start);
});
loader.load("./assets/old_antenna/scene.gltf", function (gltf) {
  const start = gltf.scene;
  gltf.scene.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  start.scale.set(0.0004, 0.0004, 0.0004);
  var newvec = formatVec(antennaVec);
  for (var i = 0; i < newvec.length; i++) {
    var newcube = start.clone();
    newcube.scale.set(0.0004, 0.0004, 0.0004);
    newcube.position.set(newvec[i].x, newvec[i].y, newvec[i].z);
    var rot = getRandomInt(-314, 314) / 100;
    newcube.rotateY(rot);
    scene.add(newcube);
  }
});
loader.load(
  "./assets/metal_advertising_billboard_single_sided/scene.gltf",
  function (gltf) {
    const start = gltf.scene;
    gltf.scene.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    start.rotateY((Math.PI / 2) * 1.05);
    start.translateZ(-40);
    start.translateX(-4.5);
    start.scale.set(0.8, 0.8, 0.8);
    start.position.set(166.56489426840827, 0, 27.612372137162442);
    start.rotateY(Math.PI / 2);
    scene.add(start);
  }
);

//load and clone mountains in a ring around the scene, do not have shadows
loader.load("./assets/background_mountain_2/scene.gltf", function (gltf) {
  const model = gltf.scene;
  model.scale.set(3, 3, 3);
  model.rotateY(Math.PI / 2);
  var numMountains = 10;
  for (var i = 0; i < numMountains; i++) {
    var newcube = model.clone();
    var rand = getRandomInt(40, 50) / 15;
    newcube.rotateY(((2 * Math.PI) / numMountains) * i);
    newcube.translateX(-3000);
    newcube.rotateY(Math.PI / 2);
    newcube.translateZ(180);
    newcube.scale.set(3 * rand, 3 * rand, 3 * rand);
    scene.add(newcube);
  }
});

var fbxloader = new FBXLoader();
var grenades = [];
fbxloader.load("./assets/Grenade/grenade.fbx", function (obj) {
  obj.castShadow = true;
  var newvec = globalBarrelVec;
  //obj.scale.set(0.01,0.01,0.01)
  for (var i = 0; i < newvec.length; i += difficultyValue) {
    var newcube = obj.clone();
    newcube.position.set(newvec[i].x, newvec[i].y + 0.4, newvec[i].z);
    newcube.scale.set(0.1, 0.1, 0.1);
    grenades.push(newcube);
    scene.add(newcube);
    collisionBarrelVec.push(
      new THREE.Vector3(newvec[i].x, newvec[i].y, newvec[i].z)
    );
  }
  //scene.add(treeGroup)
});

//instantiates a new collision object that will be placed over the car
const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(2, 1, 4.65)
  //new THREE.MeshPhongMaterial({color:0xff0000})
);

cube1.translateZ(0.23);

//instantiates a bounding box that fits the car for collision detection
let cube1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube1BB.setFromObject(cube1);

//save cube ID so it is alwaysd rendered
var cubeID = cube1.uuid;
cube1.visible = false;

//instantiates a collision object that will be used to detect start and finishes
const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 30)
  //new THREE.MeshPhongMaterial({color:0xff0000})
);

//place the colllision brush in the correct location
cube2.rotateY((Math.PI / 2) * 1.05);
cube2.translateZ(-40);
cube2.translateX(-4.5);
cube2.rotateY(Math.PI / 2);
let cube2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube2BB.setFromObject(cube2);

var cube2ID = cube2.uuid;
cube2.visible = true;
//scene.add(cube2)

//place spheres to show where checkpoints are
var geometry = new THREE.SphereGeometry(1, 32, 16);
var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
var sphere = new THREE.Mesh(geometry, material);

let cpcVec = formatVec(checkpointVec);
for (var i = 0; i < cpcVec; i++) {
  var tempSphere = sphere.clone();
  scene.add(tempSphere);
}

// assembles porsche group with correct model placements
FrontRightGroup.position.z += 1.65;
FrontRightGroup.position.x -= 0.89;
FrontLeftGroup.position.z += 1.65;
FrontLeftGroup.position.x += 0.89;

//adds follow camera to porsche, goal is where the camera wants to be and follow is where the camera is positioned
goal = new THREE.Object3D();
follow = new THREE.Object3D();
follow.position.z = -coronaSafetyDistance;
porsche.add(follow);
goal.translateZ(-10);
goal.add(camera);
porsche.add(driverCamera);
porsche.add(cube1);
porsche.castShadow = true;
porsche.receiveShadow = true;
scene.add(porsche);
porsche.rotateY(-Math.PI / 2 + 0.15);
porsche.scale.set(0.5, 0.5, 0.5);

//keys used to control scene
keys = {
  a: false,
  s: false,
  d: false,
  w: false,
  v: false,
  space: false,
  t: false,
  p: false,
  x: false,
  r: false,
};


document.addEventListener("keydown", function(e) {
  console.log(e.keyCode);
  if(e.keyCode === 27) {
    window.location.href = "index.html";
  }
});

//instantiates the controller listener
document.body.addEventListener("keydown", function (e) {
  const key = e.code.replace("Key", "").toLowerCase();
  if (keys[key] !== undefined) keys[key] = true;
});
document.body.addEventListener("keyup", function (e) {
  const key = e.code.replace("Key", "").toLowerCase();
  if (keys[key] !== undefined) keys[key] = false;
});

//function for getting random integer in a range
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

//function to find distance between two points
function distanceVector(v1, v2) {
  var dx = v1.x - v2.x;
  var dy = v1.y - v2.y;
  var dz = v1.z - v2.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// function to convert milliseconds into time format and returns it as a string
function ToTime(x) {
  var time = "";
  var temptime = x;
  var minutes = 0;
  var seconds = 0;
  var milliseconds = 0;
  while (temptime > 100) {
    temptime = temptime - 100;
    seconds++;
  }
  minutes = Math.floor(seconds / 60);
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  while (seconds > 59) {
    seconds = seconds - 60;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  milliseconds = x;
  while (milliseconds > 99) {
    milliseconds = milliseconds - 100;
  }
  if (milliseconds < 10) {
    milliseconds = "0" + milliseconds;
  }

  time = minutes + ":" + seconds + ":" + milliseconds;
  return time;
}

//optimisation function to remove trees and props that are out of draw distance, removes shadows from far away objects
function CullTrees(currpos, drawdist) {
  scene.traverse(function (node) {
    if (node instanceof THREE.Group) {
      //if the object is out of draw distance dont draw it
      if (
        distanceVector(node.position, currpos) > drawdist &&
        distanceVector(node.position, currpos) < 2000 &&
        node.uuid != groundID &&
        node.uuid != porscheID &&
        node.uuid != wheel1ID &&
        node.uuid != wheel2ID &&
        node.uuid != wheel3ID &&
        node.uuid != wheel4ID &&
        node.uuid != cubeID
      ) {
        node.visible = false;
      } else {
        node.visible = true;
      }

      // if the object is out of range dont draw shadows
      if (
        distanceVector(node.position, currpos) > shadowDistance &&
        node.uuid != groundID &&
        node.uuid != porscheID &&
        node.uuid != wheel1ID &&
        node.uuid != wheel2ID &&
        node.uuid != wheel3ID &&
        node.uuid != wheel4ID &&
        node.uuid != cubeID
      ) {
        node.traverse(function (node1) {
          if (node1.isMesh) {
            node1.castShadow = false;
            node1.receiveShadow = false;
          }
        });
        node.receiveShadow = false;
        node.castShadow = false;
      }
      //white listed objects are always drawn
      else if (node.uuid != groundID) {
        node.traverse(function (node1) {
          if (node1.isMesh) {
            node1.castShadow = true;
            node1.receiveShadow = true;
          }
        });
      }
    }
  });
}

// makes a vector with all points in the scene that can be collided with
var collide = formatTreeVec()
  .concat(formatLowPolyTreeVec())
  .concat(new THREE.Vector3(166.56489426840827, 0, 27.612372137162442))
  .concat(new THREE.Vector3(-40.44950625736646, 0, -6.705652492031376))
  .concat(new THREE.Vector3(-38.60344897137225, 0, 21.735722390031476))
  .concat(formatVec(antennaVec));

//if object is within range of the car then check if there is an intersection and return true if there is one
function checkCollisions() {
  for (var i = 0; i < collide.length; i++) {
    if (distanceVector(porsche.position, collide[i]) < 5) {
      if (cube1BB.containsPoint(collide[i])) {
        return true;
      }
    }
  }
  return false;
}

function checkBarrelCollisions() {
  const vec = collisionBarrelVec;
  for (var i = 0; i < vec.length; i++) {
    if (distanceVector(porsche.position, vec[i]) < 5) {
      if (cube1BB.containsPoint(vec[i])) {
        scene.remove(grenades[i]);
        return true;
      }
    }
  }

  return false;
}

//check if the car is intersecting with the start finish line
function checkStartFinish() {
  if (cube1BB.intersectsBox(cube2BB)) {
    return true;
  }
  return false;
}

//load sound files to be played during interactions
function loadSound(soundpath, volume) {
  let listener = new THREE.AudioListener();
  camera.add(listener);

  const sound = new THREE.Audio(listener);
  let soundloader = new THREE.AudioLoader();
  soundloader.load(soundpath, function (buffer) {
    sound.setBuffer(buffer);
    sound.setVolume(volume);
    sound.play();
  });
}

// count and remove checkpoints that have been collided with
function doLap() {
  //console.log(porsche.position,cpcVec[0])
  if (cpcVec.length != 0) {
    if (distanceVector(porsche.position, cpcVec[0]) < 16) {
      cpcVec.splice(0, 1);
      checkpointcount++;
      return true;
    }
  } else return false;
}

//creates a laptime board and puts laptimes there as times are completed
function makeLeaderBoard() {
  var word = "";
  for (var i = 0; i < laptimes.length; i++) {
    word = word + "<br>" + ToTime(laptimes[i]);
  }
  //console.log(laptimes)
  return word;
}

//function that formats coordinate vectors that contain coordinates for models to be placed
//changes input vector from x,y,z to a vector filled with Vector3
function formatVec(vector) {
  const nadia = [];
  for (var i = 0; i < vector.length - 3; i += 3) {
    var tempvec = new THREE.Vector3();
    tempvec.x = vector[i];
    tempvec.y = vector[i + 1];
    tempvec.z = vector[i + 2];
    nadia.push(tempvec);
  }
  return nadia;
}

//function that is based off of formatVec() but for barrel props exclusively, performs same function as formatVec()
function formatbarrelVec() {
  const nadia = [];
  const onemoreVec = [];
  for (var i = 0; i < barrelVec.length - 3; i += 3) {
    var tempvec = new THREE.Vector3();
    tempvec.x = barrelVec[i];
    tempvec.y = barrelVec[i + 1];
    tempvec.z = barrelVec[i + 2];
    nadia.push(tempvec);
  }
  for (var i = 0; i < nadia.length; i += difficultyValue) {
    onemoreVec.push(nadia[i]);
  }
  return onemoreVec;
}

//function that is based off of formatVec() but for tree props exclusively
function formatTreeVec() {
  const nadia1 = [];
  for (var i = 0; i < treeVec.length - 3; i += 3) {
    var tempvec1 = new THREE.Vector3();
    tempvec1.x = treeVec[i];
    tempvec1.y = treeVec[i + 1];
    tempvec1.z = treeVec[i + 2];
    nadia1.push(tempvec1);
  }
  return nadia1;
}

//function that is based off of formatVec() but for low poly tree props exclusively
function formatLowPolyTreeVec() {
  const nadia2 = [];
  for (var i = 0; i < lowPolyTreeVec.length - 3; i += 3) {
    var tempvec1 = new THREE.Vector3();
    tempvec1.x = lowPolyTreeVec[i];
    tempvec1.y = lowPolyTreeVec[i + 1];
    tempvec1.z = lowPolyTreeVec[i + 2];
    nadia2.push(tempvec1);
  }
  return nadia2;
}

//function that is used for debugging, shows vertices of track and clones boxes onto each vertex
function showVertices() {
  var newvec = formatVec(collisionVec);
  for (var i = 0; i < newvec.length; i++) {
    var newcube = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1, 2),
      new THREE.MeshBasicMaterial({ color: i * 24 })
    );
    newcube.position.set(newvec[i].x * 2, newvec[i].y, newvec[i].z * 2);
    scene.add(newcube);
  }
}

//function used to show location of where tree models will be places (not in use)
function showTreeVertices() {
  var newvec = formatTreeVec();
  for (var i = 0; i < newvec.length; i++) {
    var newcube = tree.clone();
    newcube.position.set(newvec[i].x, newvec[i].y, newvec[i].z);
    scene.add(newcube);
  }
}

// function used to double the number of vertices in a vertex vector, interpolates new points between existing points
function doublevec(singlevec) {
  var anothervec = [];
  for (var i = 0; i < singlevec.length - 2; i += 2) {
    for (var j = 0; j < singlevec.length - 2; j += 2) {
      var threevec = new THREE.Vector3();
      if (distanceVector(singlevec[i], singlevec[j]) < 20) {
        threevec.x = (singlevec[i].x + singlevec[j].x) / 2;
        threevec.z = (singlevec[i].z + singlevec[j].z) / 2;
        threevec.y = singlevec[i].y;
        anothervec.push(threevec);
        anothervec.push(singlevec[i]);
      }
    }
  }
  console.log(anothervec.length);
  return anothervec;
}
/* #endregion */
//create div for UI elements and position them correctly

var tempDiv = document.createElement("div");
tempDiv.style.position = "absolute";
tempDiv.style.width = 100;
tempDiv.style.height = 100;
tempDiv.style.top = 70 + "px";
tempDiv.style.left = 100 + "px";
tempDiv.style.fontSize = 20;
document.body.appendChild(tempDiv);

var SpeedoMeter = document.createElement("div");
SpeedoMeter.style.position = "absolute";
SpeedoMeter.style.width = 100;
SpeedoMeter.style.height = 100;
SpeedoMeter.style.bottom = 50 + "px";
SpeedoMeter.style.left = window.innerWidth / 2 + "px";
SpeedoMeter.style.fontSize = 20;
document.body.appendChild(SpeedoMeter);

var check = document.createElement("div");
check.style.position = "absolute";
check.style.width = 100;
check.style.height = 100;
check.style.top = 50 + "px";
check.style.left = window.innerWidth / 2 + "px";
check.style.fontSize = 20;
document.body.appendChild(check);

var Gears = document.createElement("div");
Gears.style.position = "absolute";
Gears.style.width = 100;
Gears.style.height = 100;
Gears.style.bottom = 50 + "px";
Gears.style.left = window.innerWidth / 2 - 100 + "px";
Gears.style.fontSize = 20;
document.body.appendChild(Gears);

var timer = document.createElement("div");
timer.style.position = "absolute";
timer.style.width = 100;
timer.style.height = 100;
timer.style.top = 74 + "px";
timer.style.left = window.innerWidth / 2 + "px";
timer.style.fontSize = 20;
document.body.appendChild(timer);

var timeLeft = document.createElement("div");
timeLeft.style.position = "absolute";
timeLeft.style.width = 100;
timeLeft.style.height = 100;
timeLeft.style.top = 29 + "px";
timeLeft.style.left = window.innerWidth / 2 + "px";
timeLeft.style.fontSize = 20;
timeLeft.style.backgroundColor = "red";
document.body.appendChild(timeLeft);

var WinLose = document.createElement("div");
WinLose.style.position = "absolute";
WinLose.style.width = 100;
WinLose.style.height = 100;
WinLose.style.top = window.innerHeight / 2 + "px";
WinLose.style.left = window.innerWidth / 2 + "px";
WinLose.style.fontSize = 20;
WinLose.style.backgroundColor = "red";
document.body.appendChild(WinLose);

var turnBack = document.createElement("div");
turnBack.style.position = "absolute";
turnBack.style.width = 100;
turnBack.style.height = 100;
turnBack.style.top = 100 + "px";
turnBack.style.left = window.innerWidth / 2 - 50 + "px";
turnBack.style.fontSize = 20;
document.body.appendChild(turnBack);
turnBack.style.color = "red";

var leaderBoard = document.createElement("div");
leaderBoard.style.position = "absolute";
leaderBoard.style.width = 100;
leaderBoard.style.height = 100;
leaderBoard.style.top = 100 + "px";
leaderBoard.style.left = 150 + "px";
leaderBoard.style.fontSize = 20;
document.body.appendChild(leaderBoard);
leaderBoard.style.color = "red";

var lapscompleted = document.createElement("div");
lapscompleted.style.position = "absolute";
lapscompleted.style.width = 100;
lapscompleted.style.height = 100;
lapscompleted.style.top = 70 + "px";
lapscompleted.style.left = 10 + "px";
lapscompleted.style.fontSize = 20;
document.body.appendChild(lapscompleted);
lapscompleted.style.backgroundColor = "white";
lapscompleted.innerHTML = "Laps: " + laps + " / 3";

// call on window resize listener for window resizes
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//set speed factor that can be adjusted to change car characteristics
let factor = 0.00006;

//animate function that runs every frame

loadSound("assets/Sounds/lambo.mp3", 0.5);

function animate(time) { //time is the time since the last frame
  counter++;

  //sets interval that scene is updated and culled
  if (counter % updatespersecond == 0) {
    CullTrees(porsche.position, drawDistance);
    counter = 0;
  }

  //sets a 10 second wait for model loading
  if (time > 15000) {
    //start frame rate counter
    stats.begin();

    //update position of collision box
    cube1BB.copy(cube1.geometry.boundingBox).applyMatrix4(cube1.matrixWorld);

    //if collision is detected
    if (checkCollisions()) {
      loadSound("assets/Sounds/car-crash-sound-eefect.mp3", 0.001);

      //translate car and set speed to zero
      if (speed > 0) {
        porsche.translateZ(-speed / 2);
      } else if (speed < 0) {
        porsche.translateZ(-speed / 2);
      }
      speed = 0;
    }

    if (!win && !lose) {
      if (keys.w || keys.s) {
        //loadSound("assets/Sounds/acceleration.mp3",0.001)
      }
      //if car is accelerating then mimic gearing
      if (keys.w && speed < 70 / 12) {
        if (speed <= 9.2 / 12) {
          speed +=
            (5 * 0.016564) / 12 -
            left * speed * factor -
            right * speed * factor;
        } else if (speed <= 27.77 / 12 && speed > 9.2 / 12) {
          speed +=
            (3.7 * 0.016564) / 12 -
            left * speed * factor -
            right * speed * factor;
        } else if (speed > 27.77 / 12 && speed <= 44.444 / 12) {
          speed +=
            (1.35 * 0.016564) / 12 -
            left * speed * factor -
            right * speed * factor;
        } else if (speed > 44.444 / 12 && speed <= 60.555 / 12) {
          speed +=
            (1.15 * 0.016564) / 12 -
            left * speed * factor -
            right * speed * factor;
        } else if (speed > 60.555 / 12 && speed < 63 / 12) {
          speed +=
            (0.9 * 0.016564) / 12 -
            left * speed * factor -
            right * speed * factor;
        } else if (speed > 63 / 12) {
          var z = getRandomInt(-100, 100);
          speed +=
            (z * 0.05 * 0.016564) / 12 -
            left * speed * factor -
            right * speed * factor;
        }
        if (speed > 64 / 12) {
          speed -= ((Math.random() * 0.016564) / 12) * 0.5;
        }
        if (accelerate < 17) {
          accelerate += 1;
          car.rotateX(-accelerate * 0.00015);
        }
      }

      //else if no key is pressed the car must coast to a stop
      else {
        if (accelerate > 0) {
          accelerate -= 1;
          car.rotateX(accelerate * 0.00015);
        }
        speed -=
          (speed * 0.7 * 0.016564) / 12 -
          left * speed * factor -
          right * speed * factor;
      }

      //braking/reverse
      if (keys.s && speed > 0) {
        if (speed >= 1) {
          speed -= (speed * 3 * 0.016564) / 12;
        }
        if (speed < 1) {
          speed -= 0.01;
        }
        if (speed < 0) {
          speed = 0;
        }
        if (deccelerate < 17) {
          deccelerate += 1;
          car.rotateX(deccelerate * 0.0003);
        }
        if (reverse < 35) {
          reverse += 1;
        }
      } else {
        if (deccelerate > 0) {
          deccelerate -= 1;
          car.rotateX(-deccelerate * 0.0001);
        }
      }

      //reverse
      if (speed == 0 && reverse != 0) {
        reverse -= 1;
      }
      if (keys.s && speed <= 0 && reverse == 0) {
        if (speed > -1 && speed <= 0) {
          speed -= (1 * 0.016564) / 12;
        }
      }

      //logic to select each gear
      if (speed < 0 && !keys.w) {
        gear = "R";
      } else if (
        (speed <= 12 / 12 && gear != 1) ||
        (gear == "R" && speed < 0)
      ) {
        gear = "1";
      } else if (speed <= 27.77 / 12 && speed > 12 / 12 && gear != 2) {
        gear = "2";
      } else if (speed > 27.77 / 12 && speed <= 37.444 / 12 && gear != 3) {
        gear = "3";
      } else if (speed > 37.444 / 12 && speed <= 55.555 / 12 && gear != 4) {
        gear = "4";
      } else if (speed > 55.555 / 12 && gear != 5) {
        gear = "5";
      }

      //rotate wheels at appropriate speed for car
      if (
        FrontRightWheel &&
        FrontLeftWheel &&
        car &&
        RearLeftWheel &&
        RearRightWheel
      ) {
        FrontRightWheel.rotateX(speed * 2);
        FrontLeftWheel.rotateX(-speed * 2);
        RearRightWheel.rotateX(speed * 2);
        RearLeftWheel.rotateX(-speed * 2);
      }

      //translate car at speed
      porsche.translateZ(speed / 4);

      //steer left
      if (keys.a) {
        if (left < 30 && right == 0) {
          FrontLeftGroup.rotateY(0.03);
          FrontRightGroup.rotateY(0.03);
          car.rotateZ(speed * 0.0005);
          left += 1;
        }
        if (speed != 0)
          if (speed < 1) {
            porsche.rotateY(left * 0.001 * speed);
          } else {
            porsche.rotateY(left * 0.001);
          }
      } else if (left > 0 && right == 0) {
        left -= 2;
        FrontLeftGroup.rotateY(-0.06);
        FrontRightGroup.rotateY(-0.06);
        car.rotateZ(-speed * 0.0005);
        if (speed != 0)
          if (speed < 1) {
            porsche.rotateY(left * 0.001 * speed);
          } else {
            porsche.rotateY(left * 0.001);
          }
      }
      if (left < 0) {
        left = 0;
      }

      //steer right
      if (keys.d && !keys.a && left == 0) {
        if (right < 30 && left == 0) {
          //loadSound("assets/Sounds/left_right_screeching.mp3",0.1)
          FrontLeftGroup.rotateY(-0.03);
          FrontRightGroup.rotateY(-0.03);
          car.rotateZ(-speed * 0.0005);
          right += 1;
        }
        if (speed != 0) {
          if (speed < 1) {
            porsche.rotateY(-right * 0.001 * speed);
          } else {
            porsche.rotateY(-right * 0.001);
          }
        }
      } else if (right > 0 && left == 0) {
        right -= 2;
        FrontLeftGroup.rotateY(0.06);
        FrontRightGroup.rotateY(0.06);

        car.rotateZ(speed * 0.001);

        if (speed != 0)
          if (speed < 1) {
            porsche.rotateY(-right * 0.001 * speed);
          } else {
            porsche.rotateY(-right * 0.001);
          }
      }
      if (right < 0) {
        right = 0;
      }
    }

    //undo any body tilt that hasnt been untilted (simulate suspension rightening), center all rotation groups
    if (car) {
      if ((right == 0 && left == 0) || speed == 0) {
        if (car.rotation.z != 0) {
          if (car.rotation.z > 0) {
            car.rotateZ(-0.005);
          } else if (car.rotation.z < 0) {
            car.rotateZ(0.005);
          }
          if (car.rotation.z < 0.01 && car.rotation.z > -0.01) {
            car.rotation.z = 0;
          }
        }
        if (
          ((right == 0 && left == 0 && FrontLeftGroup.rotation.y != 0) ||
            FrontRightGroup.rotation.y != 0) &&
          speed != 0
        ) {
          FrontLeftGroup.rotation.y = 0;
          FrontRightGroup.rotation.y = 0;
        }
      }
      if (accelerate == 0 && deccelerate == 0 && car.rotation.x != 0) {
        if (car.rotation.x > 0) {
          car.rotateX(-0.008);
        } else if (car.rotation.x < 0) {
          car.rotateX(0.008);
        }
        if (car.rotation.x < 0.01 && car.rotation.x > -0.01) {
          car.rotation.x = 0;
        }
      }
    }

    //select camera logic with v, p for showcase purposes
    if (keys.v || keys.p) {
      Vee -= 1;
      if (fpv && Vee == 0 && !keys.p) {
        Playercamera = camera;
        SpeedoMeter.style.color = "black";
        Gears.style.color = "black";
        check.style.color = "black";
        timer.style.color = "black";
        fpv = false;
        Vee = 8;
      } else if (!fpv && Vee == 0 && !keys.p) {
        Playercamera = driverCamera;
        fpv = true;
        SpeedoMeter.style.color = "white";
        Gears.style.color = "white";
        check.style.color = "white";
        timer.style.color = "white";
        Vee = 8;
      } else if (!orbitcam && keys.p && Vee == 0) {
        Playercamera = camera1;
        orbitcam = true;
        Vee = 8;
      } else if (orbitcam && keys.p && Vee == 0) {
        Playercamera = camera;
        orbitcam = false;
        Vee = 8;
      }
      if (Vee < 0) {
        Vee = 0;
      }
    }

    //teleport car back to start if out of bounds
    if (
      porsche.position.z > 250 ||
      porsche.position.z < -250 ||
      porsche.position.x > 550 ||
      porsche.position.x < -450
    ) {
      turnBack.innerHTML = "OUT OF BOUNDS! TURN BACK!";
    } else {
      turnBack.innerHTML = "";
    }
    if (
      porsche.position.z > 400 ||
      porsche.position.z < -400 ||
      porsche.position.x > 700 ||
      porsche.position.x < -600
    ) {
      speed = speed / 2;
      porsche.position.z = 0;
      porsche.position.x = 0;
    }

    // system used to place props and store location or props
    if (keys.space) {
      space += 1;
      if (space == 10) {
        var cubetemp = collisionSphere.clone();
        cubetemp.position.set(porsche.position.x, 0, porsche.position.z);
        collisionVec2.push(cubetemp.position.x);
        collisionVec2.push(cubetemp.position.y);
        collisionVec2.push(cubetemp.position.z);
        scene.add(cubetemp);
        space = 0;
      }
    }

    //show vertices of track and log the position of placed props
    if (keys.t) {
      showVertices();
      console.log(collisionVec2);
    }

    let currentTime = new Date();

    //update ui
    tempDiv.style.backgroundColor = "white";
    tempDiv.innerHTML = "Lap times:    " + "<br>" + makeLeaderBoard();
    SpeedoMeter.innerHTML = parseInt(speed * 54) + " KPH";
    Gears.innerHTML = "Gear: " + gear;
    check.innerHTML = "Checkpoints: " + checkpointcount + "/ 36";
    lapscompleted.innerHTML = "Laps: " + laps + " / 3";

    //if the finish line is crossed log laptime, begin new lap and timer
    if (checkStartFinish()) {
      if (Onlap) {
        if (checkpointcount == 36) {
          laps++;
          laptimes.push(endTime);
          console.log(laptimes);
          console.log(endTime);
          Onlap = true;
          start = new Date();
          startTime = start.getTime();
          if (cpcVec.length == 0) {
            cpcVec = formatVec(checkpointVec);
            checkpointcount = 0;
          }
        }
      } else {
        Onlap = true;
        start = new Date();
        startTime = start.getTime();
      }
    }
    if (Onlap) {
      end = new Date();
      endTime = Math.trunc((end.getTime() - startTime) / 10);
      timer.innerHTML = "Current Lap:" + ToTime(endTime);
      timeLeft.innerHTML =
        "Time Left:" +
        ToTime(
          Math.trunc(
            timetoComplete -
              (currentTime.getTime() - startTimeleft.getTime()) / 10
          )
        );
    }
    if (
      Math.trunc(
        timetoComplete - (currentTime.getTime() - startTimeleft.getTime()) / 10
      ) < 0
    ) {
      timeLeft.innerHTML = "Time Left:" + "00:00:00";
    }
    if (
      Math.trunc(
        timetoComplete - (currentTime.getTime() - startTimeleft.getTime()) / 10
      ) <= 0 &&
      win == false
    ) {
      // Initialize a new OpenGl particle system with given scene and perspective camera
      particles = new MyParticleSystem({
        parent: porsche,
        camera: Playercamera,
      });
      RAF();
      // console.log("Particles", particles.particles);
      WinLose.innerHTML = "YOU LOST! press R to try again!";
      WinLose.style.backgroundColor = "red";
      lose = true;
    } else if (
      laps == 3 &&
      Math.trunc(
        timetoComplete - (currentTime.getTime() - startTimeleft.getTime()) / 10
      ) >= 0 &&
      !lose
    ) {
      WinLose.innerHTML = "YOU WIN! CONGRATS!";
      WinLose.style.backgroundColor = "green";
      win = true;
      timer.innerHTML = "Current Lap:" + "00:00:00";
    }

    if (keys.r) {
      porsche.position.z = 0;
      porsche.position.x = 0;
      // console.log(porsche.particles);
      // porsche.remove(particles);
      speed = 0;
      porsche.rotation.set(0, -Math.PI / 2 + 0.15, 0);
      laps = 0;
      if (difficulty == "hard") {
        timetoComplete = HardtimetoComplete;
      } else if (difficulty == "medium") {
        timetoComplete = MediumtimetoComplete;
      } else if (difficulty == "easy") {
        timetoComplete = EasytimetoComplete;
      } else {
        timetoComplete = 10000000000;
      }
      win = false;
      lose = false;
      laptimes = [];
      cpcVec = formatVec(checkpointVec);
      checkpointcount = 0;
      start = new Date();
      startTime = start.getTime();
      startTimeleft = new Date();
      Onlap = false;
      timeLeft.innerHTML = "";
      currentTime = new Date();
      end = new Date();
      currentTime.innerHTML = "";
      timer.innerHTML = "";
      WinLose.innerHTML = "";
      loadSound("assets/Sounds/lambo.mp3", 0.5);
    }

    if (checkBarrelCollisions()) {
      timetoComplete = timetoComplete - 150;
      console.log(true);
    }

    //animate skybox
    skybox.rotateY(Math.PI / 4000);
    doLap();

    //calculate camera position with smoothing with lerp
    a.lerp(porsche.position, 0.7);
    b.copy(goal.position);
    dir.copy(a).sub(b).normalize();
    const dis = a.distanceTo(b) - coronaSafetyDistance;
    goal.position.addScaledVector(dir, dis);
    goal.position.lerp(temp, 0.04); //accelerate
    temp.setFromMatrixPosition(follow.matrixWorld);
    camera.lookAt(porsche.position);
    renderer.render(scene, Playercamera); // render the scene
  }

  stats.end();
}
window.addEventListener("DOMContentLoaded", () => { //when the page loads
  renderer.setAnimationLoop(animate);
});
