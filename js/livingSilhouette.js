window.addEventListener("DOMContentLoaded", () => {

  const pathEl = document.getElementById("silhouette-path");
  const input = document.getElementById("user-input");

  // Realistic normalized silhouettes
  const silhouettes = [
    // Neutral
    "M100 20c-10 0-20 12-20 22v25c0 10-6 18-14 22-16 12-26 35-26 60 0 25 8 45 20 57 6 6 10 14 10 22v175c0 35-18 55-18 75 0 32 32 48 54 48s54-16 54-48c0-20-18-40-18-75V206c0-8 4-16 10-22 12-12 20-32 20-57 0-25-10-48-26-60-8-4-14-12-14-22V42c0-10-10-22-20-22z",
    // Thin
    "M100 20c-8 0-18 10-18 20v25c0 9-4 17-12 21-15 12-24 35-24 58 0 22 6 40 16 52 5 5 9 12 9 20v175c0 33-16 53-16 72 0 30 30 45 52 45s52-15 52-45c0-19-16-39-16-72V206c0-7 3-15 9-20 10-12 16-30 16-52 0-23-9-46-24-58-8-4-12-12-12-21V40c0-10-10-20-18-20z",
    // Curvy
    "M100 20c-12 0-22 12-22 24v25c0 10-6 18-14 24-18 14-30 38-30 64 0 25 9 47 22 60 8 8 12 16 12 24v175c0 38-18 58-18 78 0 32 36 50 60 50s60-18 60-50c0-20-18-40-18-78V214c0-10 4-18 12-24 13-13 22-35 22-60 0-26-12-50-30-64-8-6-14-14-14-24V44c0-12-10-24-22-24z",
    // Tall
    "M100 15c-10 0-20 10-20 22v30c0 10-5 18-13 22-16 12-28 35-28 60 0 25 7 45 18 57 6 6 10 14 10 22v185c0 35-18 55-18 75 0 32 34 50 56 50s56-18 56-50c0-20-18-40-18-75V188c0-8 4-16 10-22 11-12 18-33 18-57 0-25-11-48-28-60-8-4-13-12-13-22V37c0-12-10-22-20-22z",
    // Hourglass
    "M100 20c-13 0-23 12-23 24v25c0 10-6 20-15 26-20 14-32 40-32 66 0 28 10 50 24 64 9 8 14 16 14 24v175c0 40-20 60-20 82 0 34 38 52 64 52s64-18 64-52c0-22-20-42-20-82V212c0-12 5-20 14-24 14-14 24-36 24-64 0-26-12-52-32-66-9-6-15-16-15-26V44c0-12-10-24-23-24z"
  ];

  let currentIndex = 0;
  let nextIndex = 1;
  let isMorphing = false;

  // Display initial silhouette
  pathEl.setAttribute("d", silhouettes[currentIndex]);

  // Function to morph to next silhouette
  function morphToNext() {
    if (isMorphing) return; // prevent overlapping morphs
    isMorphing = true;

    const interpolator = flubber.interpolate(silhouettes[currentIndex], silhouettes[nextIndex]);
    let t = 0;

    const interval = setInterval(() => {
      t += 0.02;
      if (t > 1) t = 1;
      pathEl.setAttribute("d", interpolator(t));

      if (t === 1) {
        clearInterval(interval);
        currentIndex = nextIndex;
        nextIndex = (nextIndex + 1) % silhouettes.length;
        isMorphing = false;
      }
    }, 20);
  }

  // Typing triggers morph
  input.addEventListener("input", () => {
    morphToNext();
  });

  // Enter key triggers morph and clears input
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      morphToNext();
      input.value = "";
    }
  });

});
