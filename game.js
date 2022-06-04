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
let fpv=false;
let Vee=8;

const renderer = new THREE.WebGLRenderer({
  antialias: true
});


const textureLoader=new THREE.TextureLoader();
const grassBaseColor=textureLoader.load('./assets/GrassTexture/Grass_001_COLOR.jpg');
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

const driverCamera=new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 30000 );
driverCamera.position.set( 0.3, 1.3, 0 );
driverCamera.lookAt( 0,1.3,10 );

let Playercamera = camera;


const light = new THREE.AmbientLight( 0x0f0f0f ); // soft white light
scene.add( light );
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0);
directionalLight.position.set(0,200,-100);
directionalLight.target.position.set(0,0,0)
directionalLight.castShadow=true;
//Set up shadow properties for the light
directionalLight.shadow.mapSize.width = 1024; // default
directionalLight.shadow.mapSize.height = 1024; // default
var d = 200;
directionalLight.shadow.camera.left = - d;
directionalLight.shadow.camera.right = d;
directionalLight.shadow.camera.top = d;
directionalLight.shadow.camera.bottom = - d;
directionalLight.shadow.bias=-0.0001
scene.add( directionalLight );


grassBaseColor.wrapS = THREE.RepeatWrapping;
grassBaseColor.wrapT = THREE.RepeatWrapping;
grassBaseColor.repeat.set( 7000, 7000 );

const planeGeometry = new THREE.PlaneGeometry(1500, 1000,1,1); // create a plane
const planeMaterial = new THREE.MeshPhongMaterial({
    map:grassBaseColor

});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
//plane.geometry.attributes.uv2=plane.geometry.attributes.uv;aw
plane.receiveShadow=true;
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;

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
  
  loader.load('./assets/porschecar/car1.gltf',function(gltf){
    const model=gltf.scene;
    car=model
    gltf.scene.traverse( function( node ) {

      if ( node.isMesh ) { node.castShadow = true; node.receiveShadow=true }
  
  } );
    porsche.add(car);
  });
  loader.load('./assets/qwqe/scene1.gltf',function(gltf){
    const grassmodel=gltf.scene;
    grass=grassmodel
    gltf.scene.traverse( function( node ) {

      if ( node.isMesh ) {node.receiveShadow=true }
  
  } );

    scene.add(grass)
    grass.scale.set(200,200,200)
    grass.translateY(-0.85)
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
loader.load('./assets/maple_tree/scene.gltf',function(gltf){
  gltf.scene.traverse( function( node ) {

    if ( node.isMesh ) { node.castShadow = true; node.receiveShadow=true }

} );
  const tree=gltf.scene;
  tree.castShadow=true;
  scene.add(tree);
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
porsche.add(driverCamera)
porsche.castShadow=true;
porsche.receiveShadow=true;
scene.add( porsche );
porsche.rotateY(-Math.PI/2 +0.15)
porsche.scale.set(0.5,0.5,0.5)


keys = {
  a: false,
  s: false,
  d: false,
  w: false,
  v: false,
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


var turnBack = document.createElement('div');
turnBack.style.position = 'absolute';
//SpeedoMeter.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
turnBack.style.width = 100;
turnBack.style.height = 100;
turnBack.style.top= 100 + 'px';
turnBack.style.left = (window.innerWidth/2)-50  + 'px';;
turnBack.style.fontSize=20
document.body.appendChild(turnBack);
turnBack.style.color='red'


renderer.render(scene, camera);

let factor=0.00006;

function animate(time) {
  if(porsche){
    if ( keys.w && speed<70/12){
      if(speed<=9.2/12){
        speed+=5*0.016564/12-(left*speed*factor)-(right*speed*factor)
      }
      else if(speed<=27.77/12 && speed>9.2/12){
        speed+=3.7*0.016564/12-(left*speed*factor)-(right*speed*factor)
      }
      else if(speed>27.77/12 && speed<=44.444/12){
        speed+=1.35*0.016564/12-(left*speed*factor)-(right*speed*factor)
      }
      else if(speed>44.444/12 && speed<=60.555/12){
        speed+=1.15*0.016564/12-(left*speed*factor)-(right*speed*factor)
      }
      else if(speed>60.555/12 && speed<63/12){
        speed+=0.9*0.016564/12-(left*speed*factor)-(right*speed*factor)
      }
      else if(speed>63/12){
        var z=getRandomInt(-100,100)
        speed+=z*0.05 * 0.016564/12-(left*speed*factor)-(right*speed*factor)
      }
      if(speed>64/12){
        speed-=Math.random()*0.016564/12*0.5
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
      speed-=speed*0.7*0.016564/12 -(left*speed*factor)-(right*speed*factor);
    }
    if ( keys.s && speed>0 ){
      if(speed>=1){
        speed -=speed*3*0.016564/12;
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
        car.rotateX(-deccelerate*0.0001)
      }
    }
  
  
  
    //reverse
    if(speed==0 && reverse!=0){
      reverse-=1
    }
    if(keys.s && speed<=0 && reverse==0 ){
      if(speed>-1 && speed<=0){
        speed-=1*0.016564/12
      }
    }
  
  
    if(speed<0 && !keys.w){
      gear='R'
    }
    else if((speed<=12/12&& gear!=1) || (gear=='R' && speed<0)){
      gear='1'
    }
    else if(speed<=27.77/12 && speed>12/12 && gear!=2){
      gear='2'
    }
    else if(speed>27.77/12 && speed<=37.444/12 && gear!=3){
      gear='3'
    }
    else if(speed>37.444/12 && speed<=55.555/12 && gear!=4){
      gear='4'
    }
    else if(speed>55.555/12 && gear!=5){
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
      if(left<30 && right==0){
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
    else if(left>0 && right==0){
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
      if(right<30 && left==0){
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
    else if(right>0 && left==0){
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
            car.rotateX(-0.008)
          }
          else if(car.rotation.x<0){
              car.rotateX(0.008)
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
  
    if(keys.v){
      Vee-=1;
      if(fpv && Vee==0){
        Playercamera=camera
        SpeedoMeter.style.color='black'
        Gears.style.color='black'
        fpv=false;
        Vee=8
      }
      else if(!fpv && Vee==0){
        Playercamera=driverCamera
        fpv=true;
        SpeedoMeter.style.color='white'
        Gears.style.color='white'
        Vee=8
      }
      if(Vee<0){
        Vee=0
      }
    }
  
  
      if((porsche.position.z>250 || porsche.position.z<-250)){
        turnBack.innerHTML = "OUT OF BOUNDS! TURN BACK!";
      }
      else{
        turnBack.innerHTML = "";
      }
     if((porsche.position.z>400 || porsche.position.z<-400)){
        speed=speed/2
        porsche.position.z=0
      }
  
      if((porsche.position.x>550|| porsche.position.x<-450)){
        turnBack.innerHTML = "OUT OF BOUNDS! TURN BACK!";
      }
      else{
        turnBack.innerHTML = "";
      }
     if((porsche.position.x>700 || porsche.position.x<-600)){
        speed=speed/2
        porsche.position.x=0
      }
     
  
  SpeedoMeter.innerHTML = parseInt(speed*54) + " KPH";
  Gears.innerHTML = "Gear: " + gear
  timer.innerHTML = laptime;
  //laptime+=1
  //directionalLight.position.set(porsche.position.x,20,porsche.position.z)
  directionalLight.shadow.camera.left -= 1;
  directionalLight.shadow.camera.right -=1;
  directionalLight.shadow.camera.top -=1 ;
  directionalLight.shadow.camera.bottom -= 1;
  
      a.lerp(porsche.position,0.7);
      b.copy(goal.position);
      dir.copy( a ).sub( b ).normalize();
      const dis = a.distanceTo( b ) - coronaSafetyDistance;
      goal.position.addScaledVector( dir, dis );
      goal.position.lerp(temp, 0.04); //accelerate
  
      temp.setFromMatrixPosition(follow.matrixWorld);
      camera.lookAt( porsche.position );
      renderer.render(scene, Playercamera); // render the scene
  }
  
}
window.addEventListener('DOMContentLoaded', () => {
  renderer.setAnimationLoop(animate);
});


