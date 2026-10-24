// Laundry Math engine: laundry pipeline honesty - when the last load is dry under a washer-then-dryer handoff, which machine is the bottleneck, the latest start that still makes a done-by time, and when each load lands. Exact integer minutes, no library, no named constants; every cycle time and the deadline are the owner's own entries.
function _loads(t) {
  t = typeof t === "string" ? t.trim() : "";
  if (!/^([1-9]|1[0-9]|20)$/.test(t)) throw new Error("the load count must be a whole number of loads from 1 to 20, like 3");
  return parseInt(t, 10);
}
function _mins(t, err) {
  t = typeof t === "string" ? t.trim() : "";
  if (!/^[0-9]{1,3}$/.test(t)) throw new Error(err);
  var v = parseInt(t, 10);
  if (v < 1 || v > 600) throw new Error(err);
  return v;
}
function _clock(t) {
  t = typeof t === "string" ? t.trim() : "";
  var m = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/.exec(t);
  if (!m) throw new Error("the done-by time must be a 24-hour clock time like 18:00");
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}
var _W = "the washer minutes must be a whole number from 1 to 600, like 38";
var _D = "the dryer minutes must be a whole number from 1 to 600, like 55";
function _args(loads, wash, dry, by) {
  return [_loads(loads), _mins(wash, _W), _mins(dry, _D), _clock(by)];
}
function _pl(n, one, many) { return n + (n === 1 ? one : many); }
function _v(n, one, many) { return n === 1 ? one : many; }
function _dur(m) {
  if (m < 60) return _pl(m, " minute", " minutes");
  return _pl(Math.floor(m / 60), " hour", " hours") + " and " + _pl(m % 60, " minute", " minutes");
}
function _clk(m) {
  m = ((m % 1440) + 1440) % 1440;
  var h = Math.floor(m / 60), mm = String(m % 60).padStart(2, "0");
  var ap = h < 12 ? "AM" : "PM", h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ":" + mm + " " + ap;
}
function _plan(n, w, d) {
  var dry = [], done = 0;
  for (var k = 0; k < n; k++) {
    var s = Math.max((k + 1) * w, done);
    done = s + d;
    dry.push(done);
  }
  return { finish: done, dry: dry };
}
function finishTruth(loads, wash, dry, by) {
  var v = _args(loads, wash, dry, by), n = v[0], w = v[1], d = v[2];
  var p = _plan(n, w, d);
  return _pl(n, " load", " loads") + " at " + _pl(w, " minute", " minutes") + " in the washer and " + _pl(d, " minute", " minutes") + " in the dryer " + _v(n, "finishes", "finish") + " " + _dur(p.finish) + " after " + _v(n, "it", "the first load") + " starts.";
}
function bottleneckTruth(loads, wash, dry, by) {
  var v = _args(loads, wash, dry, by), n = v[0], w = v[1], d = v[2];
  var p = _plan(n, w, d);
  if (n === 1) return "With 1 load there is no handoff: the washer runs " + _dur(w) + " and the dryer runs " + _dur(d) + ", one after the other.";
  var wb = n * w, db = n * d;
  if (d > w) return "The dryer is the bottleneck: it runs " + _dur(db) + " against the washer's " + _dur(wb) + ", and the washer sits idle " + _dur(p.finish - wb) + " inside the window.";
  if (w > d) return "The washer is the bottleneck: it runs " + _dur(wb) + " against the dryer's " + _dur(db) + ", and the dryer sits idle " + _dur(p.finish - db) + " inside the window.";
  return "Both machines run " + _dur(wb) + " each: neither is the bottleneck, and every handoff is clean.";
}
function deadlineTruth(loads, wash, dry, by) {
  var v = _args(loads, wash, dry, by), n = v[0], w = v[1], d = v[2], t = v[3];
  var p = _plan(n, w, d);
  var start = t - p.finish;
  if (start < 0) return "To finish by " + _clk(t) + ", start the " + _v(n, "load", "first load") + " by " + _clk(start) + " the day before: the pipeline needs " + _dur(p.finish) + ".";
  return "To finish by " + _clk(t) + ", start the " + _v(n, "load", "first load") + " by " + _clk(start) + ": the pipeline needs " + _dur(p.finish) + ".";
}
function handoffTruth(loads, wash, dry, by) {
  var v = _args(loads, wash, dry, by), n = v[0], w = v[1], d = v[2];
  var p = _plan(n, w, d);
  if (n === 1) return "The load is dry " + _dur(p.dry[0]) + " after the start.";
  var parts = [];
  for (var k = 0; k < n; k++) parts.push("load " + (k + 1) + " at " + _dur(p.dry[k]) + " in");
  return "Each load lands as the dryer frees up: " + parts.slice(0, -1).join(", ") + ", and " + parts[n - 1] + ".";
}
