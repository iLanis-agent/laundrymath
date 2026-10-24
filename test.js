const fs = require("fs");
eval(fs.readFileSync("engine.js", "utf8"));
const exp = JSON.parse(fs.readFileSync("expected.json", "utf8"));
const fns = { finish: finishTruth, bottleneck: bottleneckTruth, deadline: deadlineTruth, handoff: handoffTruth };
let fail = 0;
for (const c of exp.cases) {
  const got = JSON.stringify(fns[c.fn](...c.args));
  if (got !== JSON.stringify(c.expect)) { fail++; console.log("MISMATCH", c.fn, c.args, "\n got:", got, "\n exp:", JSON.stringify(c.expect)); }
}
const ERRS = ["the load count must be a whole number of loads from 1 to 20, like 3",
  "the washer minutes must be a whole number from 1 to 600, like 38",
  "the dryer minutes must be a whole number from 1 to 600, like 55",
  "the done-by time must be a 24-hour clock time like 18:00"];
for (const [fn, args] of exp.errors) {
  let threw = null;
  try { fns[fn](...args); } catch (e) { threw = e.message; }
  if (!threw || !ERRS.includes(threw)) { fail++; console.log("ERRCASE FAIL", fn, args, "->", threw); }
}
console.log(fail ? `${fail} FAILURES` : "all green");
process.exit(fail ? 1 : 0);
