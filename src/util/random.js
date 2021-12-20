/**
 * A set of random utilities.
 */

const createGenerator = (hash) => {
  /* Algorithm "xor128" from p. 5 of Marsaglia, "Xorshift RNGs" */
  /* Adapted by Piter Pasma */

  const xs_state = Uint32Array.from(
    [0, 0, 0, 0].map((_, i) => parseInt(hash.substr(i * 8 + 2, 8), 16))
  );

  const value = () => {
    let s,
      t = xs_state[3];
    xs_state[3] = xs_state[2];
    xs_state[2] = xs_state[1];
    xs_state[1] = s = xs_state[0];
    t ^= t << 11;
    t ^= t >>> 8;
    xs_state[0] = t ^ s ^ (s >>> 19);
    return xs_state[0] / 0x100000000;
  };

  const chance = (n = 0.5) => value() < n;
  const bool = chance; // lol

  const range = (min, max) => {
    const delta = max - min;
    return value() * delta + min;
  };

  const rangeFloor = (min, max) => Math.floor(range(min, max));

  const pick = (array) =>
    array.length ? array[rangeFloor(0, array.length)] : undefined;

  const weighted = (weights) => {
    var totalWeight = weights.reduce((a, b) => a + b);

    var random = value() * totalWeight;
    for (let i = 0; i < weights.length; i++) {
      if (random < weights[i]) {
        return i;
      }
      random -= weights[i];
    }
    return 0;
  };

  // Shuffle an array
  const shuffle = (arr) => {
    var rand;
    var tmp;
    var len = arr.length;
    var ret = [...arr];
    while (len) {
      rand = ~~(value() * len--);
      tmp = ret[len];
      ret[len] = ret[rand];
      ret[rand] = tmp;
    }
    return ret;
  };

  // Return a random location inside a circle
  const insideCircle = (radius = 1, out = []) => {
    var theta = value() * 2.0 * Math.PI;
    var r = radius * Math.sqrt(value());
    out[0] = r * Math.cos(theta);
    out[1] = r * Math.sin(theta);
    return out;
  };

  let _nextGaussian = null;
  let _hasNextGaussian = false;
  const gaussian = (mean = 0, standardDerivation = 1) => {
    // https://github.com/openjdk-mirror/jdk7u-jdk/blob/f4d80957e89a19a29bb9f9807d2a28351ed7f7df/src/share/classes/java/util/Random.java#L496
    if (_hasNextGaussian) {
      _hasNextGaussian = false;
      var result = _nextGaussian;
      _nextGaussian = null;
      return mean + standardDerivation * result;
    } else {
      var v1 = 0;
      var v2 = 0;
      var s = 0;
      do {
        v1 = value() * 2 - 1; // between -1 and 1
        v2 = value() * 2 - 1; // between -1 and 1
        s = v1 * v1 + v2 * v2;
      } while (s >= 1 || s === 0);
      var multiplier = Math.sqrt((-2 * Math.log(s)) / s);
      _nextGaussian = v2 * multiplier;
      _hasNextGaussian = true;
      return mean + standardDerivation * (v1 * multiplier);
    }
  };

  return {
    value,
    chance,
    bool,
    range,
    rangeFloor,
    pick,
    weighted,
    shuffle,
    insideCircle,
    gaussian,
  };
};

export default createGenerator;

// Generates a pure random hash, useful for testing
// i.e. not deterministic!
export const getRandomHash = () => {
  let result = "0x";
  for (let i = 64; i > 0; --i)
    result += "0123456789abcdef"[~~(Math.random() * 16)];
  return result;
};
