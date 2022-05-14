import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import { Scene } from 'three';

const renderer = new THREE.WebGLRenderer();

renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45, // field of view
    window.innerWidth / window.innerHeight, // aspect ratio
    0.1, // near plane
    1000 // far plane
);

const orbit = new OrbitControls(camera, renderer.domElement); 

const AxesHelper = new THREE.AxesHelper(5); // 10 is the length of the axes
scene.add(AxesHelper); // add the axes to the scene
camera.position.set(-10,30,30); // set the camera position to 5 units from the origin
orbit.update();

const BoxGeometry = new THREE.BoxGeometry(); // create a box
const BoxMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00}); // create a green box
const Box = new THREE.Mesh(BoxGeometry, BoxMaterial); // create a mesh with the geometry and material
Box.scale.set(5, 5, 5); // scale the mesh
scene.add(Box); // add the box to the scene and start the render loop
Box.castShadow = true;
Box.receiveShadow = true;


const planeGeometry = new THREE.PlaneGeometry(30, 30); // create a plane
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide

}); // create a plane with a white color
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    wireframe: false
});

const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);



sphere.position.set(-10, 15, 0);
sphere.castShadow = true;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const spotlight = new THREE.SpotLight(0xffffff, 1);
scene.add(spotlight);
spotlight.position.set(-30, 50, 0);
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
    Box.rotation.x = time/1000;
    Box.rotation.y = time/1000;
    renderer.render(scene, camera); // render the scene
}

renderer.setAnimationLoop(animate);









