import gsap from 'gsap'
import * as THREE from 'three'
import { Lensflare, LensflareElement } from './flare.js';
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'


//Scene, cameram, renderer 생성

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

//Scene 배경 설정
scene.background = new THREE.TextureLoader().load('./img/back.png')

//틀이 될 구체 설정
const sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader
    }))

sphere.material.alphaTest = 1
sphere.material.opacity = 0
sphere.material.transparent = true

//scene에 구체 추가
scene.add(sphere)

//함께 회전할 group 생성 및 scene에 group 추가
const group = new THREE.Group()
group.add(sphere)
scene.add(group)

//발광 효과 주기 위한 EffectComposer, UnrealBloomPass, RenderPass 생성)
const effectComposer = new EffectComposer(renderer)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(window.innerWidth, window.innerHeight)
const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.strength = 3
unrealBloomPass.radius = 0.1
unrealBloomPass.threshold = 0.3
var renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)


// 배경에 별 뿌려진 듯한 효과 주기 위한 오브젝트들 생성
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


//카메라 확대 정도
camera.position.z = 10


//구체 중심부 라이팅
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

//랜덤한 큐브 배치를 위한 난수 생성 함수
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

//구체 위에 뿌려질 흰색 도트들 생성
const dots = new THREE.Group()
group.add(dots)

function createdots(lat, lng) {
    const dot = new THREE.Mesh(
        new THREE.CircleGeometry(0.015, 32),
        new THREE.MeshBasicMaterial({
            color: '#FFFFFF',
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


    dot.position.z = z
    dot.position.x = x
    dot.position.y = y

    dot.lookAt(0, 0, 0)
    dot.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -0.2))

    dots.add(dot)
}

//구체 위에 뿌려질 흰색 도트들 위치 랜덤하게 잡기
for (let i = 0; i < 1000; i++) {
    var a = getRandomNumber(-90, 90)
    var b = getRandomNumber(-180, 180)
    createdots(a.real, b.real)

}

//NLP 큐브 생성
const NLP = new THREE.Group()
group.add(NLP)

function createBlue(lat, lng, classification, title, text) {
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
    const radius = 5

    const x = radius * Math.cos(latitude) * Math.sin(longitude)
    const y = radius * Math.sin(latitude)
    const z = radius * Math.cos(latitude) * Math.cos(longitude)

    box.position.z = z
    box.position.x = x
    box.position.y = y

    box.lookAt(0, 0, 0)
    NLP.add(box)

    box.classification = classification
    box.title = title
    box.text = text
    box.longitude = lat
    box.latitude = lng
    box.thumbnail = title
    box.invisibility = false
}


for (let i = 0; i < 70; i++) {
    var a = getRandomNumber(-90, 90)
    var b = getRandomNumber(-180, 180)
    createBlue(a.real, b.real, 'Classification', 'Headline', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.')

}

//CV 큐브 생성
const CV = new THREE.Group()
group.add(CV)

function createblue2(lat, lng, classification, title, text) {
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
    const radius = 5

    const x = radius * Math.cos(latitude) * Math.sin(longitude)
    const y = radius * Math.sin(latitude)
    const z = radius * Math.cos(latitude) * Math.cos(longitude)


    box.position.z = z
    box.position.x = x
    box.position.y = y

    box.lookAt(0, 0, 0)
    CV.add(box)

    box.classification = classification
    box.title = title
    box.text = text
    box.longitude = lat
    box.latitude = lng
    box.thumbnail = title
    box.invisibility = false
}


for (let i = 0; i < 70; i++) {
    var a = getRandomNumber(-90, 90)
    var b = getRandomNumber(-180, 180)
    createblue2(a.real, b.real, 'Classification', 'Headline', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.')

}


//AIED 큐브 생성
const AIEd = new THREE.Group()
group.add(AIEd)

function createblue3(lat, lng, classification, title, text) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.15),
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

    box.classification = classification
    box.title = title
    box.text = text
    box.longitude = lat
    box.latitude = lng
    box.thumbnail = title
    box.invisibility = false
}


for (let i = 0; i < 70; i++) {
    var a = getRandomNumber(-90, 90)
    var b = getRandomNumber(-180, 180)
    createblue3(a.real, b.real, 'Classification', 'Headline', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.')

}


// 그룹 전체 회전 기본 값
group.rotation.offset = {
    x: 0,
    y: 0
}

// 마우스 위치 기본값
const mouse = {
    x: undefined,
    y: undefined,
    down: false,
    xPrev: undefined,
    yPrev: undefined
}

// 큐브에 마우스 올렸을때 뜨는 썸네일 내용/박스
const thumbnail = document.getElementById('thumbnail')
const thumbnailEl = document.getElementById('thumbnailEl')

// 큐브에 클릭 시 뜨는 논문 상세 내용/박스
const popUpEl = document.getElementById('popUpEl')
const classificationEL = document.getElementById('classEl')
const titleEl = document.getElementById('titleEl')
const textEl = document.getElementById('textEl')
const close = document.getElementById('close')
var raycaster = new THREE.Raycaster();

// Animate
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    raycaster.setFromCamera(mouse, camera)

    if (!stopstate) {
        group.rotation.y += 0.001
    }

    var intersects1 = raycaster.intersectObjects(AIEd.children);
    var intersects2 = raycaster.intersectObjects(NLP.children);
    var intersects3 = raycaster.intersectObjects(CV.children);

    gsap.set(thumbnail, {
        display: 'None'
    })

    for (let i = 0; i < intersects1.length; i++) {
        const box = intersects1[i].object

        //큐브가 정지상태가 아닐때만 썸네일이 뜨도록
        if (!stopstate) {
            gsap.set(thumbnail, {
                display: 'block'
            })
        }
        thumbnailEl.innerHTML = box.thumbnail
    }

    for (let i = 0; i < intersects2.length; i++) {
        const box = intersects2[i].object
        if (!stopstate) {
            gsap.set(thumbnail, {
                display: 'block'
            })
        }
        thumbnailEl.innerHTML = box.thumbnail
    }

    for (let i = 0; i < intersects3.length; i++) {
        const box = intersects3[i].object
        if (!stopstate) {
            gsap.set(thumbnail, {
                display: 'block'
            })
        }
        thumbnailEl.innerHTML = box.thumbnail
    }

    renderer.render(scene, camera);
    effectComposer.render();
}

animate()


//마우스 드래그 시 구체 회전하도록 설정
canvasContainer.addEventListener('mousedown', ({ clientX, clientY }) => {
    if (!stopstate) {
        mouse.down = true
        mouse.xPrev = clientX
        mouse.yPrev = clientY
    }
})
addEventListener('mousemove', (event) => {

    mouse.x = ((event.clientX - innerWidth / 2) / innerWidth) * 2 - 0.01
    mouse.y = -(event.clientY / innerHeight) * 2 + 1


    gsap.set(thumbnail, {
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


//AIED 큐브들을 잇는 선
const material1 = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
    alphaTest: 1
});

//NLP 큐브들을 잇는 선
const material2 = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
    alphaTest: 1
});

//CV 큐브들을 잇는 선
const material3 = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
    alphaTest: 1
});


//박스 위치를 저장하고 그 박스들 끼리 연결하는 선 생성
const AIEdpoints = [];
const NLPpoints = [];
const CVpoints = [];
for (let i = 0; i < AIEd.children.length; i++) {
    const box = AIEd.children[i]
    AIEdpoints.push(new THREE.Vector3(box.position.x, box.position.y, box.position.z));
}
for (let i = 0; i < NLP.children.length; i++) {
    const box = NLP.children[i]
    NLPpoints.push(new THREE.Vector3(box.position.x, box.position.y, box.position.z));
}
for (let i = 0; i < CV.children.length; i++) {
    const box = CV.children[i]
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

//좌측 상단에 클릭 시 해당 종류의 큐브만 필터링 해서 볼 수 있는 부분
//큐브가 클릭 중이지 않을 때만 활성화
//선택한 큐브 종류를 제외한 나머지 큐브들+선의 투명도 조절 
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

    if (!stopstate) {
        for (let i = 0; i < AIEd.children.length; i++) {
            const box = AIEd.children[i]
            if (box.material.opacity = 0.2) {
                box.material.opacity = 1
                box.invisibility = false
            } else {
                box.material.opacity = 0.2
                box.invisibility = true
            }
        }
        for (let i = 0; i < NLP.children.length; i++) {
            const box = NLP.children[i]
            box.material.opacity = 0.2
            box.invisibility = true
        }
        for (let i = 0; i < CV.children.length; i++) {
            const box = CV.children[i]
            box.material.opacity = 0.2
            box.invisibility = true
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
    }
});

NLPblock.addEventListener('click', () => {
    if (!stopstate) {
        for (let i = 0; i < AIEd.children.length; i++) {
            const box = AIEd.children[i]
            box.material.opacity = 0.2
            box.invisibility = true
        }
        for (let i = 0; i < NLP.children.length; i++) {
            const box = NLP.children[i]
            if (box.material.opacity = 0.2) {
                box.material.opacity = 1
                box.invisibility = false
            } else {
                box.material.opacity = 0.2
                box.invisibility = true
            }
        }
        for (let i = 0; i < CV.children.length; i++) {
            const box = CV.children[i]
            box.material.opacity = 0.2
            box.invisibility = true
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
    }
});

CVblock.addEventListener('click', () => {
    if (!stopstate) {
        for (let i = 0; i < AIEd.children.length; i++) {
            const box = AIEd.children[i]
            box.material.opacity = 0.2
            box.invisibility = true
        }
        for (let i = 0; i < NLP.children.length; i++) {
            const box = NLP.children[i]
            box.material.opacity = 0.2
            box.invisibility = true
        }
        for (let i = 0; i < CV.children.length; i++) {
            const box = CV.children[i]
            if (box.material.opacity = 0.2) {
                box.material.opacity = 1
                box.invisibility = false
            } else {
                box.material.opacity = 0.2
                box.invisibility = true
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
    }
});

//전체 선택 시 원복
Allblock.addEventListener('click', () => {
    if (!stopstate) {
        for (let i = 0; i < AIEd.children.length; i++) {
            const box = AIEd.children[i]
            box.material.opacity = 1
            box.invisibility = false

        }
        for (let i = 0; i < NLP.children.length; i++) {
            const box = NLP.children[i]
            box.material.opacity = 1
            box.invisibility = false
        }
        for (let i = 0; i < CV.children.length; i++) {
            const box = CV.children[i]
            box.material.opacity = 1
            box.invisibility = false
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
    }
});

// 구체 회전 멈추는 조건값
var stopstate = false

// 큐브 클릭 시 큐브 선택
window.addEventListener('click', boxClick, false);

var raycaster2 = new THREE.Raycaster();
var mouse2 = new THREE.Vector2();

function boxClick(event) {

    event.preventDefault();
    mouse2.x = ((event.clientX - renderer.domElement.clientWidth / 2) / renderer.domElement.clientWidth) * 2
    mouse2.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster2.setFromCamera(mouse2, camera);
    var intersects1 = raycaster2.intersectObjects(AIEd.children);
    var intersects2 = raycaster2.intersectObjects(NLP.children);
    var intersects3 = raycaster2.intersectObjects(CV.children);

    for (let i = 0; i < intersects1.length; i++) {

        const box = intersects1[i].object
        const state = box.invisibility

        if (!state) {
            for (let i = 0; i < AIEd.children.length; i++) {
                const box = AIEd.children[i]
                box.material.opacity = 0.2
                box.invisibility = true
            }
            for (let i = 0; i < NLP.children.length; i++) {
                const box = NLP.children[i]
                box.material.opacity = 0.2
                box.invisibility = true
            }
            for (let i = 0; i < CV.children.length; i++) {
                const box = CV.children[i]
                box.material.opacity = 0.2
                box.invisibility = true
            }
            for (let i = 0; i < dots.children.length; i++) {
                const dot = dots.children[i]
                dot.material.opacity = 0.2
            }

            box.material.opacity = 1
            effectComposer.addPass(unrealBloomPass)

            line1.material.opacity = 0.1
            line2.material.opacity = 0.1
            line3.material.opacity = 0.1

            Allbox.setAttribute("id", "Allbox")
            Allp.setAttribute("id", "Allp")
            AIEdbox.setAttribute("id", "AIEdbox")
            AIEdp.setAttribute("id", "AIEdp")
            NLPbox.setAttribute("id", "NLPbox")
            NLPp.setAttribute("id", "NLPp")
            CVbox.setAttribute("id", "CVbox")
            CVp.setAttribute("id", "CVp")

            gsap.to(group.rotation, 1, { x: box.longitude * (Math.PI / 180) });
            gsap.to(group.rotation, 1, { y: -box.latitude * (Math.PI / 180) });

            gsap.to(camera.position, 1, { z: 7 });

            gsap.set(popUpEl, {
                display: 'block'
            })

            stopstate = true

            classificationEL.innerHTML = box.classification
            titleEl.innerHTML = box.title
            textEl.innerHTML = box.text

            close.addEventListener('click', () => {
                gsap.set(popUpEl, {
                    display: 'None'
                })

                stopstate = false
                gsap.to(camera.position, 1, { z: 10 });

                for (let i = 0; i < AIEd.children.length; i++) {
                    const box = AIEd.children[i]
                    box.material.opacity = 1
                    box.invisibility = false
                }
                for (let i = 0; i < NLP.children.length; i++) {
                    const box = NLP.children[i]
                    box.material.opacity = 1
                    box.invisibility = false
                }
                for (let i = 0; i < CV.children.length; i++) {
                    const box = CV.children[i]
                    box.material.opacity = 1
                    box.invisibility = false
                }
                for (let i = 0; i < dots.children.length; i++) {
                    const dot = dots.children[i]
                    dot.material.opacity = 1
                }

                line1.material.opacity = 0.3
                line2.material.opacity = 0.3
                line3.material.opacity = 0.3

                effectComposer.removePass(unrealBloomPass)
            })
        }
    }

    for (let i = 0; i < intersects2.length; i++) {

        const box = intersects2[i].object
        const state = box.invisibility

        if (!state) {
            for (let i = 0; i < AIEd.children.length; i++) {
                const box = AIEd.children[i]
                box.material.opacity = 0.2
                box.invisibility = true
            }
            for (let i = 0; i < NLP.children.length; i++) {
                const box = NLP.children[i]
                box.material.opacity = 0.2
                box.invisibility = true
            }
            for (let i = 0; i < CV.children.length; i++) {
                const box = CV.children[i]
                box.material.opacity = 0.2
                box.invisibility = true
            }
            for (let i = 0; i < dots.children.length; i++) {
                const dot = dots.children[i]
                dot.material.opacity = 0.2
            }

            box.material.opacity = 1
            effectComposer.addPass(unrealBloomPass)

            line1.material.opacity = 0.1
            line2.material.opacity = 0.1
            line3.material.opacity = 0.1

            Allbox.setAttribute("id", "Allbox")
            Allp.setAttribute("id", "Allp")
            AIEdbox.setAttribute("id", "AIEdbox")
            AIEdp.setAttribute("id", "AIEdp")
            NLPbox.setAttribute("id", "NLPbox")
            NLPp.setAttribute("id", "NLPp")
            CVbox.setAttribute("id", "CVbox")
            CVp.setAttribute("id", "CVp")

            gsap.set(popUpEl, {
                display: 'block'
            })

            gsap.set(thumbnail, {
                display: 'None'
            })

            stopstate = true

            gsap.to(group.rotation, 1, { x: box.longitude * (Math.PI / 180) });
            gsap.to(group.rotation, 1, { y: -box.latitude * (Math.PI / 180) });

            gsap.to(camera.position, 1, { z: 7 });

            classificationEL.innerHTML = box.classification
            titleEl.innerHTML = box.title
            textEl.innerHTML = box.text

            close.addEventListener('click', () => {
                gsap.set(popUpEl, {
                    display: 'None'
                })
                stopstate = false
                gsap.to(camera.position, 1, { z: 10 });

                for (let i = 0; i < AIEd.children.length; i++) {
                    const box = AIEd.children[i]
                    box.material.opacity = 1
                    box.invisibility = false
                }
                for (let i = 0; i < NLP.children.length; i++) {
                    const box = NLP.children[i]
                    box.material.opacity = 1
                    box.invisibility = false
                }
                for (let i = 0; i < CV.children.length; i++) {
                    const box = CV.children[i]
                    box.material.opacity = 1
                    box.invisibility = false
                }
                for (let i = 0; i < dots.children.length; i++) {
                    const dot = dots.children[i]
                    dot.material.opacity = 1
                }

                line1.material.opacity = 0.3
                line2.material.opacity = 0.3
                line3.material.opacity = 0.3

                effectComposer.removePass(unrealBloomPass)
            })

        }
    }

    for (let i = 0; i < intersects3.length; i++) {

        const box = intersects3[i].object
        const state = box.invisibility

        if (!state) {
            for (let i = 0; i < AIEd.children.length; i++) {
                const box = AIEd.children[i]
                box.material.opacity = 0.2
                box.invisibility = true
            }
            for (let i = 0; i < NLP.children.length; i++) {
                const box = NLP.children[i]
                box.material.opacity = 0.2
                box.invisibility = true
            }
            for (let i = 0; i < CV.children.length; i++) {
                const box = CV.children[i]
                box.material.opacity = 0.2
                box.invisibility = true
            }
            for (let i = 0; i < dots.children.length; i++) {
                const dot = dots.children[i]
                dot.material.opacity = 0.2
            }

            box.material.opacity = 1
            effectComposer.addPass(unrealBloomPass)

            line1.material.opacity = 0.1
            line2.material.opacity = 0.1
            line3.material.opacity = 0.1

            Allbox.setAttribute("id", "Allbox")
            Allp.setAttribute("id", "Allp")
            AIEdbox.setAttribute("id", "AIEdbox")
            AIEdp.setAttribute("id", "AIEdp")
            NLPbox.setAttribute("id", "NLPbox")
            NLPp.setAttribute("id", "NLPp")
            CVbox.setAttribute("id", "CVbox")
            CVp.setAttribute("id", "CVp")

            gsap.set(popUpEl, {
                display: 'block'
            })

            stopstate = true

            gsap.to(group.rotation, 1, { x: box.longitude * (Math.PI / 180) });
            gsap.to(group.rotation, 1, { y: -box.latitude * (Math.PI / 180) });

            gsap.to(camera.position, 1, { z: 7 });

            classificationEL.innerHTML = box.classification
            titleEl.innerHTML = box.title
            textEl.innerHTML = box.text

            close.addEventListener('click', () => {

                gsap.set(popUpEl, {
                    display: 'None'
                })
                stopstate = false
                gsap.to(camera.position, 1, { z: 10 });

                for (let i = 0; i < AIEd.children.length; i++) {
                    const box = AIEd.children[i]
                    box.material.opacity = 1
                    box.invisibility = false
                }
                for (let i = 0; i < NLP.children.length; i++) {
                    const box = NLP.children[i]
                    box.material.opacity = 1
                    box.invisibility = false
                }
                for (let i = 0; i < CV.children.length; i++) {
                    const box = CV.children[i]
                    box.material.opacity = 1
                    box.invisibility = false
                }
                for (let i = 0; i < dots.children.length; i++) {
                    const dot = dots.children[i]
                    dot.material.opacity = 1
                }

                line1.material.opacity = 0.3
                line2.material.opacity = 0.3
                line3.material.opacity = 0.3

                effectComposer.removePass(unrealBloomPass)
            })

        }
    }
}