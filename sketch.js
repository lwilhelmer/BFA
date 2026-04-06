// Body transformation values
let bodyScale = 1.0;
let targetScale = 1.0;
let silhouetteImg;

// Cumulative interaction tracking
let interactionCount = 0;
let totalInteractions = 0;
let glitchIntensity = 0;
let distortionLevel = 0;
let watchingEyes = [];
let eyeCount = 1;
let maxEyes = 15;

// Sound system
let audioContext;
let notificationSounds = [];
let whisperSounds = [];
let soundLayerCount = 0;
let maxSoundLayers = 8;

// Floating comments array
let floatingComments = [];
let commentSpawnRate = 0;
let maxComments = 80;

// Body distortion effects
let pixelDistortion = 0;
let colorShift = 0;
let noiseAmount = 0;
let bodyGlitchOffset = { x: 0, y: 0 };
let permanentDistortions = [];

// Thresholds based on click count
// 0-10 clicks → subtle changes
// 10-20 clicks → more extreme
// 20-30 clicks → chaotic
// 30+ clicks → glitch / breakdown
const SUBTLE_MAX = 10;
const EXTREME_THRESHOLD = 10; // more extreme starts
const CHAOS_THRESHOLD = 20; // chaotic starts
const BREAKDOWN_THRESHOLD = 30; // glitch/breakdown starts

// Sentiment keywords for detection
const negativeWords = [
  "ugly",
  "fat",
  "stupid",
  "dumb",
  "horrible",
  "awful",
  "terrible",
  "hate",
  "worst",
  "bad",
  "gross",
  "disgusting",
  "pathetic",
  "loser",
  "worthless",
  "hideous",
  "repulsive",
  "fool",
  "idiot",
  "moron",
  "imbecile",
  "shut up",
  "go away",
  "nobody likes",
  "fail",
  "useless",
  "embarrassing",
];

const positiveWords = [
  "beautiful",
  "amazing",
  "wonderful",
  "great",
  "awesome",
  "love",
  "pretty",
  "cute",
  "gorgeous",
  "fantastic",
  "excellent",
  "perfect",
  "smart",
  "brave",
  "inspiring",
  "incredible",
  "lovely",
  "brilliant",
  "best",
  "nice",
  "kind",
  "sweet",
  "cool",
  "admire",
  "talent",
  "unique",
  "special",
];

// Predefined sample comments
const sampleComments = [
  { text: "you're so beautiful! ❤️", sentiment: 1 },
  { text: "wow amazing photo!", sentiment: 1 },
  { text: "love this so much! 💕", sentiment: 1 },
  { text: "you're incredible!", sentiment: 1 },
  { text: "omg you're fat", sentiment: -1 },
  { text: "you're so ugly", sentiment: -1 },
  { text: "worst post ever", sentiment: -1 },
  { text: "go away nobody likes you", sentiment: -1 },
  { text: "look at how disgusting", sentiment: -1 },
  { text: "so pretty!!", sentiment: 1 },
];

function preload() {
  // Load the silhouette PNG image
  silhouetteImg = loadImage("Silhouette.png");
}

function setup() {
  // Canvas for body - sits inside Instagram post
  let canvas = createCanvas(400, 400);
  canvas.parent("canvas-container");

  // Resize image to fit canvas if needed
  if (silhouetteImg.width > 0) {
    silhouetteImg.resize(300, 0);
  }

  // Initialize audio context
  initAudio();

  // Create floating comment DOM elements
  initializeFloatingComments();

  // Initialize watching eyes
  initializeWatchingEyes();

  // Add click detection on canvas
  canvas.mousePressed(handleCanvasClick);

  // Update interaction display
  updateInteractionDisplay();
}

function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.log("Audio not supported");
  }
}

function playNotificationSound() {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800 + Math.random() * 400;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.1,
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

function playWhisperSound() {
  if (!audioContext) return;

  const bufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(
    1,
    bufferSize,
    audioContext.sampleRate,
  );
  const output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = audioContext.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 500 + Math.random() * 300;

  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.3,
  );

  whiteNoise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);

  whiteNoise.start(audioContext.currentTime);
  whiteNoise.stop(audioContext.currentTime + 0.3);
}

function initializeWatchingEyes() {
  watchingEyes = [];
  for (let i = 0; i < eyeCount; i++) {
    watchingEyes.push({
      x: random(50, 350),
      y: random(50, 350),
      size: random(15, 25),
      pupilSize: random(5, 10),
      blinkTimer: random(60, 180),
      isBlinking: false,
      opacity: 0.6,
    });
  }
}

function initializeFloatingComments() {
  // Create floating comment DOM elements that float around the entire page
  // Position them absolutely on the page, outside the post
  let shuffledComments = [...sampleComments].sort(() => Math.random() - 0.5);

  for (let i = 0; i < 30; i++) {
    createFloatingCommentElement(
      shuffledComments[i % shuffledComments.length].text,
      shuffledComments[i % shuffledComments.length].sentiment,
      random(20, window.innerWidth - 150),
      random(50, window.innerHeight - 50),
      random(1000),
      false,
    );
  }
}

function createFloatingCommentElement(text, sentiment, x, y, offset, spawned) {
  let div = document.createElement("div");
  div.className = "floating-comment";
  div.textContent = text;
  div.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    padding: 6px 12px;
    background: ${sentiment === 1 ? "rgba(200, 255, 200, 0.85)" : "rgba(255, 220, 220, 0.85)"};
    border: 1px solid ${sentiment === 1 ? "rgb(100, 200, 100)" : "rgb(200, 100, 100)"};
    border-radius: 16px;
    font-size: 13px;
    color: ${sentiment === 1 ? "rgb(50, 100, 50)" : "rgb(100, 50, 50)"};
    cursor: pointer;
    z-index: 1000;
    animation: floatComment ${8 + Math.random() * 4}s ease-in-out infinite;
    animation-delay: -${offset / 100}s;
    transform-origin: center;
  `;

  // Random movement variation
  let moveX = (Math.random() - 0.5) * 30;
  let moveY = (Math.random() - 0.5) * 20;
  div.style.setProperty("--move-x", `${moveX}px`);
  div.style.setProperty("--move-y", `${moveY}px`);

  let commentData = {
    element: div,
    text: text,
    sentiment: sentiment,
    hovered: false,
    applied: false,
    offset: offset,
    spawned: spawned,
  };

  div.addEventListener("mouseenter", () => {
    commentData.hovered = true;
    div.style.transform = "scale(1.15)";
    div.style.background =
      sentiment === 1
        ? "rgba(144, 238, 144, 0.95)"
        : "rgba(255, 180, 180, 0.95)";
  });

  div.addEventListener("mouseleave", () => {
    commentData.hovered = false;
    div.style.transform = "scale(1)";
    div.style.background =
      sentiment === 1
        ? "rgba(200, 255, 200, 0.85)"
        : "rgba(255, 220, 220, 0.85)";
  });

  div.addEventListener("click", () => {
    if (!commentData.applied) {
      applyCommentEffect(commentData);
      incrementInteraction();
      // Make element fade and remove
      div.style.transition = "opacity 0.5s, transform 0.5s";
      div.style.opacity = "0";
      div.style.transform = "scale(0.8)";
      setTimeout(() => div.remove(), 500);
      commentData.applied = true;
    }
  });

  document.body.appendChild(div);
  floatingComments.push(commentData);
}

function handleCanvasClick() {
  // Resume audio context on first interaction
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
  }

  // Check if any floating comment was clicked
  for (let comment of floatingComments) {
    if (comment.hovered && !comment.applied) {
      applyCommentEffect(comment);
      incrementInteraction();
      break;
    }
  }
}

function applyCommentEffect(comment) {
  comment.applied = true;
  comment.fadeOut = 1;

  if (comment.sentiment === -1) {
    // Mean comment - make body skinnier and add distortion
    targetScale = Math.max(0.6, targetScale - 0.15);
    addPermanentDistortion(-1);
    background(255, 200, 200);
  } else if (comment.sentiment === 1) {
    // Positive comment - make body bigger
    targetScale = Math.min(1.5, targetScale + 0.15);
    addPermanentDistortion(1);
    background(255, 220, 240);
  } else {
    // Neutral comment
    targetScale = Math.max(
      0.7,
      Math.min(1.4, targetScale + random(-0.05, 0.05)),
    );
    addPermanentDistortion(0);
  }

  // Play sounds based on interaction level
  if (interactionCount > 5) {
    playNotificationSound();
  }
  if (interactionCount > 10) {
    playWhisperSound();
  }
}

function addPermanentDistortion(sentiment) {
  // Add permanent distortion points to the body
  const numPoints = Math.floor(1 + interactionCount / 5);
  for (let i = 0; i < numPoints; i++) {
    permanentDistortions.push({
      x: random(-100, 100),
      y: random(-150, 150),
      size: random(5, 15 + interactionCount / 2),
      sentiment: sentiment,
      offset: random(TWO_PI),
      speed: random(0.02, 0.05),
    });
  }
}

function incrementInteraction() {
  interactionCount++;
  totalInteractions++;

  // Update distortion level based on click ranges
  // 0-10: subtle (0-0.5)
  // 10-20: more extreme (0.5-0.8)
  // 20-30: chaotic (0.8-1.0)
  // 30+: breakdown (1.0)
  if (interactionCount <= SUBTLE_MAX) {
    distortionLevel = map(interactionCount, 0, SUBTLE_MAX, 0, 0.5, true);
  } else if (interactionCount <= EXTREME_THRESHOLD * 2) {
    distortionLevel = map(
      interactionCount,
      SUBTLE_MAX,
      EXTREME_THRESHOLD * 2,
      0.5,
      0.8,
      true,
    );
  } else if (interactionCount < BREAKDOWN_THRESHOLD) {
    distortionLevel = map(
      interactionCount,
      EXTREME_THRESHOLD * 2,
      BREAKDOWN_THRESHOLD,
      0.8,
      1.0,
      true,
    );
  } else {
    distortionLevel = 1.0;
  }

  // Glitch intensity triggers at 30+ clicks
  glitchIntensity = map(
    interactionCount,
    BREAKDOWN_THRESHOLD,
    BREAKDOWN_THRESHOLD + 10,
    0,
    1,
    true,
  );

  // Spawn 2 new comments on each click
  for (let i = 0; i < 2 && floatingComments.length < maxComments; i++) {
    spawnRandomComment();
  }

  // Add more watching eyes
  if (interactionCount % 3 === 0 && watchingEyes.length < maxEyes) {
    addWatchingEye();
  }

  // Increase sound layers
  if (interactionCount % 4 === 0 && soundLayerCount < maxSoundLayers) {
    soundLayerCount++;
  }

  // Update display
  updateInteractionDisplay();
}

function spawnRandomComment() {
  // Spawn new floating comment as DOM element
  const randomComment =
    sampleComments[Math.floor(Math.random() * sampleComments.length)];
  createFloatingCommentElement(
    randomComment.text,
    randomComment.sentiment,
    random(20, window.innerWidth - 150),
    random(50, window.innerHeight - 50),
    random(1000),
    true,
  );
}

function addWatchingEye() {
  watchingEyes.push({
    x: random(30, 370),
    y: random(30, 370),
    size: random(15, 25),
    pupilSize: random(5, 10),
    blinkTimer: random(60, 180),
    isBlinking: false,
    opacity: map(interactionCount, 0, BREAKDOWN_THRESHOLD, 0.4, 0.9),
  });
}

function updateInteractionDisplay() {
  const display = document.getElementById("interaction-display");
  if (display) {
    display.textContent = `👁️ ${interactionCount} interactions`;
    // Opacity increases as clicks progress through stages
    display.style.opacity = map(
      interactionCount,
      0,
      SUBTLE_MAX + EXTREME_THRESHOLD + CHAOS_THRESHOLD,
      0.3,
      1,
      true,
    );
  }

  // Update live viewer count based on watching eyes
  const liveDisplay = document.getElementById("live-viewers");
  if (liveDisplay) {
    let viewerCount = watchingEyes.length * 137 + 1;
    liveDisplay.textContent = `LIVE • ${viewerCount.toLocaleString()}`;
  }
}

function analyzeSentiment(text) {
  const lowerText = text.toLowerCase();

  let negativeCount = 0;
  let positiveCount = 0;

  for (let word of negativeWords) {
    if (lowerText.includes(word)) {
      negativeCount++;
    }
  }

  for (let word of positiveWords) {
    if (lowerText.includes(word)) {
      positiveCount++;
    }
  }

  if (negativeCount > positiveCount) return -1;
  if (positiveCount > negativeCount) return 1;
  return 0;
}

function draw() {
  // Draw background with slight fade for flash effect
  background(250, 248, 245);

  // Smoothly interpolate body scale
  bodyScale = lerp(bodyScale, targetScale, 0.08);

  // Apply glitch effects at breakdown threshold (30+ clicks)
  if (interactionCount >= BREAKDOWN_THRESHOLD) {
    applyGlitchEffects();
  }

  // Watching eyes drawn behind body
  drawWatchingEyes();

  push();
  // Center the body where the Instagram post is
  translate(width / 2, height / 2);

  // Apply cumulative distortions
  applyCumulativeDistortions();

  // Apply transformation to the image
  scale(bodyScale, 1);

  // Draw the silhouette image centered with distortions
  imageMode(CENTER);
  if (silhouetteImg.width > 0) {
    drawDistortedBody();
  }
  pop();

  // Draw permanent distortion effects
  drawPermanentDistortions();

  // Draw interaction intensity overlay
  drawIntensityOverlay();

  // Instructions
  fill(120);
  noStroke();
  textSize(11);
  textAlign(CENTER);
  text("Click floating comments around the page!", width / 2, 25);
}

function applyGlitchEffects() {
  // Random screen shake
  if (random() < glitchIntensity * 0.3) {
    bodyGlitchOffset.x = random(-5, 5) * glitchIntensity;
    bodyGlitchOffset.y = random(-5, 5) * glitchIntensity;
  } else {
    bodyGlitchOffset.x *= 0.9;
    bodyGlitchOffset.y *= 0.9;
  }

  // Random color flashes
  if (random() < glitchIntensity * 0.2) {
    const flashColor = random([
      color(255, 0, 0, 30),
      color(0, 255, 0, 30),
      color(0, 0, 255, 30),
      color(255, 255, 0, 30),
    ]);
    background(flashColor);
  }
}

function applyCumulativeDistortions() {
  // Apply noise-based distortion
  if (distortionLevel > 0) {
    noiseAmount = distortionLevel * 10;
    const noiseX = noise(frameCount * 0.01) * noiseAmount;
    const noiseY = noise(frameCount * 0.01 + 100) * noiseAmount;
    translate(noiseX - noiseAmount / 2, noiseY - noiseAmount / 2);
  }

  // Apply glitch offset
  translate(bodyGlitchOffset.x, bodyGlitchOffset.y);

  // Apply rotation distortion at chaotic levels (20+ clicks)
  if (interactionCount > CHAOS_THRESHOLD) {
    const rotationAmount = map(
      interactionCount,
      CHAOS_THRESHOLD,
      BREAKDOWN_THRESHOLD,
      0,
      0.1,
      true,
    );
    rotate(sin(frameCount * 0.1) * rotationAmount);
  }
}

function drawDistortedBody() {
  // At breakdown threshold (30+ clicks), draw completely glitched body
  if (interactionCount >= BREAKDOWN_THRESHOLD) {
    drawChaosBody();
    return;
  }

  // Draw body with pixel-level distortion
  if (distortionLevel > 0.3) {
    // Create distorted version using pixels
    const img = silhouetteImg.get();
    img.loadPixels();

    const distortionStrength = map(distortionLevel, 0.3, 1, 0, 20, true);

    for (let i = 0; i < img.pixels.length; i += 4) {
      if (random() < distortionStrength * 0.1) {
        // Randomly shift pixel colors
        img.pixels[i] = constrain(
          img.pixels[i] + random(-50, 50) * distortionLevel,
          0,
          255,
        );
        img.pixels[i + 1] = constrain(
          img.pixels[i + 1] + random(-50, 50) * distortionLevel,
          0,
          255,
        );
        img.pixels[i + 2] = constrain(
          img.pixels[i + 2] + random(-50, 50) * distortionLevel,
          0,
          255,
        );
      }
    }

    img.updatePixels();
    image(img, 0, 0);
  } else {
    image(silhouetteImg, 0, 0);
  }
}

function drawChaosBody() {
  // Completely glitched/breakdown body at 30+ clicks
  const chaosLevel = map(
    interactionCount,
    BREAKDOWN_THRESHOLD,
    BREAKDOWN_THRESHOLD + 20,
    1,
    2,
    true,
  );

  // Draw fragmented pieces of the body
  for (let i = 0; i < 20 * chaosLevel; i++) {
    push();
    translate(random(-100, 100) * chaosLevel, random(-150, 150) * chaosLevel);
    rotate(random(TWO_PI));
    scale(random(0.1, 0.5));

    // Random color tint
    tint(
      random(150, 255),
      random(150, 255),
      random(150, 255),
      random(100, 200),
    );

    image(silhouetteImg, 0, 0);
    pop();
  }

  // Add glitch lines
  stroke(255, 0, 0, 100);
  strokeWeight(2);
  for (let i = 0; i < 10; i++) {
    const y = random(-200, 200);
    line(-200, y, 200, y + random(-20, 20));
  }

  // Add noise overlay
  noStroke();
  for (let i = 0; i < 500; i++) {
    fill(random(255), random(255), random(255), random(50, 150));
    rect(random(-200, 200), random(-200, 200), random(2, 8), random(2, 8));
  }
}

function drawPermanentDistortions() {
  // Draw permanent distortion effects that accumulate
  for (let distortion of permanentDistortions) {
    push();
    translate(width / 2 + distortion.x, height / 2 + distortion.y);

    // Pulsating effect
    const pulse = sin(frameCount * distortion.speed + distortion.offset);
    const size = distortion.size * (1 + pulse * 0.3);

    // Color based on sentiment
    if (distortion.sentiment === -1) {
      fill(255, 100, 100, 100);
      stroke(255, 50, 50, 150);
    } else if (distortion.sentiment === 1) {
      fill(100, 255, 100, 100);
      stroke(50, 255, 50, 150);
    } else {
      fill(200, 200, 200, 100);
      stroke(150, 150, 150, 150);
    }

    strokeWeight(1);
    ellipse(0, 0, size, size);
    pop();
  }
}

function drawWatchingEyes() {
  for (let eye of watchingEyes) {
    push();
    translate(eye.x, eye.y);

    // Eye white
    fill(255, 255, 255, eye.opacity * 255);
    stroke(0, 0, 0, eye.opacity * 200);
    strokeWeight(1);
    ellipse(0, 0, eye.size, eye.size * 0.7);

    // Pupil that follows mouse
    const angle = atan2(mouseY - eye.y, mouseX - eye.x);
    const pupilX = cos(angle) * eye.pupilSize * 0.3;
    const pupilY = sin(angle) * eye.pupilSize * 0.3;

    fill(0, 0, 0, eye.opacity * 255);
    noStroke();
    ellipse(pupilX, pupilY, eye.pupilSize, eye.pupilSize);

    // Blinking
    eye.blinkTimer--;
    if (eye.blinkTimer <= 0) {
      eye.isBlinking = true;
      eye.blinkTimer = random(60, 180);
    }

    if (eye.isBlinking) {
      fill(250, 248, 245, 255);
      noStroke();
      rectMode(CENTER);
      rect(0, 0, eye.size, eye.size * 0.7);
      eye.isBlinking = false;
    }

    pop();
  }
}

function drawFloatingComments() {
  let mouseX_ = mouseX;
  let mouseY_ = mouseY;

  for (let comment of floatingComments) {
    // Organic floating animation - more random movement
    if (!comment.applied) {
      // Multiple layered movements for organic feel
      comment.y =
        comment.originalY +
        sin((frameCount + comment.offset) * 0.02) * 10 +
        cos((frameCount + comment.offset * 0.7) * 0.015) * 5;
      // Slight horizontal drift too
      comment.x = comment.x + random(-0.3, 0.3);
    }

    // Check if mouse is over comment
    let textWidth_ = textWidth(comment.text);
    comment.hovered =
      mouseX_ > comment.x - 5 &&
      mouseX_ < comment.x + textWidth_ + 15 &&
      mouseY_ > comment.y - 12 &&
      mouseY_ < comment.y + 4;

    // Draw comment - organic floating text, no boxes
    if (comment.applied) {
      // Fade out applied comments
      comment.fadeOut -= 0.02;
      if (comment.fadeOut <= 0) continue;

      push();
      // Ghostly fading text
      fill(80, 80, 80, comment.fadeOut * 200);
      noStroke();
      textSize(13);
      textAlign(LEFT, CENTER);
      text(comment.text, comment.x, comment.y);
      pop();
    } else {
      // Floating text that glows on hover - no boxes
      push();
      if (comment.hovered) {
        // Hover glow effect
        let glowSize = 15;
        for (let i = 3; i > 0; i--) {
          fill(
            comment.sentiment === 1
              ? color(100, 200, 100, 20 * i)
              : color(200, 100, 100, 20 * i),
          );
          noStroke();
          textSize(13 + i * 2);
          text(comment.text, comment.x, comment.y);
        }
      }

      // Main text
      fill(comment.sentiment === 1 ? color(60, 100, 60) : color(100, 50, 50));
      noStroke();
      textSize(13);
      textAlign(LEFT, CENTER);
      text(comment.text, comment.x, comment.y);
      pop();
    }
  }
}

function drawIntensityOverlay() {
  // Visual feedback for interaction intensity based on click ranges
  // 0-10: subtle changes
  // 10-20: more extreme
  // 20-30: chaotic
  // 30+: glitch/breakdown
  if (interactionCount > 0) {
    // Vignette effect that intensifies
    const vignetteIntensity = map(
      interactionCount,
      0,
      BREAKDOWN_THRESHOLD,
      0,
      150,
      true,
    );
    drawingContext.shadowBlur = vignetteIntensity;
    drawingContext.shadowColor = `rgba(0, 0, 0, ${map(
      interactionCount,
      0,
      BREAKDOWN_THRESHOLD,
      0,
      0.5,
      true,
    )})`;

    // Subtle scan lines appear at extreme level (10+ clicks)
    if (interactionCount > EXTREME_THRESHOLD) {
      stroke(0, 0, 0, 20);
      strokeWeight(1);
      for (let y = 0; y < height; y += 4) {
        line(0, y, width, y);
      }
    }

    // Static noise at chaotic level (20+ clicks)
    if (interactionCount > CHAOS_THRESHOLD) {
      noStroke();
      for (let i = 0; i < interactionCount * 2; i++) {
        fill(random(255), random(255), random(255), random(10, 30));
        rect(random(width), random(height), random(1, 3), random(1, 3));
      }
    }

    // Glitch artifacts at breakdown level (30+ clicks)
    if (interactionCount >= BREAKDOWN_THRESHOLD) {
      noStroke();
      // Horizontal glitch lines
      for (let i = 0; i < 5; i++) {
        fill(random(255), random(100), random(100), random(50, 150));
        rect(0, random(height), width, random(1, 4));
      }
      // Random colored pixels
      for (let i = 0; i < 20; i++) {
        fill(
          random([0, 255]),
          random([0, 255]),
          random([0, 255]),
          random(100, 255),
        );
        rect(random(width), random(height), random(2, 10), random(2, 10));
      }
    }
  }
}

// Handle comment input
document
  .getElementById("commentInput")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter" && this.value !== "") {
      // Resume audio context on first interaction
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume();
      }

      const comment = this.value;
      const sentiment = analyzeSentiment(comment);

      if (sentiment === -1) {
        // Mean comment - make body skinnier (narrower width)
        targetScale = Math.max(0.6, targetScale - 0.15);
        addPermanentDistortion(-1);
      } else if (sentiment === 1) {
        // Positive comment - make body wider
        targetScale = Math.min(1.5, targetScale + 0.15);
        addPermanentDistortion(1);
      } else {
        // Neutral comment - slight random change
        targetScale = Math.max(
          0.7,
          Math.min(1.4, targetScale + random(-0.05, 0.05)),
        );
        addPermanentDistortion(0);
      }

      // Flash effect
      background(255, 220, 220);

      // Increment interaction
      incrementInteraction();

      // Play sounds
      if (interactionCount > 5) {
        playNotificationSound();
      }
      if (interactionCount > 10) {
        playWhisperSound();
      }

      this.value = "";
    }
  });
