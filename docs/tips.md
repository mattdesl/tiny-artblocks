# Optimize the Lowest Hanging Fruit

Usually in a script there is a single source that is causing most of the bytes, such as the set of hex code palettes (see next tip).

Once you optimize the largest offender, then move onto the next largest offender, and so on. You can use `npm run inspect` to help you here.

It's also good practice to look at the minified output to get a sense of which functions are creating bloat. You can load the minified file into VSCode and use `Cmd + Shift + P` then `Format Document` to more easily see how the minification works.

# Color Palette Optimization

If you have a set of predefined color palettes, see here for ideas:

https://gist.github.com/mattdesl/58b806478f4d33e8b91ed9c51c39014d

# Modularize & DRY

Never repeat the same code; use modules to split up code. The best way to modularize is to write everything as helper functions:

```js
// import utils like so
import * as random from './random';

// simple math util
export const lerp = (min, max, t) => min * (1 - t) + max * t;

// more complex function like Noise, Poisson Disc sampling, etc
export const noise = () => {
  // build noise permutation tables with current PRNG
  // ...
  return (x, y) => {
    // run noise interpolation on tables to get computed value
  };
};
```

# Zero Dependencies

Don't pull things from NPM/node_modules as they will be likely bloated. Instead, copy and paste into your `util` folder, and modify/optimize the dependencies by hand.

# Array Functions instead of for loops

Sometimes for loops can lead to more bytes than `Array(100).fill().map(myFunc)` and other array utilities.

# Spread + Destructure

Take advantage of ES6 features like spread and destructure:

```js
const arr = [ 1, 2, 13 ];

// WORSE
someFunc(arr[0], arr[1], arr[2]);
const x = arr[0], y = arr[1], z = arr[2];

// BETTER
someFunc(...arr); // spread
const [x,y,z] = a; // destructure
```

Note that these are slower performance wise, maybe not worth doing inside a hot code path (like vector/matrix math).

# Arrow Functions Only

Avoid classes and write in a functional style. Almost always prefer arrow functions; these can be mangled. You can name these however you wish, as the mangler will rename them.

Use closures (functions within functions) rather than a lot of global scope; this way the mangler can understand that a variable (or entire function) only belongs to a single scope, and inline it accordingly.

```js
const draw = () => {
  const shapes = [
    [ 0, 0 ], [ 1, 0 ], [ 2, 1 ], [ 0, 1 ]
  ];

  const a = (x, y) => {
    context.beginPath()
    context.arc(x, y, 1, 0, Math.PI * 2);
    context.fill();
  };
  
  shapes.forEach(s => a(...s));
};

draw()
```

# Arrow Expressions Where Possible

Try to wrap as much as you can into a single expression, and you can skip the `return` and curly brackets, like so:

```js
// WORSE
export const lerp = (min, max, t) => {
  return min * (1 - t) + max * t;
};

// BETTER
export const lerp = (min, max, t) => min * (1 - t) + max * t;
```

Sometimes you can do this with some tricks such as expressions within default arguments, and/or comma expression.

# Avoid Objects

Usually, keys for an object cannot be mangled, this includes variables and functions. Instead of using objects, it's better to use arrays and destructure like so:

```js
// WORSE
const a = { x: 0, y: 1, color: 'blue' }; // define
const { x, y, color } = a; // later on

// BETTER
const a = [ 0, 1, 'blue' ]; // define
const [ x, y, color ] = a; // later on
```

# Mitigate Named Repetition

Sometimes you can't avoid names, like `context.globalCompositeOperation` – in these cases make sure you use a function to avoid repeating this more than once.

```js
const setContextOptions = (context, mode, color, alpha=1) => {
  context.globalCompositeOperation = mode;
  context.fillStyle = context.strokeStyle = color;
  context.globalAlpha = alpha;
}
```

# Single line assignment

If you are assigning multiple things to the same value, use a single line like so:

```js
context.lineJoin = context.lineCap = "round";
a = b = c = 0;
```

# Truncation instead of floor

If you want to floor a known positive-only number, you can use `~~x` instead of `Math.floor(x)`. Don't use this for numbers that may need to be negative. 
