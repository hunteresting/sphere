import gsap from 'gsap'
import * as THREE from 'three'

import { Lensflare, LensflareElement } from './flare.js';
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'


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

scene.background = new THREE.Color(0x01152E)

renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight)
renderer.setPixelRatio(window.devicePixelRatio)

const sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader
    }))

sphere.material.alphaTest = 1
sphere.material.opacity = 0
sphere.material.transparent = true

scene.add(sphere)

const group = new THREE.Group()
group.add(sphere)
scene.add(group)

const starVertices = []
for (let i = 0; i < 500; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = -Math.random() * 3000
    starVertices.push(x, y, z)
}

const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
    color: 0x80B6FF
})

starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starVertices, 3)
)

const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars)

camera.position.z = 10

// lensflares

const light = new THREE.Light(0xffffff, 1.5, 2000);
light.color.setHSL(0.995, 0.5, 0.9);

const textureLoader = new THREE.TextureLoader();
const textureFlare3 = textureLoader.load('./img/lensflare3.png');


const lensflare = new Lensflare();

lensflare.addElement(new LensflareElement(textureFlare3, 500, 0.6));
lensflare.addElement(new LensflareElement(textureFlare3, 1000, 0.7));


light.add(lensflare);
light.position.set(0, 0, 0);
scene.add(light);

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

function createdots(lat, lng) {
    const dot = new THREE.Mesh(
        new THREE.CircleGeometry(0.015, 32),
        new THREE.MeshBasicMaterial({
            color: '#FFFFFF',
        }),

    )

    const latitude = (lat / 180) * Math.PI
    const longitude = (lng / 180) * Math.PI
    const radius = 4.7

    const x = radius * Math.cos(latitude) * Math.sin(longitude)
    const y = radius * Math.sin(latitude)
    const z = radius * Math.cos(latitude) * Math.cos(longitude)


    dot.position.z = z
    dot.position.x = x
    dot.position.y = y

    dot.lookAt(0, 0, 0)
    dot.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -0.2))

    group.add(dot)
}


for (let i = 0; i < 1000; i++) {
    var a = getRandomNumber(-90, 90)
    var b = getRandomNumber(-180, 180)
    createdots(a.real, b.real)

}

const boxes = new THREE.Group
const NLP = new THREE.Group()
group.add(NLP)
group.add(boxes)

function createBlue(lat, lng, papername, contents) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.15),
        new THREE.MeshBasicMaterial({
            color: '#8097f9',
            opacity: 1,
            transparent: true
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
    NLP.add(box)

    box.papername = papername
    box.contents = contents
}


for (let i = 0; i < 70; i++) {
    var a = getRandomNumber(-90, 90)
    var b = getRandomNumber(-180, 180)
    createBlue(a.real, b.real, 'Classification', 'Headline')

}

const CV = new THREE.Group()
group.add(CV)

function createblue2(lat, lng, papername, contents) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.15),
        new THREE.MeshBasicMaterial({
            color: '#82d3ff',
            opacity: 1,
            transparent: true
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
    CV.add(box)

    box.papername = papername
    box.contents = contents
}


for (let i = 0; i < 70; i++) {
    var a = getRandomNumber(-90, 90)
    var b = getRandomNumber(-180, 180)
    createblue2(a.real, b.real, 'Classification', 'Headline')

}

const AIEd = new THREE.Group()
group.add(AIEd)


function createblue3(lat, lng, papername, contents) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.2),
        new THREE.MeshBasicMaterial({
            color: '#1462ff',
            opacity: 1,
            transparent: true
        }),

    )

    const latitude = (lat / 180) * Math.PI
    const longitude = (lng / 180) * Math.PI
    const radius = 5

    const x = radius * Math.cos(latitude) * Math.sin(longitude)
    const y = radius * Math.sin(latitude)
    const z = radius * Math.cos(latitude) * Math.cos(longitude)


    box.position.z = z
    box.position.x = x
    box.position.y = y

    box.lookAt(0, 0, 0)
    AIEd.add(box)

    box.papername = papername
    box.contents = contents
}


for (let i = 0; i < 70; i++) {
    var a = getRandomNumber(-90, 90)
    var b = getRandomNumber(-180, 180)
    createblue3(a.real, b.real, 'Classification', 'Headline')

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

    raycaster.setFromCamera(mouse, camera)

    const intersects1 = raycaster.intersectObjects(AIEd.children.filter(mesh => {
        return mesh.geometry.type === "BoxGeometry"
    }))
    const intersects2 = raycaster.intersectObjects(NLP.children.filter(mesh => {
        return mesh.geometry.type === "BoxGeometry"
    }))
    const intersects3 = raycaster.intersectObjects(CV.children.filter(mesh => {
        return mesh.geometry.type === "BoxGeometry"
    }))

    gsap.set(popUpEl, {
        display: 'none'
    })

    for (let i = 0; i < intersects1.length; i++) {

        const box = intersects1[i].object

        gsap.set(popUpEl, {
            display: 'block'
        })

        headEl.innerHTML = box.papername
        conEl.innerHTML = box.contents
    }

    for (let i = 0; i < intersects2.length; i++) {

        const box = intersects2[i].object

        gsap.set(popUpEl, {
            display: 'block'
        })

        headEl.innerHTML = box.papername
        conEl.innerHTML = box.contents
    }

    for (let i = 0; i < intersects3.length; i++) {

        const box = intersects3[i].object

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


    if (innerWidth >= 1280) {
        mouse.x = ((event.clientX - innerWidth / 2) / innerWidth) * 2
        mouse.y = -(event.clientY / innerHeight) * 2 + 1
    } else {
        const offset = canvasContainer.getBoundingClientRect().top
        mouse.x = (event.clientX / innerWidth) * 2 - 1
        mouse.y = -((event.clientY - offset) / innerHeight) * 2 + 1
        console.log(mouse.y)
    }

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

addEventListener('mouseup', () => {
    mouse.down = false
})

const material1 = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
    alphaTest: 1
});

const material2 = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
    alphaTest: 1
});

const material3 = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
    alphaTest: 1
});

const AIEdpoints = [];
const NLPpoints = [];
const CVpoints = [];

const AIEddot = AIEd.children.filter(mesh => {
    return mesh.geometry.type === "BoxGeometry"
})

const NLPdot = NLP.children.filter(mesh => {
    return mesh.geometry.type === "BoxGeometry"
})

const CVdot = CV.children.filter(mesh => {
    return mesh.geometry.type === "BoxGeometry"
})

for (let i = 0; i < AIEddot.length; i++) {
    const box = AIEddot[i]
    AIEdpoints.push(new THREE.Vector3(box.position.x, box.position.y, box.position.z));
}

for (let i = 0; i < NLPdot.length; i++) {
    const box = NLPdot[i]
    NLPpoints.push(new THREE.Vector3(box.position.x, box.position.y, box.position.z));
}

for (let i = 0; i < CVdot.length; i++) {
    const box = CVdot[i]
    CVpoints.push(new THREE.Vector3(box.position.x, box.position.y, box.position.z));
}

const geometry1 = new THREE.BufferGeometry().setFromPoints(AIEdpoints);
const line1 = new THREE.Line(geometry1, material1);

const geometry2 = new THREE.BufferGeometry().setFromPoints(NLPpoints);
const line2 = new THREE.Line(geometry2, material2);

const geometry3 = new THREE.BufferGeometry().setFromPoints(CVpoints);
const line3 = new THREE.Line(geometry3, material3);

scene.add(line1)
scene.add(line2)
scene.add(line3)
group.add(line1)
group.add(line2)
group.add(line3)

const AIEdblock = document.getElementById("AIEd")
const AIEdbox = document.getElementById("AIEdbox")
const AIEdp = document.getElementById("AIEdp")
const NLPblock = document.getElementById("NLP")
const NLPbox = document.getElementById("NLPbox")
const NLPp = document.getElementById("NLPp")
const CVblock = document.getElementById("CV")
const CVbox = document.getElementById("CVbox")
const CVp = document.getElementById("CVp")
const Allblock = document.getElementById("All")
const Allbox = document.getElementById("Allbox")
const Allp = document.getElementById("Allp")


AIEdblock.addEventListener('click', () => {
    for (let i = 0; i < AIEd.children.length; i++) {
        const box = AIEd.children[i]
        if (box.material.opacity = 0.2) {
            box.material.opacity = 1
        } else {
            box.material.opacity = 0.2
        }
    }
    for (let i = 0; i < NLP.children.length; i++) {
        const box = NLP.children[i]
        box.material.opacity = 0.2
    }
    for (let i = 0; i < CV.children.length; i++) {
        const box = CV.children[i]
        box.material.opacity = 0.2
    }
    line1.material.opacity = 0.3
    line2.material.opacity = 0.1
    line3.material.opacity = 0.1

    Allbox.setAttribute("id", "Allboxc")
    Allp.setAttribute("id", "Allpc")
    AIEdbox.setAttribute("id", "AIEdbox")
    AIEdp.setAttribute("id", "AIEdp")
    NLPbox.setAttribute("id", "NLPboxc")
    NLPp.setAttribute("id", "NLPpc")
    CVbox.setAttribute("id", "CVboxc")
    CVp.setAttribute("id", "CVpc")

});

NLPblock.addEventListener('click', () => {
    for (let i = 0; i < AIEd.children.length; i++) {
        const box = AIEd.children[i]
        box.material.opacity = 0.2
    }
    for (let i = 0; i < NLP.children.length; i++) {
        const box = NLP.children[i]
        if (box.material.opacity = 0.2) {
            box.material.opacity = 1
        } else {
            box.material.opacity = 0.2
        }
    }
    for (let i = 0; i < CV.children.length; i++) {
        const box = CV.children[i]
        box.material.opacity = 0.2
    }
    line1.material.opacity = 0.1
    line2.material.opacity = 0.3
    line3.material.opacity = 0.1

    Allbox.setAttribute("id", "Allboxc")
    Allp.setAttribute("id", "Allpc")
    AIEdbox.setAttribute("id", "AIEdboxc")
    AIEdp.setAttribute("id", "AIEdpc")
    NLPbox.setAttribute("id", "NLPbox")
    NLPp.setAttribute("id", "NLPp")
    CVbox.setAttribute("id", "CVboxc")
    CVp.setAttribute("id", "CVpc")
});

CVblock.addEventListener('click', () => {
    for (let i = 0; i < AIEd.children.length; i++) {
        const box = AIEd.children[i]
        box.material.opacity = 0.2
    }
    for (let i = 0; i < NLP.children.length; i++) {
        const box = NLP.children[i]
        box.material.opacity = 0.2
    }
    for (let i = 0; i < CV.children.length; i++) {
        const box = CV.children[i]
        if (box.material.opacity = 0.2) {
            box.material.opacity = 1
        } else {
            box.material.opacity = 0.2
        }
    }
    line1.material.opacity = 0.1
    line2.material.opacity = 0.1
    line3.material.opacity = 0.3

    Allbox.setAttribute("id", "Allboxc")
    Allp.setAttribute("id", "Allpc")
    AIEdbox.setAttribute("id", "AIEdboxc")
    AIEdp.setAttribute("id", "AIEdpc")
    NLPbox.setAttribute("id", "NLPboxc")
    NLPp.setAttribute("id", "NLPpc")
    CVbox.setAttribute("id", "CVbox")
    CVp.setAttribute("id", "CVp")
});

Allblock.addEventListener('click', () => {
    for (let i = 0; i < AIEd.children.length; i++) {
        const box = AIEd.children[i]
        box.material.opacity = 1
    }
    for (let i = 0; i < NLP.children.length; i++) {
        const box = NLP.children[i]
        box.material.opacity = 1
    }
    for (let i = 0; i < CV.children.length; i++) {
        const box = CV.children[i]
        box.material.opacity = 1
    }
    line1.material.opacity = 0.3
    line2.material.opacity = 0.3
    line3.material.opacity = 0.3

    Allbox.setAttribute("id", "Allbox")
    Allp.setAttribute("id", "Allp")
    AIEdbox.setAttribute("id", "AIEdbox")
    AIEdp.setAttribute("id", "AIEdp")
    NLPbox.setAttribute("id", "NLPbox")
    NLPp.setAttribute("id", "NLPp")
    CVbox.setAttribute("id", "CVbox")
    CVp.setAttribute("id", "CVp")
});



var scene2 = new THREE.Scene();

var renderer2 = new THREE.WebGLRenderer({ antialias: true });
renderer2.autoClear = false;
renderer2.setSize(window.innerWidth, window.innerHeight);
renderer2.setClearColor(0x101000);
document.body.appendChild(renderer2.domElement)

AIEd.children.forEach(element => {
    element.addEventListener("click", () => {
        scene2.add(element);

        renderScene = new THREE.RenderPass(scene2, camera);
        bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,
            0.4,
            0.85
        );
        bloomPass.threshold = 0.21;
        bloomPass.strength = 1.5;
        bloomPass.radius = 0.65;
        bloomPass.renderToScreen = true;

        composer = new THREE.EffectComposer(renderer);
        composer.setSize(window.innerWidth, window.innerHeight);

        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        renderer2.clear();
        composer.render();
        renderer2.render(scene2, camera);
    })
})