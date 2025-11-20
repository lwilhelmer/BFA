// Selectors
const path = document.getElementById("silhouette-path");
const buttons = document.querySelectorAll(".btn");
const resetBtn = document.getElementById("reset");

// Define visual transforms
const transforms = {
  skinny: {
    transform: "translateX(-6px) scaleX(0.88) scaleY(0.98)",
    filter: "brightness(0.98) contrast(1.02)",
  },
  curves: {
    transform: "translateX(2px) scaleX(1.06) scaleY(1.04)",
    filter: "brightness(1.02) contrast(1.03)",
  },
  ugly: {
    transform: "translateY(-4px) skewX(2deg) scaleX(0.96)",
    filter: "saturate(0.9)",
  },
  fat: {
    transform: "translateX(4px) scaleX(1.14) scaleY(1.03)",
    filter: "brightness(0.98)",
  },
  toned: {
    transform: "translateY(0px) scaleX(0.98) scaleY(0.96)",
    filter: "contrast(1.06)",
  },
};

// Map each comment to its opposite effect
const oppositeMap = {
  skinny: "fat",
  fat: "skinny",
  curves: "ugly",
  ugly: "curves",
  toned: "ugly", // or pick whatever opposite you want
};

// Apply a transform
function applyTransform(t) {
  path.style.transition =
    "transform 520ms cubic-bezier(.22,.9,.36,1), filter 380ms";
  path.style.transform = t.transform;
  path.style.filter = t.filter || "none";
}

// Reset transform
function resetTransform() {
  path.style.transition =
    "transform 540ms cubic-bezier(.22,.9,.36,1), filter 300ms";
  path.style.transform = "none";
  path.style.filter = "none";
}

// Wire up buttons to apply opposite transform
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-morph");
    const oppositeKey = oppositeMap[key] || key; // fallback to itself
    const t = transforms[oppositeKey];
    if (!t) return;
    applyTransform(t);
  });
});

resetBtn.addEventListener("click", () => {
  resetTransform();
});

// Optional: keyboard shortcut R to reset
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "r") resetTransform();
});
