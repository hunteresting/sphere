import gsap from 'gsap'
import * as THREE from 'three'

import { Lensflare, LensflareElement } from './flare.js';

import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'

const canvasContainer = document.querySelector('#canvasContainer')
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    canvasContainer.offsetWidth / canvasContainer.offsetHeight,
    0.1,
    1000)
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector('canvas')
})

renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight)
renderer.setPixelRatio(window.devicePixelRatio)

//create a sphere
const sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 50, 50), new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('./img/dot.png'),
    opacity: 0.1,
    transparent: true,
}))

scene.add(sphere)

const group = new THREE.Group()
group.add(sphere)
scene.add(group)

camera.position.z = 13


// lights

const dirLight = new THREE.DirectionalLight(0xffffff, 0.05);
dirLight.position.set(0, -1, 0).normalize();
dirLight.color.setHSL(0.1, 0.7, 0.5);
scene.add(dirLight);

// lensflares

addLight(0.55, 0.9, 0.5);
addLight(0.08, 0.8, 0.5);
addLight(0.995, 0.5, 0.9);

function addLight(h, s, l) {

    const light = new THREE.PointLight(0xffffff, 1.5, 2000000000);
    light.color.setHSL(h, s, l);
    light.position.set(0, 0, 0);
    scene.add(light);

    const textureLoader = new THREE.TextureLoader();

    const textureFlare0 = textureLoader.load('./img/lensflare0.png');
    const textureFlare3 = textureLoader.load('./img/lensflare3.png');


    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(textureFlare0, 700, 0, light.color));
    lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
    lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
    lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
    lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));
    light.add(lensflare);

    console.log(light)

}



function createPoint(lat, lng, papername, contents) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.15),
        new THREE.ShaderMaterial({
            vertexShader: atmosphereVertexShader,
            fragmentShader: atmosphereFragmentShader,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        }),

    )

    const latitude = (lat / 180) * Math.PI
    const longitude = (lng / 180) * Math.PI
    const radius = 4.7

    const x = radius * Math.cos(latitude) * Math.sin(longitude)
    const y = radius * Math.sin(latitude)
    const z = radius * Math.cos(latitude) * Math.cos(longitude)


    box.position.z = z
    box.position.x = x
    box.position.y = y

    box.lookAt(0, 0, 0)
    box.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -0.4))

    group.add(box)

    box.papername = papername
    box.contents = contents
}

function getRandomNumber() {

    var decimal;
    var random = Math.random();
    var isFirstNumber = function(number) { return ("" + random).indexOf(number) == 0; };

    switch (arguments.length) {
        case 0:
            if (isFirstNumber(0.001)) { decimal = 0; } else {
                var decimalDigits = ("" + random).replace("0.", "").length;
                var exponential = Math.floor(Math.random() * decimalDigits);
                decimal = (exponential < 1) ? random : random * Math.pow(10, exponential);
            }

            break;
        case 1:
            if (isFirstNumber(0.001)) { decimal = 0; } else {
                var max = Number(arguments[0]) || parseFloat(arguments[0]);

                if (isNaN(max) || max === 0 || isFirstNumber(0.999)) { decimal = max; } else { decimal = random * max; }
            }

            break;
        case 2:
            var temp, min, max;

            temp = (arguments[0] < arguments[1]) ? arguments[0] : arguments[1];
            min = Number(temp) || parseFloat(temp);

            temp = (arguments[0] < arguments[1]) ? arguments[1] : arguments[0];
            max = Number(temp) || parseFloat(temp);

            if (isNaN(min) || isNaN(max) || min == max) { decimal = (min == max) ? max : NaN; } else {
                if (isFirstNumber(0.001)) { decimal = min; } else if (isFirstNumber(0.999)) { decimal = max; } else { decimal = (random * (max - min)) + min; }
            }

            break;
    }

    if (isNaN(decimal)) { return { real: NaN, integer: NaN, positive: NaN, negative: NaN }; }

    if (decimal == 0) { return { real: 0, integer: 0, positive: 0, negative: 0 }; }

    return {
        real: decimal,
        integer: decimal - (decimal % 1),
        positive: (decimal < 0) ? -decimal : decimal,
        negative: (decimal > 0) ? -decimal : decimal
    };
}

for (let i = 0; i < 150; i++) {
    var a = getRandomNumber(-90, 90)
    var b = getRandomNumber(-180, 180)
    createPoint(a.real, b.real, 'ini', '무궁화 삼천리')

}



sphere.rotation.y = -Math.PI / 2

group.rotation.offset = {
    x: 0,
    y: 0
}

const mouse = {
    x: undefined,
    y: undefined,
    down: false,
    xPrev: undefined,
    yPrev: undefined
}

const raycaster = new THREE.Raycaster();
const popUpEl = document.querySelector('#popUpEl')
const headEl = document.querySelector('#headEl')
const conEl = document.querySelector('#conEl')

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    group.rotation.y += 0.0002

    /* if (mouse.x) {
        gsap.to(group.rotation, {
            x: -mouse.y * 0.5,
            y: mouse.x * 0.5,
            duration: 1.5
        })
    }*/

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(mouse, camera)

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(group.children.filter(mesh => {
        return mesh.geometry.type === "BoxGeometry"
    }))

    group.children.forEach((mesh) => {
        mesh.material.opacity = 1
    })

    gsap.set(popUpEl, {
        display: 'none'
    })

    for (let i = 0; i < intersects.length; i++) {
        const box = intersects[i].object
        box.material.opacity = 0.5

        gsap.set(popUpEl, {
            display: 'block'
        })

        headEl.innerHTML = box.papername
        conEl.innerHTML = box.contents
    }

    renderer.render(scene, camera);

}

animate()

canvasContainer.addEventListener('mousedown', ({ clientX, clientY }) => {
    mouse.down = true
    mouse.xPrev = clientX
    mouse.yPrev = clientY
})

addEventListener('mousemove', (event) => {

    mouse.x = ((event.clientX - innerWidth / 2) / innerWidth) * 2
    mouse.y = -(event.clientY / innerHeight) * 2 + 1

    gsap.set(popUpEl, {
        x: event.clientX,
        y: event.clientY
    })

    if (mouse.down) {

        const deltaX = event.clientX - mouse.xPrev
        const deltaY = event.clientY - mouse.yPrev
        group.rotation.y += deltaX * 0.005
        group.rotation.x += deltaY * 0.005
        mouse.xPrev = event.clientX
        mouse.yPrev = event.clientY

    }
})

addEventListener('mouseup', (event) => {
    mouse.down = false
})

const material = new THREE.LineBasicMaterial({
    color: 0x5A5959
});

const points = [];

const dot = group.children.filter(mesh => {
    return mesh.geometry.type === "BoxGeometry"
})

for (let i = 0; i < dot.length; i++) {
    const box = dot[i]
    points.push(new THREE.Vector3(box.position.x + 0.1, box.position.y + 0.1, box.position.z + 0.1));
}

const geometry = new THREE.BufferGeometry().setFromPoints(points);

const line = new THREE.Line(geometry, material);
line.material.linewidth = 0.1
line.material.opacity = 0.1
line.receiveShadow = true
console.log(line)

scene.add(line);
group.add(line)