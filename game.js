import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import{GLTFLoader} from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js";
import{RGBELoader} from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/RGBELoader.js";


var goal, keys, follow;

var temp = new THREE.Vector3;
var dir = new THREE.Vector3;
var a = new THREE.Vector3;
var b = new THREE.Vector3;
var coronaSafetyDistance = 2.6;
var velocity = 0.0;
var speed = 0.0;

let accelerate=0;
let left=0;
let right=0;
let deccelerate=0;
let gearchange=0;
let gear='0';
let carXrotation=0;
let reverse=0;
let laptime=0;

const renderer = new THREE.WebGLRenderer({
  antialias: true
});


const textureLoader=new THREE.TextureLoader();
const grassBaseColor=textureLoader.load('./assets/Dirt/Ground_Dirt_008_baseColor.jpg');
const grassNormal=textureLoader.load('./assets/Dirt/Ground_Dirt_008_normal.jpg');
const grassHeight=textureLoader.load('./assets/Dirt/Ground_Dirt_008_height.png');
const grassRoughness=textureLoader.load('./assets/Dirt/Ground_Dirt_008_roughness.jpg');
const grassAmbientOcclusioMap=textureLoader.load('./assets/Dirt/Ground_Dirt_008_ambientOcclusion.jpg');



renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 30000 );
    camera.position.set( 0, 1.2, 0 );
    const scene = new THREE.Scene();
camera.lookAt( 0,0,0 );



const light = new THREE.AmbientLight( 0x7f7f7f ); // soft white light
scene.add( light );

grassBaseColor.wrapS = THREE.RepeatWrapping;
grassBaseColor.wrapT = THREE.RepeatWrapping;
grassBaseColor.repeat.set( 7000, 7000 );

const planeGeometry = new THREE.PlaneGeometry(10000, 10000,1,1); // create a plane
const planeMaterial = new THREE.MeshStandardMaterial({
    map:grassBaseColor,
    normalMap:grassNormal,
    displacementMap: grassHeight,
    displacementScale:0.05,
    roughnessMap:grassRoughness,
    roughness:1,
    aoMap:grassAmbientOcclusioMap,


});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
//plane.geometry.attributes.uv2=plane.geometry.attributes.uv;

scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;
renderer.outputEncoding=THREE.sRGBEncoding;

let materialArray=[];

let texture_ft= new THREE.TextureLoader().load('./assets/Skybox/yonder_ft.jpg');
let texture_bk= new THREE.TextureLoader().load('./assets/Skybox/yonder_bk.jpg');
let texture_up= new THREE.TextureLoader().load('./assets/Skybox/yonder_up.jpg');
let texture_dn= new THREE.TextureLoader().load('./assets/Skybox/yonder_dn.jpg');
let texture_rt= new THREE.TextureLoader().load('./assets/Skybox/yonder_rt.jpg');
let texture_lf= new THREE.TextureLoader().load('./assets/Skybox/yonder_lf.jpg');

materialArray.push(new THREE.MeshBasicMaterial({map:texture_ft}));
materialArray.push(new THREE.MeshBasicMaterial({map:texture_bk}));
materialArray.push(new THREE.MeshBasicMaterial({map:texture_up}));
materialArray.push(new THREE.MeshBasicMaterial({map:texture_dn}));
materialArray.push(new THREE.MeshBasicMaterial({map:texture_rt}));
materialArray.push(new THREE.MeshBasicMaterial({map:texture_lf}));

for(let i=0;i<6;i++){
  materialArray[i].side=THREE.BackSide;
}


let skyboxGeo = new THREE.BoxGeometry(10000,10000,10000);
let skybox=new THREE.Mesh(skyboxGeo,materialArray);
scene.add(skybox)





const porsche=new THREE.Group();
const FrontLeftGroup= new THREE.Group();
const FrontRightGroup= new THREE.Group();
const rgbeLoader= new RGBELoader();
let FrontRightWheel
let FrontLeftWheel
let RearLeftWheel
let RearRightWheel
let car
let grass
const loader=new GLTFLoader();

rgbeLoader.load('./assets/MR_INT-003_Kitchen_Pierre.hdr',function(texture){
    texture.mapping=THREE.EquirectangularReflectionMapping;
    scene.environment=texture;
    
    loader.load('./assets/porschecar/wheel.gltf',function(gltf){
    const FrontRightmodel=gltf.scene;
    FrontRightWheel=FrontRightmodel
    FrontRightWheel.position.y+=0.35;
    FrontRightGroup.add(FrontRightWheel)
    porsche.add(FrontRightGroup);
  });
  
  loader.load('./assets/porschecar/car.gltf',function(gltf){
    const model=gltf.scene;
    car=model
    porsche.add(car);
  });
  loader.load('./assets/qwqe/scene.gltf',function(gltf){
    const grassmodel=gltf.scene;
    grass=grassmodel
    //scene.add(grass)
    grass.scale.set(250,250,250)
    grass.translateY(-1.05)
  });
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
  RearRightWheel.position.x-=0.9;
  RearRightWheel.position.y+=0.35;
  porsche.add(RearRightWheel);
});
loader.load('./assets/porschecar/wheel.gltf',function(gltf){
  const RearLeftmodel=gltf.scene;
  RearLeftWheel=RearLeftmodel
  RearLeftWheel.rotation.y=Math.PI
  RearLeftWheel.position.z-=1;
  RearLeftWheel.position.x+=0.9;
  RearLeftWheel.position.y+=0.35;
  porsche.add(RearLeftWheel);
});
FrontRightGroup.position.z+=1.65;
FrontRightGroup.position.x-=0.89;
FrontLeftGroup.position.z+=1.65;
FrontLeftGroup.position.x+=0.89;
goal = new THREE.Object3D;
follow = new THREE.Object3D;
follow.position.z = -coronaSafetyDistance;
porsche.add( follow );
goal.translateZ(-10);
goal.add( camera );
scene.add( porsche );
porsche.castShadow
porsche.scale.set(0.5,0.5,0.5)


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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}


var SpeedoMeter = document.createElement('div');
SpeedoMeter.style.position = 'absolute';
//SpeedoMeter.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
SpeedoMeter.style.width = 100;
SpeedoMeter.style.height = 100;
SpeedoMeter.style.bottom= 50 + 'px';
SpeedoMeter.style.left = window.innerWidth/2 + 'px';
SpeedoMeter.style.fontSize=20
document.body.appendChild(SpeedoMeter);

var Gears = document.createElement('div');
Gears.style.position = 'absolute';
//SpeedoMeter.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
Gears.style.width = 100;
Gears.style.height = 100;
Gears.style.bottom= 50 + 'px';
Gears.style.left = (window.innerWidth/2) -100 + 'px';
Gears.style.fontSize=20
document.body.appendChild(Gears);


var timer = document.createElement('div');
timer.style.position = 'absolute';
//SpeedoMeter.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
timer.style.width = 100;
timer.style.height = 100;
timer.style.top= 50 + 'px';
timer.style.left = 100 + 'px';
timer.style.fontSize=20
document.body.appendChild(timer);



renderer.render(scene, camera);

let factor=0.00006;

function animate(time) {
  
  if ( keys.w && speed<70/6){
    if(speed<=9.2/6){
      speed+=5*0.016564/6-(left*speed*factor)-(right*speed*factor)
    }
    else if(speed<=27.77/6 && speed>9.2/6){
      speed+=4*0.016564/6-(left*speed*factor)-(right*speed*factor)
    }
    else if(speed>27.77/6 && speed<=44.444/6){
      speed+=1.5*0.016564/6-(left*speed*factor)-(right*speed*factor)
    }
    else if(speed>44.444/6 && speed<=60.555/6){
      speed+=1.2*0.016564/6-(left*speed*factor)-(right*speed*factor)
    }
    else if(speed>60.555/6 && speed<63/6){
      speed+=0.9*0.016564/6-(left*speed*factor)-(right*speed*factor)
    }
    else if(speed>63/6){
      var z=getRandomInt(-100,100)
      speed+=z*0.05 * 0.016564/6-(left*speed*factor)-(right*speed*factor)
    }
    if(speed>64/6){
      speed-=Math.random()*0.016564/6*0.5
    }
    if(accelerate<17){
      accelerate+=1;
      car.rotateX(-accelerate*0.00015)
    }
    
      
  }
  else{
    if(accelerate>0){
      accelerate-=1;
      car.rotateX(accelerate*0.00015)
    }
    speed-=speed*0.7*0.016564/6 -(left*speed*factor)-(right*speed*factor);
  }
  if ( keys.s && speed>0 ){
    if(speed>=1){
      speed -=speed*2*0.016564/6;
    }
    if(speed<1){
       speed-=0.01;
    }
    if(speed<0){
      speed=0
    }
    if(deccelerate<17 ){
      deccelerate+=1;
      car.rotateX(deccelerate*0.0003)
    }
    if(reverse<35){
      reverse+=1
    }
  }
  else{
    if(deccelerate>0){
      deccelerate-=1;
      car.rotateX(-deccelerate*0.0003)
    }
  }



  //reverse
  if(speed==0 && reverse!=0){
    reverse-=1
  }
  if(keys.s && speed<=0 && reverse==0 ){
    if(speed>-1 && speed<=0){
      speed-=1*0.016564/6
    }
  }


  if(speed<0 && !keys.w){
    gear='R'
  }
  else if((speed<=12/6&& gear!=1) || (gear=='R' && speed<0)){
    gear='1'
  }
  else if(speed<=27.77/6 && speed>12/6 && gear!=2){
    gear='2'
  }
  else if(speed>27.77/6 && speed<=37.444/6 && gear!=3){
    gear='3'
  }
  else if(speed>37.444/6 && speed<=55.555/6 && gear!=4){
    gear='4'
  }
  else if(speed>55.555/6 && gear!=5){
    gear='5'
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
    if(left<30){
      FrontLeftGroup.rotateY(0.03)
      FrontRightGroup.rotateY(0.03)
      car.rotateZ(speed*0.0005)
      left+=1
    }
    if(speed!=0)
      if(speed<1){
        porsche.rotateY(left*0.001*speed)
      }
      else{
        porsche.rotateY(left*0.001)
      }

  }
  else if(left>0){
    left-=2
    FrontLeftGroup.rotateY(-0.06)
    FrontRightGroup.rotateY(-0.06)
    car.rotateZ(-speed*0.0005)
    if(speed!=0)
      if(speed<1){
       porsche.rotateY(left*0.001*speed)
      }
      else{
       porsche.rotateY(left*0.001)
    }
  }
  if(left<0){
    left=0
  }
  if ( keys.d && !keys.a && left==0){
    if(right<30){
      FrontLeftGroup.rotateY(-0.03)
      FrontRightGroup.rotateY(-0.03)
      car.rotateZ(-speed*0.0005)
      right+=1
    }
    if(speed!=0){
      if(speed<1){
        porsche.rotateY(-right*0.001*speed)
      }
      else{
        porsche.rotateY(-right*0.001)
      }
    }
      
  }
  else if(right>0){
    right-=2
    FrontLeftGroup.rotateY(0.06)
    FrontRightGroup.rotateY(0.06)

    car.rotateZ(speed*0.001)

    if(speed!=0)
      if(speed<1){
        porsche.rotateY(-right*0.001*speed)
      }
      else{
        porsche.rotateY(-right*0.001)
      }
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
        if(car.rotation.z<0.01 && car.rotation.z>-0.01){
          car.rotation.z=0;
        }
      }
      if((accelerate==0 && deccelerate==0) && car.rotation.x!=0){
        if(car.rotation.x>0){
          car.rotateX(-0.005)
        }
        else if(car.rotation.x<0){
            car.rotateX(0.005)
        }
        if(car.rotation.x<0.01 && car.rotation.x>-0.01){
          car.rotation.x=0;
        }
      }
      if(((right==0 && left==0) && FrontLeftGroup.rotation.y!=0 || FrontRightGroup.rotation.y!=0) && speed!=0){
        FrontLeftGroup.rotation.y=0;
        FrontRightGroup.rotation.y=0;
      }
    }
  }

    
  

  

SpeedoMeter.innerHTML = parseInt(speed*27) + " KPH";
Gears.innerHTML = "Gear: " + gear;
timer.innerHTML = laptime;
//laptime+=1

    a.lerp(porsche.position,0.7);
    b.copy(goal.position);
    dir.copy( a ).sub( b ).normalize();
    const dis = a.distanceTo( b ) - coronaSafetyDistance;
    goal.position.addScaledVector( dir, dis );
    goal.position.lerp(temp, 0.04); //accelerate
    temp.setFromMatrixPosition(follow.matrixWorld);
    camera.lookAt( porsche.position );
    renderer.render(scene, camera); // render the scene
}
window.addEventListener('DOMContentLoaded', () => {
  renderer.setAnimationLoop(animate);
});


