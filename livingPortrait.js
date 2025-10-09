const input = document.getElementById('user-input');
const canvas = document.getElementById('portrait-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 300;
canvas.height = 400;

const image = new Image();
image.src = "images/portrait.jpg";

let particles = [];
let glitchLevel = 0; // increases with typing

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
    this.alpha = 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= 0.01;
  }

  draw() {
    ctx.fillStyle = `rgba(0,0,0,${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function createParticles() {
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    particles.push(new Particle(x, y));
  }
}

function applyGlitch() {
  // randomly offset small horizontal slices
  const sliceHeight = 10;
  for (let y = 0; y < canvas.height; y += sliceHeight) {
    const dx = (Math.random() - 0.5) * glitchLevel; // horizontal shift
    ctx.drawImage(canvas, 0, y, canvas.width, sliceHeight, dx, y, canvas.width, sliceHeight);
  }

  // optional flicker effect
  if (Math.random() < 0.05 * glitchLevel) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Draw particles
  particles.forEach((p, i) => {
    p.update();
    p.draw();
    if (p.alpha <= 0) particles.splice(i, 1);
  });

  // Apply glitch if level > 0
  if (glitchLevel > 0) {
    applyGlitch();
  }

  requestAnimationFrame(animate);
}

input.addEventListener('input', () => {
  createParticles();
  glitchLevel = Math.min(glitchLevel + 0.5, 10); // cap glitch intensity
});

// Slowly reduce glitch intensity over time
setInterval(() => {
  if (glitchLevel > 0) glitchLevel -= 0.1;
}, 200);

image.onload = () => {
  animate();
};
