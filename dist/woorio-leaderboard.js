'use strict';
// Local-only leaderboard. A public multi-player ranking requires an authenticated server.
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WoorioLeaderboard = api;
})(globalThis, () => {
  const RUN_KEY = 'woorio-ranked-run-v1';
  const BOARD_KEY = 'woorio-local-ranking-v1';
  const STAGES = 9;
  const read = (store, key) => { try { return JSON.parse(store.getItem(key)); } catch { return null; } };
  const write = (store, key, value) => { try { store.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
  const normalize = input => {
    const name = String(input ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ');
    return [...name].length >= 1 && [...name].length <= 12 && !/[<>\u0000-\u001f\u007f]/.test(name) ? name : null;
  };
  const validDeaths = n => Number.isSafeInteger(n) && n >= 0 && n <= 1000000;
  function create(storage) {
    const previous = read(storage, RUN_KEY);
    let run = previous && Number.isInteger(previous.next) && previous.next >= 0 && previous.next < STAGES && validDeaths(previous.deaths)
      ? { next: previous.next, deaths: previous.deaths } : null;
    let deaths = run?.deaths ?? 0;
    function persist() {
      try { if (run) storage.setItem(RUN_KEY, JSON.stringify(run)); else storage.removeItem?.(RUN_KEY); } catch {}
    }
    function begin(stage, mode = 'select') {
      if (!Number.isInteger(stage) || stage < 0 || stage >= STAGES) return false;
      if (['retry', 'resume', 'next'].includes(mode)) {
        if (!run || run.next !== stage) run = null;
      } else {
        run = stage === 0 ? { next: 0, deaths: 0 } : null;
      }
      deaths = run?.deaths ?? 0;
      persist();
      return !!run;
    }
    function death() {
      deaths = Math.min(1000000, deaths + 1);
      if (run) { run.deaths = deaths; persist(); }
      return deaths;
    }
    function clear(stage) {
      if (!run || stage !== run.next) return { eligible: false, deaths };
      const result = { eligible: true, deaths };
      if (stage === STAGES - 1) run = null;
      else run.next = stage + 1;
      persist();
      return result;
    }
    function entries() {
      const raw = read(storage, BOARD_KEY);
      if (!Array.isArray(raw)) return [];
      const byName = new Map();
      for (const item of raw.slice(0, 100)) {
        const name = normalize(item?.name);
        if (!name || !validDeaths(item?.deaths)) continue;
        const at = Number.isFinite(item.at) ? item.at : 0;
        const key = name.toLocaleLowerCase();
        const prev = byName.get(key);
        if (!prev || item.deaths < prev.deaths || (item.deaths === prev.deaths && at < prev.at))
          byName.set(key, { name, deaths: item.deaths, at });
      }
      return [...byName.values()].sort((a,b) => a.deaths - b.deaths || a.at - b.at || a.name.localeCompare(b.name)).slice(0, 20);
    }
    function submit(input, count, at = Date.now()) {
      const name = normalize(input);
      if (!name) return { ok: false, message: '닉네임은 1~12글자로 입력해줘.' };
      if (!validDeaths(count)) return { ok: false, message: '올바른 완주 기록이 아니야.' };
      const board = entries();
      board.push({ name, deaths: count, at: Number.isFinite(at) ? at : Date.now() });
      const unique = new Map();
      for (const item of board) {
        const key = item.name.toLocaleLowerCase(), prev = unique.get(key);
        if (!prev || item.deaths < prev.deaths || (item.deaths === prev.deaths && item.at < prev.at)) unique.set(key, item);
      }
      const sorted = [...unique.values()].sort((a,b) => a.deaths-b.deaths || a.at-b.at || a.name.localeCompare(b.name)).slice(0,20);
      if (!write(storage, BOARD_KEY, sorted)) return { ok: false, message: '이 브라우저에 기록을 저장할 수 없어.' };
      const rank = sorted.findIndex(x => x.name.toLocaleLowerCase() === name.toLocaleLowerCase());
      return { ok: true, rank: rank < 0 ? null : rank + 1, entries: sorted };
    }
    return {
      begin, death, clear, entries, submit,
      get resumeStage() { return run?.next ?? null; },
      get deaths() { return deaths; },
      get eligible() { return !!run; }
    };
  }
  return { create, normalize, RUN_KEY, BOARD_KEY };
});
