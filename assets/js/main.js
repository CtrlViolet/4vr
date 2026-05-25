// THREE CDN
import * as THREE from 'https://unpkg.com/three@0.179.0/build/three.module.js?module';

import { OrbitControls } from 'https://unpkg.com/three@0.179.0/examples/jsm/controls/OrbitControls.js?module';
import { GLTFLoader } from 'https://unpkg.com/three@0.179.0/examples/jsm/loaders/GLTFLoader.js?module';
import { VRButton } from 'https://unpkg.com/three@0.179.0/examples/jsm/webxr/VRButton.js?module';

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

camara.position.set(0,2,5);

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

        modelo.position.set(0,0,0);
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

    renderizador.render(
        escena,
        camara
    );
}