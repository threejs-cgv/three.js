import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import{GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import{RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';
import * as dat from 'dat.gui';
import { Scene } from 'three';
import { REVISION } from 'three';

const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  90, // field of view
  window.innerWidth / window.innerHeight, // aspect ratio
  0.1, // near plane
  100000 // far plane
);

const orbit = new OrbitControls(camera, renderer.domElement); 


camera.position.set(-10,30,30); // set the camera position to 5 units from the origin
orbit.update();


var xmove=0;
var carrotate=0;
var accelerate=false;
var deccelerate=false;
const BoxGeometry = new THREE.BoxGeometry(); // create a box
const BoxMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00}); // create a green box
const Box = new THREE.Mesh(BoxGeometry, BoxMaterial); // create a mesh with the geometry and material
Box.scale.set(5, 5, 5); // scale the mesh
scene.add(Box); // add the box to the scene and start the render loop
Box.castShadow = true;
Box.receiveShadow = true;
Box.translateX(10)
Box.translateY(10)

const planeGeometry = new THREE.PlaneGeometry(10000, 10000); // create a plane
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide

}); // create a plane with a white color
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=4;


const rgbeLoader= new RGBELoader();
let car
rgbeLoader.load('./assets/MR_INT-005_WhiteNeons_NAD.hdr',function(texture){
    texture.mapping=THREE.EquirectangularReflectionMapping;
    scene.environment=texture;
    const loader=new GLTFLoader();
    loader.load('./assets/scene.gltf',function(gltf){
    const model=gltf.scene;
    scene.add(model)
    car=model
  });
});


  

const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    wireframe: false
});
function createWheels() {
    const geometry = new THREE.BoxBufferGeometry(12, 12, 10);
    const material = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const wheel = new THREE.Mesh(geometry, material);
    return wheel;
  }
  function getCarFrontTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 32;
    const context = canvas.getContext("2d");
  
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 64, 32);
  
    context.fillStyle = "#666666";
    context.fillRect(8, 8, 48, 24);
  
    return new THREE.CanvasTexture(canvas);
  }
  function getCarSideTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 32;
    const context = canvas.getContext("2d");
  
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 128, 32);
  
    context.fillStyle = "#666666";
    context.fillRect(10, 8, 38, 24);
    context.fillRect(58, 8, 60, 24);
  
    return new THREE.CanvasTexture(canvas);
  }

  function createCar() {
    const car = new THREE.Group();
  
    var backWheel = createWheels();
    backWheel.position.y = 6;
    backWheel.position.x = -18;
    backWheel.position.z = -12;
    car.add(backWheel);

    backWheel = createWheels();
    backWheel.position.y = 6;
    backWheel.position.x = -18;
    backWheel.position.z = 12;
    car.add(backWheel);
  
    var frontWheel = createWheels();
    frontWheel.position.y = 6;
    frontWheel.position.x = 18;
    frontWheel.position.z = -12;
    car.add(frontWheel);

    frontWheel = createWheels();
    frontWheel.position.y = 6;
    frontWheel.position.x = 18;
    frontWheel.position.z = 12;

    car.add(frontWheel);
  
    const main = new THREE.Mesh(
      new THREE.BoxBufferGeometry(60, 15, 30),
      new THREE.MeshLambertMaterial({ color: 0xa52523 })
    );

    window.addEventListener("keydown", function (event) {
        if (event.key == "ArrowUp") {
          xmove=1.5;
          return;
        }
        if (event.key == "ArrowDown") {
         xmove=-1;
          return;
        }
        if (event.key == "ArrowLeft") {
            carrotate=0.02;
            return;
          }
          if ((event.key == "ArrowRight")) {
            carrotate=-0.02;
            return;
          }

      });
    window.addEventListener("keyup", function (event) {
        if (event.key == "ArrowUp") {
          xmove=0;
          return;
        }
        if (event.key == "ArrowDown") {
            xmove=0;
          return;
        }

        if (event.key == "ArrowLeft") {
            carrotate=0;
            return;
          }
          if (event.key == "ArrowRight") {
            carrotate=0;
            return;
          }
      });

    if(accelerate){
        const xmove=10;
    };


    main.position.y = 12;
    car.add(main);
    
    const carFrontTexture = getCarFrontTexture();
  
    const carBackTexture = getCarFrontTexture();
  
    const carRightSideTexture = getCarSideTexture();
  
    const carLeftSideTexture = getCarSideTexture();
    carLeftSideTexture.center = new THREE.Vector2(0.5, 0.5);
    carLeftSideTexture.rotation = Math.PI;
    carLeftSideTexture.flipY = false;
  
    const cabin = new THREE.Mesh(new THREE.BoxBufferGeometry(33, 12, 24), [
      new THREE.MeshLambertMaterial({ map: carFrontTexture }),
      new THREE.MeshLambertMaterial({ map: carBackTexture }),
      new THREE.MeshLambertMaterial({ color: 0xffffff }), // top
      new THREE.MeshLambertMaterial({ color: 0xffffff }), // bottom
      new THREE.MeshLambertMaterial({ map: carRightSideTexture }),
      new THREE.MeshLambertMaterial({ map: carLeftSideTexture }),
    ]);
    cabin.position.x = -6;
    cabin.position.y = 25.5;
    car.add(cabin);
  
    return car;
  }
  
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);


renderer.render(scene, camera);

sphere.position.set(-10, 15, 0);
sphere.castShadow = true;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const spotlight = new THREE.SpotLight(0xffffff, 0.1);
scene.add(spotlight);
spotlight.position.set(0,100, 0);
spotlight.castShadow = true;
spotlight.angle = 0.5;
const spotLightHelper = new THREE.SpotLightHelper(spotlight);
scene.add(spotLightHelper);



// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// scene.add(directionalLight);
// directionalLight.position.set(-30, 50, 0);
// directionalLight.castShadow = true;
// directionalLight.shadow.camera.bottom = -12; 


// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(directionalLightHelper);

// const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dLightShadowHelper);

const gui = new dat.GUI();

const options = {
    sphereColor: '#ffff00',
    sphereWireframe: false
    
};

gui.addColor(options, 'sphereColor').onChange(function(e){
    sphereMaterial.color.set(e);
});

gui.add(options, 'sphereWireframe').onChange(function(e){
    sphereMaterial.wireframe = e;
});
 


function animate(time) {
  if(car){
    car.position.z=car.position.z+0.01;
  }

    Box.rotation.x = time/1000;
    Box.rotation.y = time/1000;
    renderer.render(scene, camera); // render the scene
    
}

renderer.setAnimationLoop(animate);

class ThirdPersonCamera{
  constructor(params){
    this._params=params;
    this._camera=params.camera;
  }
}