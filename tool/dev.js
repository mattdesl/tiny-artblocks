const rollup = require("rollup");
const path = require("path");
const liveServer = require("live-server");
const compress = require("./compress");
const { promisify } = require("util");
const prettyBytes = require("pretty-bytes");
const fs = require("fs");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const pluginJson = require("@rollup/plugin-json");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const { handleError, printError } = require("./error");

const mode = process.argv.includes("--dev") ? "development" : "production";
const gwei = 125;
const INPUT_FILE = path.resolve(__dirname, "../src/index.js");
const OUTPUT_FILE = path.resolve(__dirname, "../www/main.js");
const OUTPUT_FILE_MIN = path.resolve(__dirname, "../www/main.min.js");

if (mode === "development") {
  const liveServer = require("live-server");
  (async () => {
    await build();

    const port = 8081;
    console.log(`Starting development server on http://localhost:${port}/`);
    liveServer.start({
      port,
      open: false,
      logLevel: 0, // or 1 for more logs
      watch: [
        path.resolve(__dirname, "../src/**/*.js"),
        path.resolve(__dirname, "../www/index.html"),
      ],
      root: path.resolve(__dirname, "../www"),
      ignore: path.resolve(__dirname, "../www/*.js"),
      middleware: [
        async (req, res, next) => {
          if (req.url === "/main.min.js") {
            const src = await build();
            res.setHeader("Content-Type", "text/javascript");
            res.end(src);
          } else {
            next(null);
          }
        },
      ],
    });
  })();
} else if (process.argv.includes("--inspect")) {
  const inspect = require("./inspect");
  (async () => {
    const src = await bundle();
    inspect(src);
  })();
} else {
  build();
}

async function build() {
  try {
    const src = await bundle();

    const min = await compress(src);
    await writeFile(OUTPUT_FILE_MIN, min);

    console.log(`Minified Bytes: ${min.length} (${prettyBytes(min.length)})`);

    const eth = 675 * min.length * gwei * (1 / 1000000000);
    console.log(`~${eth.toFixed(4)} ETH at ${gwei} gwei`);

    return min;
  } catch (err) {
    let msg = err.toString();
    if (err.frame) {
      msg = handleError(err, true);
    }
    msg = JSON.stringify(msg);
    return printError(msg);
  }
}

async function bundle() {
  // create a bundle
  const bundle = await rollup.rollup({
    input: INPUT_FILE,
    // not advisable to use npm modules, but useful for prototyping
    plugins: [
      nodeResolve({
        browser: true,
      }),
      pluginJson(),
    ],
    // ignore this warning
    onwarn: (w, def) => {
      if (w.code !== "MISSING_NAME_OPTION_FOR_IIFE_EXPORT") def(w);
    },
  });

  // write the bundle to disk
  await bundle.write({
    file: OUTPUT_FILE,
    format: "iife",
  });

  // closes the bundle
  await bundle.close();

  // read back as string
  return readFile(OUTPUT_FILE, "utf8");
}
