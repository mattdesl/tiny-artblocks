const Terser = require("terser");
const minify = require("babel-minify");

module.exports = async function compress(src, keepFuncNames = false) {
  src = minify(src, {
    mangle: false,
  }).code;
  const result = await Terser.minify(src, {
    ecma: 2020,
    keep_fnames: keepFuncNames,
    toplevel: true,
    warnings: "verbose",
    compress: {
      arrows: true,
      drop_console: false,
      ecma: 2020,
      passes: 2,
      unsafe_arrows: true,
      toplevel: true,
      hoist_funs: true,
      dead_code: true,
    },
    mangle: true,
  });
  return result.code;
};
