import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";

import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";
import { MyParticleSystem, LinearSpline } from "./particles.js";

// A development environment to preview the changes made
function LoadModel() {
  console.log("LoadModel()");
  // Declare new loader and load in object at given file location to given scene
  const loader = new GLTFLoader();
  loader.load("./resources/rocket/Rocket_Ship_01.gltf", (gltf) => {
    gltf.scene.traverse((c) => {
      c.castShadow = true;
    });
    scene.add(gltf.scene);
  });
}

// Resize camera aspect ratio, update the projection matrix and set size of the threejs renderer window
function OnWindowResize() {
  console.log("Entered Onwhindowresize");
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  threejs.setSize(window.innerWidth, window.innerHeight);
}

// Function to Request an Animation Frame (RAF)
function RAF() {
  console.log("Entered RAF()");
  requestAnimationFrame((t) => {
    // If this is the first animation frame, then set the previous animation frame to the current frame t
    if (previousRAF === null) {
      previousRAF = t;
    }
    RAF();
    // Render next frame
    threejs.render(scene, camera);
    Step(t - previousRAF);
    previousRAF = t;
  });
}

//Process a moving to the next animation frame
function Step(timeElapsed) {
  console.log("ENtered Step() ParticleSystemDEMO.Step()");
  const timeElapsedNew = timeElapsed * 0.001;

  particles.Step(timeElapsedNew);
}
window.addEventListener("DOMContentLoaded", () => {
  // APP = new ParticleSystemDemo();
  console.log("Entered ParticleSystemDEMO.Initialize()");
  // Initialize a three js web gl renderer with antialiasing
  threejs = new THREE.WebGLRenderer({
    antialias: true,
  });

  // Set the renderer to Responsive properties
  threejs.shadowMap.enabled = true;
  threejs.shadowMap.type = THREE.PCFSoftShadowMap;
  threejs.setPixelRatio(window.devicePixelRatio);
  threejs.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(threejs.domElement);

  window.addEventListener(
    // Listen for resizing event
    "resize",
    () => {
      // Run function that reacts to the resizing
      OnWindowResize();
    },
    false
  );

  // Set Perspective camera parameters
  const fov = 60;
  const aspect = 1920 / 1080;
  const near = 1.0;
  const far = 1000.0;

  // Initializes perspective camera and set's it's initialize position
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(25, 10, 0);

  // Init new scene graph to add objects to
  scene = new THREE.Scene();

  //Declare new directional light  and set it's properties
  let light = new THREE.DirectionalLight(0xffffff, 1.0);
  light.position.set(20, 100, 10);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  light.shadow.bias = -0.001;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 500.0;
  light.shadow.camera.left = 100;
  light.shadow.camera.right = -100;
  light.shadow.camera.top = 100;
  light.shadow.camera.bottom = -100;

  // Add directional light to scene
  scene.add(light);

  // Declare basic ambient light and add it to the scene
  light = new THREE.AmbientLight(0x101010);
  scene.add(light);

  //Initialize new orbit controls, set to perspective camera
  const controls = new OrbitControls(camera, threejs.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  // Declare cube map texture, init textures for 6 sides
  const loader = new THREE.CubeTextureLoader();
  const background_texture = loader.load([
    "./resources/px.png",
    "./resources/nx.png",
    "./resources/py.png",
    "./resources/ny.png",
    "./resources/pz.png",
    "./resources/nz.png",
  ]);

  // Add cubemap texture as scene graph background
  scene.background = background_texture;

  // Initialize a new OpenGl particle system with given scene and perspective camera
  particles = new MyParticleSystem({
    parent: scene,
    camera: camera,
  });

  //LoadModel();

  // Set initial animation frame to null and start requesting loop
  previousRAF = null;
  RAF();
});
