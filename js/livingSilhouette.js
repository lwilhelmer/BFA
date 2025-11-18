const pathEl = document.getElementById("silhouette-path");
const input = document.getElementById("user-input");

// Neutral & exaggerated silhouettes
const neutralPath = "M736.728,849.786c-0.634-1.435-13.566-15.425-33.487-23.292c-4.568-1.94-4.545,2.705-16.944-34.925"; 
const editedPath  = "M736.728,849.786 ..."; // slightly altered for exaggeration


let interpolator = flubber.interpolate(neutralPath, editedPath);

pathEl.setAttribute("d", neutralPath);

input.addEventListener("input", () => {
  let intensity = Math.min(1, 0.05); // adjust intensity as you type
  pathEl.setAttribute("d", interpolator(intensity));
});

// Slowly decay morph intensity
setInterval(() => {
  if (intensity > 0) {
    intensity -= 0.01;
    if (intensity < 0) intensity = 0;
    pathEl.setAttribute("d", interpolator(intensity));
  }
}, 50);

// Switch body type on Enter
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    currentIndex = Math.floor(Math.random() * neutralPaths.length);
    interpolator = flubber.interpolate(
      neutralPaths[currentIndex],
      editedPaths[currentIndex]
    );
    intensity = 0;
    pathEl.setAttribute("d", neutralPaths[currentIndex]);
    input.value = "";
  }
});
