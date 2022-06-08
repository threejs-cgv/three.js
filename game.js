import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import{GLTFLoader} from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js";
import{FBXLoader} from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/FBXLoader.js";
import{RGBELoader} from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/RGBELoader.js";
import{OrbitControls} from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";
import {collisionVec} from './collision.js';
import {treeVec} from './collision.js';
import {lowPolyTreeVec} from './collision.js';
import {shrubVec} from './collision.js';
import {antennaVec} from './collision.js';
import {flagVec} from './collision.js';
import {Stats} from './FPS.js'

var goal, keys, follow;
var collisionVec2=[]
var temp = new THREE.Vector3;
var dir = new THREE.Vector3;
var a = new THREE.Vector3;
var b = new THREE.Vector3;
var coronaSafetyDistance = 2.6;
var velocity = 0.0;
var speed = 0.0;
var groundID=''
var porscheID=''
var wheel1ID=''
var wheel2ID=''
var wheel3ID=''
var wheel4ID=''

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
var space=0;
var orbitcam=false;
var counter=0

function loadSound(soundpath,volume){
  let listener = new THREE.AudioListener();
  camera.add(listener);


  const sound = new THREE.Audio(listener);
  let soundloader = new THREE.AudioLoader();
  soundloader.load
  (
    soundpath,
    function(buffer){
      sound.setBuffer(buffer);
      sound.setLoop(false);
      sound.setVolume(volume);
      sound.play();
     
      
    }
    
  )
  //sound.stop()
}

var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

const renderer = new THREE.WebGLRenderer({
  antialias: true
});
const camera1 = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
const controls = new OrbitControls( camera1, renderer.domElement );

//controls.update() must be called after any manual changes to the camera's transform
camera1.position.set( 0, 20, 100 );
controls.update();

const textureLoader=new THREE.TextureLoader();
const grassBaseColor=textureLoader.load('./assets/GrassTexture/Stylized_Grass_001_basecolor.jpg');
const grassDisp=textureLoader.load('./assets/GrassTexture/Stylized_Grass_001_height.png');
const grassNorm=textureLoader.load('./assets/GrassTexture/Stylized_Grass_001_normal.jpg');
const grassOcc=textureLoader.load('./assets/GrassTexture/Stylized_Grass_001_ambientOcclusion.jpg');
const grassRough=textureLoader.load('./assets/GrassTexture/Stylized_Grass_001_roughness.jpg');

let start=new Date();
let startTime=start.getTime();



renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 20000 );
    camera.position.set( 0, 1.3, 0 );
    const scene = new THREE.Scene();
camera.lookAt( 0,0,0 );

const driverCamera=new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight,0.01, 20000 );
driverCamera.position.set( 0.3, 1.3, 0 );
driverCamera.lookAt( 0,1.3,10 );

let Playercamera = camera;

const light = new THREE.AmbientLight( 0x0f0f0f ); // soft white light
scene.add( light );
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0);
directionalLight.position.set(180,100,300);
directionalLight.target.position.set(180,0,200)
directionalLight.castShadow=true;
//Set up shadow properties for the light
directionalLight.shadow.mapSize.width = 1024*0; // default
directionalLight.shadow.mapSize.height = 1024*0; // default
var d = 450;
directionalLight.shadow.camera.left = - d;
directionalLight.shadow.camera.right = d;
directionalLight.shadow.camera.top = d/2;
directionalLight.shadow.camera.bottom = - d/2;
directionalLight.shadow.bias=-0.0001
scene.add( directionalLight );

scene.fog=new THREE.FogExp2(0xDFE9F3,0.0002)


const collisionCube=new THREE.Mesh(
  new THREE.SphereGeometry(1,32,16),
  new THREE.MeshBasicMaterial({color:'red'})
)
function formatVec(vector){
  const nadia=[]
  for(var i=0;i<vector.length-3;i+=3){
    var tempvec=new THREE.Vector3();
      tempvec.x=vector[i];
      tempvec.y=vector[i+1];
      tempvec.z=vector[i+2];
      nadia.push(tempvec)
  }
  return nadia;
}

function formatTreeVec(){
  const nadia1=[]
  for(var i=0;i<treeVec.length-3;i+=3){
    var tempvec1=new THREE.Vector3();
      tempvec1.x=treeVec[i];
      tempvec1.y=treeVec[i+1];
      tempvec1.z=treeVec[i+2];
      nadia1.push(tempvec1)
  }
  return nadia1;
}
//console.log(formatTreeVec().length)
function formatLowPolyTreeVec(){
  const nadia2=[]
  for(var i=0;i<lowPolyTreeVec.length-3;i+=3){
    var tempvec1=new THREE.Vector3();
      tempvec1.x=lowPolyTreeVec[i];
      tempvec1.y=lowPolyTreeVec[i+1];
      tempvec1.z=lowPolyTreeVec[i+2];
      nadia2.push(tempvec1)
  }
  return nadia2;
}

function showVertices(){
  var newvec=formatVec(collisionVec)
  /*for(var i=0;i<newvec.length;i++){
    var newcube=new THREE.Mesh(
      new THREE.BoxGeometry(2,1,2),
      new THREE.MeshBasicMaterial({color:i*24})
    )
          newcube.position.set(newvec[i].x,newvec[i].y,newvec[i].z)
          scene.add(newcube)
  }*/
  return newvec;
}

function showTreeVertices(){
  var newvec=formatTreeVec()
  for(var i=0;i<newvec.length;i++){
    var newcube=tree.clone();
    newcube.position.set(newvec[i].x,newvec[i].y,newvec[i].z)
    scene.add(newcube)
}
}
function doublevec(singlevec){
  var anothervec=[];
  for(var i=0;i<singlevec.length-2;i+=2){
    for(var j=0;j<singlevec.length-2;j+=2){
        var threevec=new THREE.Vector3();
        if(distanceVector(singlevec[i],singlevec[j])<20){
          threevec.x=(singlevec[i].x+singlevec[j].x)/2
          threevec.z=(singlevec[i].z+singlevec[j].z)/2
          threevec.y=singlevec[i].y
          anothervec.push(threevec);
          anothervec.push(singlevec[i])
        }
        
      }
    }
    console.log(anothervec.length)
  return(anothervec)
}

//var bigVec=doublevec(formatVec())
grassBaseColor.wrapS = THREE.RepeatWrapping;
grassBaseColor.wrapT = THREE.RepeatWrapping;
grassBaseColor.repeat.set( 300, 300 );

const planeGeometry = new THREE.PlaneGeometry(1500, 1000,1,1); // create a plane
const planeMaterial = new THREE.MeshStandardMaterial({
    map:grassBaseColor,
    //normalMap:grassNorm,
    //displacementMap:grassDisp,
    //displacementScale:0.01,
    //aoMap:grassOcc,
    //roughnessMap:grassRough,
    //roughness:0.01

});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
//plane.geometry.attributes.uv2=plane.geometry.attributes.uv;
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


let skyboxGeo = new THREE.BoxGeometry(5000,5000,5000);
let skybox=new THREE.Mesh(skyboxGeo,materialArray);
scene.add(skybox)





const porsche=new THREE.Group();
const FrontLeftGroup= new THREE.Group();
const FrontRightGroup= new THREE.Group();
const rgbeLoader= new RGBELoader();
const treeGroup=new THREE.Group();
let FrontRightWheel
let FrontLeftWheel
let RearLeftWheel
let RearRightWheel
let car
let grass
const loader=new GLTFLoader();
const TestVec=[]
rgbeLoader.load('./assets/MR_INT-003_Kitchen_Pierre.hdr',function(texture){
    texture.mapping=THREE.EquirectangularReflectionMapping;
    
    //scene.environment=texture;
    
   
  loader.load('./assets/porschecar/car1.gltf',function(gltf){
    const model=gltf.scene;
    car=model
    gltf.scene.traverse( function( node ) {

      if ( node.isMesh ) { node.castShadow = true; node.receiveShadow=true }
  
  } );
    porsche.add(car);
    porscheID=car.uuid
  });
  loader.load('./assets/qwqe/scene1.gltf',function(gltf){
    const grassmodel=gltf.scene;
    grass=grassmodel
    gltf.scene.traverse( function( node ) {

      if ( node.isMesh ) {
        node.receiveShadow=true; 
      }
      
  } );

    scene.add(grass)
    grass.scale.set(200,1,200)
    grass.translateY(0.01)
    groundID=grass.uuid;
  });
});
loader.load('./assets/porschecar/wheel.gltf',function(gltf){
  const FrontRightmodel=gltf.scene;
  FrontRightWheel=FrontRightmodel
  FrontRightWheel.position.y+=0.35;
  FrontRightGroup.add(FrontRightWheel)
  wheel1ID=FrontRightGroup.uuid
  //console.log(wheel1ID)
  porsche.add(FrontRightGroup);

});

loader.load('./assets/porschecar/wheel.gltf',function(gltf){
  const FrontLeftmodel=gltf.scene;
  FrontLeftWheel=FrontLeftmodel
  FrontLeftWheel.rotation.y=Math.PI
  FrontLeftWheel.position.y+=0.35;
  FrontLeftGroup.add(FrontLeftWheel);
  wheel2ID=FrontLeftGroup.uuid
  porsche.add(FrontLeftGroup);

});
loader.load('./assets/porschecar/wheel.gltf',function(gltf){
  const RearRightmodel=gltf.scene;
  RearRightWheel=RearRightmodel
  RearRightWheel.position.z-=1;
  RearRightWheel.position.x-=0.9;
  RearRightWheel.position.y+=0.35;
  porsche.add(RearRightWheel);
  wheel3ID=RearRightWheel.uuid
});
loader.load('./assets/porschecar/wheel.gltf',function(gltf){
  const RearLeftmodel=gltf.scene;
  RearLeftWheel=RearLeftmodel
  RearLeftWheel.rotation.y=Math.PI
  RearLeftWheel.position.z-=1;
  RearLeftWheel.position.x+=0.9;
  RearLeftWheel.position.y+=0.35;
  porsche.add(RearLeftWheel);
  wheel4ID=RearLeftWheel.uuid
});
 loader.load('./assets/maple_tree/scene.gltf',function(gltf){
  gltf.scene.traverse( function( node ) {

    if ( node.isMesh ) { node.castShadow = true; node.receiveShadow=true }

} );
  const tree=gltf.scene;
  tree.castShadow=true;
  var newvec=formatTreeVec()
  tree.scale.set(0.01,0.01,0.01)
  for(var i=0;i<newvec.length;i+=1){
    var newcube=tree.clone();
    newcube.position.set(newvec[i].x,newvec[i].y,newvec[i].z)
    var rand=getRandomInt(5,15)/15
    var rot=getRandomInt(-314,314)/100
    newcube.scale.set(rand,rand,rand)
    newcube.rotateY(rot)
    scene.add(newcube)
}
scene.add(treeGroup)

});

loader.load('./assets/daisies/scene.gltf',function(gltf){
  const tree=gltf.scene;
  tree.castShadow=true;
  var newvec=formatTreeVec()
  tree.scale.set(0.01,0.01,0.01)
  for(var i=0;i<newvec.length;i+=3){
    var newcube=tree.clone();
    newcube.position.set(newvec[i].x,newvec[i].y,newvec[i].z)
    var rand=getRandomInt(5,15)/15
    var rot=getRandomInt(-314,314)/100
    newcube.scale.set(rand*3,0.2,rand*3)
    newcube.rotateY(rot)
    scene.add(newcube)
}
//scene.add(treeGroup)

}); 
 loader.load('./assets/cgv_models1.glb',function(gltf){
  gltf.scene.traverse( function( node ) {

    if ( node.isMesh ) { node.castShadow = true; node.receiveShadow=true }

} );
  const polytree=gltf.scene;
  polytree.castShadow=true;
  var newvec=formatLowPolyTreeVec()
  for(var i=0;i<newvec.length;i++){
    var newcube=polytree.clone();
    newcube.position.set(newvec[i].x,newvec[i].y,newvec[i].z)
    var rand=getRandomInt(5,15)/20
    var rot=getRandomInt(-314,314)/100
    newcube.scale.set(rand,rand,rand)
    newcube.rotateY(rot)
    scene.add(newcube)
}

});
loader.load('./assets/starting_line/scene.gltf',function(gltf){
  const start=gltf.scene;
  gltf.scene.traverse( function( node ) {

    if ( node.isMesh ) { node.castShadow = true; node.receiveShadow=true }

} );
  start.rotateY((Math.PI/2)*1.05)
  start.translateZ(-40)
  start.translateX(-4.5)
  start.translateY(1.2)
  start.scale.set(0.08,0.05,0.05)
  scene.add(start)


});

loader.load('./assets/old_antenna/scene.gltf',function(gltf){
  const start=gltf.scene;
  gltf.scene.traverse( function( node ) {

    if ( node.isMesh ) { node.castShadow = true; node.receiveShadow=true }

} );
  start.scale.set(0.0004,0.0004,0.0004)
  var newvec=formatVec(antennaVec)
  for(var i=0;i<newvec.length;i++){
    var newcube=start.clone();
    newcube.scale.set(0.0004,0.0004,0.0004)
    newcube.position.set(newvec[i].x,newvec[i].y,newvec[i].z)
    var rot=getRandomInt(-314,314)/100
    newcube.rotateY(rot)
    scene.add(newcube)
}
});
loader.load('./assets/background_mountain_2/scene.gltf',function(gltf){
  const model=gltf.scene;
  model.scale.set(3,3,3)
  model.rotateY(Math.PI/2)
  var numMountains=10
  for(var i=0;i<numMountains;i++){
    var newcube=model.clone();
    var rand=getRandomInt(40,50)/15
    newcube.rotateY((2*Math.PI/numMountains)*i)
    newcube.translateX(-3000)
    newcube.rotateY((Math.PI/2))
    newcube.translateZ(180)
    newcube.scale.set(3*rand,3*rand,3*rand)
    scene.add(newcube)
}
}); 
loader.load('./assets/metal_advertising_billboard_single_sided/scene.gltf',function(gltf){
  const start=gltf.scene;
  gltf.scene.traverse( function( node ) {

    if ( node.isMesh ) { node.castShadow = true; node.receiveShadow=true }

} );
  start.rotateY((Math.PI/2)*1.05)
  start.translateZ(-40)
  start.translateX(-4.5)
  start.scale.set(0.8,0.8,0.8)
  start.position.set(166.56489426840827,
    0,
    27.612372137162442)
  start.rotateY(Math.PI/2)
  scene.add(start)


});

let rocks =[]
let rockloader = new FBXLoader();
rockloader.load("assets/Rocks/rock.fbx",
function(obj){
  obj.castShadow=true;
  var newvec=formatTreeVec()
  for(var i=0;i<newvec.length*5;i++){
    var rock_obj=obj.clone();
    rock_obj.scale.set(0.001,0.001,0.001)
    var rand=getRandomInt(5,100)
    rock_obj.position.set(newvec[i].x-rand,newvec[i].y,newvec[i].z)
   
    var rot=getRandomInt(-314,314)/100
    //rock_obj.scale.set(rand*3,0.2,rand*3)
    rock_obj.rotateY(rot)
    rocks.push(rock_obj)
    scene.add(rock_obj)
  }
  for(var i=0;i<newvec.length*5;i++){
    var rock_obj=obj.clone();
    rock_obj.scale.set(0.0001,0.0001,0.0001)
    var rand=getRandomInt(5,100)
    rock_obj.position.set(newvec[i].x,newvec[i].y,newvec[i].z-rand)
    var rot=getRandomInt(-314,314)/100
    //rock_obj.scale.set(rand*3,0.2,rand*3)
    rock_obj.rotateY(rot)
    rocks.push(rock_obj)
    scene.add(rock_obj)
  }
})


// load grenades and tnt

let grenades =[];

let fbxloader = new FBXLoader();
fbxloader.load("assets/Grenade/grenade.fbx",
function(obj){
  obj.castShadow=true;
  var newvec=showVertices()
  for(var i=0;i<50;i++){
    var grenade_obj=obj.clone();
    grenade_obj.scale.set(0.1,0.1,0.1)
    var rand_pos=getRandomInt(10,newvec.length)
    grenade_obj.position.set(newvec[rand_pos].x,newvec[rand_pos].y,newvec[rand_pos].z)
    grenades.push(grenade_obj)
    scene.add(grenade_obj)
  }
})

fbxloader.load("assets/Grenade/tnt.fbx",
function(obj){
  obj.castShadow=true;
  var newvec=showVertices()
  for(var i=0;i<50;i++){
    var tnt_obj=obj.clone();
    tnt_obj.scale.set(0.05,0.05,0.05)
    var rand_pos=getRandomInt(10,newvec.length)
    tnt_obj.position.set(newvec[rand_pos].x,newvec[rand_pos].y,newvec[rand_pos].z)
    grenades.push(tnt_obj)
    scene.add(tnt_obj)
  }
})



//load start sound

const cube1=new THREE.Mesh(
  new THREE.BoxGeometry(2,1,4.65),
  //new THREE.MeshPhongMaterial({color:0xff0000})
)

cube1.translateZ(0.23)
let cube1BB= new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube1BB.setFromObject(cube1)

var cubeID=cube1.uuid
cube1.visible=false

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
porsche.add(cube1)
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
  space:false,
  t: false,
  p:false,
  x:false
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

function distanceVector( v1, v2 )
{
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}
function grenadeDistance( v1, v2 )
{
    var dx = v1.x - v2.position.x;
    var dy = v1.y - v2.position.y;
    var dz = v1.z - v2.position.z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}


function ToTime(x){
    var time=""
    var temptime=x
    var minutes=0
    var seconds=0
    var milliseconds=0
    while(temptime>100){
      temptime=temptime-100
      seconds++
    }
    minutes=Math.floor(seconds/60)
    if(minutes<10){
      minutes="0"+minutes
    }
    while(seconds>59){
      seconds=seconds-60
    }
    if(seconds<10){
      seconds="0"+seconds
    }
    milliseconds=x
    while(milliseconds>99){
      milliseconds=milliseconds-100
    }
    if(milliseconds<10){
      milliseconds="0"+milliseconds
    }
   
    time=minutes+":"+seconds+":"+milliseconds
    return time;

}



function CullTrees(currpos,drawdist){
  scene.traverse( function( node ) {
    if ( node instanceof THREE.Group ) {
      if((distanceVector(node.position,currpos)>drawdist
      && distanceVector(node.position,currpos)<2000) &&
       node.uuid!=groundID && node.uuid!=porscheID && 
       node.uuid!=wheel1ID && node.uuid!=wheel2ID &&
        node.uuid!=wheel3ID && node.uuid!=wheel4ID && node.uuid!=cubeID){
        node.visible=false
      }
      else{
        node.visible=true
      }
      if((distanceVector(node.position,currpos)>drawdist/2)  &&
      node.uuid!=groundID && node.uuid!=porscheID && 
      node.uuid!=wheel1ID && node.uuid!=wheel2ID &&
       node.uuid!=wheel3ID && node.uuid!=wheel4ID && node.uuid!=cubeID){
        node.traverse( function( node1 ) {

          if ( node1.isMesh ) { node1.castShadow = false; node1.receiveShadow=false}
      
      } );
        node.receiveShadow=false
        node.castShadow=false
      } 
      else if(node.uuid!=groundID){
        node.traverse( function( node1 ) {

          if ( node1.isMesh ) { node1.castShadow = true; node1.receiveShadow=true}
      
      } );
      }
    }

} );
}

var collide=formatTreeVec()
  .concat(formatLowPolyTreeVec())
  .concat(new THREE.Vector3(166.56489426840827,
    0,
    27.612372137162442))
    .concat(
      new THREE.Vector3(-40.44950625736646,
        0,
        -6.705652492031376)
    ).concat(
      new THREE.Vector3(-38.60344897137225,
        0,
        21.735722390031476)).concat(
        formatVec(antennaVec)
      )



    
function GrenadeCollision(){

  for(var i=0;i<grenades.length;i++){
    if(grenadeDistance(porsche.position,grenades[i])<1){
      console.log("boom")
      scene.remove(grenades[i])

      return true;
  
      
    }
  }
  return false
}
function checkCollisions(){
  for(var i=0;i<collide.length;i++){
    if(distanceVector(porsche.position,collide[i])<5){
      if(cube1BB.containsPoint(collide[i])){
        return true;

      }
    }
  }
  return false
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


let factor=0.00006;
//console.log(scene)
loadSound("assets/Sounds/lambo.mp3",0.5) 
function animate(time) {
  counter++;
  if(counter%30==0){
    CullTrees(porsche.position,375)
    counter=0
  }
  if(time>10000){

   
    //console.log(speed)
    stats.begin()
    cube1BB.copy(cube1.geometry.boundingBox).applyMatrix4(cube1.matrixWorld);
      //console.log(cube1BB)
      if(checkCollisions()){
        loadSound("assets/Sounds/car-crash-sound-eefect.mp3",0.005)
        if(speed>0){
          porsche.translateZ(-speed/2)
        }
        else if(speed<0){
          porsche.translateZ(-speed/2)
        }
        speed=0
        
      }
      if(GrenadeCollision()){
       console.log("ooops dead")
      }
      else{
        //console.log("alive")
      }
      if(keys.w || keys.s){
       loadSound("assets/Sounds/acceleration.mp3",0.01);
      }

    if ( keys.w && speed<70/12){
      //loadSound("assets/Sounds/driving.mp3",0.5)
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
      loadSound("assets/Sounds/abrupt_stop.mp3",0.001)
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
     // loadSound("assets/Sounds/driving.mp3",0.5)
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
        loadSound("assets/Sounds/turning.mp3",0.001)
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
        loadSound("assets/Sounds/turning.mp3",0.01)
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
        if(((right==0 && left==0) && FrontLeftGroup.rotation.y!=0 || FrontRightGroup.rotation.y!=0) && speed!=0){
          FrontLeftGroup.rotation.y=0;
          FrontRightGroup.rotation.y=0;
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
    }
  
    if(keys.v || keys.p){
      Vee-=1;
      if(fpv && Vee==0 && !keys.p){
        Playercamera=camera
        SpeedoMeter.style.color='black'
        Gears.style.color='black'
        fpv=false;
        Vee=8
      }
      else if(!fpv && Vee==0 && !keys.p){
        Playercamera=driverCamera
        fpv=true;
        SpeedoMeter.style.color='white'
        Gears.style.color='white'
        Vee=8
      }
      else if(!orbitcam && keys.p && Vee==0){
        Playercamera=camera1
        orbitcam=true
        Vee=8
      }
      else if(orbitcam && keys.p && Vee==0){
        Playercamera=camera
        orbitcam=false
        Vee=8
      }
      if(Vee<0){
        Vee=0
      }
    }
  
  
      if((porsche.position.z>250 || porsche.position.z<-250) || (porsche.position.x>550|| porsche.position.x<-450)){
        turnBack.innerHTML = "OUT OF BOUNDS! TURN BACK!";
      }
      else{
        turnBack.innerHTML = "";
      }
     if((porsche.position.z>400 || porsche.position.z<-400) || (porsche.position.x>700 || porsche.position.x<-600)){
        speed=speed/2
        porsche.position.z=0
        porsche.position.x=0
      }

      if(keys.space){ 
        space+=1;
        if(space==10){
          var cubetemp=collisionCube.clone()
          cubetemp.position.set(porsche.position.x,0,porsche.position.z)
          collisionVec2.push(cubetemp.position.x)
          collisionVec2.push(cubetemp.position.y)
          collisionVec2.push(cubetemp.position.z)
          scene.add(cubetemp)
          space=0
        }
      
        
      }
      if(keys.t){
       //showVertices();
       console.log(collisionVec2)
      }

   
      let end=new Date()
      let endTime=Math.trunc((end.getTime()-startTime)/10)
      timer.innerHTML = ToTime(endTime);
      SpeedoMeter.innerHTML = parseInt(speed*54) + " KPH";
      Gears.innerHTML = "Gear: " + gear
     


      
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
  stats.end();
}
window.addEventListener('DOMContentLoaded', () => {
  renderer.setAnimationLoop(animate);
});


