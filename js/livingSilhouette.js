// Selectors
const path = document.getElementById("silhouette-path");
const buttons = document.querySelectorAll(".btn");
const resetBtn = document.getElementById("reset");

// Define visual transforms for each comment type.
// These are CSS transform strings applied to the path; tweak values to taste.
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

// Apply a transform with a gentle 'pulse' effect and then hold it.
// repeated clicks will re-apply the transform (restarting the transition).
function applyTransform(t) {
  path.style.transition =
    "transform 520ms cubic-bezier(.22,.9,.36,1), filter 380ms";
  path.style.transform = t.transform;
  path.style.filter = t.filter || "none";
}

// simple function to clear transforms (reset)
function resetTransform() {
  path.style.transition =
    "transform 540ms cubic-bezier(.22,.9,.36,1), filter 300ms";
  path.style.transform = "none";
  path.style.filter = "none";
}

// wire up comment buttons
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-morph");
    const t = transforms[key];
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
