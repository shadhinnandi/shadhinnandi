// Rules and state for Last Train Home: driving between stations, fuel and
// the train's condition, trackside events, station menus and choices, and
// the endings. No DOM access: menus are returned as dialog specs that the
// engine shows, and choices come back through `choose`.

import { LINES, REGION_FUEL, STATIONS, lineById, linesFrom } from './world.js';

export const VMAX = 110; // km/h
export const KM_PER_SEC_AT = 90; // a train at 90 km/h covers 1 km per real second
export const DEADLINE = 36; // hours after the start (06:00 on day 1): 18:00 on day 2
const START_HOUR = 6;

export function newGame() {
  return {
    phase: 'station', // station | travel | ending
    station: 'millbrook',
    line: null,
    pos: 0,
    speed: 0,
    throttle: 0,
    brake: false,
    fuel: 70,
    tank: 100,
    credits: 60,
    supplies: 3,
    condition: 100,
    cargo: null, // { item, to, reward }
    fragments: [],
    revealed: [],
    upgrades: { boiler: false, tender: false },
    hours: 0,
    log: [{ h: 0, text: 'Morning at Millbrook. The last train north leaves today.' }],
    visited: ['millbrook'],
    deliveries: 0,
    stationFlags: {},
    // Per-trip state
    blocks: {},
    doneEvents: {},
    rockslide: Math.random() < 0.7,
    reportBought: false,
    warn: null,
    toasts: [],
    stopT: 0,
    dock: 0,
    hold: null, // dialog the engine should show (spec)
    over: null,
    km: 0,
  };
}

// ---------- helpers ----------

export const clockOf = (g) => {
  const t = START_HOUR + g.hours;
  const day = 1 + Math.floor(t / 24);
  const h = Math.floor(t % 24);
  const m = Math.floor((t % 1) * 60);
  return { day, h, m, text: `Day ${day} · ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, hourOfDay: t % 24 };
};

function toast(g, text, tone = 'info') {
  g.toasts.push({ text, tone, t: 0 });
  if (g.toasts.length > 3) g.toasts.shift();
}

function log(g, text) {
  g.log.push({ h: g.hours, text });
}

const fuelPer10 = (g, st) => STATIONS[st].fuelPrice;
export const isHiddenOpen = (g, line) => !line.hidden || g.revealed.includes(line.id);
export const routesFrom = (g, st) => linesFrom(st).filter((l) => isHiddenOpen(g, l));

/** Fuel the train would use on a line at a steady cruising speed. */
export function fuelEstimate(g, line, speed = 80) {
  const per = 0.38 * REGION_FUEL[line.region] * (1 + 0.5 * (speed / 100) ** 2) * (g.upgrades.boiler ? 0.8 : 1);
  let total = line.km * per;
  for (const e of line.events) if (e.type === 'weather') total += (e.to - e.from) * per * 0.3;
  return Math.round(total);
}

export function nextStation(g) {
  return g.line ? lineById(g.line).to : g.station;
}

// ---------- driving ----------

/** controls = { up, down, brake } (held) */
export function update(g, c, dt) {
  for (const t of g.toasts) t.t += dt;
  g.toasts = g.toasts.filter((t) => t.t < 3.5);
  if (g.phase !== 'travel' || g.hold || g.over) return;
  const line = lineById(g.line);

  // Docking sequence at the next station
  if (g.dock > 0) {
    g.dock += dt;
    g.speed = Math.max(0, g.speed - 30 * dt);
    if (g.dock > 1.6) arrive(g, line.to);
    return;
  }

  // Throttle and brakes
  if (c.up) g.throttle = Math.min(1, g.throttle + 0.7 * dt);
  if (c.down) g.throttle = Math.max(-0.15, g.throttle - 0.9 * dt);
  g.brake = Boolean(c.brake);
  const target = g.fuel > 0 && g.condition > 0 ? g.throttle * VMAX : 0;
  if (g.brake) g.speed = Math.max(0, g.speed - 28 * dt);
  else if (g.throttle < 0 && g.speed <= 0.5) g.speed = -9; // creep backwards
  else if (target > g.speed) g.speed = Math.min(target, g.speed + 9 * dt * (1 - g.speed / (VMAX + 10)));
  else g.speed = Math.max(Math.min(target, g.speed), g.speed - 4 * dt);
  if (g.throttle >= 0 && g.speed < 0) g.speed = 0;

  // Move along the line
  const dkm = (g.speed / KM_PER_SEC_AT) * dt;
  g.pos = Math.max(0, Math.min(line.km + 0.6, g.pos + dkm));
  g.km += Math.abs(dkm);
  g.hours += Math.abs(dkm) * (2.2 / 60);

  // Fuel
  let weather = 1;
  for (const e of line.events) if (e.type === 'weather' && g.pos > e.from && g.pos < e.to) weather = 1.3;
  const per = 0.38 * REGION_FUEL[line.region] * (1 + 0.5 * (Math.abs(g.speed) / 100) ** 2) * (g.upgrades.boiler ? 0.8 : 1) * weather;
  g.fuel = Math.max(0, g.fuel - Math.abs(dkm) * per);

  events(g, line, dt);

  // Out of fuel or broken down, and stopped: decide what to do.
  if (g.speed <= 0.5 && g.fuel <= 0 && !g.hold) g.hold = strandedMenu(g, 'fuel');
  else if (g.speed <= 0.5 && g.condition <= 0 && !g.hold) g.hold = strandedMenu(g, 'broken');

  // Arrival: slow enough in the platform zone
  const zone = g.pos > line.km - 0.35 && g.pos < line.km + 0.25;
  if (zone && Math.abs(g.speed) < 18 && g.speed >= 0) {
    g.dock = 0.0001;
    toast(g, `Arriving at ${STATIONS[line.to].name}`);
  } else if (g.pos > line.km + 0.25 && g.speed > 0) {
    g.warn = { text: 'Overshot the platform: stop, then pull S back to reverse', t: 0 };
  }
}

function inLimit(line, pos) {
  return line.events.find((e) => e.type === 'limit' && pos > e.from && pos < e.to);
}

function events(g, line, dt) {
  g.warn = null;
  const key = (e) => `${line.id}:${e.type}:${e.km ?? e.from}`;

  // Speed limits
  const lim = inLimit(line, g.pos);
  if (lim && g.speed > lim.limit + 5 && !g.doneEvents[key(lim)]) {
    g.doneEvents[key(lim)] = true;
    g.condition = Math.max(0, g.condition - 12);
    toast(g, `Too fast over the ${lim.reason.toLowerCase()}: the train is damaged`, 'bad');
    log(g, `Took the ${lim.reason.toLowerCase()} too fast and damaged the train.`);
  }
  const ahead = line.events.find((e) => e.type === 'limit' && e.from > g.pos && e.from - g.pos < 3);
  if (lim) g.warn = { text: `${lim.reason}: limit ${lim.limit} km/h`, limit: lim.limit };
  else if (ahead) g.warn = { text: `${ahead.reason} ahead: slow to ${ahead.limit} km/h`, limit: ahead.limit };

  // Blocks on the track
  for (const e of line.events) {
    if (e.type !== 'block' || !blockPresent(g, line, e)) continue;
    const d = e.km - g.pos;
    if (d < 5 && d > 0) g.warn = { text: `${blockName(e.kind)} on the line ${d.toFixed(1)} km ahead: stop the train`, danger: true };
    if (d <= 0.05 && g.speed > 3) {
      // Hit it
      const dmg = { rocks: 40, tree: 22, deer: 8 }[e.kind];
      g.blocks[key(e)] = 'cleared';
      g.condition = Math.max(0, g.condition - dmg);
      g.speed *= 0.4;
      g.throttle = Math.min(g.throttle, 0.3);
      toast(g, `Crashed into the ${blockName(e.kind).toLowerCase()}!`, 'bad');
      log(g, `Ran into ${blockName(e.kind).toLowerCase()} on the ${STATIONS[line.from].name} line.`);
      g.crash = 0.6;
    } else if (d > 0 && d < 5 && g.speed <= 0.5) {
      g.hold = blockMenu(g, line, e);
      return;
    }
  }

  // Flag stops
  for (const e of line.events) {
    if (e.type !== 'flag' || g.doneEvents[key(e)]) continue;
    const d = e.km - g.pos;
    if (d < 3 && d > -0.5 && g.speed > 0.5) g.warn = g.warn || { text: `Someone is waving by the line ${Math.max(0, d).toFixed(1)} km ahead`, flag: true };
    if (Math.abs(d) < 0.5 && g.speed <= 0.5) {
      g.doneEvents[key(e)] = true;
      g.hold = flagMenu(g, e);
      return;
    }
    if (d < -0.5) g.doneEvents[key(e)] = true;
  }
}

export function blockPresent(g, line, e) {
  const k = `${line.id}:block:${e.km}`;
  if (g.blocks[k] === 'cleared') return false;
  if (g.blocks[k] === undefined) {
    g.blocks[k] = line.id === 'harrow-greyfell' ? (g.rockslide ? 'yes' : 'no') : Math.random() < e.chance ? 'yes' : 'no';
  }
  return g.blocks[k] === 'yes';
}

export const blockName = (k) => ({ rocks: 'Rockslide', tree: 'Fallen tree', deer: 'Deer' })[k];

// ---------- dialogs ----------

function spec(eyebrow, title, body, choices, rows) {
  return { eyebrow, title, body: Array.isArray(body) ? body : [body], choices, rows };
}

function blockMenu(g, line, e) {
  const k = `${line.id}:block:${e.km}`;
  if (e.kind === 'deer') {
    return spec('On the line', 'A herd of deer', 'Deer are crossing the tracks. You wait quietly until they move on.', [{ id: `clear:${k}:wait1`, label: 'Wait for them (20 min)', primary: true }]);
  }
  if (e.kind === 'rocks') {
    return spec('On the line', 'Rockslide', 'Boulders have come down across both rails. The train cannot pass.', [
      { id: `clear:${k}:dig`, label: 'Clear them by hand', hint: 'Uses 2 supplies and 2 hours', disabled: g.supplies < 2 },
      { id: `clear:${k}:wait5`, label: 'Wait for the track crew', hint: 'Takes 5 hours', primary: true },
    ]);
  }
  return spec('On the line', 'Fallen tree', 'A storm-felled pine lies across the rails.', [
    { id: `clear:${k}:saw`, label: 'Saw it apart', hint: 'Takes 1 hour', primary: true },
    { id: `clear:${k}:ram`, label: 'Push through it', hint: 'Damages the train (-18 condition)' },
  ]);
}

function flagMenu(g, e) {
  if (e.kind === 'farmer') {
    return spec('Flag stop', 'A farmer with a basket', '"Going to Harrow? I can pay my way in eggs and coins."', [
      { id: 'flag:farmer:yes', label: 'Give her a lift', hint: '+15 credits, +1 supply', primary: true },
      { id: 'flag:no', label: 'Wave and carry on' },
    ]);
  }
  if (e.kind === 'fisher') {
    return spec('Flag stop', 'A fisherman by the tracks', '"Fresh catch, cheap! Keeps a crew going for days."', [
      { id: 'flag:fisher:buy', label: 'Buy fish', hint: '5 credits for 2 supplies', disabled: g.credits < 5, primary: true },
      { id: 'flag:no', label: 'No, thank you' },
    ]);
  }
  return spec('Flag stop', 'A tired hiker', '"I’ve walked from Whisperwood. There’s an old branch line from Pinecross nobody uses any more."', [
    { id: 'flag:hiker:share', label: 'Share a meal', hint: '1 supply: she marks the line on your map', disabled: g.supplies < 1, primary: true },
    { id: 'flag:no', label: 'Wish her luck' },
  ]);
}

function strandedMenu(g, why) {
  const fuel = why === 'fuel';
  return spec(
    'Stranded',
    fuel ? 'The firebox is cold' : 'The engine has broken down',
    fuel ? 'You have run out of fuel between stations.' : 'The train is too damaged to move.',
    [
      fuel
        ? { id: 'strand:burn', label: 'Burn supplies for fuel', hint: '1 supply gives 12 fuel', disabled: g.supplies < 1, primary: true }
        : { id: 'strand:patch', label: 'Patch the engine', hint: '2 supplies give +35 condition', disabled: g.supplies < 2, primary: true },
      { id: `strand:tow:${why}`, label: 'Wait for a freight train', hint: 'Costs 30 credits and 6 hours', disabled: g.credits < 30 },
      { id: 'strand:give', label: 'Give up the journey', hint: 'Ends the game' },
    ],
  );
}

/** The main menu of the current station. */
export function stationMenu(g) {
  const st = STATIONS[g.station];
  const id = g.station;
  const f = g.stationFlags[id] || (g.stationFlags[id] = {});
  const choices = [];
  const body = [st.blurb];
  if (!st.final) {
    const price = fuelPer10(g, id);
    choices.push({ id: 'fuel', label: `Buy 20 fuel`, hint: `${price * 2} credits`, disabled: g.credits < price * 2 || g.fuel > g.tank - 5 });
    choices.push({ id: 'supply', label: 'Buy 2 supplies', hint: '10 credits', disabled: g.credits < 10 });
    if (st.workshop) choices.push({ id: 'repair', label: 'Repair the train', hint: '20 credits for +30 condition', disabled: g.credits < 20 || g.condition >= 100 });
  }
  // Deliveries
  if (g.cargo && g.cargo.to === id) choices.push({ id: 'deliver', label: `Deliver the ${g.cargo.item}`, hint: `+${g.cargo.reward} credits`, primary: true });
  // Station stories and offers
  if (id === 'millbrook' && !f.job && !g.cargo) choices.push({ id: 'job-seed', label: 'Carry a crate of seed to Saltmere', hint: 'Paid 45 credits on delivery (coast line)' });
  if (id === 'harrow' && !g.reportBought) choices.push({ id: 'report', label: 'Buy the mountain line report', hint: '6 credits: is the pass clear?', disabled: g.credits < 6 });
  if (id === 'greyfell' && !f.miners) {
    choices.push({ id: 'miners-give', label: 'Share supplies with the miners', hint: '2 supplies: they have something of yours', disabled: g.supplies < 2 });
    choices.push({ id: 'miners-sell', label: 'Sell supplies to the canteen', hint: '2 supplies for 30 credits', disabled: g.supplies < 2 });
  }
  if (id === 'quarry' && !f.signal) choices.push({ id: 'signalman', label: 'Talk to the old signalman', hint: 'Takes 1 hour' });
  if (id === 'saltmere' && !f.sailor) choices.push({ id: 'sailor', label: 'Listen to the old sailor', hint: 'Takes 1 hour' });
  if (id === 'saltmere' && !g.cargo && !f.fish) choices.push({ id: 'job-fish', label: 'Carry fish to Lantern Bay', hint: 'Paid 30 credits on delivery' });
  if (id === 'lantern') {
    if (!g.upgrades.boiler) choices.push({ id: 'up-boiler', label: 'Fit an efficient boiler', hint: '55 credits: 20% less fuel', disabled: g.credits < 55 });
    if (!g.upgrades.tender) choices.push({ id: 'up-tender', label: 'Fit a bigger tender', hint: '40 credits: +40 fuel capacity', disabled: g.credits < 40 });
    if (!f.keeper) choices.push({ id: 'keeper', label: 'Climb the lighthouse to see the keeper', hint: 'Takes 1 hour' });
  }
  if (id === 'pinecross' && g.supplies > 0) choices.push({ id: 'sell-timber', label: 'Sell a supply to the timber camp', hint: '+12 credits' });
  if (id === 'whisperwood' && !f.cabin) choices.push({ id: 'cabin', label: 'Visit the cabin by the platform', primary: true });
  if (st.final) return endingSpec(g);
  choices.push({ id: 'depart', label: 'Choose a route and depart', primary: !choices.some((c) => c.primary) });
  return spec(`Station · ${clockOf(g).text}`, st.name, body, choices.slice(0, 8), [
    ['Fuel', `${Math.round(g.fuel)} / ${g.tank}`],
    ['Credits', g.credits],
    ['Supplies', g.supplies],
    ['Condition', `${Math.round(g.condition)}%`],
  ]);
}

export function routeMenu(g) {
  const routes = routesFrom(g, g.station);
  return spec(
    'Junction',
    `Leaving ${STATIONS[g.station].name}`,
    routes.length > 1 ? 'Choose your line. Fuel estimates assume a steady 80 km/h.' : 'One line leads on from here.',
    [
      ...routes.map((l) => {
        const est = fuelEstimate(g, l);
        const dest = STATIONS[l.to];
        return {
          id: `go:${l.id}`,
          label: `${dest.name} · ${l.km} km`,
          hint: `${l.note || ''} About ${est} fuel${est > g.fuel ? ' (more than you have)' : ''}.`.trim(),
        };
      }),
      { id: 'back', label: 'Back to the station' },
    ],
  );
}

function endingSpec(g) {
  const n = g.fragments.length;
  const late = g.hours > DEADLINE;
  const title = n === 3 ? 'The whole letter, home at last' : n > 0 ? 'Pieces of a story' : 'Home, with empty hands';
  const text =
    n === 3
      ? 'Your grandmother reads the letter by the stove, all three pages, and laughs at the parts about the miners and the sea. Forty years late, it still arrives in time.'
      : n > 0
        ? `You hand over ${n} of the three pages. She reads them twice and says the rest can stay out there, along the line, where he left them.`
        : 'You arrive with nothing but the journey. She hugs you anyway and puts the kettle on.';
  return spec('Northwatch', title, [text, late ? 'The pass closed behind you as you arrived: you were the very last train.' : 'You made it before the pass closed, with daylight to spare.'], [{ id: 'finish', label: 'Finish the journey', primary: true }], [
    ['Letter pages', `${n} of 3`],
    ['Arrived', clockOf(g).text],
  ]);
}

// ---------- choices ----------

/** Apply a dialog choice. Returns the next dialog spec, or null to close. */
export function choose(g, id) {
  const st = g.station;
  const f = g.stationFlags[st] || (g.stationFlags[st] = {});
  const back = () => stationMenu(g);
  const [kind, a, b] = id.split(':');
  switch (kind) {
    case 'fuel': {
      const price = fuelPer10(g, st) * 2;
      g.credits -= price;
      g.fuel = Math.min(g.tank, g.fuel + 20);
      return back();
    }
    case 'supply':
      g.credits -= 10;
      g.supplies += 2;
      return back();
    case 'repair':
      g.credits -= 20;
      g.condition = Math.min(100, g.condition + 30);
      g.hours += 1;
      return back();
    case 'deliver':
      g.credits += g.cargo.reward;
      g.deliveries += 1;
      log(g, `Delivered the ${g.cargo.item} to ${STATIONS[st].name} for ${g.cargo.reward} credits.`);
      toast(g, `+${g.cargo.reward} credits`, 'good');
      g.cargo = null;
      return back();
    case 'job-seed':
      f.job = true;
      g.cargo = { item: 'crate of seed', to: 'saltmere', reward: 45 };
      log(g, 'Took on a crate of seed for Saltmere.');
      return back();
    case 'job-fish':
      f.fish = true;
      g.cargo = { item: 'barrels of fish', to: 'lantern', reward: 30 };
      log(g, 'Loaded barrels of fish for Lantern Bay.');
      return back();
    case 'report':
      g.credits -= 6;
      g.reportBought = true;
      log(g, g.rockslide ? 'Report: rocks have come down on the mountain line.' : 'Report: the mountain line is clear.');
      return spec('Report', 'Mountain line report', g.rockslide ? 'A rockslide blocks the line to Greyfell. Expect to dig or wait.' : 'The pass is clear all the way to Greyfell.', [{ id: 'ok', label: 'Thanks' }]);
    case 'miners-give':
      f.miners = true;
      g.supplies -= 2;
      g.credits += 15;
      gain(g, 'mine', 'The first page', 'The old foreman hands you a folded page: "Your grandfather left this with my father. Said someone would come for it."');
      return spec('Greyfell', 'The first page', ['The old foreman hands you a folded page: "Your grandfather left this with my father. Said someone would come for it."', 'They add 15 credits for the food.'], [{ id: 'ok', label: 'Continue', primary: true }]);
    case 'miners-sell':
      f.miners = true;
      g.supplies -= 2;
      g.credits += 30;
      log(g, 'Sold supplies to the miners for 30 credits.');
      return back();
    case 'signalman':
      f.signal = true;
      g.hours += 1;
      reveal(g, 'The signalman remembers the Whisperwood branch from Pinecross. It is marked on your map now.');
      return spec('Old Quarry Halt', 'The old signalman', ['"Whisperwood? There’s a branch off the Pinecross line. They stopped printing it in the timetable, but the rails are still there."', 'Fuel is cheap here: the quarry still has coal.'], [{ id: 'ok', label: 'Continue', primary: true }]);
    case 'sailor':
      f.sailor = true;
      g.hours += 1;
      gain(g, 'sea', 'The second page', 'The sailor kept a page in a tin for forty years.');
      return spec('Saltmere', 'The second page', ['"A young man left this at the harbour. Asked me to keep it dry." He hands you a page sealed in a tobacco tin.'], [{ id: 'ok', label: 'Continue', primary: true }]);
    case 'keeper':
      f.keeper = true;
      g.hours += 1;
      reveal(g, 'The lighthouse keeper pointed out the old Whisperwood branch from Pinecross.');
      return spec('Lantern Bay', 'The keeper', ['From the lamp room you can see the whole coast. "That line into the trees past Pinecross? Whisperwood. Nobody goes now. Someone should."'], [{ id: 'ok', label: 'Continue', primary: true }]);
    case 'up-boiler':
      g.credits -= 55;
      g.upgrades.boiler = true;
      log(g, 'Fitted an efficient boiler.');
      return back();
    case 'up-tender':
      g.credits -= 40;
      g.upgrades.tender = true;
      g.tank += 40;
      log(g, 'Fitted a bigger tender.');
      return back();
    case 'sell-timber':
      g.supplies -= 1;
      g.credits += 12;
      return back();
    case 'cabin':
      f.cabin = true;
      g.supplies += 2;
      gain(g, 'wood', 'The last page', 'In the cabin, on a nail by the window, the last page.');
      return spec('Whisperwood', 'The last page', ['The cabin is empty but swept. On a nail by the window hangs the final page, addressed to Northwatch. Someone left two crates of food on the step.'], [{ id: 'ok', label: 'Continue', primary: true }]);
    case 'depart':
      return routeMenu(g);
    case 'back':
    case 'ok':
      return g.phase === 'station' ? back() : null;
    case 'go': {
      const line = lineById(a);
      g.phase = 'travel';
      g.line = line.id;
      g.pos = 0;
      g.speed = 0;
      g.throttle = 0;
      g.dock = 0;
      log(g, `Left ${STATIONS[st].name} for ${STATIONS[line.to].name}.`);
      return null;
    }
    case 'clear': {
      const key = `${a}:${b}:${id.split(':')[3]}`;
      const how = id.split(':').pop();
      g.blocks[key] = 'cleared';
      if (how === 'dig') {
        g.supplies -= 2;
        g.hours += 2;
      } else if (how === 'wait5') g.hours += 5;
      else if (how === 'wait1') g.hours += 1 / 3;
      else if (how === 'saw') g.hours += 1;
      else if (how === 'ram') g.condition = Math.max(0, g.condition - 18);
      log(g, how === 'wait5' ? 'Waited five hours for the track crew.' : how === 'dig' ? 'Cleared the rocks by hand.' : how === 'saw' ? 'Sawed through a fallen tree.' : how === 'ram' ? 'Pushed through a fallen tree.' : 'Waited for deer to cross.');
      return null;
    }
    case 'flag':
      if (a === 'farmer' && b === 'yes') {
        g.credits += 15;
        g.supplies += 1;
        log(g, 'Gave a farmer a lift. She paid in coins and eggs.');
        toast(g, '+15 credits, +1 supply', 'good');
      } else if (a === 'fisher' && b === 'buy') {
        g.credits -= 5;
        g.supplies += 2;
        toast(g, '+2 supplies', 'good');
      } else if (a === 'hiker' && b === 'share') {
        g.supplies -= 1;
        reveal(g, 'A hiker marked the old Whisperwood branch on your map.');
      }
      return null;
    case 'strand':
      if (a === 'burn') {
        g.supplies -= 1;
        g.fuel += 12;
        log(g, 'Burned supplies in the firebox to keep going.');
      } else if (a === 'patch') {
        g.supplies -= 2;
        g.condition = Math.min(100, g.condition + 35);
        log(g, 'Patched the engine by the trackside.');
      } else if (a === 'tow') {
        g.credits -= 30;
        g.hours += 6;
        if (b === 'fuel') g.fuel = Math.max(g.fuel, 20);
        else g.condition = Math.max(g.condition, 40);
        log(g, 'Waited six hours for a freight train to help.');
      } else {
        g.over = { reason: 'stranded' };
      }
      return null;
    case 'finish':
      g.over = { reason: 'arrived' };
      return null;
    default:
      return null;
  }
}

function gain(g, id, title, text) {
  if (!g.fragments.includes(id)) g.fragments.push(id);
  log(g, `${title} of the letter: ${text}`);
  toast(g, `Letter page found (${g.fragments.length} of 3)`, 'good');
}

function reveal(g, text) {
  if (!g.revealed.includes('pinecross-whisperwood')) {
    g.revealed.push('pinecross-whisperwood');
    log(g, text);
    toast(g, 'New route on your map: Whisperwood', 'good');
  }
}

function arrive(g, st) {
  g.phase = 'station';
  g.station = st;
  g.line = null;
  g.speed = 0;
  g.throttle = 0;
  g.dock = 0;
  if (!g.visited.includes(st)) g.visited.push(st);
  log(g, `Arrived at ${STATIONS[st].name}.`);
  g.hold = stationMenu(g);
}

export function score(g) {
  return g.fragments.length * 150 + g.deliveries * 40 + Math.round(g.credits) + Math.round(g.condition) + (g.hours <= DEADLINE ? 200 : 0);
}

export { LINES, STATIONS };
