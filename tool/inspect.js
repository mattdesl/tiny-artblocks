const compress = require("./compress");
const acorn = require("acorn");
const walk = require("acorn-walk");

module.exports = async function inspect(src) {
  const min = await compress(src, true);
  parse(min);
};

function parse(src) {
  const ast = acorn.parse(src, {
    ecmaVersion: 2020,
  });
  const funcs = [];
  walk.simple(ast, {
    FunctionExpression(node) {
      push(node);
    },
    FunctionDeclaration(node) {
      push(node);
    },
  });

  funcs.sort((a, b) => b.size - a.size);

  if (funcs.length) {
    console.log("Largest Offending Functions:");
    funcs.forEach((f) => {
      if (f.name) console.log(f.name, f.size, trim(f.code));
      else console.log("?", f.size, trim(f.code));
    });
  } else {
    console.log(
      "All functions are wrapped as IIFE, arrow functions, or closures - nothing left to analyze."
    );
  }

  function trim(src) {
    const len = src.length - 4;
    const k = 70;
    if (len >= k) {
      return src.slice(0, k - 4) + " ...";
    } else {
      return src.slice(0, k);
    }
  }

  function push(node) {
    funcs.push({
      size: node.end - node.start,
      node,
      name: node.id ? node.id.name : null,
      code: src.slice(node.start, node.end),
    });
  }
}
