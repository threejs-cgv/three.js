import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";

import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";

/*
  Entered RAF() particles.js:461:13
  ENtered Step() ParticleSystemDEMO.Step() particles.js:477:13

  Entered MyParticleSystem.Step() particles.js:330:13
  Entered _AddParticles particles.js:196:13
  Entered UpdateParticles function particles.js:270:13
  Entered UpdateGeometry() */

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
    // console.log("Entered ParticleSystem.constructor()");
    // Check params in object given,
    // Set unspecified params to default values
    /* #region Set Defaults */
    this._texture = "./resources/fire.png"; // set default to params.texture
    this._birthrate = 75.0; // Set default to params.birthrate
    this._life = (Math.random() * 0.75 + 0.25) * 2.0; // set default to params.life
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

    // Connect to camera and scene
    this._camera = params.camera;
    this._scene = params.parent;
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
    this._scene.add(this._points);
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
    // console.log("Entered _AddParticles()");
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
  _UpdateGeometry(toRender) {
    // console.log("Entered UpdateGeometry()");
    const positions = [];
    const sizes = [];
    const colours = [];
    const angles = [];
    if (toRender == true) {
      // Fetching the particles lists current properties into list to update
      for (let p of this._particles) {
        positions.push(p.position.x, p.position.y, p.position.z);
        colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
        sizes.push(p.currentSize);
        angles.push(p.rotation);
      }
    } else {
      for (let p of this._particles) {
        // Fetching the particles lists current properties into list to update
        for (let p of this._particles) {
          positions.push(p.position.x, p.position.y, p.position.z);
          colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
          sizes.push(p.currentSize);
          angles.push(p.rotation);
        }
      }
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
    // console.log("Entered UpdateParticles function");
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
    // console.log("Entered MyParticleSystem.Step()");
    this._AddParticles(timeElapsed);
    this._UpdateParticles(timeElapsed);
    this._UpdateGeometry(true);
  }

  Stop() {
    for (var i = this._scene.children.length - 1; i >= 0; i--) {
      var obj = this._scene.children[i];
      console.log(obj);
      this._scene.remove(obj);
    }
  }
}
