import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";

import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";

// Vertex Shader
const _VS = `
uniform float pointMultiplier;

varying vec4 vColour;

attribute float size;
attribute vec3 colour;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  //_____Sets size of point according to transformed position
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;
  
  vColour = vec4(colour,1.0);
}`;

// Fragment shader
const _FS = `
uniform sampler2D diffuseTexture;

varying vec4 vColour;

void main(){
  //_____Samples the texture
  gl_FragColor = texture2D (diffuseTexture, gl_PointCoord) * vColour;

}`;

// Main particle system class
class ParticleSystem {
  constructor(params) {
    // Initializing uniform variables
    const uniforms = {
      diffuseTexture: {
        value: new THREE.TextureLoader().load("./resources/fire.png"),
      },
      pointMultiplier: {
        value:
          window.innerHeight / (2.0 * Math.tan((0.5 * 60.0 * Math.PI) / 180.0)),
      },
    };

    // Creating a texture for particle
    this._material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: _VS,
      fragmentShader: _FS,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });

    // Connect to camera
    this._camera = params.camera;
    this._particles = [];

    // Creating a buffer geometry for this particles system
    this._geometry = new THREE.BufferGeometry();

    // Specify which properties an objeect in this geometry buffer can have. What props are in the shaders
    // Set position attribute for each particle
    this._geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([], 3)
    );
    this._geometry.setAttribute(
      "colour",
      new THREE.Float32BufferAttribute([], 3)
    );

    // Create the points with given material on the given buffer geometry
    this._points = new THREE.Points(this._geometry, this._material);

    // Add the points we created to the given scene
    params.parent.add(this._points);

    this._AddParticles(10);
    this._UpdateGeometry();
  }

  // Function: Add randomized particles to particles list object and randomize their locations
  // Returns a List<Obj<"position:vec3">>
  _AddParticles(numParticles) {
    if (numParticles > 0 && numParticles < 100) {
      for (let i = 0; i < numParticles; i++) {
        this._particles.push({
          position: new THREE.Vector3(
            (Math.random() * 2 - 1) * 1.0,
            (Math.random() * 2 - 1) * 1.0,
            (Math.random() * 2 - 1) * 1.0
          ),
          size: (Math.random() * 0.5 + 0.5) * 4.0,
          colour: new THREE.Color(Math.random(), Math.random(), Math.random()),
        });
      }
    } else {
      console.log("ERROR _AddParticles: Cannot add", numParticles, "particles");
    }
  }

  // Iterate over list of particles and update the buffer geometry object elements with the new particle properties
  _UpdateGeometry() {
    const positions = [];
    const sizes = [];
    const colours = [];
    // Pushing the particles current properties into list to update
    for (let p of this._particles) {
      positions.push(p.position.x, p.position.y, p.position.z);
      colours.push(p.colour.r, p.colour.g, p.colour.b);
      sizes.push(p.size);
    }
    // Using the list to bind the particles updated attributes to the particle system's geometry buffer
    this._geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    this._geometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(sizes, 1)
    );
    this._geometry.setAttribute(
      "colour",
      new THREE.Float32BufferAttribute(colours, 3)
    );

    // Set the relevant attributes to update their values
    this._geometry.attributes.position.needsUpdate = true;
    this._geometry.attributes.size.needsUpdate = true;
    this._geometry.attributes.colour.needsUpdate = true;
  }

  // Update the particles a properties according to the new time stamp data
  _UpdateParticles(timeElapsed) {
    //Sorting particles to be rendered according to their distance
    this._particles.sort((particle_a, particle_b) => {
      // Sort to render particles in order of their distance from the perspective camera
      const distance_1 = this._camera.position.distanceTo(particle_a.position);
      const distance_2 = this._camera.position.distanceTo(particle_b.position);

      if (distance_1 > distance_2) {
        return -1;
      }
      if (distance_2 > distance_1) {
        return 1;
      }
      return 0;
    });
  }

  // Take a step forward in time. Advance the animations
  Step(timeElapsed) {
    this._AddParticles(1);
    this._UpdateParticles(timeElapsed);
    this._UpdateGeometry();
  }
}

// ________________________________________________________________________________________________________________________________________
// A development environment to preview the changes made
class ParticleSystemDemo {
  constructor() {
    this._Initialize();
  }

  // Initialize a demo
  _Initialize() {
    // Initialize a three js web gl renderer with antialiasing
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });

    // Set the renderer to Responsive properties
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this._threejs.domElement);

    window.addEventListener(
      // Listen for resizing event
      "resize",
      () => {
        // Run function that reacts to the resizing
        this._OnWindowResize();
      },
      false
    );

    // Set Perspective camera parameters
    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;

    // Initializes perspective camera and set's it's initialize position
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(25, 10, 0);

    // Init new scene graph to add objects to
    this._scene = new THREE.Scene();

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
    this._scene.add(light);

    // Declare basic ambient light and add it to the scene
    light = new THREE.AmbientLight(0x101010);
    this._scene.add(light);

    //Initialize new orbit controls, set to perspective camera
    const controls = new OrbitControls(this._camera, this._threejs.domElement);
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
    this._scene.background = background_texture;

    // Initialize a new OpenGl particle system with given scene and perspective camera
    this._particles = new ParticleSystem({
      parent: this._scene,
      camera: this._camera,
    });

    this._LoadModel();

    // Set initial animation frame to null and start requesting loop
    this._previousRAF = null;
    this._RAF();
  }

  // Class created to load the 3D model in
  _LoadModel() {
    // Declare new loader and load in object at given file location to given scene
    const loader = new GLTFLoader();
    loader.load("./resources/rocket/Rocket_Ship_01.gltf", (gltf) => {
      gltf.scene.traverse((c) => {
        c.castShadow = true;
      });
      this._scene.add(gltf.scene);
    });
  }

  // Resize camera aspect ratio, update the projection matrix and set size of the threejs renderer window
  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  // Function to Request an Animation Frame (RAF)
  _RAF() {
    requestAnimationFrame((t) => {
      // If this is the first animation frame, then set the previous animation frame to the current frame t
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }
      this._RAF();
      // Render next frame
      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  //Process a moving to the next animation frame
  _Step(timeElapsed) {
    const timeElapsedNew = timeElapsed * 0.001;

    this._particles.Step(timeElapsedNew);
  }
}

// Initialize  a demo to view the class in action.
let _APP = null;

window.addEventListener("DOMContentLoaded", () => {
  _APP = new ParticleSystemDemo();
});
