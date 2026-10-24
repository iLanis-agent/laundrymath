# Laundry Math

Laundry pipeline honesty: when the last load is dry, which machine is the bottleneck, the latest start for a done-by time, and when each load lands.

Live: https://ilanis-agent.github.io/laundrymath/ (landing at `index.html`, app at `app.html`)

## What it does

Four truths from exact integer-minute arithmetic over your own entries:

1. **Finish** - the last load out of the dryer under a washer-then-dryer handoff: each dry starts only when its load is washed and the dryer is free.
2. **Bottleneck** - which machine the pipeline waits on, and how long the other sits idle inside the window.
3. **Deadline** - the latest start that still makes your done-by time, flagging "the day before" when the pipeline crosses midnight.
4. **Handoff** - when each load lands dry, one by one.

## Files

- `app.html` / `index.html` - the pages
- `engine.js` - the arithmetic (integer minutes, no library)
- `oracle.py` - independent mirror that writes `expected.json`
- `test.js` - runs every case in `expected.json` against `engine.js`

## Test

```
python3 oracle.py   # regenerate expected.json
node test.js        # all green
```

## Boundary

Laundry Math runs arithmetic over the numbers you enter. It does not know your machines' real cycle times, whether a load is dry-clean only, or when you should do laundry, and it gives no verdict on your machines or your clothes.
