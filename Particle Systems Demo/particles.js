import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";

import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";

// Vertex Shader
const _VS = `
uniform float pointMultiplier;

attribute float size;
attribute float angle;
attribute vec4 colour;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  //_____Sets size of point according to transformed position
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;
  
  vAngle = vec2(cos(angle), sin(angle));
  vColour = colour;
}`;

// Fragment shader
const _FS = `

uniform sampler2D diffuseTexture;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  //_____Samples the texture
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
}`;

export class LinearSpline {
  constructor(lerp) {
    this._points = [];
    this._lerp = lerp;
  }

  AddPoint(t, d) {
    this._points.push([t, d]);
  }

  Get(t) {
    let p1 = 0;

    for (let i = 0; i < this._points.length; i++) {
      if (this._points[i][0] >= t) {
        break;
      }
      p1 = i;
    }

    const p2 = Math.min(this._points.length - 1, p1 + 1);

    if (p1 == p2) {
      return this._points[p1][1];
    }

    return this._lerp(
      (t - this._points[p1][0]) / (this._points[p2][0] - this._points[p1][0]),
      this._points[p1][1],
      this._points[p2][1]
    );
  }
}

// Main particle system class
export class MyParticleSystem {
  constructor(params) {
    console.log("Entered ParticleSystem.constructor()");
    // Check params in object given,
    // Set unspecified params to default values
    /* #region Set Defaults */
    this._texture = "./resources/fire.png"; // set default to params.texture
    this._birthrate = 75.0; // Set default to params.birthrate
    this._life = (Math.random() * 0.75 + 0.25) * 6.0; // set default to params.life
    this._speed = -15; // Set default to params.speed
    this._maxsize = 4.0; // Set default to params.maxsize
    if ("texture" in params) {
      this._texture = params.texture;
    }
    if ("birthrate" in params) {
      this._birthrate = params.birthrate;
    }
    if ("life" in params) {
      this._life = params.life;
    }
    if ("speed" in params) {
      this._speed = params.speed;
    }
    if ("maxsize" in params) {
      this._maxsize = params.maxsize;
    }
    /* #endregion */

    // Initializing uniform variables
    const uniforms = {
      diffuseTexture: {
        value: new THREE.TextureLoader().load(this._texture),
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
    // console.log("Camera assigned", this._camera);

    // Creating a buffer geometry for this particles system
    this._geometry = new THREE.BufferGeometry();

    // Specify which properties an object in this geometry buffer can have. What props are in the shaders
    // Set position attribute for each particle
    this._geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([], 3)
    );
    this._geometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute([], 1)
    );
    this._geometry.setAttribute(
      "colour",
      new THREE.Float32BufferAttribute([], 4)
    );
    this._geometry.setAttribute(
      "angle",
      new THREE.Float32BufferAttribute([], 1)
    );

    // Create the points with given material on the given buffer geometry
    this._points = new THREE.Points(this._geometry, this._material);

    // Add the points we created to the given scene
    params.parent.add(this._points);

    /* #region Spline stuff */
    // New Software Design principle. A Spline returns progress as a float between 0 and 1
    // 'a' represents the start, 'b' represetns the finish, 't' represents time lapsed
    this._alphaSpline = new LinearSpline((t, a, b) => {
      return a + t * (b - a);
    });
    this._alphaSpline.AddPoint(0.0, 0.0);
    this._alphaSpline.AddPoint(0.1, 1.0);
    this._alphaSpline.AddPoint(0.6, 1.0);
    this._alphaSpline.AddPoint(1.0, 0.0);

    this._colourSpline = new LinearSpline((t, a, b) => {
      const c = a.clone();
      return c.lerp(b, t);
    });
    this._colourSpline.AddPoint(0.0, new THREE.Color(0xffff80));
    this._colourSpline.AddPoint(1.0, new THREE.Color(0xff8080));

    this._sizeSpline = new LinearSpline((t, a, b) => {
      return a + t * (b - a);
    });
    this._sizeSpline.AddPoint(0.0, 1.0);
    this._sizeSpline.AddPoint(0.5, 5.0);
    this._sizeSpline.AddPoint(1.0, 1.0);

    /* #endregion */

    setInterval(this._AddParticles(), 1000);

    this._UpdateGeometry();
  }

  // Function: Add randomized particles to particles list object and randomize their locations
  // Returns a List<Obj<"position:vec3">>
  _AddParticles(timeElapsed) {
    console.log("Entered _AddParticles");
    if (!this.gdfsghk) {
      this.gdfsghk = 0.0;
    }
    this.gdfsghk += timeElapsed;
    const n = Math.floor(this.gdfsghk * this._birthrate); // Set default 'params.birthrate'
    this.gdfsghk -= n / 75.0;

    // Iterates and set's each particle's properties
    for (let i = 0; i < n; i++) {
      this._particles.push({
        position: new THREE.Vector3(
          (Math.random() * 2 - 1) * 1.0,
          (Math.random() * 2 - 1) * 1.0,
          (Math.random() * 2 - 1) * 1.0
        ),
        size: (Math.random() * 0.5 + 0.5) * this._maxsize, // set default
        colour: new THREE.Color(
          Math.random() * 0.4 + 0.7,
          Math.random() * 0.3 + 0.3,
          Math.random() * 0.2 + 0.05
        ),
        alpha: 1.0,
        life: this._life,
        maxLife: this._life,
        rotation: Math.random() * 2.0 * Math.PI,
        velocity: new THREE.Vector3(0, this._speed, 0), // set default params.speed
      });
    }
  }

  // Iterate over list of particles and update the buffer geometry object elements with the new particle properties
  _UpdateGeometry() {
    console.log("Entered UpdateGeometry()");
    const positions = [];
    const sizes = [];
    const colours = [];
    const angles = [];

    // Fetching the particles lists current properties into list to update
    for (let p of this._particles) {
      positions.push(p.position.x, p.position.y, p.position.z);
      colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
      sizes.push(p.currentSize);
      angles.push(p.rotation);
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
      new THREE.Float32BufferAttribute(colours, 4)
    );
    this._geometry.setAttribute(
      "angle",
      new THREE.Float32BufferAttribute(angles, 1)
    );

    // Set the relevant attributes to update their values
    this._geometry.attributes.position.needsUpdate = true;
    this._geometry.attributes.size.needsUpdate = true;
    this._geometry.attributes.colour.needsUpdate = true;
    this._geometry.attributes.angle.needsUpdate = true;
  }

  // Update the particles a properties according to the new time stamp data
  _UpdateParticles(timeElapsed) {
    console.log("Entered UpdateParticles function");
    // Decrease the particles life value each frame
    for (let p of this._particles) {
      p.life -= timeElapsed;
    }

    // Filter only particles that have positive life value.
    this._particles = this._particles.filter((p) => {
      return p.life > 0.0;
    });

    //Iterate through each particle and update what's necessary
    for (let p of this._particles) {
      // 't' is a percentage which tracks 'life' left used out of 5.0
      const t = 1.0 - p.life / p.maxLife;

      // Rotate particle over time
      p.rotation += timeElapsed * 0.5;

      // Find splines for each process.
      p.alpha = this._alphaSpline.Get(t);
      p.currentSize = p.size * this._sizeSpline.Get(t);
      p.colour.copy(this._colourSpline.Get(t));

      // Added drag calculations to simulate physics
      p.position.add(p.velocity.clone().multiplyScalar(timeElapsed));

      const drag = p.velocity.clone();
      drag.multiplyScalar(timeElapsed * 0.1);
      drag.x =
        Math.sign(p.velocity.x) *
        Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
      drag.y =
        Math.sign(p.velocity.y) *
        Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
      drag.z =
        Math.sign(p.velocity.z) *
        Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
      p.velocity.sub(drag);
    }

    // Sort to render particles in order of their distance from the perspective camera
    this._particles.sort((a, b) => {
      const d1 = this._camera.position.distanceTo(a.position);
      const d2 = this._camera.position.distanceTo(b.position);

      if (d1 > d2) {
        return -1;
      }

      if (d1 < d2) {
        return 1;
      }

      return 0;
    });
  }

  // Take a step forward in time. Advance the animations
  Step(timeElapsed) {
    console.log("Entered MyParticleSystem.Step()");
    this._AddParticles(timeElapsed);
    this._UpdateParticles(timeElapsed);
    this._UpdateGeometry();
  }
}

// ________________________________________________________________________________________________________________________________________
// A development environment to preview the changes made
class ParticleSystemDemo {
  constructor() {
    console.log("Entered ParticleSystemDEMO.constructor()");
    this._Initialize();
  }

  // Initialize a demo
  _Initialize() {
    console.log("Entered ParticleSystemDEMO.Initialize()");
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
    this._particles = new MyParticleSystem({
      parent: this._scene,
      camera: this._camera,
    });

    //this._LoadModel();

    // Set initial animation frame to null and start requesting loop
    this._previousRAF = null;
    this._RAF();
  }

  // Class created to load the 3D model in
  _LoadModel() {
    console.log("LoadModel()");
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
    console.log("Entered Onwhindowresize");
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  // Function to Request an Animation Frame (RAF)
  _RAF() {
    console.log("Entered RAF()");
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
    console.log("ENtered Step() ParticleSystemDEMO.Step()");
    const timeElapsedNew = timeElapsed * 0.001;

    this._particles.Step(timeElapsedNew);
  }
}

// Initialize  a demo to view the class in action.
let _APP = null;

window.addEventListener("DOMContentLoaded", () => {
  _APP = new ParticleSystemDemo();
});
