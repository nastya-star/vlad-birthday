/* ==========================================================================
   THE GREAT BIRTHDAY HUNT — app logic
   Everything you'd want to customize lives in js/config.js.
   Structure follows the original birthday-website: password cover → site,
   hidden-item hunt → unlocks the cake → light / wish / blow / slice / camera.
   ========================================================================== */
(function(){
  "use strict";

  const C = window.BIRTHDAY_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SVGNS = "http://www.w3.org/2000/svg";

  const STORE_FOUND = "birthday_hunt_found";
  const STORE_PHOTO = "birthday_photo";

  const store = {
    get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
    set(k, v){ try{ localStorage.setItem(k, v); }catch(e){} },
    del(k){ try{ localStorage.removeItem(k); }catch(e){} },
  };

  // ?reset=1 clears saved progress + the camera photo (handy while testing)
  if(window.location.search.includes("reset=1")){
    store.del(STORE_FOUND); store.del(STORE_PHOTO);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  /* ---------- config with safe defaults ---------- */
  const NAME = C.friendName || "Friend";
  const seen = new Set();
  const STICKERS = (C.stickers || []).filter(s => s && s.id && !seen.has(s.id) && seen.add(s.id));
  const REQUIRED = Math.max(1, Math.min(C.stickersRequired || STICKERS.length, STICKERS.length || 1));
  const CATEGORIES = (C.photoCategories && C.photoCategories.length) ? C.photoCategories.slice() : ["PHOTOS"];
  const photos = (C.photos || []).filter(p => p && p.src).map(p => Object.assign({ category: CATEGORIES[0], caption: "", place: "", alt: "" }, p));
  const notes = C.notes || [];
  const reveal = C.reveal || {};

  // stickers that already have their own white edge skip the CSS outline
  if(C.addStickerOutline === false) document.documentElement.classList.add("prebuilt-stickers");

  const fill = (s) => String(s == null ? "" : s)
    .replace(/\{name\}/g, NAME)
    .replace(/\{NAME\}/g, NAME.toUpperCase())
    .replace(/\{count\}/g, REQUIRED);

  function escapeHtml(str){
    const d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }
  function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  /* ======================================================================
     Static text from config
  ====================================================================== */
  const titleTop = fill((C.title && C.title.top) || "THE GREAT");
  const titleBottom = fill((C.title && C.title.bottom) || "{name} HUNT");
  document.title = `${titleTop} ${titleBottom}`.replace(/\s+/g, " ").trim();
  $("poster-title").textContent = `${titleTop} ${titleBottom}`;
  $("tagline").textContent = fill((C.title && C.title.tagline) || "");
  $("poster-year").textContent = String(new Date().getFullYear());
  $("rules-count").textContent = REQUIRED;
  $("total-count").textContent = REQUIRED;
  $("footer-from").textContent = "Made with love by " + (C.fromName || "your friends");
  $("notes-sub").textContent = `Little notes for ${NAME}.`;
  $("reveal-message").textContent = fill(reveal.message || "Happy birthday, {name}!");
  $("reveal-ps").textContent = fill(reveal.ps || "");
  $("cake-unlocked").textContent = fill(reveal.unlockedLine || "All {count} stickers found!");

  /* ======================================================================
     Coiny's "V" is round and reads like a "U" (VLAD → ULAD), so every V/v
     in display type is swapped to Londrina Solid Black. Works for HTML and
     SVG text.
  ====================================================================== */
  function fixV(root){
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while(walker.nextNode()) if(/[Vv]/.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const inSvg = node.parentNode instanceof SVGElement;
      if(node.parentNode.classList && node.parentNode.classList.contains("alt-v")) return;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/([Vv])/).forEach(part => {
        if(!part) return;
        if(/^[Vv]$/.test(part)){
          const el = inSvg ? document.createElementNS(SVGNS, "tspan") : document.createElement("span");
          el.setAttribute("class", "alt-v");
          el.textContent = part;
          frag.appendChild(el);
        }else frag.appendChild(document.createTextNode(part));
      });
      node.parentNode.replaceChild(frag, node);
    });
  }
  const DISPLAY_SELECTOR = ".section-title, .album-title, .footer-big, .reveal-message, .cake-wish, .toast-big, .complete-stamp, .t-face, .t-shadow";
  function fixAllV(){ document.querySelectorAll(DISPLAY_SELECTOR).forEach(fixV); }

  /* ======================================================================
     Welcome poster — rays, wavy ring, swirl, curved type
  ====================================================================== */
  (function buildPoster(){
    const cx = 500, cy = 500;

    // sunburst rays across the poster
    const rays = $("rays");
    const N = 28, R = 760;
    for(let i = 0; i < N; i += 2){
      const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2;
      const p = document.createElementNS(SVGNS, "path");
      p.setAttribute("d", `M${cx} ${cy} L${cx + R*Math.cos(a0)} ${cy + R*Math.sin(a0)} L${cx + R*Math.cos(a1)} ${cy + R*Math.sin(a1)} Z`);
      rays.appendChild(p);
    }

    // wavy ring just outside the deep-blue band
    let d = "";
    const bumps = 30;
    for(let i = 0; i <= 360; i++){
      const t = (i / 360) * Math.PI * 2;
      const r = 304 + 6 * Math.sin(t * bumps);
      d += (i ? "L" : "M") + (cx + r*Math.cos(t)).toFixed(1) + " " + (cy + r*Math.sin(t)).toFixed(1);
    }
    $("ring-wave").setAttribute("d", d + "Z");

    // 4-arm Archimedean swirl in cream / orange / cream / blue
    const swirl = $("swirl");
    const Rs = 232, arms = 4, turns = 3.1;
    const k = Rs / (turns * 2 * Math.PI);
    const band = (2 * Math.PI * k) / arms;
    const colors = ["var(--cream)", "var(--orange)", "var(--cream)", "var(--blue)"];
    const thetaMax = (Rs + band * 2) / k;
    for(let a = 0; a < arms; a++){
      const phase = (a / arms) * Math.PI * 2;
      let pd = "";
      for(let th = 0; th <= thetaMax; th += 0.06){
        const r = k * th, ang = th + phase;
        pd += (pd ? "L" : "M") + (cx + r*Math.cos(ang)).toFixed(1) + " " + (cy + r*Math.sin(ang)).toFixed(1);
      }
      const p = document.createElementNS(SVGNS, "path");
      p.setAttribute("d", pd);
      p.style.stroke = colors[a];
      p.style.strokeWidth = (band + 0.8).toFixed(2);
      swirl.appendChild(p);
    }

    // curved title + ring text
    document.querySelectorAll(".tp-top").forEach(el => el.textContent = titleTop);
    document.querySelectorAll(".tp-bottom").forEach(el => el.textContent = titleBottom);
    fixAllV();

    function fit(){
      // shrink the font if a long name would run past the end of the arc
      [[".title-top", 325 * Math.PI * 0.80], [".title-bottom", 405 * Math.PI * 0.78]].forEach(([sel, max]) => {
        const texts = document.querySelectorAll(sel + " text");
        texts.forEach(t => t.style.fontSize = "");
        const len = texts[1].getComputedTextLength();
        if(len > max){
          const base = parseFloat(getComputedStyle(texts[1]).fontSize) || 122;
          texts.forEach(t => t.style.fontSize = (base * max / len).toFixed(1) + "px");
        }
      });
      // repeat the ring phrase to wrap all the way round
      const ring = $("ring-text");
      const phrase = (C.title && C.title.ring) || "FELIZ ANIVERSÁRIO ✦ ";
      const circ = 2 * Math.PI * 255;
      let s = phrase;
      ring.textContent = s;
      let guard = 0;
      while(ring.parentNode.getComputedTextLength() < circ * 0.86 && guard++ < 12){ s += phrase; ring.textContent = s; }
      if(ring.parentNode.getComputedTextLength() > circ){ s = s.slice(0, -phrase.length); ring.textContent = s; }
      ring.setAttribute("textLength", (circ - 4).toFixed(0));
      ring.setAttribute("lengthAdjust", "spacing");
    }
    fit();
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    // pause the swirl while the poster is off-screen
    const sw = $("swirl");
    if("IntersectionObserver" in window){
      new IntersectionObserver(([e]) => { sw.style.animationPlayState = e.isIntersecting ? "running" : "paused"; })
        .observe($("poster-svg"));
    }
  })();

  /* ======================================================================
     Sticker art — real cut-out, or a neutral numbered placeholder
  ====================================================================== */
  function placeholderSVG(i){
    const n = String(i + 1).padStart(2, "0");
    const palettes = [["var(--blue)", "var(--cream)"], ["var(--orange)", "var(--deep)"], ["var(--deep)", "var(--orange)"]];
    const [bg, fg] = palettes[i % palettes.length];
    let d = "";
    for(let a = 0; a <= 360; a += 3){
      const t = a * Math.PI / 180, r = 44 + 3.2 * Math.cos(t * 16);
      d += (a ? "L" : "M") + (50 + r*Math.cos(t)).toFixed(2) + " " + (50 + r*Math.sin(t)).toFixed(2);
    }
    return `<svg class="sticker-art" viewBox="0 0 100 100" role="img" aria-label="Placeholder sticker ${n}">
      <path d="${d}Z" style="fill:${bg}"/>
      <circle cx="50" cy="50" r="33" style="fill:none;stroke:${fg};stroke-width:1.6;stroke-dasharray:3 3"/>
      <use href="#sym-sparkle" x="40" y="17" width="20" height="20" style="fill:${fg}"/>
      <text x="50" y="62" text-anchor="middle" style="font-family:var(--font-display);font-size:24px;fill:${fg}">${n}</text>
      <text x="50" y="76" text-anchor="middle" style="font-family:var(--font-label);font-size:8.5px;letter-spacing:1.4px;fill:${fg}">STICKER</text>
    </svg>`;
  }

  const missingArt = new Set();   // files that 404'd — don't re-request them
  function stickerArt(st, i, cls){
    const wrap = document.createElement("span");
    wrap.className = cls || "";
    wrap.style.display = "block";
    wrap.style.width = "100%";
    wrap.style.height = "100%";
    if(st.src && !missingArt.has(st.src)){
      const img = new Image();
      img.className = "sticker-art";
      img.alt = "";
      img.draggable = false;
      img.decoding = "async";
      img.onerror = () => { missingArt.add(st.src); wrap.innerHTML = placeholderSVG(i); };
      img.src = st.src;
      wrap.appendChild(img);
    }else{
      wrap.innerHTML = placeholderSVG(i);
    }
    return wrap;
  }

  /* ======================================================================
     The hunt — hide stickers in zones, collect each one exactly once
  ====================================================================== */
  const found = new Set((() => {
    try{ return JSON.parse(store.get(STORE_FOUND) || "[]"); }catch(e){ return []; }
  })().filter(id => STICKERS.some(s => s.id === id)));
  let newlyFound = null;
  window.stickersUnlocked = false;

  const zoneLayers = {};
  document.querySelectorAll("[data-zone-layer]").forEach(el => zoneLayers[el.dataset.zoneLayer] = el);
  const fallbackZones = Object.keys(zoneLayers).filter(z => z !== "hero");

  function placeStickers(){
    STICKERS.forEach((st, i) => {
      if(found.has(st.id)) return;
      const layer = zoneLayers[st.zone] || zoneLayers[fallbackZones[i % fallbackZones.length]];
      if(!layer) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sticker" + (st.zone === "hero" ? " big" : "");
      btn.dataset.id = st.id;
      btn.setAttribute("aria-label", "A hidden sticker — collect it");
      const x = (st.x != null) ? st.x : 8 + ((i * 37) % 84);
      const y = (st.y != null) ? st.y : 12 + ((i * 53) % 76);
      btn.style.left = x + "%";
      btn.style.top = y + "%";
      btn.style.setProperty("--size", typeof st.size === "string" ? st.size : (st.size || 64) + "px");
      btn.style.setProperty("--tilt", (st.tilt != null ? st.tilt : ((i % 2 ? 1 : -1) * (6 + (i * 7) % 12))) + "deg");
      btn.appendChild(stickerArt(st, i));
      btn.addEventListener("click", () => collect(st, btn));
      layer.appendChild(btn);
    });
  }

  function saveFound(){ store.set(STORE_FOUND, JSON.stringify([...found])); }

  function collect(st, btn){
    if(found.has(st.id) || btn.disabled) return;   // never count the same sticker twice
    found.add(st.id);
    newlyFound = st.id;
    saveFound();
    btn.disabled = true;
    btn.setAttribute("aria-hidden", "true");

    const r = btn.getBoundingClientRect();
    const px = r.left + r.width / 2, py = r.top + r.height / 2;
    celebrate(px, py);
    chime();

    btn.classList.add("popping");
    setTimeout(() => flyToAlbum(btn), reduceMotion ? 0 : 650);

    updateCounters(true);
    renderSheets();
    const n = Math.min(found.size, REQUIRED);
    if(found.size >= REQUIRED && !window.stickersUnlocked){
      showToast("COLLECTION COMPLETE!", `${n} / ${REQUIRED} STICKERS COLLECTED`, "THE CAKE IS UNLOCKED", true);
      setTimeout(() => { launchConfetti(); unlockCake(true); }, 700);
    }else{
      showToast("YOU FOUND ONE!", `${n} / ${REQUIRED} STICKERS COLLECTED`, "KEEP EXPLORING", false);
    }
  }

  function flyToAlbum(btn){
    const target = $("album-btn");
    const tr = target.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    if(reduceMotion || !tr.width){
      btn.classList.add("collected");
      return;
    }
    const dx = (tr.left + tr.width / 2) - (br.left + br.width / 2);
    const dy = (tr.top + tr.height / 2) - (br.top + br.height / 2);
    btn.classList.remove("popping");
    btn.classList.add("flying");
    btn.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(200deg) scale(.15)`;
    setTimeout(() => {
      btn.classList.add("collected");
      target.classList.remove("bump"); void target.offsetWidth; target.classList.add("bump");
    }, 760);
  }

  function updateCounters(){
    const n = Math.min(found.size, REQUIRED);
    $("found-count").textContent = n;
    const line = `${n} / ${REQUIRED} stickers collected`;
    $("teaser-status").textContent = line;
    $("album-status").textContent = line;
    $("album-progress-bar").style.width = (100 * n / REQUIRED) + "%";
    $("album-btn").setAttribute("aria-label", `Open the sticker album, ${n} of ${REQUIRED} collected`);
    $("album-complete").hidden = n < REQUIRED;
    if(!window.stickersUnlocked){
      const left = REQUIRED - n;
      $("cake-hint").textContent = n === 0
        ? `find all ${REQUIRED} stickers first…`
        : `${left} more sticker${left === 1 ? "" : "s"} to go…`;
    }
  }

  function renderSheet(el, compact){
    el.innerHTML = "";
    STICKERS.forEach((st, i) => {
      const slot = document.createElement("div");
      const has = found.has(st.id);
      slot.className = "slot" + (has ? " found" : "") + (has && st.id === newlyFound ? " new" : "");
      const num = `<span class="slot-num">Nº ${String(i + 1).padStart(2, "0")}</span>`;
      if(has){
        slot.innerHTML = num;
        const wrap = document.createElement("div");
        wrap.className = "slot-art-wrap";
        wrap.style.setProperty("--tilt", ((i % 2 ? 4 : -4) + (i % 3)) + "deg");
        wrap.appendChild(stickerArt(st, i));
        slot.appendChild(wrap);
        if(!compact) slot.insertAdjacentHTML("beforeend", `<p class="slot-label">${escapeHtml(st.label || "Sticker " + (i + 1))}</p>`);
      }else{
        slot.innerHTML = num + `<div class="slot-q" aria-hidden="true">?</div>` +
          (compact ? "" : `<p class="slot-hint">${escapeHtml(st.hint || "Keep exploring…")}</p>`);
      }
      slot.setAttribute("aria-label", has ? `Sticker ${i + 1}: ${st.label || ""} — collected` : `Sticker ${i + 1}: not found yet`);
      el.appendChild(slot);
    });
  }
  function renderSheets(){
    renderSheet($("sticker-sheet"), false);
    renderSheet($("teaser-sheet"), true);
  }

  /* ---------- celebratory effects ---------- */
  function celebrate(x, y){
    if(reduceMotion) return;
    const fx = document.createElement("div");
    fx.className = "fx";
    fx.style.left = x + "px";
    fx.style.top = y + "px";
    fx.innerHTML = `<svg class="fx-burst" viewBox="0 0 100 100"><use href="#sym-burst"/></svg>`;
    const cols = ["var(--blue)", "var(--orange)", "var(--deep)", "var(--cream)"];
    for(let i = 0; i < 9; i++){
      const a = (i / 9) * Math.PI * 2 + Math.random() * .4;
      const dist = 70 + Math.random() * 40;
      fx.insertAdjacentHTML("beforeend",
        `<svg class="fx-spark" viewBox="0 0 100 100" style="--dx:${(Math.cos(a)*dist).toFixed(0)}px;--dy:${(Math.sin(a)*dist).toFixed(0)}px;fill:${cols[i % cols.length]};animation-delay:${(i%3)*30}ms"><use href="#sym-sparkle"/></svg>`);
    }
    document.body.appendChild(fx);
    setTimeout(() => fx.remove(), 1100);
  }

  function chime(){
    try{
      if(!window.__stickerAC) window.__stickerAC = new (window.AudioContext || window.webkitAudioContext)();
      const c = window.__stickerAC;
      if(c.state === "suspended") c.resume();
      [0, 0.09].forEach((t, i) => {
        const osc = c.createOscillator(), gain = c.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(i ? 1046.5 : 784, c.currentTime + t);
        gain.gain.setValueAtTime(0.0001, c.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.09, c.currentTime + t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t + 0.28);
        osc.connect(gain); gain.connect(c.destination);
        osc.start(c.currentTime + t); osc.stop(c.currentTime + t + 0.3);
      });
    }catch(e){ /* silent is fine */ }
  }

  let toastTimer;
  function showToast(big, count, small, complete){
    const t = $("toast");
    $("toast-big").textContent = big;
    $("toast-count").textContent = count;
    $("toast-small").textContent = small;
    fixV($("toast-big"));
    t.classList.toggle("complete", !!complete);
    t.classList.remove("show"); void t.offsetWidth; t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), complete ? 4200 : 2600);
  }

  /* ======================================================================
     Confetti burst (palette colors)
  ====================================================================== */
  function launchConfetti(){
    const canvas = $("confetti-canvas");
    const ctx = canvas.getContext("2d");
    const w = canvas.width = window.innerWidth;
    const h = canvas.height = window.innerHeight;
    const colors = ["--blue", "--orange", "--deep", "--cream"].map(cssVar);
    const count = reduceMotion ? 0 : 140;
    const particles = [];
    for(let i = 0; i < count; i++){
      particles.push({
        x: w/2 + (Math.random()-0.5)*90, y: h*0.42,
        vx: (Math.random()-0.5) * 12, vy: -Math.random()*11 - 4,
        size: 5 + Math.random()*6,
        color: colors[i % colors.length],
        rot: Math.random()*Math.PI, vrot: (Math.random()-0.5) * 0.3,
        life: 0, maxLife: 90 + Math.random()*40,
        shape: i % 3,
      });
    }
    function tick(){
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      particles.forEach(p => {
        if(p.life > p.maxLife) return;
        alive = true;
        p.vy += 0.22; p.x += p.vx; p.y += p.vy; p.rot += p.vrot; p.life++;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - p.life/p.maxLife);
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = colors[2]; ctx.lineWidth = 1.2;
        if(p.shape === 0){ ctx.fillRect(-p.size/2, -p.size/3, p.size, p.size*0.66); }
        else if(p.shape === 1){ ctx.beginPath(); ctx.arc(0, 0, p.size/2, 0, Math.PI*2); ctx.fill(); ctx.stroke(); }
        else { // tiny star
          ctx.beginPath();
          for(let k = 0; k < 8; k++){ const r = k % 2 ? p.size*0.25 : p.size*0.7; const a = k * Math.PI/4; ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r); }
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      });
      if(alive) requestAnimationFrame(tick); else ctx.clearRect(0, 0, w, h);
    }
    if(count > 0) tick();
  }
  window.addEventListener("resize", () => {
    const c = $("confetti-canvas");
    c.width = window.innerWidth; c.height = window.innerHeight;
  });

  /* ======================================================================
     Password / welcome flow
  ====================================================================== */
  const PASSWORD = C.password == null ? "" : String(C.password);
  const gate = $("gate");
  const pwForm = $("pw-form");
  const pwInput = $("password-input");
  const pwWrap = $("pw-input-wrap");
  const pwError = $("pw-error");
  const helpNote = $("help-note");
  let unlocked = false;
  let popupTimer = null;

  if(!PASSWORD){
    gate.classList.add("no-password");
    $("gate-eyebrow").textContent = "a postcard has arrived for you";
    $("enter-btn").textContent = "Open the postcard";
  }else{
    popupTimer = setTimeout(() => { if(!unlocked) helpNote.classList.add("visible"); }, (C.hintDelaySeconds || 6) * 1000);
  }

  $("reveal-trigger").addEventListener("click", () => {
    $("pw-reveal-text").textContent = PASSWORD + "  (tap to copy)";
    $("pw-reveal-box").classList.add("show");
  });
  $("pw-reveal-text").addEventListener("click", () => {
    try{ navigator.clipboard.writeText(PASSWORD); }catch(e){}
    pwInput.value = PASSWORD;
    $("pw-reveal-text").textContent = "copied — and typed in!";
    setTimeout(() => { $("pw-reveal-text").textContent = PASSWORD + "  (tap to copy)"; }, 1600);
  });
  $("got-it-btn").addEventListener("click", () => helpNote.classList.remove("visible"));

  pwForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // forgiving match: ignore case, spaces, punctuation and accents (¡ ! é …)
    const norm = (v) => String(v).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
    if(!PASSWORD || norm(pwInput.value) === norm(PASSWORD)){
      unlock();
    }else{
      pwWrap.classList.remove("error"); void pwWrap.offsetWidth; pwWrap.classList.add("error");
      pwError.classList.add("show");
      clearTimeout(pwForm._errTimer);
      pwForm._errTimer = setTimeout(() => pwError.classList.remove("show"), 2600);
    }
  });

  function unlock(){
    if(unlocked) return;
    unlocked = true;
    clearTimeout(popupTimer);
    helpNote.classList.remove("visible");
    document.body.classList.remove("locked");
    launchConfetti();
  }

  /* ======================================================================
     Postcards — tabs, gallery, lightbox (same model as the original)
  ====================================================================== */
  try{
    const savedPhoto = store.get(STORE_PHOTO);
    if(savedPhoto) photos.unshift({ src: savedPhoto, category: CATEGORIES[0], caption: "the birthday selfie", place: "right here", alt: "Photo taken on the birthday page" });
  }catch(e){}

  let activeCategory = CATEGORIES.find(c => photos.some(p => p.category === c)) || CATEGORIES[0];
  let filteredPhotos = [];
  let lightboxIndex = 0;
  const STAMPS = [["orange", "sym-sun", "CORREIO"], ["blue", "sym-plane", "AÉREO"], ["cream", "sym-sparkle", "POSTAL"]];
  const isVideo = (src) => /\.(mp4|webm|mov)(\?|$)/i.test(src);

  function stampHTML(i, inner){
    const [cls, sym, word] = STAMPS[i % STAMPS.length];
    return `<span class="stamp ${cls}" aria-hidden="true"><span class="stamp-inner">${
      inner || `<svg viewBox="0 0 ${sym === "sym-plane" ? 64 : 100} ${sym === "sym-plane" ? 64 : 100}"><use href="#${sym}"/></svg>`
    }<small>${word}</small></span></span>`;
  }
  function postmarkHTML(text){
    return `<span class="postmark" aria-hidden="true"><svg viewBox="0 0 160 70"><use href="#sym-postmark"/></svg><span>${escapeHtml(text)}</span></span>`;
  }

  function renderTabs(){
    const tabsEl = $("tabs");
    tabsEl.innerHTML = "";
    CATEGORIES.forEach(cat => {
      const n = photos.filter(p => p.category === cat).length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", cat === activeCategory ? "true" : "false");
      btn.innerHTML = `${escapeHtml(cat)}<span class="tab-count">${n ? "· " + n : ""}</span>`;
      btn.addEventListener("click", () => { activeCategory = cat; renderTabs(); renderGallery(); });
      tabsEl.appendChild(btn);
    });
  }

  // illustrated placeholder scenes (no stock photos)
  const SCENES = [
    `<rect width="400" height="300" class="f-cream2"/>
     <circle cx="200" cy="190" r="78" class="f-orange s-deep"/>
     <rect y="188" width="400" height="112" class="f-blue"/>
     <path d="M0 214 q25 -10 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 M0 244 q25 -10 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 M0 274 q25 -10 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" class="wave-line"/>
     <line x1="0" y1="188" x2="400" y2="188" class="s-deep" style="stroke-width:3"/>`,
    `<rect width="400" height="300" class="f-cream"/>
     <circle cx="300" cy="86" r="34" class="f-orange s-deep"/>
     <path d="M0 210 L90 120 L150 170 L230 90 L330 190 L400 150 L400 300 L0 300 Z" class="f-blue s-deep"/>
     <path d="M0 250 Q100 200 200 240 T400 230 L400 300 L0 300 Z" class="f-deep"/>
     <path d="M190 300 C200 270 240 262 228 240" class="road"/>`,
    `<rect width="400" height="300" class="f-cream2"/>
     <g class="f-cream3">${Array.from({length: 12}, (_, i) => { const a0 = i/12*Math.PI*2, a1 = (i+.5)/12*Math.PI*2; return `<path d="M200 150 L${200+400*Math.cos(a0)} ${150+400*Math.sin(a0)} L${200+400*Math.cos(a1)} ${150+400*Math.sin(a1)} Z"/>`; }).join("")}</g>
     <circle cx="200" cy="150" r="70" class="f-blue s-deep"/>
     <circle cx="200" cy="150" r="48" class="f-cream s-deep"/>
     <circle cx="200" cy="150" r="24" class="f-orange s-deep"/>`,
  ];
  const PLACEHOLDER_CAPTIONS = ["postcard still in the mail…", "greetings from somewhere", "a photo is on its way"];

  function renderGallery(){
    const gallery = $("gallery");
    gallery.innerHTML = "";
    filteredPhotos = photos.filter(p => p.category === activeCategory);

    if(filteredPhotos.length === 0){
      SCENES.forEach((scene, i) => {
        const card = document.createElement("div");
        card.className = "postcard placeholder";
        card.style.animationDelay = (i * 0.08) + "s";
        card.innerHTML = `
          <span class="pc-photo"><svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${scene}</svg></span>
          ${stampHTML(i)}
          ${postmarkHTML(activeCategory)}
          <span class="pc-caption">${PLACEHOLDER_CAPTIONS[i]}</span>
          <span class="pc-place">${escapeHtml(activeCategory)}</span>`;
        gallery.appendChild(card);
      });
      return;
    }

    filteredPhotos.forEach((p, i) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "postcard";
      card.style.animationDelay = (i * 0.06) + "s";
      card.setAttribute("aria-label", "Open postcard: " + (p.caption || p.alt || "photo"));
      const media = isVideo(p.src)
        ? `<video src="${escapeHtml(p.src)}" autoplay loop muted playsinline></video>`
        : `<img src="${escapeHtml(p.thumb || p.src)}" alt="${escapeHtml(p.alt || p.caption)}" loading="lazy" decoding="async" />`;
      card.innerHTML = `
        <span class="pc-photo">${media}</span>
        ${stampHTML(i)}
        ${postmarkHTML(p.place || activeCategory)}
        ${p.caption ? `<span class="pc-caption">${escapeHtml(p.caption)}</span>` : ""}
        ${p.place ? `<span class="pc-place">— ${escapeHtml(p.place)}</span>` : ""}`;
      const m = card.querySelector("img, video");
      // frame each postcard to its photo: portrait 4:5, landscape 4:3
      const frame = card.querySelector(".pc-photo");
      if(p.ratio) frame.style.aspectRatio = p.ratio;
      m.addEventListener(isVideo(p.src) ? "loadedmetadata" : "load", () => {
        const w = m.naturalWidth || m.videoWidth, h = m.naturalHeight || m.videoHeight;
        if(w && h && !p.ratio) frame.style.aspectRatio = (w >= h ? "4 / 3" : "4 / 5");
      }, { once: true });
      if(m.complete && m.naturalWidth) frame.style.aspectRatio = p.ratio || (m.naturalWidth >= m.naturalHeight ? "4 / 3" : "4 / 5");
      m.addEventListener("error", () => {
        m.remove();
        card.querySelector(".pc-photo").insertAdjacentHTML("beforeend", `<span class="pc-broken">this postcard got lost in the mail<br/>(check the file name)</span>`);
      });
      card.addEventListener("click", () => openLightbox(i));
      gallery.appendChild(card);
    });
  }

  let lastFocus = null;
  function openLightbox(index){
    lightboxIndex = index;
    lastFocus = document.activeElement;
    updateLightbox();
    $("lightbox").hidden = false;
    $("lb-close").focus();
  }
  function updateLightbox(){
    const p = filteredPhotos[lightboxIndex];
    if(!p) return;
    $("lb-media").innerHTML = isVideo(p.src)
      ? `<video src="${escapeHtml(p.src)}" autoplay controls loop playsinline></video>`
      : `<img src="${escapeHtml(p.src)}" alt="${escapeHtml(p.alt || p.caption)}" />`;
    $("lb-caption").innerHTML = escapeHtml(p.caption) + (p.place ? `<small>${escapeHtml(p.place)}</small>` : "");
    const multi = filteredPhotos.length > 1;
    $("lb-prev").hidden = !multi; $("lb-next").hidden = !multi;
  }
  function closeLightbox(){
    $("lightbox").hidden = true;
    $("lb-media").innerHTML = "";
    if(lastFocus) lastFocus.focus();
  }
  function lbNext(){ lightboxIndex = (lightboxIndex + 1) % filteredPhotos.length; updateLightbox(); }
  function lbPrev(){ lightboxIndex = (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length; updateLightbox(); }
  $("lb-close").addEventListener("click", closeLightbox);
  $("lb-next").addEventListener("click", lbNext);
  $("lb-prev").addEventListener("click", lbPrev);
  $("lightbox").addEventListener("click", (e) => { if(e.target.id === "lightbox") closeLightbox(); });

  // swipe in the lightbox on phones
  (function(){
    let x0 = null;
    const lb = $("lightbox");
    lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", e => {
      if(x0 == null || filteredPhotos.length < 2) return;
      const dx = e.changedTouches[0].clientX - x0;
      if(Math.abs(dx) > 50) (dx < 0 ? lbNext : lbPrev)();
      x0 = null;
    });
  })();

  /* ======================================================================
     Notes — postcard backs
  ====================================================================== */
  function initials(name){
    return String(name || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  }
  function renderNotes(){
    const grid = $("note-grid");
    grid.innerHTML = "";
    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();
    notes.forEach((m, i) => {
      const card = document.createElement("article");
      card.className = "letter";
      card.style.animationDelay = (i * 0.08) + "s";
      card.innerHTML = `
        <div class="letter-msg">
          <p>${escapeHtml(m.message)}</p>
          <span class="letter-sign">— ${escapeHtml(m.name)}</span>
        </div>
        <div class="letter-side">
          ${stampHTML(i, `<b>${escapeHtml(initials(m.name))}</b>`)}
          ${postmarkHTML((m.from ? m.from + " " : "") + today)}
          <ul class="address" aria-label="Addressed to">
            <li>To ${escapeHtml(NAME)}</li>
            <li>somewhere in</li>
            <li>Latin America</li>
          </ul>
        </div>`;
      grid.appendChild(card);
    });
  }

  /* ======================================================================
     Sticker album modal
  ====================================================================== */
  const albumModal = $("album-modal");
  function openAlbum(){
    lastFocus = document.activeElement;
    renderSheets();
    albumModal.hidden = false;
    document.body.style.overflow = "hidden";
    albumModal.querySelector(".modal-close").focus();
    newlyFound = null; // the peel-in animation plays once
  }
  function closeAlbum(){
    albumModal.hidden = true;
    document.body.style.overflow = "";
    if(lastFocus) lastFocus.focus();
  }
  $("album-btn").addEventListener("click", openAlbum);
  $("open-album-inline").addEventListener("click", openAlbum);
  albumModal.querySelector("[data-close-modal]").addEventListener("click", closeAlbum);
  albumModal.addEventListener("click", (e) => { if(e.target === albumModal) closeAlbum(); });
  $("go-cake").addEventListener("click", () => { closeAlbum(); });

  window.addEventListener("keydown", (e) => {
    if(!$("lightbox").hidden){
      if(e.key === "Escape") closeLightbox();
      if(e.key === "ArrowRight") lbNext();
      if(e.key === "ArrowLeft") lbPrev();
      return;
    }
    if(e.key === "Escape" && !albumModal.hidden) closeAlbum();
  });

  /* ======================================================================
     Camera (after eating the slice) — adds a selfie to the postcards
  ====================================================================== */
  (function initCameraFlow(){
    const ui = $("camera-ui"), video = $("cam-video"), canvas = $("cam-canvas");
    const snapBtn = $("cam-snap"), cancelBtn = $("cam-cancel"), prompt = $("cam-prompt");
    let stream = null;

    function closeCam(){
      ui.hidden = true;
      if(stream){ stream.getTracks().forEach(t => t.stop()); stream = null; }
    }
    window.openCamera = async () => {
      ui.hidden = false;
      prompt.textContent = "Wait… one picture for the postcard wall.";
      video.style.display = ""; snapBtn.style.display = ""; cancelBtn.textContent = "Cancel";
      try{
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        video.srcObject = stream;
      }catch(err){
        prompt.textContent = "The postcard couldn't borrow your camera this time — but the memory still counts.";
        video.style.display = "none";
        snapBtn.style.display = "none";
        cancelBtn.textContent = "Close";
      }
    };
    cancelBtn.addEventListener("click", closeCam);
    snapBtn.addEventListener("click", () => {
      if(!video.videoWidth) return;
      const s = Math.min(video.videoWidth, video.videoHeight, 900);
      canvas.width = canvas.height = s;
      const ctx = canvas.getContext("2d");
      const sx = (video.videoWidth - Math.min(video.videoWidth, video.videoHeight)) / 2;
      const sy = (video.videoHeight - Math.min(video.videoWidth, video.videoHeight)) / 2;
      const side = Math.min(video.videoWidth, video.videoHeight);
      ctx.translate(s, 0); ctx.scale(-1, 1);  // mirror like the preview
      ctx.drawImage(video, sx, sy, side, side, 0, 0, s, s);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const entry = { src: dataUrl, category: CATEGORIES[0], caption: "the birthday selfie", place: "right here", alt: "Photo taken on the birthday page" };
      if(photos[0] && photos[0].src.startsWith("data:")) photos[0] = entry; else photos.unshift(entry);
      store.set(STORE_PHOTO, dataUrl);
      closeCam();
      activeCategory = CATEGORIES[0];
      renderTabs(); renderGallery();
      $("postcards").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  })();

  /* ======================================================================
     Music — music-box "Happy Birthday" (public-domain tune) via WebAudio.
     Same arrangement as the original; it only plays when the button is
     tapped (no autoplay).
  ====================================================================== */
  (function initMusic(){
    const btn = $("music-btn");
    let ctx, master, delay, feedback, wet, playing = false, loopTimer = null, activeNodes = [];
    const BEAT = 0.4;
    const MELODY = [
      [392.00,0.75],[392.00,0.25],[440.00,1],[392.00,1],[523.25,1],[493.88,2],
      [392.00,0.75],[392.00,0.25],[440.00,1],[392.00,1],[587.33,1],[523.25,2],
      [392.00,0.75],[392.00,0.25],[783.99,1],[659.25,1],[523.25,1],[493.88,1],[440.00,2],
      [698.46,0.75],[698.46,0.25],[659.25,1],[523.25,1],[587.33,1],[523.25,2],
    ];
    const BASS = [130.81, 130.81, 196.00, 130.81];
    const PHRASE_BEATS = [6, 6, 8, 8];
    const melodyLength = MELODY.reduce((sum, [, beats]) => sum + beats, 0) * BEAT;

    function pluck(freq, startTime, dur, type, peakGain, detune){
      const osc = ctx.createOscillator();
      osc.type = type; osc.frequency.value = freq;
      if(detune) osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, startTime);
      g.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
      osc.connect(g); g.connect(master); g.connect(wet);
      osc.start(startTime); osc.stop(startTime + dur + 0.08);
      activeNodes.push(osc);
    }
    function scheduleNote(freq, t, dur){
      const j = (Math.random() - 0.5) * 0.01;
      pluck(freq, t + j, dur * 0.92, "sine", 0.85, -3);
      pluck(freq * 2, t + j, dur * 0.55, "triangle", 0.16, 4);
    }
    function scheduleBass(freq, t, dur){
      const osc = ctx.createOscillator();
      osc.type = "sine"; osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.22, t + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(master);
      osc.start(t); osc.stop(t + dur + 0.1);
      activeNodes.push(osc);
    }
    function playLoop(){
      if(!playing) return;
      let t = ctx.currentTime + 0.05, phraseIdx = 0, beatsInto = 0;
      MELODY.forEach(([freq, beats]) => {
        const dur = beats * BEAT;
        if(beatsInto === 0) scheduleBass(BASS[phraseIdx], t, PHRASE_BEATS[phraseIdx] * BEAT * 0.96);
        scheduleNote(freq, t, dur * 0.9);
        t += dur; beatsInto += beats;
        if(beatsInto >= PHRASE_BEATS[phraseIdx]){ beatsInto = 0; phraseIdx = Math.min(phraseIdx + 1, PHRASE_BEATS.length - 1); }
      });
      loopTimer = setTimeout(() => { if(playing) playLoop(); }, (melodyLength + 1.2) * 1000);
    }
    const ICON_OFF = $("music-icon-off").outerHTML;
    const ICON_ON = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18V6l10-2v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.5" stroke="currentColor" stroke-width="2"/><circle cx="16.5" cy="16" r="2.5" stroke="currentColor" stroke-width="2"/></svg>';
    function start(){
      if(playing) return Promise.resolve();
      if(!ctx){
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
        delay = ctx.createDelay(); delay.delayTime.value = 0.28;
        feedback = ctx.createGain(); feedback.gain.value = 0.22;
        wet = ctx.createGain(); wet.gain.value = 0.5;
        wet.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(ctx.destination);
      }
      const resume = ctx.state === "suspended" ? ctx.resume() : Promise.resolve();
      return resume.then(() => {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.62, ctx.currentTime + 0.6);
        playing = true; playLoop();
        btn.classList.add("playing");
        btn.setAttribute("aria-pressed", "true");
        btn.setAttribute("aria-label", "Pause birthday music");
        btn.innerHTML = ICON_ON;
      });
    }
    function stop(){
      playing = false; clearTimeout(loopTimer); loopTimer = null;
      if(master && ctx){
        try{ master.gain.cancelScheduledValues(ctx.currentTime); }catch(e){}
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      }
      activeNodes.forEach(o => { try{ o.stop(ctx.currentTime + 0.22); }catch(e){} });
      activeNodes = [];
      btn.classList.remove("playing");
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute("aria-label", "Play birthday music");
      btn.innerHTML = ICON_OFF;
    }
    btn.addEventListener("click", () => { if(playing) stop(); else start().catch(() => {}); });
  })();

  /* ======================================================================
     Cake — locked until the album is complete; then light, wish, blow,
     reveal, cut a slice, eat it, and take a photo (original sequence).
  ====================================================================== */
  const scene = $("cake-scene");
  const candleBtn = $("candle-hit");
  let lit = false, blownOut = false, cut = false, eaten = false;

  function showEl(el, delay){ setTimeout(() => el && el.classList.add("show"), delay || 0); }

  function unlockCake(animated){
    if(window.stickersUnlocked) return;
    window.stickersUnlocked = true;
    scene.classList.add("ready");
    candleBtn.setAttribute("aria-disabled", "false");
    $("cake-hint").textContent = "tap the candle to light it.";
    showEl($("cake-unlocked"), animated ? 300 : 0);
  }

  function playCue(kind){
    try{
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      const c = new AC();
      const dur = kind === "spark" ? 0.28 : 0.4;
      const size = Math.floor(c.sampleRate * dur);
      const buffer = c.createBuffer(1, size, c.sampleRate);
      const data = buffer.getChannelData(0);
      for(let i = 0; i < size; i++) data[i] = (Math.random()*2 - 1) * (1 - i/size);
      const noise = c.createBufferSource(); noise.buffer = buffer;
      const filter = c.createBiquadFilter();
      filter.type = kind === "spark" ? "highpass" : "lowpass";
      filter.frequency.value = kind === "spark" ? 1600 : 450;
      const gain = c.createGain(); gain.gain.value = kind === "spark" ? 0.1 : 0.16;
      noise.connect(filter); filter.connect(gain); gain.connect(c.destination);
      noise.start(); noise.stop(c.currentTime + dur);
      noise.onended = () => { try{ c.close(); }catch(e){} };
    }catch(e){}
  }

  function lightCandle(){
    if(!window.stickersUnlocked || lit) return;
    lit = true;
    scene.classList.add("lit");
    playCue("spark");
    $("cake-lock").hidden = true;
    candleBtn.setAttribute("aria-label", "Blow out the candle");
    showEl($("cake-wish"), 900);
    showEl($("blow-btn"), 1050);
  }

  function blowOutCandle(){
    if(!lit || blownOut) return;
    blownOut = true;
    scene.classList.add("blowing");
    playCue("puff");
    $("blow-btn").classList.add("used");
    requestAnimationFrame(() => scene.classList.add("blown"));
    setTimeout(() => scene.classList.remove("blowing"), 1700);
    setTimeout(() => {
      $("cake-wish").classList.remove("show");
      $("cake-unlocked").classList.remove("show");
      $("blow-btn").classList.remove("show");
    }, 1500);
    showEl($("cake-reveal"), 1900);
    setTimeout(launchConfetti, 1900);
    showEl($("cake-ps"), 3400);
    setTimeout(() => {
      cut = true;
      scene.classList.add("cut");
      candleBtn.setAttribute("aria-label", "Eat the slice");
      $("cake-lock").hidden = false;
      $("cake-hint").textContent = "tap the slice to eat it.";
    }, 2600);
  }

  function eatSlice(){
    if(!cut || eaten) return;
    eaten = true;
    $("cake-slice").classList.add("eaten");
    $("i-ate-note").classList.add("show");
    $("cake-lock").hidden = true;
    candleBtn.setAttribute("aria-label", "Cake finished");
    setTimeout(() => { if(window.openCamera) window.openCamera(); }, 1500);
  }

  candleBtn.addEventListener("click", () => {
    if(!lit) lightCandle();
    else if(!blownOut) blowOutCandle();
    else eatSlice();
  });
  $("blow-btn").addEventListener("click", (e) => { e.stopPropagation(); blowOutCandle(); });

  /* ======================================================================
     Boot
  ====================================================================== */
  placeStickers();
  updateCounters();
  renderSheets();
  renderTabs();
  renderGallery();
  renderNotes();
  if(found.size >= REQUIRED) unlockCake(false);
})();
