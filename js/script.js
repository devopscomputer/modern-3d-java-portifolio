// Configurações iniciais para Three.js e partículas
let body,
  mainContainer,
  scene,
  renderer,
  camera,
  cameraLookAt = new THREE.Vector3(0, 0, 0),
  cameraTarget = new THREE.Vector3(0, 0, 800),
  windowWidth,
  windowHeight,
  windowHalfWidth,
  windowHalfHeight,
  mouseX = 0,
  mouseY = 0,
  colors = ['#F7A541', '#F45D4C', '#FA2E59', '#4783c3', '#9c6cb7'],
  graphics,
  currentGraphic = 0,
  graphicCanvas,
  gctx,
  canvasWidth = 240,
  canvasHeight = 240,
  graphicPixels = [],
  particles = [],
  graphicOffsetX = canvasWidth / 2,
  graphicOffsetY = canvasHeight / 4;

// -----------------------
// Setup stage
// -----------------------
const initStage = () => {
  body = document.querySelector('body');
  mainContainer = document.querySelector('#main');

  setWindowSize();

  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('mousemove', onMouseMove, false);
};

// -----------------------
// Setup scene
// -----------------------
const initScene = () => {
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(windowWidth, windowHeight);
  mainContainer.appendChild(renderer.domElement);

  scene.background = new THREE.Color(0xFFFFFF);
};

// -----------------------
// Setup camera
// -----------------------
const initCamera = () => {
  const fieldOfView = 75;
  const aspectRatio = windowWidth / windowHeight;
  const nearPlane = 1;
  const farPlane = 3000;
  camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
  camera.position.z = 800;
};

// -----------------------
// Setup canvas
// -----------------------
const initCanvas = () => {
  graphicCanvas = document.createElement('canvas');
  graphicCanvas.width = canvasWidth;
  graphicCanvas.height = canvasHeight;
  gctx = graphicCanvas.getContext('2d');
  graphics = document.querySelectorAll('.intro-cell > img');
};

// -----------------------
// Setup light
// -----------------------
const initLights = () => {
  const shadowLight = new THREE.DirectionalLight(0xffffff, 2);
  shadowLight.position.set(20, 0, 10);
  scene.add(shadowLight);

  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(-20, 0, 20);
  scene.add(light);

  const backLight = new THREE.DirectionalLight(0xffffff, 1);
  backLight.position.set(0, 0, -20);
  scene.add(backLight);
};

// -----------------------
// Setup particles
// -----------------------
function Particle() {
  this.vx = Math.random() * 0.05;
  this.vy = Math.random() * 0.05;
}

Particle.prototype.init = function (i) {
  const particle = new THREE.Object3D();
  const geometryCore = new THREE.SphereGeometry(2, 8, 8); // Geometria da partícula
  const materialCore = new THREE.MeshBasicMaterial({
    color: colors[i % colors.length]
  });

  const box = new THREE.Mesh(geometryCore, materialCore);

  const pos = getGraphicPos(graphicPixels[i]);
  particle.targetPosition = new THREE.Vector3(pos.x, pos.y, pos.z);

  particle.position.set(windowWidth * 0.5, windowHeight * 0.5, -10 * Math.random() + 20);
  randomPos(particle.position);

  particle.add(box);
  this.particle = particle;
};

Particle.prototype.updateRotation = function () {
  this.particle.rotation.x += this.vx;
  this.particle.rotation.y += this.vy;
};

Particle.prototype.updatePosition = function () {
  this.particle.position.lerp(this.particle.targetPosition, 0.1);
};

const updateParticles = () => {
  particles.forEach((p) => {
    p.updateRotation();
    p.updatePosition();
  });
};

const getGraphicPos = (pixel) => {
  const posX = (pixel.x - graphicOffsetX - Math.random() * 4 - 2) * 3;
  const posY = (pixel.y - graphicOffsetY - Math.random() * 4 - 2) * 3;
  const posZ = -20 * Math.random() + 40;

  return { x: posX, y: posY, z: posZ };
};

const setParticles = () => {
  graphicPixels.forEach((_, i) => {
    if (particles[i]) {
      const pos = getGraphicPos(graphicPixels[i]);
      particles[i].particle.targetPosition.set(pos.x, pos.y, pos.z);
    } else {
      const p = new Particle();
      p.init(i);
      scene.add(p.particle);
      particles[i] = p;
    }
  });

  for (let i = graphicPixels.length; i < particles.length; i++) {
    randomPos(particles[i].particle.targetPosition, true);
  }

  console.log('Total Particles: ' + particles.length);
};

// -----------------------
// Random position
// -----------------------
function randomPos(vector, outFrame = false) {
  const radius = outFrame ? windowWidth * 5 : windowWidth * -2;
  const centerX = 0;
  const centerY = 0;

  const r = windowWidth + radius * Math.random();
  const angle = Math.random() * Math.PI * 2;

  vector.x = centerX + r * Math.cos(angle);
  vector.y = centerY + r * Math.sin(angle);
  vector.z = Math.random() * windowWidth;
}

// -----------------------
// Update canvas
// -----------------------
const updateGraphic = () => {
  const img = graphics[currentGraphic];
  if (img && img.complete) {
    gctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

    const gData = gctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
    graphicPixels = [];

    for (let i = gData.length; i >= 0; i -= 4) {
      if (gData[i] === 0) {
        const x = (i / 4) % canvasWidth;
        const y = canvasHeight - Math.floor(i / (4 * canvasWidth));
        if (x % 2 === 0 && y % 2 === 0) {
          graphicPixels.push({ x, y });
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      randomPos(particles[i].particle.targetPosition);
    }

    setTimeout(() => {
      setParticles();
    }, 500);
  }
};

// -----------------------
// Setup background objects
// -----------------------
const initBgObjects = () => {
  for (let i = 0; i < 40; i++) {
    createBgObject(i);
  }
};

const createBgObject = (i) => {
  const geometry = new THREE.SphereGeometry(10, 6, 6);
  const material = new THREE.MeshBasicMaterial({ color: 0xdddddd });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  sphere.position.set(
    Math.random() * windowWidth * 2 - windowWidth,
    Math.random() * windowHeight * 2 - windowHeight,
    Math.random() * -2000 - 200
  );
};

// -----------------------
// Setup slider
// -----------------------
const initSlider = () => {
  const elem = document.querySelector('.intro-carousel');

  const flkty = new Flickity(elem, {
    cellAlign: 'center',
    pageDots: false,
    wrapAround: true,
    resize: true,
  });

  flkty.on('select', () => {
    currentGraphic = flkty.selectedIndex;
    updateGraphic();
  });
};

const onMouseMove = (event) => {
  mouseX = event.clientX - windowHalfWidth;
  mouseY = event.clientY - windowHalfHeight;
  cameraTarget.x = (mouseX * -1) / 2;
  cameraTarget.y = mouseY / 2;
};

const onWindowResize = () => {
  setWindowSize();

  camera.aspect = windowWidth / windowHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(windowWidth, windowHeight);
};

const setWindowSize = () => {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  windowHalfWidth = windowWidth / 2;
  windowHalfHeight = windowHeight / 2;
};

const animate = () => {
  requestAnimationFrame(animate);
  updateParticles();
  camera.position.lerp(cameraTarget, 0.2);
  camera.lookAt(cameraLookAt);
  render();
};

const render = () => {
  renderer.render(scene, camera);
};

initStage();
initScene();
initCanvas();
initCamera();
initSlider();
initBgObjects();
updateGraphic();
animate();

// -----------------------
// Função atrasada (6 segundos) para o efeito de texto
// -----------------------
setTimeout(() => {
  var COLOR = "black"; // Cor padrão
  var MESSAGE = document.getElementById("title-desktop").textContent;

  var FONT_SIZE = 60;
  var AMOUNT = 3000;
  var CLEAR_AMOUNT = 2;
  var SIZE = 2;
  var INITIAL_DISPLACEMENT = 100;
  var INITIAL_VELOCITY = 5;
  var VELOCITY_RETENTION = 0.95;
  var SETTLE_SPEED = 1;
  var FLEE_SPEED = 1;
  var FLEE_DISTANCE = 50;
  var FLEE = true;
  var SCATTER_VELOCITY = 3;
  var SCATTER = true;

  // Usar as mesmas cores das partículas definidas anteriormente
  var textColors = colors;

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    MESSAGE = document.getElementById("title-mobile").textContent;
    FONT_SIZE = 30;
    AMOUNT = 200;
    SIZE = 1;
    INITIAL_DISPLACEMENT = 100;
    SETTLE_SPEED = 1;
    FLEE = false;
    SCATTER_VELOCITY = 2;
  }

  FLEE_SPEED /= 10;
  SETTLE_SPEED /= 100;
  SCATTER_VELOCITY *= 10;
  var CLEAR_RADIUS = Math.round(CLEAR_AMOUNT + SIZE);
  var MOVED_O = Array.apply(null, Array(AMOUNT)).map(function () {
    return null;
  });

  const canvas = document.getElementById("spring-text");
  const ctx = canvas.getContext("2d");
  var POINTS = [];
  var MOVED = [];
  var moved_length = 0;
  var MOUSE = {
    x: 0,
    y: 0
  };

  function Point(x, y, r, g, b, a) {
    var angle = Math.random() * 6.28;
    this.dest_x = x;
    this.dest_y = y;

    // Usar as cores das partículas para o texto
    var colorIndex = Math.floor(Math.random() * textColors.length);
    var selectedColor = textColors[colorIndex];

    this.r = parseInt(selectedColor.slice(1, 3), 16);
    this.g = parseInt(selectedColor.slice(3, 5), 16);
    this.b = parseInt(selectedColor.slice(5, 7), 16);
    this.a = a;

    this.lastx = 0;
    this.lasty = 0;
    this.x = canvas.width / 2 - x + (Math.random() - 0.5) * INITIAL_DISPLACEMENT;
    this.y = canvas.height / 2 - y + (Math.random() - 0.5) * INITIAL_DISPLACEMENT;
    this.velx = INITIAL_VELOCITY * Math.cos(angle);
    this.vely = INITIAL_VELOCITY * Math.sin(angle);
    this.target_x = canvas.width / 2 - x;
    this.target_y = canvas.height / 2 - y;
    this.moved = false;
    MOVED[moved_length] = this;
    moved_length++;

    this.getX = function () {
      return this.x;
    };

    this.getY = function () {
      return this.y;
    };

    this.fleeFrom = function (x, y) {
      this.velx -= (MOUSE.x - this.x) * FLEE_SPEED;
      this.vely -= (MOUSE.y - this.y) * FLEE_SPEED;
    };

    this.settleTo = function (x, y) {
      this.velx = VELOCITY_RETENTION * (this.velx + (this.target_x - this.x) * SETTLE_SPEED);
      this.vely = VELOCITY_RETENTION * (this.vely + (this.target_y - this.y) * SETTLE_SPEED);
    };

    this.scatter = function () {
      var unit = this.unitVecTo(MOUSE.x, MOUSE.y);
      var vel = SCATTER_VELOCITY * (0.5 + Math.random() / 2);
      this.velx = -unit.x * vel;
      this.vely = -unit.y * vel;
    };

    this.checkMove = function () {
      this.moved = !(
        Math.abs(Math.round(this.target_x - this.x)) === 0 &&
        Math.abs(Math.round(this.target_y - this.y)) === 0 &&
        Math.abs(Math.round(this.velx)) === 0 &&
        Math.abs(Math.round(this.vely)) === 0
      );
    };

    this.simpleMove = function () {
      this.checkMove();
      if (!this.moved) {
        return;
      }

      this.lastx = this.x;
      this.lasty = this.y;
      this.x += this.velx;
      this.y += this.vely;
      MOVED[moved_length] = this;
      moved_length++;
    };

    this.move = function () {
      if (this.distanceTo(MOUSE.x, MOUSE.y) <= FLEE_DISTANCE) {
        this.fleeFrom(MOUSE.x, MOUSE.y);
      } else {
        this.settleTo(this.target_x, this.target_y);
      }
      this.simpleMove();
    };

    this.distanceTo = function (x, y) {
      var dx = x - this.x;
      var dy = y - this.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    this.unitVecTo = function (x, y) {
      var dx = x - this.x;
      var dy = y - this.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      return {
        x: dx / d,
        y: dy / d
      };
    };

    this.inMotion = function () {
      return this.moved;
    };

    this.clear = function () {
      ctx.clearRect(this.lastx - CLEAR_RADIUS, this.lasty - CLEAR_RADIUS, CLEAR_RADIUS * 2, CLEAR_RADIUS * 2);
    };

    this.draw = function () {
      ctx.fillStyle = "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
      ctx.beginPath();
      ctx.arc(this.x, this.y, SIZE, 0, 2 * Math.PI);
      ctx.fill();
    };
  }

  window.addEventListener("resize", function () {
    resizeCanvas();
    adjustText();
  });

  if (FLEE) {
    window.addEventListener("mousemove", function (event) {
      MOUSE.x = event.clientX;
      MOUSE.y = event.clientY;
    });
  }

  if (SCATTER) {
    window.addEventListener("click", function (event) {
      MOUSE.x = event.clientX;
      MOUSE.y = event.clientY;
      for (var i = 0; i < POINTS.length; i++) {
        POINTS[i].scatter();
      }
    });
  }

  function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  function adjustText() {
    ctx.fillStyle = COLOR;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = FONT_SIZE + "px Arial";
    ctx.fillText(MESSAGE, canvas.width / 2, canvas.height / 2);
    var textWidth = ctx.measureText(MESSAGE).width;
    if (textWidth == 0) {
      return;
    }
    var minX = canvas.width / 2 - textWidth / 2;
    var minY = canvas.height / 2 - FONT_SIZE / 2;
    var data = ctx.getImageData(minX, minY, textWidth, FONT_SIZE).data;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var isBlank = true;
    for (var i = 0; i < data.length; i++) {
      if (data[i] != 0) {
        isBlank = false;
        break;
      }
    }

    if (!isBlank) {
      var count = 0;
      var curr = 0;
      var num = 0;
      var x = 0;
      var y = 0;
      var w = Math.floor(textWidth);
      POINTS = [];
      while (count < AMOUNT) {
        while (curr == 0) {
          num = Math.floor(Math.random() * data.length);
          curr = data[num];
        }
        num = Math.floor(num / 4);
        x = w / 2 - num % w;
        y = FONT_SIZE / 2 - Math.floor(num / w);
        POINTS.push(new Point(x, y, data[num * 4], data[num * 4 + 1], data[num * 4 + 2], data[num * 4 + 3]));
        curr = 0;
        count++;
      }
    }
  }

  function init() {
    resizeCanvas();
    adjustText();
    window.requestAnimationFrame(animate);
  }

  function animate() {
    update();
    draw();
  }

  function update() {
    for (var i = 0; i < POINTS.length; i++) {
      POINTS[i].move();
    }
  }

  function draw() {
    for (var i = 0; i < moved_length; i++) {
      MOVED[i].clear();
    }
    MOVED = MOVED_O;
    moved_length = 0;

    for (var i = 0; i < POINTS.length; i++) {
      POINTS[i].draw();
    }

    window.requestAnimationFrame(animate);
  }

  init();
}, 6000); // Atraso de 6 segundos para o efeito de texto
// Função para inicializar o GIF com atraso e efeito de partículas
function showGifWithParticles() {
  const gifElement = document.querySelector('.gif-background');

  // Certifica-se que o GIF começa invisível
  gifElement.style.opacity = 0;

  // Define o atraso de 4 segundos
  setTimeout(() => {
    // Transição gradual do GIF
    let opacity = 0;
    const interval = setInterval(() => {
      if (opacity < 1) {
        opacity += 0.01; // Gradualmente aumenta a opacidade
        gifElement.style.opacity = opacity;
      } else {
        clearInterval(interval); // Para quando a opacidade atingir 1
      }
    }, 30); // Ajusta a velocidade da transição aqui (em milissegundos)

    // Inicia o efeito de partículas com as configurações já existentes
    startParticlesEffect();
  }, 4000); // Atraso de 4 segundos
}

// Função para simular o efeito de partículas com as mesmas configurações já existentes
function startParticlesEffect() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  
  let particlesArray = [];
  const numberOfParticles = 300; // Número de partículas

  // Criação de partículas
  function createParticles() {
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 1,
        speedX: Math.random() * 3 - 1.5,
        speedY: Math.random() * 3 - 1.5,
        color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`
      });
    }
  }

  // Atualiza e movimenta as partículas
  function updateParticles() {
    for (let i = 0; i < particlesArray.length; i++) {
      const p = particlesArray[i];
      p.x += p.speedX;
      p.y += p.speedY;

      // Desenha as partículas
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

      // Redesenha a partícula se sair da tela
      if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
        particlesArray[i] = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 5 + 1,
          speedX: Math.random() * 3 - 1.5,
          speedY: Math.random() * 3 - 1.5,
          color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`
        };
      }
    }
  }

  // Anima as partículas
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateParticles();
    requestAnimationFrame(animateParticles);
  }

  // Inicializa e anima as partículas
  createParticles();
  animateParticles();
}

// Chama a função para exibir o GIF com o efeito de partículas
window.addEventListener('load', () => {
  showGifWithParticles();
});
