// THREE CDN
import * as THREE from 'https://unpkg.com/three@0.179.0/build/three.module.js?module';

import { OrbitControls } from 'https://unpkg.com/three@0.179.0/examples/jsm/controls/OrbitControls.js?module';
import { GLTFLoader } from 'https://unpkg.com/three@0.179.0/examples/jsm/loaders/GLTFLoader.js?module';
import { VRButton } from 'https://unpkg.com/three@0.179.0/examples/jsm/webxr/VRButton.js?module';
import { XRControllerModelFactory } from 'https://unpkg.com/three@0.179.0/examples/jsm/webxr/XRControllerModelFactory.js?module';

// CONTENEDOR
const contenedorEscena3D =
document.getElementById("contenedorEscena3D");

// ESCENA
const escena = new THREE.Scene();
escena.background = new THREE.Color(0x202020);

// CAMARA
const camara = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);

camara.position.set(0,1.6,0);

const cameraRig = new THREE.Group();
cameraRig.add(camara);
escena.add(cameraRig);

// RENDER
const renderizador = new THREE.WebGLRenderer({
    antialias:true
});

renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderizador.setSize(
    window.innerWidth,
    window.innerHeight
);

renderizador.xr.enabled = true;

contenedorEscena3D.appendChild(
    renderizador.domElement
);

// BOTON VR
document.body.appendChild(
    VRButton.createButton(renderizador)
);

// VR y controlador visible
const controller1 = renderizador.xr.getController(0);
controller1.addEventListener('connected', function(event) {
    console.log('Controlador VR conectado:', event.data);
});
controller1.addEventListener('disconnected', function() {
    this.remove(this.children[0]);
});
escena.add(controller1);

const controllerModelFactory = new XRControllerModelFactory();
const controllerGrip1 = renderizador.xr.getControllerGrip(0);
controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
escena.add(controllerGrip1);

// CONTROLES
const controles = new OrbitControls(
    camara,
    renderizador.domElement
);

controles.enableDamping = true;

// LUCES
const luzAmbiente =
new THREE.AmbientLight(0xffffff,2);

escena.add(luzAmbiente);

const luzDireccional =
new THREE.DirectionalLight(0xffffff,2);

luzDireccional.position.set(5,10,5);

escena.add(luzDireccional);

// CARGADOR GLB
const isGitHub = window.location.hostname.includes('github.io');
const repoName = '4vr'; // Cambia esto si tu repo se publica desde otra ruta de repositorio
const BASE_PATH = isGitHub
    ? `/${repoName}/assets/models/`
    : './assets/models/';

const loader = new GLTFLoader().setPath(BASE_PATH);

loader.load(
    'aulay8.glb',

    function(gltf){

        const modelo = gltf.scene;

        const box = new THREE.Box3().setFromObject(modelo);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();

        box.getSize(size);
        box.getCenter(center);

        modelo.position.sub(center);
        modelo.position.y += size.y * 0.5;
        modelo.scale.set(1,1,1);

        escena.add(modelo);
    },

    undefined,

    function(error){
        console.log(error);
    }
);

// RESIZE
window.addEventListener('resize',()=>{

    camara.aspect =
    window.innerWidth/window.innerHeight;

    camara.updateProjectionMatrix();

    renderizador.setSize(
        window.innerWidth,
        window.innerHeight
    );
});

// ANIMACION
renderizador.setAnimationLoop(animar);

function animar(){

    controles.update();
    updateVRMovement();

    renderizador.render(
        escena,
        camara
    );
}

function updateVRMovement(){
    const session = renderizador.xr.getSession();
    if (!session) return;

    const xrCamera = renderizador.xr.getCamera(camara);
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const worldUp = new THREE.Vector3(0, 1, 0);
    const movementSpeed = 0.05;

    session.inputSources.forEach((inputSource) => {
        if (!inputSource.gamepad) return;

        const axes = inputSource.gamepad.axes;
        let x = 0;
        let y = 0;

        if (axes.length >= 4) {
            x = axes[2];
            y = axes[3];
        } else if (axes.length >= 2) {
            x = axes[0];
            y = axes[1];
        }

        if (Math.abs(x) < 0.15) x = 0;
        if (Math.abs(y) < 0.15) y = 0;
        if (x === 0 && y === 0) return;

        xrCamera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        right.crossVectors(forward, worldUp).normalize();

        cameraRig.position.addScaledVector(forward, -y * movementSpeed);
        cameraRig.position.addScaledVector(right, -x * movementSpeed);
    });
}