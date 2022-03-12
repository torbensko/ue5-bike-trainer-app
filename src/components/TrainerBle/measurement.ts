// @ts-nocheck
function format(x, precision = 1000) {
  return Math.round(x * precision) / precision;
}

//
// A collection of common functions that makes JS more functional
//

// Values
function equals(a, b) {
  return Object.is(a, b);
}

function isNull(x) {
  return Object.is(x, null);
}

function isUndefined(x) {
  return Object.is(x, undefined);
}

function exists(x) {
  if (isNull(x) || isUndefined(x)) {
    return false;
  }
  return true;
}

function existance(value, fallback) {
  if (exists(value)) return value;
  if (exists(fallback)) return fallback;
  throw new Error(`existance needs a fallback value `, value);
}

function isFunction(x) {
  return equals(typeof x, "function");
}

function isArray(x) {
  return Array.isArray(x);
}

function isObject(x) {
  return equals(typeof x, "object") && !isArray(x);
}

function isCollection(x) {
  return isArray(x) || isObject(x);
}

function isString(x) {
  return equals(typeof x, "string");
}

function isNumber(x) {
  if (isNaN(x)) return false;
  return equals(typeof x, "number");
}

function isAtomic(x) {
  return isNumber(x) || isString(x);
}

function validate(predicates = [], value, fallback = undefined) {
  if (predicates.reduce((acc, p) => acc && p(value), true)) return value;
  if (exists(fallback)) return fallback;
  throw new Error(`validate needs a fallback value with `, value);
}

// Collections
function empty(x) {
  if (isNull(x)) throw new Error(`empty called with null: ${x}`);
  if (!isCollection(x) && !isString(x) && !isUndefined(x)) {
    throw new Error(`empty takes a collection: ${x}`);
  }
  if (isUndefined(x)) return true;
  if (isArray(x)) {
    if (equals(x.length, 0)) return true;
  }
  if (isObject(x)) {
    if (equals(Object.keys(x).length, 0)) return true;
  }
  if (isString(x)) {
    if (equals(x, "")) return true;
  }
  return false;
}

function first(xs) {
  if (!isArray(xs) && !isString(xs) && !isUndefined(xs)) {
    throw new Error(`first takes ordered collection or a string: ${xs}`);
  }
  if (isUndefined(xs)) return undefined;
  if (empty(xs)) return undefined;
  return xs[0];
}

function second(xs) {
  if (!isArray(xs) && !isString(xs) && !isUndefined(xs)) {
    throw new Error(`second takes ordered collection or a string: ${xs}`);
  }
  if (isUndefined(xs)) return undefined;
  if (empty(xs)) return undefined;
  if (xs.length < 2) return undefined;
  return xs[1];
}

function third(xs) {
  if (!isArray(xs) && !isString(xs) && !isUndefined(xs)) {
    throw new Error(`third takes ordered collection or a string: ${xs}`);
  }
  if (isUndefined(xs)) return undefined;
  if (empty(xs)) return undefined;
  if (xs.length < 3) return undefined;
  return xs[2];
}

function last(xs) {
  if (!isArray(xs) && !isString(xs) && !isUndefined(xs)) {
    throw new Error(`last takes ordered collection or a string: ${xs}`);
  }
  if (isUndefined(xs)) return undefined;
  if (empty(xs)) return undefined;
  return xs[xs.length - 1];
}

function map(coll, fn) {
  if (isArray(coll)) return coll.map(fn);
  if (isObject(coll)) {
    return Object.fromEntries(
      Object.entries(coll).map(([k, v], i) => [k, fn(v, k, i)])
    );
  }
  if (isString(coll)) {
    return coll.split("").map(fn).join("");
  }
  throw new Error(`map called with unkown collection `, coll);
}

function traverse(obj, fn = (x) => x, acc = []) {
  function recur(fn, obj, keys, acc) {
    if (empty(keys)) {
      return acc;
    } else {
      let [k, ...ks] = keys;
      let v = obj[k];

      if (isObject(v)) {
        acc = recur(fn, v, Object.keys(v), acc);
        return recur(fn, obj, ks, acc);
      } else {
        acc = fn(acc, k, v, obj);
        return recur(fn, obj, ks, acc);
      }
    }
  }
  return recur(fn, obj, Object.keys(obj), acc);
}

function getIn(...args) {
  let [collection, ...path] = args;
  return path.reduce((acc, key) => {
    if (exists(acc[key])) return acc[key];
    return undefined;
  }, collection);
}

function set(coll, k, v) {
  coll = coll || {};
  coll[k] = v;
  return coll;
}

function setIn(coll = {}, [k, ...keys], v) {
  return keys.length ? set(coll, k, setIn(coll[k], keys, v)) : set(coll, k, v);
}

function avg(xs, prop = false) {
  if (prop !== false) {
    return xs.reduce((acc, v, i) => acc + (v[prop] - acc) / (i + 1), 0);
  } else {
    return xs.reduce((acc, v, i) => acc + (v - acc) / (i + 1), 0);
  }
}

function mavg(value_c, value_p, count_c, count_p = count_c - 1) {
  return (value_c + count_p * value_p) / count_c;
}

function max(xs, prop = false) {
  if (prop !== false) {
    return xs.reduce((acc, v, i) => (v[prop] > acc ? v[prop] : acc), 0);
  } else {
    return xs.reduce((acc, v, i) => (v > acc ? v : acc), 0);
  }
}

function sum(xs, path = false) {
  if (path !== false) {
    return xs.reduce((acc, v, i) => acc + v[path], 0);
  } else {
    return xs.reduce((acc, v, i) => acc + v, 0);
  }
}

function rand(min = 0, max = 10) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function capitalize(str) {
  return str.trim().replace(/^\w/, (c) => c.toUpperCase());
}

function clamp(lower, upper, value) {
  if (value >= upper) {
    return upper;
  } else if (value < lower) {
    return lower;
  } else {
    return value;
  }
}

// Functions
function compose2(f, g) {
  return function (...args) {
    return f(g(...args));
  };
}

function compose(...fns) {
  return fns.reduce(compose2);
}

function pipe(...fns) {
  return fns.reduceRight(compose2);
}

function repeat(n) {
  return function (f) {
    return function (x) {
      if (n > 0) {
        return repeat(n - 1)(f)(f(x));
      } else {
        return x;
      }
    };
  };
}

function curry2(fn) {
  return function (arg1, arg2) {
    if (exists(arg2)) {
      return fn(arg1, arg2);
    } else {
      return function (arg2) {
        return fn(arg1, arg2);
      };
    }
  };
}

//
// Copied from lodash.js
//
function debounce(func, wait, options = {}) {
  const root = window;
  let lastArgs, lastThis, maxWait, result, timerId, lastCallTime;

  let lastInvokeTime = 0;
  let leading = false;
  let maxing = false;
  let trailing = true;

  // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
  const useRAF =
    !wait && wait !== 0 && typeof root.requestAnimationFrame === "function";

  if (!isFunction(func)) {
    // edit
    throw new TypeError("debounce expectes a function");
  }

  wait = existance(toNumber(wait), 0); // edit

  // if (isObject(options)) {
  leading = toBool(options.leading);
  maxing = exists(options.maxWait);
  maxWait = maxing
    ? Math.max(existance(toNumber(options.maxWait), 0), wait)
    : maxWait;
  trailing = exists(options.trailing) ? toBool(options.trailing) : trailing;
  // }

  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function startTimer(pendingFunc, wait) {
    if (useRAF) {
      root.cancelAnimationFrame(timerId);
      return root.requestAnimationFrame(pendingFunc);
    }
    return setTimeout(pendingFunc, wait);
  }

  function cancelTimer(id) {
    if (useRAF) {
      return root.cancelAnimationFrame(id);
    }
    return clearTimeout(id); // edit
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = startTimer(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = startTimer(timerExpired, remainingWait(time));
    return timerId; // edit
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      cancelTimer(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return isUndefined(timerId) ? result : trailingEdge(Date.now());
  }

  function pending() {
    return !isUndefined(timerId);
  }

  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (isUndefined(timerId)) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = startTimer(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (isUndefined(timerId)) {
      timerId = startTimer(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;
  return debounced;
}
// end copied from lodash.js

// Async
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// XF (Events)
function XF(args = {}) {
  let data = {};
  let name = args.name || "db";

  function create(obj) {
    data = proxify(obj);
  }

  function proxify(obj) {
    let handler = {
      set: (target, key, value) => {
        target[key] = value;
        dispatch(`${name}:${key}`, target);
        return true;
      },
    };
    return new Proxy(obj, handler);
  }

  function dispatch(eventType, value) {
    window.dispatchEvent(evt(eventType)(value));
  }

  function sub(eventType, handler, options = {}) {
    function handlerWraper(e) {
      if (isStoreSource(eventType)) {
        handler(e.detail.data[evtProp(eventType)]);
      } else {
        handler(e.detail.data);
      }
    }

    window.addEventListener(
      eventType,
      handlerWraper,
      Object.assign({ capture: false }, options)
    );

    return handlerWraper;
  }

  function reg(eventType, handler, options = {}) {
    function handlerWraper(e) {
      return handler(e.detail.data, data);
    }

    window.addEventListener(
      eventType,
      handlerWraper,
      Object.assign({ capture: false }, options)
    );

    return handlerWraper;
  }

  function unsub(eventType, handler, options = {}) {
    // console.log('unsub ${element}', handler); // rmv
    window.removeEventListener(
      eventType,
      handler,
      Object.assign({ capture: false }, options)
    );
  }

  function isStoreSource(eventType) {
    return equals(evtSource(eventType), name);
  }

  function evt(eventType) {
    return function (value) {
      return new CustomEvent(eventType, { detail: { data: value } });
    };
  }

  function evtProp(eventType) {
    return second(eventType.split(":"));
  }

  function evtSource(eventType) {
    return first(eventType.split(":"));
  }

  return Object.freeze({
    create,
    reg,
    sub,
    dispatch,
    unsub,
  });
}

const xf = XF();

// format
function toNumber(value) {
  return +value;
}

function toBool(value) {
  return !!value;
}

function toFixed(x, points = 2) {
  const precision = 10 ** points;
  return Math.round(x * precision) / precision;
}

function dataviewToArray(dataview) {
  return Array.from(new Uint8Array(dataview.buffer));
}

function dataviewToString(dataview) {
  let utf8decoder = new TextDecoder("utf-8");
  return utf8decoder.decode(dataview.buffer);
}

function stringToCharCodes(str) {
  return str.split("").map((c) => c.charCodeAt(0));
}

function stringToDataview(str) {
  let charCodes = stringToCharCodes(str);
  let uint8 = new Uint8Array(charCodes);
  let dataview = new DataView(uint8.buffer);

  return dataview;
}

// Bits
function nthBit(field, bit) {
  return (field >> bit) & 1;
}

function nthBitToBool(field, bit) {
  return toBool(nthBit(field, bit));
}

function xor(view, start = 0, end = view.byteLength) {
  let cs = 0;
  const length = end < 0 ? view.byteLength + end : end;
  for (let i = start; i < length; i++) {
    cs ^= view.getUint8(i);
  }
  return cs;
}

function State(args = {}) {
  const defaults = {
    revs: -1,
    time: -1,
    value: 0,
    resolution: 1024,
    maxRevs: 2 ** 16,
    maxTime: 2 ** 16,
    transform: (x) => x,

    rate: 1024 / 2, // 0.5 second,
    maxRateCount: 3,
    rateCount: 0,
  };

  const resolution = existance(args.resolution, defaults.resolution);
  const transform = existance(args.transform, defaults.transform);
  const maxRevs = existance(args.maxRevs, defaults.maxRevs);
  const maxTime = existance(args.maxTime, defaults.maxTime);
  const calculate = existance(args.calculate, defaultCalculate);

  const rate = existance(args.rate, defaults.rate);
  let maxRateCount = existance(args.maxRateCount, defaults.maxRateCount);
  let rateCount = defaults.rateCount;

  let revs_1 = defaults.revs;
  let time_1 = defaults.time;
  let value = defaults.value;

  function setRevs(revs) {
    revs_1 = revs;
    return revs_1;
  }

  function setTime(time) {
    time_1 = time;
    return time_1;
  }

  function setRateCount(count) {
    rateCount = count;
    return rateCount;
  }

  function setMaxRateCount(maxCount) {
    maxRateCount = existance(maxCount, defaults.maxRateCount);
    console.log(`maxRateCount: ${maxRateCount}`);
    return maxRateCount;
  }

  function getRevs() {
    return revs_1;
  }

  function getTime() {
    return time_1;
  }

  function getRateCount() {
    return rateCount;
  }

  function getMaxRateCount() {
    return maxRateCount;
  }

  function reset() {
    setRevs(defaults.revs);
    setTime(defaults.time);
    setRateCount(defaults.rateCount);
    value = defaults.value;
    return { revs: revs_1, time: time_1 };
  }

  function isRolloverTime(time_2) {
    return time_2 < getTime();
  }

  function isRolloverRevs(revs_2) {
    return revs_2 < getRevs();
  }

  function rollOverTime() {
    return getTime() - maxTime;
  }

  function rollOverRevs() {
    return getRevs() - maxRevs;
  }

  function stillRevs(revs_2) {
    // coasting or not moving
    return equals(getRevs(), revs_2);
  }

  function stillTime(time) {
    // multiple transmissions of the same time
    return equals(getTime(), time);
  }

  function underRate(time) {
    if (equals(rateCount, maxRateCount)) {
      rateCount = 0;
      return false;
    }
    if (equals(getTime(), time)) {
      rateCount += 1;
      return true;
    }
    if (time - getTime() < rate) {
      rateCount += 1;
      return true;
    }
    rateCount = 0;
    return false;
  }

  function defaultCalculate(revs_2, time_2) {
    if (getRevs() < 0) setRevs(revs_2); // set initial revs
    if (getTime() < 0) setTime(time_2); // set initial time

    if (underRate(time_2)) {
      return value;
    }

    if (stillRevs(revs_2)) {
      setTime(time_2);
      value = 0;
      return value;
    }

    if (isRolloverTime(time_2)) {
      setTime(rollOverTime());
    }

    if (isRolloverRevs(revs_2)) {
      setRevs(rollOverRevs());
    }

    value = transform(
      (revs_2 - getRevs()) / ((time_2 - getTime()) / resolution)
    );

    setRevs(revs_2);
    setTime(time_2);
    return value;
  }

  return {
    setRevs,
    setTime,
    setRateCount,
    setMaxRateCount,
    getRevs,
    getTime,
    getRateCount,
    getMaxRateCount,
    reset,
    calculate,
    rollOverTime,
    rollOverRevs,
  };
}

function RateAdjuster(args = {}) {
  const defaults = {
    sampleSize: 0,
    rate: 3, // [0,1,2,3]
    cutoff: 20,
    maxStillTime: 3000, // ms
    status: "reading",
    statusList: ["reading", "done"],
    sensor: "cscs",
    onDone: (x) => x,
  };

  let _sample = [];
  let _sampleSize = defaults.sampleSize;
  let _rate = defaults.rate;
  let _maxStillTime = defaults.maxStillTime;

  let _cutoff = defaults.cutoff;
  let _status = defaults.status;

  const onDone = existance(args.onDone, defaults.onDone);
  const sensor = existance(args.sensor, defaults.sensor);

  function getSampleSize() {
    return _sampleSize;
  }
  function getSample() {
    return _sample;
  }
  function getRate() {
    return _rate;
  }
  function getStatus() {
    return _status;
  }
  function getCutoff() {
    return _cutoff;
  }
  function getMaxStillTime(ms) {
    return _maxStillTime;
  }

  function setCutoff(count) {
    _cutoff = count;
  }
  function setMaxStillTime(ms) {
    _maxStillTime = ms;
  }

  function reset() {
    _sample = [];
    _sampleSize = defaults.sampleSize;
    _rate = defaults.rate;
    _status = defaults.status;
  }

  function isDone() {
    return equals(_status, "done");
  }

  function timestampAvgDiff(sample) {
    return sample.reduce(function (acc, x, i, xs) {
      let tsd = 1000;
      if (i > 0) {
        tsd = xs[i].ts - xs[i - 1].ts;
      }
      acc += (tsd - acc) / (i + 1);
      return acc;
    }, 0);
  }

  function calculate(sample) {
    const tsAvgDiff = timestampAvgDiff(sample);

    const maxRateCount = clamp(
      2,
      15,
      Math.round(_maxStillTime / tsAvgDiff) - 1
    );

    console.log(
      `rateAdjuster :on ${sensor} :tsAvgDiff ${tsAvgDiff} :result ${maxRateCount}`
    );

    return maxRateCount;
  }

  function update(value) {
    if (isDone()) return;

    _sample.push(value);
    _sampleSize += 1;

    if (_sampleSize >= _cutoff) {
      _status = "done";
      _rate = calculate(_sample);
      onDone(_rate);
    }
  }

  return Object.freeze({
    getSampleSize,
    getSample,
    getRate,
    getStatus,
    getCutoff,
    getMaxStillTime,
    setCutoff,
    setMaxStillTime,

    reset,
    isDone,
    timestampAvgDiff,
    calculate,
    update,
  });
}

const wheelRevolutionDataPresent = (flags) => nthBitToBool(flags, 0);
const crankRevolutionDataPresent = (flags) => nthBitToBool(flags, 1);
const cumulativeWheelRevolutionsPresent = (flags) => nthBitToBool(flags, 2);

const definitions = {
  flags: {
    size: 1,
    resolution: 1,
    unit: "",
  },
  cumulativeWheelRevolutions: {
    size: 4,
    resolution: 1,
    unit: "",
  },
  lastWheelEventTime: {
    size: 2,
    resolution: 1 / 1024,
    unit: "s",
  },
  cumulativeCrankRevolutions: {
    size: 2,
    resolution: 1,
    unit: "",
  },
  lastCrankEventTime: {
    size: 2,
    resolution: 1 / 1024,
    unit: "s",
  },
};

function flagsIndex() {
  return 0;
}

function cumulativeWheelRevolutionsIndex(flags) {
  if (wheelRevolutionDataPresent(flags)) {
    const i = definitions.flags.size;
    return i;
  }
  return undefined;
}

function lastWheelEventTimeIndex(flags) {
  let i = definitions.flags.size;
  if (wheelRevolutionDataPresent(flags)) {
    i += definitions.cumulativeWheelRevolutions.size;
    return i;
  }
  return undefined;
}

function cumulativeCrankRevolutionsIndex(flags) {
  let i = definitions.flags.size;
  if (crankRevolutionDataPresent(flags)) {
    if (wheelRevolutionDataPresent(flags)) {
      i += definitions.cumulativeWheelRevolutions.size;
      i += definitions.lastWheelEventTime.size;
      return i;
    }

    return i;
  }
  return undefined;
}

function lastCrankEventTimeIndex(flags) {
  let i = definitions.flags.size;
  if (crankRevolutionDataPresent(flags)) {
    if (wheelRevolutionDataPresent(flags)) {
      i += definitions.cumulativeWheelRevolutions.size;
      i += definitions.lastWheelEventTime.size;
    }

    i += definitions.cumulativeCrankRevolutions.size;

    return i;
  }

  return undefined;
}

function readFlags(dataview) {
  const flags = dataview.getUint8(flagsIndex(), true);
  return flags;
}

function readCumulativeWheelRevolutions(dataview) {
  const flags = readFlags(dataview);
  const index = cumulativeWheelRevolutionsIndex(flags);
  if (exists(index)) {
    return dataview.getUint32(index, true);
  }
  return undefined;
}

function readLastWheelEventTime(dataview) {
  const flags = readFlags(dataview);
  const index = lastWheelEventTimeIndex(flags);
  if (exists(index)) {
    return dataview.getUint16(index, true);
  }
  return undefined;
}

function readCumulativeCrankRevolutions(dataview) {
  const flags = readFlags(dataview);
  const index = cumulativeCrankRevolutionsIndex(flags);
  if (exists(index)) {
    return dataview.getUint16(index, true);
  }
  return undefined;
}

function readLastCrankEventTime(dataview) {
  const flags = readFlags(dataview);
  const index = lastCrankEventTimeIndex(flags);
  if (exists(index)) {
    return dataview.getUint16(index, true);
  }
  return undefined;
}

function Cadence(args = {}) {
  // In two successive measurements:
  // Instantaneous Cadence =
  //    (Difference in two successive Cumulative Crank Revolutions values) /
  //    (Difference in two successive Last Crank Event Time values)

  function transform(x) {
    // revs per second to revs per minutes
    return Math.round(x * 60);
  }

  const stateValue = State({
    resolution: 1024,
    maxRevs: 2 ** 16,
    maxTime: 2 ** 16,
    transform,
  });

  return Object.freeze(stateValue);
}

function Speed(args = {}) {
  // In two successive measurements:
  // Instantaneous Speed =
  //    (Difference in two successive Cumulative Wheel Revolution values
  //    * Wheel Circumference) /
  //    (Difference in two successive Last Wheel Event Time values)

  const defaults = {
    wheelCircumference: 2.105, // meters or 700x25
  };

  let wheelCircumference = existance(
    args.wheelCircumference,
    defaults.wheelCircumference
  );

  function getWheelCircumference() {
    return wheelCircumference;
  }

  function setWheelCircumference(value) {
    wheelCircumference = value;
    return wheelCircumference;
  }

  function transform(x) {
    // revs per second to km per hour
    return format(x * wheelCircumference * 3.6, 100);
  }

  const stateValue = State({
    resolution: 2048,
    maxRevs: 2 ** 32,
    maxTime: 2 ** 16,
    transform,
  });

  return Object.freeze({
    ...stateValue,
    getWheelCircumference,
    setWheelCircumference,
  });
}

// Example input:
// by Wahoo Sensor
//
// (0x) 03-0c-00-00-00-44-1A-02-00-99-1D
// (0x) [0x03, 0x0c, 0x00, 0x00, 0x00, 0x44, 0x1A, 0x02, 0x00, 0x99, 0x1D]
// (10) [3, 12, 0, 0, 0, 68, 26, 2, 0, 153, 29]
//
// “Wheel rev: 12,
//  Last wheel event time: 6724 ms,
//  Crank rev: 2,
//  Last crank event time: 7577 ms” received
//
//      flags  wheel revs   wheel time  crank revs  crank time
// (0x) 03    -0c-00-00-00 -44-1A      -02-00      -99-1D
//
// Example data stream:
//
// flags  wheel revs   wheel time  crank revs  crank time
// 03    -00-00-00-00 -00-00      -00-00      -00-00
//                                 00          0             -> 0 rpm
// 03    -00-00-00-00 -00-00      -3C-00      -00-F0
//                                 60          (60 * 1024)   -> 60 rpm
// 03    -00-00-00-00 -00-00      -3E-00      -00-F4
//                                 62          (61 * 1024)   -> 120 rpm

function Measurement() {
  const speed = Speed();
  const cadence = Cadence();

  const rateAdjuster = RateAdjuster({
    sensor: "cscs",
    onDone: function (maxRateCount) {
      speed.setMaxRateCount(maxRateCount);
      cadence.setMaxRateCount(maxRateCount);
    },
  });

  function reset() {
    const crank = cadence.reset();
    const wheel = speed.reset();

    return {
      wheel,
      crank,
    };
  }

  function setWheelCircumference(value) {
    return speed.setWheelCircumference(value);
  }

  function encode(value) {}

  function decode(dataview): any {
    const flags = readFlags(dataview);
    let data = {};

    if (wheelRevolutionDataPresent(flags)) {
      data["wheelRevolutions"] = readCumulativeWheelRevolutions(dataview);
      data["wheelEvent"] = readLastWheelEventTime(dataview);
      data["speed"] = speed.calculate(
        data["wheelRevolutions"],
        data["wheelEvent"]
      );
    }

    if (crankRevolutionDataPresent(flags)) {
      data["crankRevolutions"] = readCumulativeCrankRevolutions(dataview);
      data["crankEvent"] = readLastCrankEventTime(dataview);
      data["cadence"] = cadence.calculate(
        data["crankRevolutions"],
        data["crankEvent"]
      );
    }

    if (!rateAdjuster.isDone()) {
      rateAdjuster.update({ ts: Date.now() });
    }

    // const dataLog = {
    //     ts: Date.now(),
    //     r: data.crankRevolutions,
    //     t: data.crankEvent,
    //     c:  data.cadence
    // };
    // console.log(dataLog);

    return data;
  }

  return Object.freeze({
    reset,
    setWheelCircumference,
    encode,
    decode,
    speed,
    cadence,
  });
}

const _ = {
  wheelRevolutionDataPresent,
  crankRevolutionDataPresent,
  cumulativeWheelRevolutionsPresent,

  flagsIndex,
  cumulativeWheelRevolutionsIndex,
  lastWheelEventTimeIndex,
  cumulativeCrankRevolutionsIndex,
  lastCrankEventTimeIndex,

  readFlags,
  readCumulativeWheelRevolutions,
  readLastWheelEventTime,
  readCumulativeCrankRevolutions,
  readLastCrankEventTime,
};

export { Measurement, Speed, Cadence, _ };
