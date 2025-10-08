const input = document.getElementById("user-input");
const canvas = document.getElementById("portrait-canvas");
const imageLayer = document.getElementById("image-layer");
const ctx = canvas.getContext("2d");

canvas.width = 320;
canvas.height = 420;

// Particle system
let particles = [];

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 4 + 1;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.size > 0.2) this.size -= 0.02;
  }

  draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function handleInput() {
  const text = input.value;
  // particles
  for (let i = 0; i < text.length; i++) {
    const angle = (Math.PI * 2 * i) / text.length;
    const x = 160 + Math.cos(angle) * 100;
    const y = 210 + Math.sin(angle) * 120;
    for (let j = 0; j < 5; j++) {
      particles.push(new Particle(x, y));
    }
  }

  // images
  const img = document.createElement("img");
  const num = Math.floor(Math.random() * 5) + 1;
  img.src = `images/${num}.jpg`;
  img.classList.add("trace");
  img.style.left = Math.random() * 70 + "%";
  img.style.top = Math.random() * 70 + "%";
  img.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
  imageLayer.appendChild(img);

  // limit number of images
  if (imageLayer.children.length > 15) {
    imageLayer.removeChild(imageLayer.firstChild);
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    p.update();
    p.draw();
    if (p.size <= 0.2) particles.splice(i, 1);
  });
  requestAnimationFrame(animate);
}

input.addEventListener("input", handleInput);
animate();
