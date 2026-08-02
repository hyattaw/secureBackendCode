/* ------------------------------
   SHARED MINIGAME UI HELPERS
   ------------------------------ */

export function uiPop(el) {
  el.classList.remove("ui-pop");
  void el.offsetWidth;
  el.classList.add("ui-pop");
}

export function uiShake(el) {
  el.classList.remove("ui-shake");
  void el.offsetWidth;
  el.classList.add("ui-shake");
}

export function uiGlow(el, enable = true) {
  if (enable) el.classList.add("ui-glow");
  else el.classList.remove("ui-glow");
}
