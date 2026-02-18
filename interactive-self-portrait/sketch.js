// Body transformation values
let bodyScale = 1.0;
let targetScale = 1.0;
let silhouetteImg;

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

  // Instructions
  fill(120);
  noStroke();
  textSize(11);
  textAlign(CENTER);
  text("Mean comment → body gets skinnier", width / 2, 35);
  text("Positive comment → body gets bigger", width / 2, 52);
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
