import * as RND from "./util/random";
import { Lch } from "./util/color";

// See if tokenData exists from ArtBlocks input
// It may come in as object or string depending on context
let hash =
  typeof tokenData !== "undefined"
    ? typeof tokenData === "string"
      ? tokenData
      : tokenData.hash
    : RND.getRandomHash();

// Create a new canvas to the browser size
const W = window;

const margin = 0.15;
let shapes, backgroundColor, colors;

W.setup = () => {
  createCanvas(innerWidth, innerHeight);

  console.log(hash);
  RND.set_seed(hash);

  // There is probably a better way to do this with p5js
  const n = RND.rangeFloor(1e18);
  randomSeed(n);
  noiseSeed(n);
  noLoop();

  colors = [Lch(50, 50, random(180, 360)), Lch(100, 70, random(0, 180))];
  backgroundColor = Lch(95, 0, 0);
  shapes = Array(450)
    .fill()
    .map(() => [
      random(margin, 1 - margin),
      random(margin, 1 - margin),
      Math.abs(randomGaussian(0, 0.01)),
      random(colors),
    ]);
};

// On window resize, update the canvas size
W.windowResized = () => {
  resizeCanvas(innerWidth, innerHeight);
};

// Render loop that draws shapes with p5
W.draw = () => {
  background(backgroundColor);

  noStroke();

  // 'contain' fit mode
  let scale = 1 >= innerWidth / innerHeight ? innerWidth : innerHeight;

  // 'cover' fit mode
  // let scale = 1 < innerWidth / innerHeight ? innerWidth : innerHeight;

  let tx = (innerWidth - scale) * 0.5;
  let ty = (innerHeight - scale) * 0.5;

  // draw shapes
  shapes.forEach(([x, y, radius, color]) => {
    fill(color);
    circle(tx + x * scale, ty + y * scale, radius * scale * 2);
  });
};
