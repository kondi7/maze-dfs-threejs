import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const mazeSize = 9;//mazeSettings
const wallLength = 20;
const wallHeight = 25;
const wallWidth = 1;


let camera, scene, renderer, controls;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.y = 10;
//const box = new THREE.Box3();

scene = new THREE.Scene();
scene.background = new THREE.Color( 0x67aebb );
controls = new PointerLockControls( camera, document.body );

const topLight = new THREE.SpotLight( 0xffffff, 10000, 0, Math.PI/6 ); //light above
topLight.position.set( 40, 135, -100 );
topLight.target.position.set( 0, 0, 0 );
topLight.castShadow = true; 
topLight.shadow.camera.near = 500;
topLight.shadow.camera.far = 4000;
topLight.shadow.camera.fov = 30;
topLight.shadow.camera.near = 0.5; // default
scene.add( topLight );

const spotLight = new THREE.SpotLight( 0xffffff, 0.2, 250, Math.PI * 0.1, 0, 0.1 ); //flashlight light
spotLight.castShadow = true; 
camera.add( spotLight );
spotLight.position.set( 3, -2, -3 );
spotLight.add( spotLight.target );
spotLight.target.position.set( 0, 0, -20 );
let flashlight = true;

const handleG = new THREE.CylinderGeometry( 0.2, 0.2, 1, 32 ); //flashlight
const ringG = new THREE.CylinderGeometry( 0.21, 0.21, 0.05, 32 ); 
const tipG = new THREE.CylinderGeometry( 0.2, 0.3, 0.3, 32 ); 
const material = new THREE.MeshBasicMaterial( {color: 0x664606} ); 
const material2 = new THREE.MeshBasicMaterial( {color: 0x010101} ); 
const torchlightHandle = new THREE.Mesh( handleG, material ); 
const torchlightRing = new THREE.Mesh( ringG, material2 ); 
const torchlightTip = new THREE.Mesh( tipG, material ); 
torchlightRing.position.y = -0.5;
torchlightTip.position.y = -0.65;
const torchlight = new THREE.Group();
torchlight.rotation.x = Math.PI/2;
torchlight.add( torchlightHandle, torchlightRing, torchlightTip );
camera.add( torchlight );
torchlight.position.set( 3, -2, -3 );

//const playerG = new THREE.BoxGeometry( 0.2, 0.2, 0.2); 
//const playerM = new THREE.MeshStandardMaterial( {color: 0xffffff} ); 
//const player = new THREE.Mesh( playerG, playerM ); 
//camera.add( player );
//let cameraBox = new THREE.Box3( new THREE.Vector3(-0.1, -10.1, -0.1), new THREE.Vector3(0.1, 10.1, 0.1) );
////cameraBox.setFromObject( camera );
////const boundWallN = new THREE.Group();
////boundWallN.add( wallN, wallBounds );
//console.log( cameraBox );

const blocker = document.getElementById( 'blocker' );
const instructions = document.getElementById( 'instructions' );

instructions.addEventListener( 'click', function () {
	controls.lock();
} );
controls.addEventListener( 'lock', function () {
	instructions.style.display = 'none';
	blocker.style.display = 'none';
} );
controls.addEventListener( 'unlock', function () {
	blocker.style.display = 'block';
	instructions.style.display = '';
} );

scene.add( controls.object );

const onKeyDown = function ( event ) {
	switch ( event.code ) {
		case 'ArrowUp':
		case 'KeyW':
			moveForward = true;
			break;
		case 'ArrowLeft':
		case 'KeyA':
			moveLeft = true;
			break;
		case 'ArrowDown':
		case 'KeyS':
			moveBackward = true;
			break;
		case 'ArrowRight':
		case 'KeyD':
			moveRight = true;
			break;
		case 'KeyF':
			if ( flashlight === true ) {
				flashlight = false; 
				spotLight.intensity = 0;
			}
			else {
				flashlight = true; 
				spotLight.intensity = 0.2;
			}
			break;
	}
};

const onKeyUp = function ( event ) {
	switch ( event.code ) {
		case 'ArrowUp':
		case 'KeyW':
			moveForward = false;
			break;
		case 'ArrowLeft':
		case 'KeyA':
			moveLeft = false;
			break;
		case 'ArrowDown':
		case 'KeyS':
			moveBackward = false;
			break;
		case 'ArrowRight':
		case 'KeyD':
			moveRight = false;
			break;
	}
};

document.addEventListener( 'keydown', onKeyDown );
document.addEventListener( 'keyup', onKeyUp );

let floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
floorGeometry.rotateX( - Math.PI / 2 );
const floorMaterial = new THREE.MeshStandardMaterial( {color: 0x889988} ); 
const floor = new THREE.Mesh( floorGeometry, floorMaterial );
floor.receiveShadow = true;
scene.add( floor );

const wallG = new THREE.BoxGeometry( wallLength, wallHeight, wallWidth ); 
const wallM = new THREE.MeshStandardMaterial( {color: 0x333333} ); 
const wallN = new THREE.Mesh( wallG, wallM ); 
wallN.position.y = wallHeight/2;
wallN.castShadow = true;
wallN.receiveShadow = true;

//let wallBounds = new THREE.Box3( new THREE.Vector3(), new THREE.Vector3() );
//wallBounds.setFromObject( wallN );
//const boundWallN = new THREE.Group();
//boundWallN.add( wallN, wallBounds );
//console.log( wallBounds );

const cell = new THREE.Group();
const wallS = wallN.clone();
wallS.position.z = wallN.position.z + ( wallLength-wallWidth);
const wallE = wallN.clone(); 
wallE.rotation.y = Math.PI/2;
wallE.position.x = wallN.position.x + ( wallLength-wallWidth ) / 2;
wallE.position.z = wallN.position.z + ( wallLength-wallWidth ) / 2;
const wallW = wallN.clone();                                     
wallW.rotation.y = -Math.PI/2;                                   
wallW.position.x = wallN.position.x - ( wallLength-wallWidth ) / 2;
wallW.position.z = wallN.position.z + ( wallLength-wallWidth ) / 2;
cell.add( wallN, wallE, wallS, wallW );

cell.position.x = -( mazeSize * wallLength ) / 2;
cell.position.z = -( mazeSize * wallLength ) / 2;
camera.position.z = ( mazeSize * wallLength ) / 2 + 10;
	
var grid = [];
for (let i=0; i<mazeSize; i++) {
	grid[i] = [];
	for (let j=0; j<mazeSize; j++) {
		const newCell = cell.clone();
		newCell.position.z = cell.position.z + i*wallLength;
		newCell.position.x = cell.position.x + j*wallLength;
		newCell.userData.z = i;
		newCell.userData.x = j;
		
		grid[i].push( newCell );
		newCell.userData.visited = false;
		scene.add( newCell );
	}	
}

//const roofG = new THREE.BoxGeometry( (mazeSize * wallLength)/2, 1, (mazeSize * wallLength) ); 
//const roof = new THREE.Mesh( roofG, wallM ); 
//roof.position.x = grid[Math.floor(mazeSize/2)][Math.floor(mazeSize/2)].position.x;// - wallLength/4
//roof.position.z = grid[Math.floor(mazeSize/2)][Math.floor(mazeSize/2)].position.z;// + wallLength/2
//roof.position.y = wallHeight;
//roof.castShadow = true;
//roof.receiveShadow = true;
//scene.add( roof );

var cellStack = []; //grid -> maze 
var entrance = grid[mazeSize-1][Math.floor(mazeSize/2)];
entrance.children[2].visible = false;
cellStack.push( entrance );
entrance.userData.visited = true;

var max = 0;
var goal;
while (cellStack.length > 0) {
	if (cellStack.length > max) {
		max = cellStack.length;
		goal = cellStack[cellStack.length-1];
	}
	
	let currentCell = cellStack.pop();
	let z = currentCell.userData.z;
	let x = currentCell.userData.x;
	let unvisitedNeighbours = [];
	
	if (grid[z-1] !== undefined  &&  grid[z-1][x] !== undefined  &&  grid[z-1][x].userData.visited == false) {
		unvisitedNeighbours.push( grid[z-1][x] );
	}	
	if (grid[z][x+1] !== undefined  &&  grid[z][x+1].userData.visited == false ) {
		unvisitedNeighbours.push( grid[z][x+1] );
	}
	if (grid[z+1] !== undefined  &&  grid[z+1][x] !== undefined  &&  grid[z+1][x].userData.visited == false ) {
		unvisitedNeighbours.push( grid[z+1][x] );
	}
	if (grid[z][x-1] !== undefined  &&  grid[z][x-1].userData.visited == false) {
		unvisitedNeighbours.push( grid[z][x-1] );
	}	
	
	if (unvisitedNeighbours.length > 0) {
		cellStack.push( currentCell );
		let chosenNeighbour = unvisitedNeighbours[ Math.floor(Math.random() * unvisitedNeighbours.length) ];
		if (z - chosenNeighbour.userData.z == 1) {//north
			currentCell.children[0].visible = false;
			chosenNeighbour.children[2].visible = false;
		}
		else if (chosenNeighbour.userData.x - x == 1) {//east
			currentCell.children[1].visible = false;
			chosenNeighbour.children[3].visible = false;
		}
		else if (chosenNeighbour.userData.z - z == 1) {//south
			currentCell.children[2].visible = false;
			chosenNeighbour.children[0].visible = false;
		}
		else if (x - chosenNeighbour.userData.x == 1) {//west
			currentCell.children[3].visible = false;
			chosenNeighbour.children[1].visible = false;
		}
		chosenNeighbour.userData.visited = true;
		cellStack.push( chosenNeighbour );
	}
}

const goalMaterial = new THREE.MeshStandardMaterial( {color: 0xffd700} ); 
for (let i=0; i<4; i++) {goal.children[i].material = goalMaterial;}

	
renderer = new THREE.WebGLRenderer( { antialias: true } );	
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor( new THREE.Color( 0xffffff ) );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	//cameraBox.copy(player.geometry.boundingBox).applyMatrix4(player.matrixWorld);
	//console.log( player );
	const time = performance.now();

	if ( controls.isLocked === true ) {
		const delta = ( time - prevTime ) / 1000;

		velocity.x -= velocity.x * 10.0 * delta; //staying in place
		velocity.z -= velocity.z * 10.0 * delta;
		velocity.y -= 1000.0 * delta; //gravity

		direction.z = Number( moveForward ) - Number( moveBackward ); //movement
		direction.x = Number( moveRight ) - Number( moveLeft );
		direction.normalize();
		if ( moveForward || moveBackward ) {velocity.z -= direction.z * 400.0 * delta;}
		if ( moveLeft || moveRight ) {velocity.x -= direction.x * 400.0 * delta;}

		controls.moveRight( - velocity.x * delta ); 
		controls.moveForward( - velocity.z * delta );
		controls.object.position.y += ( velocity.y * delta );

		if ( controls.object.position.y < 10 ) {
			velocity.y = 0;
			controls.object.position.y = 10;
		}
	}
	prevTime = time;
	renderer.render( scene, camera );
}




