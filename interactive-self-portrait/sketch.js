let stretch = 0;

function setup() {
  let canvas = createCanvas(400, 400);
  canvas.parent("canvas-container");
}

function draw() {
  background(245);

  push();
  translate(width / 2, height / 2);
  scale(1, 1 + stretch);

  noStroke();
  fill(50);
  ellipse(0, 0, 120, 220); // body silhouette placeholder
  pop();
}

document
  .getElementById("commentInput")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter" && this.value !== "") {
      stretch += 0.05; // body changes with each comment
      this.value = "";
    }
  });
