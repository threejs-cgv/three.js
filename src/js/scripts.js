import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import{GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import{RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';
import * as dat from 'dat.gui';
import { Scene } from 'three';
import { REVISION } from 'three';
import Stats from 'stats.js'

var goal, keys, follow;

var temp = new THREE.Vector3;
var dir = new THREE.Vector3;
var a = new THREE.Vector3;
var b = new THREE.Vector3;
var coronaSafetyDistance = 2;
var velocity = 0.0;
var speed = 0.0;

let accelerate=0;
let left=0;
let right=0;
let deccelerate=0;


const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
const renderer = new THREE.WebGLRenderer({
  antialias: true
});


const textureLoader=new THREE.TextureLoader();
const grassBaseColor=textureLoader.load('./assets/GrassTexture/Grass_001_COLOR.jpg');
const grassNormal=textureLoader.load('./assets/GrassTexture/Grass_001_NORM.jpg');
const grassHeight=textureLoader.load('./assets/GrassTexture/Grass_001_DISP.png');
const grassRoughness=textureLoader.load('./assets/GrassTexture/Stylized_Grass_001_roughness.jpg');
const grassAmbientOcclusioMap=textureLoader.load('./assets/GrassTexture/Grass_001_OCC.jpg');
const grassMaterial=textureLoader.load('./assets/GrassTexture/Material_1597.jpg');


renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 30000 );
    camera.position.set( 0, 1.5, 0 );
    
    scene = new THREE.Scene();
camera.lookAt( 0,0,0 );

const planeGeometry = new THREE.PlaneGeometry(100, 100,1,1); // create a plane
const planeMaterial = new THREE.MeshStandardMaterial({
    map:grassBaseColor,

});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.geometry.attributes.uv2=plane.geometry.attributes.uv;

scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;
renderer.outputEncoding=THREE.sRGBEncoding;



const porsche=new THREE.Group();
const FrontLeftGroup= new THREE.Group();
const FrontRightGroup= new THREE.Group();
const rgbeLoader= new RGBELoader();
let FrontRightWheel
let FrontLeftWheel
let RearLeftWheel
let RearRightWheel
let car
rgbeLoader.load('./assets/MR_INT-005_WhiteNeons_NAD.hdr',function(texture){
    texture.mapping=THREE.EquirectangularReflectionMapping;
    scene.environment=texture;
    const loader=new GLTFLoader();
    loader.load('./assets/porschecar/wheel.gltf',function(gltf){
    const FrontRightmodel=gltf.scene;
    FrontRightWheel=FrontRightmodel
    FrontRightWheel.position.y+=0.35;
    FrontRightGroup.add(FrontRightWheel)
    porsche.add(FrontRightGroup);
  });
  loader.load('./assets/porschecar/wheel.gltf',function(gltf){
    const FrontLeftmodel=gltf.scene;
    FrontLeftWheel=FrontLeftmodel
    FrontLeftWheel.rotation.y=Math.PI
    
    FrontLeftWheel.position.y+=0.35;
    FrontLeftGroup.add(FrontLeftWheel);
    porsche.add(FrontLeftGroup);
  });
  loader.load('./assets/porschecar/wheel.gltf',function(gltf){
    const RearRightmodel=gltf.scene;
    RearRightWheel=RearRightmodel
    RearRightWheel.position.z-=1;
    RearRightWheel.position.x-=0.93;
    RearRightWheel.position.y+=0.35;
    porsche.add(RearRightWheel);
  });
  loader.load('./assets/porschecar/wheel.gltf',function(gltf){
    const RearLeftmodel=gltf.scene;
    RearLeftWheel=RearLeftmodel
    RearLeftWheel.rotation.y=Math.PI
    RearLeftWheel.position.z-=1;
    RearLeftWheel.position.x+=0.93;
    RearLeftWheel.position.y+=0.35;
    porsche.add(RearLeftWheel);
  });
  loader.load('./assets/porschecar/car.gltf',function(gltf){
    const model=gltf.scene;
    car=model
    porsche.add(car);
  });
});

  
FrontRightGroup.position.z+=1.65;
FrontRightGroup.position.x-=0.91;
FrontLeftGroup.position.z+=1.65;
FrontLeftGroup.position.x+=0.91;
goal = new THREE.Object3D;
follow = new THREE.Object3D;
follow.position.z = -coronaSafetyDistance;
porsche.add( follow );
goal.translateZ(-10);
goal.add( camera );
scene.add( porsche );
porsche.scale.set(0.5,0.5,0.5)
var gridHelper = new THREE.GridHelper( 40, 40 );
scene.add( gridHelper );

scene.add( new THREE.AxesHelper() );



keys = {
  a: false,
  s: false,
  d: false,
  w: false
};

document.body.addEventListener( 'keydown', function(e) {
  
  const key = e.code.replace('Key', '').toLowerCase();
  if ( keys[ key ] !== undefined )
    keys[ key ] = true;
  
});
document.body.addEventListener( 'keyup', function(e) {
  
  const key = e.code.replace('Key', '').toLowerCase();
  if ( keys[ key ] !== undefined )
    keys[ key ] = false;
  
});

function createStats() {
  var stats = new Stats();
  stats.setMode(0);

  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0';
  stats.domElement.style.top = '0';

  return stats;
}

renderer.render(scene, camera);



function animate(time) {
  stats.begin()
  
  if ( keys.w && speed<70/6){
    if(speed<=27.77/6){
      speed+=5.34*0.016564/6
    }
    else if(speed>27.77/6 && speed<=44.444/6){
      speed+=2.525*0.016564/6
    }
    else if(speed>44.444/6 && speed<=55.555/6){
      speed+=1.4*0.016564/6
    }
    else if(speed>55.555/4){
      speed+=0.9*0.016564/6
    }
    accelerate+=1;
  }
  else{
    if(accelerate>0){
      accelerate-=1;
    }
    speed-=speed*3*0.016564/6;
  }
  if ( keys.s )
  if(speed>=0.05){
    speed -=speed*8*0.016564/6;
  }
  if(speed<0.05){
     speed-=0.005;
  }
  if(speed<0){
    speed=0
  }


  //rotate wheels at appropriate speed for car
  if(FrontRightWheel && FrontLeftWheel && car && RearLeftWheel && RearRightWheel){
    FrontRightWheel.rotateX(speed*2)
    FrontLeftWheel.rotateX(-speed*2)
    RearRightWheel.rotateX(speed*2)
    RearLeftWheel.rotateX(-speed*2)

  }


  porsche.translateZ( speed/4 );

  if ( keys.a ){
    if(left<25){
      FrontLeftGroup.rotateY(0.03)
      FrontRightGroup.rotateY(0.03)
      car.rotateZ(speed*0.0005)
      left+=1
    }
    if(speed!=0)
    porsche.rotateY(left*0.002)
  }
  else if(left>0){
    left-=2
    FrontLeftGroup.rotateY(-0.06)
    FrontRightGroup.rotateY(-0.06)
    car.rotateZ(-speed*0.001)
    if(speed!=0)
      porsche.rotateY(left*0.002)
  }
  if(left<0){
    left=0
  }
  if ( keys.d && !keys.a && left==0){
    if(right<25){
      FrontLeftGroup.rotateY(-0.03)
      FrontRightGroup.rotateY(-0.03)
      car.rotateZ(-speed*0.0005)
      right+=1
    }
    if(speed!=0)
      porsche.rotateY(-right*0.002)
  }
  else if(right>0){
    right-=2
    FrontLeftGroup.rotateY(0.06)
    FrontRightGroup.rotateY(0.06)
    car.rotateZ(speed*0.001)

    if(speed!=0)
      porsche.rotateY(-right*0.002)
  }
  if(right<0){
    right=0
  }
 

  //undo any body tilt that hasnt been untilted (simulate suspension rightening)
  if(car){
    if((right==0 && left==0) || speed==0){
      if(car.rotation.z!=0){
        if(car.rotation.z>0){
          car.rotateZ(-0.005)
        }
        else if(car.rotation.z<0){
            car.rotateZ(0.005)
        }
      }
    }
    
  }
  
  var SpeedoMeter = document.createElement('div');
SpeedoMeter.style.position = 'absolute';
//SpeedoMeter.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
SpeedoMeter.style.width = 100;
SpeedoMeter.style.height = 100;
SpeedoMeter.style.backgroundColor = "white";
SpeedoMeter.innerHTML = speed;
SpeedoMeter.style.bottom= 100 + 'px';
SpeedoMeter.style.left = 10 + 'px';
SpeedoMeter.style.fontSize=20
document.body.appendChild(SpeedoMeter);



  //console.log(speed*3.6)



    a.lerp(porsche.position,1);
    b.copy(goal.position);
    dir.copy( a ).sub( b ).normalize();
    const dis = a.distanceTo( b ) - coronaSafetyDistance;
    goal.position.addScaledVector( dir, dis );
    goal.position.lerp(temp, 0.04); //accelerate
    temp.setFromMatrixPosition(follow.matrixWorld);
    camera.lookAt( porsche.position );
    renderer.render( scene, camera );
  renderer.render(scene, camera); // render the scene
  stats.end();
}
window.addEventListener('DOMContentLoaded', () => {
  renderer.setAnimationLoop(animate);
});


