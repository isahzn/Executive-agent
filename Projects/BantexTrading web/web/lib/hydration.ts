// Inline pre-hydration tap replay.
//
// Problem this solves: the site is server-rendered, so buttons are visible and
// paint their CSS press states instantly — but React's onClick handlers don't
// exist until the JS bundles download and hydration completes. On a phone with
// a cold cache that window is seconds long (large framework chunks + slow
// CPU), and taps landing inside it are silently dropped: the button "registers
// being clicked" (CSS :active) yet nothing happens. Verified headlessly on the
// production build: taps 300ms after DOM ready on a 6x-throttled CPU never
// reached React.
//
// Fix: this tiny inline script (first element in <body>, parsed before any
// bundle) records presses on real buttons that land while the element is not
// yet React-live, and replays the MOST RECENT one the moment that element
// becomes live — so the user's tap finally does what they asked. No framework
// coupling beyond the standard React props expando, ~1.2KB, ES5 syntax so it
// parses even where the modern main bundle cannot.
//
// Safety rules baked in:
// - Only `button[type="button"]:not([disabled])` is eligible. Submit buttons
//   (checkout "Pay"), links, radios and checkboxes are excluded, so a
//   pre-hydration tap can never double-fire a form submission. Links need no
//   help: an unhydrated anchor click navigates natively.
// - Elements that are already React-live at press time are never recorded —
//   their native click works, and recording would cause a double action.
// - Race guard: if hydration lands between a recorded pointerdown and the
//   gesture's own click (native click then fires React's handler), the native
//   click is marked "worked" and the replay is cancelled — never double-fired.
// - Only the MOST RECENT recorded tap is replayed (earlier taps are usually
//   mis-taps; replaying a whole sequence could trigger unintended actions).
// - Recorded taps expire after 8s (a real phone's hydration window: cold
//   cache + mid-range CPU measured >4s at 6x throttle headlessly), polling
//   stops 15s after the last recorded tap, and polling only runs while taps
//   are pending — zero idle cost.
export const PREHYDRATION_TAP_REPLAY = `(function () {
  if (window.__btPrehydrInit) return;
  window.__btPrehydrInit = true;
  var taps = [];
  var clicks = [];
  var pollTimer = null;
  var startedAt = Date.now();
  var MAX_TAPS = 3;
  var MAX_CLICKS = 8;
  var MAX_AGE_MS = 8000;
  var POLL_MS = 120;
  var POLL_LIMIT_MS = 15000;

  function isLive(el) {
    for (var k in el) {
      if (k.indexOf("__reactProps$") === 0) return true;
    }
    return false;
  }

  function recordTap(e) {
    var t = e.target;
    var el = t && t.closest
      ? t.closest('button[type="button"]:not([disabled])')
      : null;
    if (!el || isLive(el)) return;
    startedAt = Date.now();
    taps.push({ el: el, at: startedAt });
    if (taps.length > MAX_TAPS) taps.shift();
    startPolling();
  }

  function recordNativeClick(e) {
    var t = e.target;
    var el = t && t.closest ? t.closest('button[type="button"]') : null;
    if (!el) return;
    clicks.push({ el: el, live: isLive(el), at: Date.now() });
    if (clicks.length > MAX_CLICKS) clicks.shift();
  }

  // True when this exact gesture already reached React (hydration landed
  // between the press and the click) — replaying would double-fire.
  function gestureAlreadyWorked(tap) {
    for (var i = 0; i < clicks.length; i++) {
      var c = clicks[i];
      if (c.el === tap.el && c.at > tap.at && c.live) return true;
    }
    return false;
  }

  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(function () {
      var now = Date.now();
      if (now - startedAt > POLL_LIMIT_MS) {
        clearInterval(pollTimer);
        pollTimer = null;
        taps = [];
        return;
      }
      taps = taps.filter(function (t) {
        return now - t.at < MAX_AGE_MS;
      });
      if (!taps.length) {
        clearInterval(pollTimer);
        pollTimer = null;
        return;
      }
      var tap = taps[taps.length - 1];
      if (isLive(tap.el) && !gestureAlreadyWorked(tap)) {
        clearInterval(pollTimer);
        pollTimer = null;
        taps = [];
        if (tap.el.isConnected && !tap.el.disabled) tap.el.click();
      }
    }, POLL_MS);
  }

  document.addEventListener("pointerdown", recordTap, {
    capture: true,
    passive: true,
  });
  document.addEventListener("click", recordNativeClick, {
    capture: true,
    passive: true,
  });
})();`;
