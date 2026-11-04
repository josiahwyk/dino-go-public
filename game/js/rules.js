/* ---------- Battle rules (no screen, sound or saving here, so tests/run.js can check them) ---------- */
// The battle screen (battle.js) asks these what happens, then does the animation, speech and saving itself.
const RULES = {
  // His maths level adapts. Questions at his level count both ways: 5 right first time in a row moves him up,
  // being stuck (2+ wrong taps) on 2 questions moves him down. A harder question (from a bigger move) right first time
  // also counts toward moving up, and a miss on it never counts toward stuck. Easier questions and spelling (lvl 0) count for nothing.
  // Changes s (the save) in place; returns true if anything changed, so the caller knows to save.
  adaptLevel(s, qLvl, miss) {
    const first = miss === 0;
    if (qLvl < s.mathLvl || (qLvl > s.mathLvl && !first)) return false;
    if (first) {
      s.streak++;
      s.stuck = 0;
      if (s.streak >= 5 && s.mathLvl < MAXL) {
        s.mathLvl++;
        s.streak = 0;
      }
    } else {
      s.streak = 0;
      if (miss >= 2) {
        s.stuck++;
        if (s.stuck >= 2 && s.mathLvl > 1) {
          s.mathLvl--;
          s.stuck = 0;
        }
      }
    }
    return true;
  },
  // A right answer. Right first time charges the super meter by the move's charge and the shield by one pip.
  // Returns fin (the super move fires now) and shieldUp (the shield just became ready).
  rightAnswer(e, { first, charge, shieldNeed }) {
    let shieldUp = false;
    if (first) {
      e.combo += charge;
      if (!e.shield) {
        e.shieldN++;
        if (e.shieldN >= shieldNeed) {
          e.shield = true;
          e.shieldN = 0;
          shieldUp = true;
        }
      }
    }
    return { fin: first && e.combo >= finNeed(), shieldUp };
  },
  // A wrong tap (miss = how many wrong taps on this question so far, including this one). The shield pips start again,
  // and the first wrong tap on a question takes 1 off the super meter.
  wrongTap(e, miss) {
    e.shieldN = 0;
    if (miss === 1) e.combo = Math.max(0, e.combo - 1);
  },
  // A question missed first time comes back as a fresh one of the same kind 2 rounds later. Only 3 wait at a time, each kind at most twice.
  queueRetry(retry, q) {
    if (q.gen && retry.length < 3 && (q.tries || 0) < 2)
      retry.push({ gen: q.gen, lvl: q.lvl, wait: 2, tries: (q.tries || 0) + 1 });
  },
  // How much of the wild dino's remaining health a hit takes. With k hits left a move of power p takes p/(p+1.6*(k-1)) of what is left (the other
  // hits are assumed to be a middling move), so a bigger move shows a bigger number now, but the fight always ends on exactly the S.hits-th right answer
  // (never early, never an extra one): every hit leaves at least 1 health for each hit still to come, and the last hit takes the rest.
  // The finisher always takes at least 55% of what is left, so its number is big however many big moves came first.
  hitDamage(e, hits, p, fin) {
    const k = hits - e.turn,
      H = e.hp;
    if (k <= 1) return H;
    let d = Math.round((H * p) / (p + 1.6 * (k - 1)));
    if (fin) d = Math.max(d, Math.round(H * 0.55));
    return Math.max(1, Math.min(d, H - (k - 1)));
  },
  // Every hit but the last leaves the wild dino standing; the S.hits-th hit always knocks it out.
  applyHit(e, dmg, hits) {
    e.turn++;
    e.hp = e.turn >= hits ? 0 : e.hp - dmg;
  },
};
