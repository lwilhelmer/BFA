// Body transformation values
let bodyScale = 1.0;
let targetScale = 1.0;
let silhouetteImg;

// Floating comments array
let floatingComments = [];

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
  let canvas = createCanvas(400, 400);
  canvas.parent("canvas-container");

  // Resize image to fit canvas if needed
  if (silhouetteImg.width > 0) {
    silhouetteImg.resize(300, 0);
  }

  // Initialize floating comments
  initializeFloatingComments();

  // Add click detection on canvas
  canvas.mousePressed(handleCanvasClick);
}

function initializeFloatingComments() {
  // Create floating comments positioned around the canvas
  const positions = [
    { x: 20, y: 80 },
    { x: 320, y: 100 },
    { x: 50, y: 200 },
    { x: 340, y: 220 },
    { x: 30, y: 300 },
    { x: 350, y: 320 },
    { x: 150, y: 60 },
    { x: 280, y: 70 },
  ];

  // Shuffle and pick sample comments
  let shuffledComments = [...sampleComments].sort(() => Math.random() - 0.5);

  positions.forEach((pos, i) => {
    if (shuffledComments[i]) {
      floatingComments.push({
        text: shuffledComments[i].text,
        sentiment: shuffledComments[i].sentiment,
        x: pos.x,
        y: pos.y,
        originalY: pos.y,
        offset: random(1000),
        hovered: false,
        applied: false,
        fadeOut: 0,
      });
    }
  });
}

function handleCanvasClick() {
  // Check if any floating comment was clicked
  for (let comment of floatingComments) {
    if (comment.hovered && !comment.applied) {
      applyCommentEffect(comment);
      break;
    }
  }
}

function applyCommentEffect(comment) {
  comment.applied = true;
  comment.fadeOut = 1;

  if (comment.sentiment === -1) {
    // Mean comment - make body skinnier
    targetScale = Math.max(0.6, targetScale - 0.15);
    // Red flash effect
    background(255, 200, 200);
  } else if (comment.sentiment === 1) {
    // Positive comment - make body bigger
    targetScale = Math.min(1.5, targetScale + 0.15);
    // Pink flash effect
    background(255, 220, 240);
  } else {
    // Neutral comment
    targetScale = Math.max(
      0.7,
      Math.min(1.4, targetScale + random(-0.05, 0.05)),
    );
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

  push();
  translate(width / 2, height / 2);

  // Apply transformation to the image - only scale width, not height
  scale(bodyScale, 1);

  // Draw the silhouette image centered
  imageMode(CENTER);
  if (silhouetteImg.width > 0) {
    image(silhouetteImg, 0, 0);
  }
  pop();

  // Update and draw floating comments
  drawFloatingComments();

  // Instructions
  fill(120);
  noStroke();
  textSize(11);
  textAlign(CENTER);
  text("Click floating comments to see their effect!", width / 2, 25);
}

function drawFloatingComments() {
  let mouseX_ = mouseX;
  let mouseY_ = mouseY;

  for (let comment of floatingComments) {
    // Floating animation
    if (!comment.applied) {
      comment.y =
        comment.originalY + sin((frameCount + comment.offset) * 0.03) * 8;
    }

    // Check if mouse is over comment
    let textWidth_ = textWidth(comment.text);
    comment.hovered =
      mouseX_ > comment.x - 5 &&
      mouseX_ < comment.x + textWidth_ + 15 &&
      mouseY_ > comment.y - 12 &&
      mouseY_ < comment.y + 4;

    // Draw comment background
    if (comment.applied) {
      // Fade out applied comments
      comment.fadeOut -= 0.02;
      if (comment.fadeOut <= 0) continue;

      push();
      fill(150, 150, 150, comment.fadeOut * 255);
      noStroke();
      rect(comment.x - 5, comment.y - 14, textWidth_ + 10, 18, 4);

      fill(100, 100, 100, comment.fadeOut * 255);
      textSize(11);
      textAlign(LEFT, CENTER);
      text(comment.text, comment.x, comment.y);
      pop();
    } else {
      // Draw comment based on sentiment
      let bgColor;
      if (comment.sentiment === 1) {
        // Positive - pink/green
        bgColor = comment.hovered ? color(144, 238, 144) : color(200, 255, 200);
      } else {
        // Negative - red/orange
        bgColor = comment.hovered ? color(255, 180, 180) : color(255, 220, 220);
      }

      push();
      // Hover effect - slightly larger
      let scaleAmount = comment.hovered ? 1.1 : 1.0;
      translate(comment.x + textWidth_ / 2, comment.y);
      scale(scaleAmount);
      translate(-(comment.x + textWidth_ / 2), -comment.y);

      fill(bgColor);
      stroke(
        comment.sentiment === 1 ? color(100, 200, 100) : color(200, 100, 100),
      );
      strokeWeight(1);
      rect(comment.x - 5, comment.y - 14, textWidth_ + 10, 18, 4);

      // Draw text
      fill(comment.sentiment === 1 ? color(50, 150, 50) : color(150, 50, 50));
      noStroke();
      textSize(11);
      textAlign(LEFT, CENTER);
      text(comment.text, comment.x, comment.y);
      pop();

      // Draw pointer line to body center
      if (comment.hovered) {
        push();
        stroke(
          comment.sentiment === 1
            ? color(100, 200, 100, 150)
            : color(200, 100, 100, 150),
        );
        strokeWeight(2);
        let startX =
          comment.x + (comment.sentiment === 1 ? textWidth_ + 5 : -5);
        let startY = comment.y - 5;
        let endX = width / 2;
        let endY = height / 2;
        line(startX, startY, endX, endY);
        pop();
      }
    }
  }
}

document
  .getElementById("commentInput")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter" && this.value !== "") {
      const comment = this.value;
      const sentiment = analyzeSentiment(comment);

      if (sentiment === -1) {
        // Mean comment - make body skinnier (narrower width)
        targetScale = Math.max(0.6, targetScale - 0.15);
      } else if (sentiment === 1) {
        // Positive comment - make body wider
        targetScale = Math.min(1.5, targetScale + 0.15);
      } else {
        // Neutral comment - slight random change
        targetScale = Math.max(
          0.7,
          Math.min(1.4, targetScale + random(-0.05, 0.05)),
        );
      }

      // Flash effect
      background(255, 220, 220);

      this.value = "";
    }
  });
