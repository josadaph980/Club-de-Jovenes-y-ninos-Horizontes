/* ==========================================================================
   script.js — Rellena la página con los datos de siteData.js, integra el
   enlace alterno de Donorbox y maneja el menú.
   JavaScript nativo, sin librerías. Todo el texto se inserta con textContent
   (nunca innerHTML con datos editables), así que ningún dato puede inyectar código.
   ========================================================================== */
(function () {
  "use strict";

  // `const SITE_DATA` (en siteData.js) no cuelga de window, por eso se lee por nombre.
  var D = typeof SITE_DATA !== "undefined" ? SITE_DATA : null;
  if (!D) {
    console.error("No se encontró SITE_DATA: revisa que siteData.js cargue antes de script.js.");
    return;
  }

  /* ---------- Utilidades ---------- */
  function get(path) {
    return path.split(".").reduce(function (obj, key) {
      return obj && obj[key] !== undefined ? obj[key] : undefined;
    }, D);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function byId(id) { return document.getElementById(id); }

  function whatsappHref(contact, message) {
    var url = "https://wa.me/" + D.countryCode + contact.phone;
    return message ? url + "?text=" + encodeURIComponent(message) : url;
  }

  function mailtoHref(subject, body) {
    var params = [];
    if (subject) params.push("subject=" + encodeURIComponent(subject));
    if (body) params.push("body=" + encodeURIComponent(body));
    return "mailto:" + D.org.email + (params.length ? "?" + params.join("&") : "");
  }

  // Persona de contacto principal (la primera de la lista; hoy, solo Jeffrey).
  var MAIN = (D.contacts && D.contacts[0]) || null;

  function externalLink(className, href, label, hiddenHint) {
    var a = el("a", className, label);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    if (hiddenHint) a.appendChild(el("span", "visually-hidden", " " + hiddenHint));
    return a;
  }

  var NEW_TAB = "(se abre en una pestaña nueva)";

  /* ---------- Textos y enlaces enlazados por data-bind / data-href ---------- */
  function bindSimple() {
    document.querySelectorAll("[data-bind]").forEach(function (node) {
      var value = get(node.getAttribute("data-bind"));
      if (value) node.textContent = value;
    });
    document.querySelectorAll("[data-href]").forEach(function (node) {
      var value = get(node.getAttribute("data-href"));
      if (value) node.setAttribute("href", value);
    });
  }

  /* ---------- Logo (o rótulo provisional "CJNH") ---------- */
  function renderLogo() {
    document.querySelectorAll("[data-logo]").forEach(function (slot) {
      slot.textContent = "";
      if (D.logo && D.logo.src) {
        slot.classList.add("has-logo");
        var img = document.createElement("img");
        img.src = D.logo.src;
        img.alt = D.logo.alt || "";
        img.addEventListener("error", function () {
          slot.classList.remove("has-logo");
          slot.textContent = D.org.acronym; // si el archivo no existe, vuelve al texto
        });
        slot.appendChild(img);
      } else {
        slot.textContent = D.org.acronym;
        slot.setAttribute("aria-hidden", "true"); // el nombre ya está en el texto contiguo
      }
    });
  }

  /* ---------- Logos de grupos (solo si la fundación entrega el archivo) ---------- */
  function renderGroupLogos() {
    var logos = D.groupLogos || {};
    document.querySelectorAll("[data-group-logo]").forEach(function (slot) {
      var cfg = logos[slot.getAttribute("data-group-logo")];
      if (!cfg || !cfg.src) return;                 // sin archivo: el espacio queda oculto
      var img = document.createElement("img");
      img.src = cfg.src;
      img.alt = cfg.alt || "";
      img.addEventListener("error", function () { slot.hidden = true; });
      slot.appendChild(img);
      slot.hidden = false;
    });
  }

  /* ---------- Paneles desplegables (grupos, "por qué lo hacemos", programas) ----------
     Un solo escuchador delegado para todos los botones [data-toggle]: cada uno controla el
     panel indicado en aria-controls y refleja su estado en aria-expanded. Sin JavaScript los
     paneles quedan visibles (no tienen "hidden" en el HTML). */
  function setupToggles() {
    document.querySelectorAll("[data-panel]").forEach(function (p) { p.hidden = true; });
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-toggle]");
      if (!btn) return;
      var panel = byId(btn.getAttribute("aria-controls"));
      if (!panel) return;
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      var host = btn.closest("[data-acc]");
      if (host) host.classList.toggle("is-open", open);
      var label = btn.querySelector(".diamond__text");
      if (label) label.textContent = open ? btn.getAttribute("data-text-open") : btn.getAttribute("data-text-closed");
    });
  }

  /* ---------- Tarjetas con información complementaria (principios, actividades, cifras) ----------
     El cursor la muestra con CSS; el toque, el clic y el teclado la fijan con .is-open / aria-expanded. */
  function setupReveal() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".reveal__btn");
      if (!btn) return;
      var card = btn.closest("[data-reveal]");
      if (!card) return;
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      card.classList.toggle("is-open", open);
    });
  }

  /* ---------- Carruseles de fotografías ----------
     Base: lista con desplazamiento horizontal y "snap" (sin JavaScript se puede deslizar igual).
     Con JavaScript: avance automático cada 5 s con UN solo temporizador por carrusel.
     - Solo el botón de pausa/reproducción detiene o reanuda el avance automático.
     - Flechas, indicadores, teclado y deslizamiento cambian de foto y reinician la cuenta
       de 5 s, pero NO apagan la reproducción.
     - Mientras el carrusel está fuera de pantalla o la pestaña está oculta, la cuenta espera.
     - Con "movimiento reducido" sigue avanzando, pero el cambio es instantáneo (sin deslizamiento). */
  function setupCarousels() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll("[data-carousel]").forEach(function (root) {
      if (root.__carousel) return;               // evita inicializar dos veces (dos temporizadores)
      root.__carousel = true;
      var vp = root.querySelector(".carousel__viewport");
      var slides = Array.prototype.slice.call(root.querySelectorAll(".carousel__slide"));
      var dotsWrap = root.querySelector(".carousel__dots");
      var toggleBtn = root.querySelector(".carousel__toggle");
      var n = slides.length, idx = 0, playing = true, visible = false, scrollT = 0;
      var DELAY = 5000, STEP = 250, elapsed = 0;
      if (!vp || n < 2) return;

      var dots = slides.map(function (s, i) {
        var d = el("button", "carousel__dot");
        d.type = "button";
        d.setAttribute("aria-label", "Ver foto " + (i + 1) + " de " + n);
        d.addEventListener("click", function () { go(i); });
        dotsWrap.appendChild(d);
        return d;
      });

      function mark() {
        dots.forEach(function (d, i) { d.setAttribute("aria-current", String(i === idx)); });
      }
      function go(i, instant) {
        elapsed = 0;                              // cada cambio reinicia la cuenta: nunca hay avances dobles
        idx = (i + n) % n;
        vp.scrollTo({ left: slides[idx].offsetLeft, behavior: (reduce || instant) ? "auto" : "smooth" });
        mark();
      }
      function setPlaying(p) {
        playing = p;
        elapsed = 0;
        root.classList.toggle("is-paused", !p);
        toggleBtn.setAttribute("aria-label", p ? "Pausar el cambio automático" : "Reanudar el cambio automático");
        toggleBtn.setAttribute("aria-pressed", String(!p));
      }
      function tick() {
        if (!playing || !visible || document.hidden) return;   // la cuenta espera, no se pierde
        elapsed += STEP;
        if (elapsed >= DELAY) go(idx + 1);
      }

      root.querySelector(".carousel__prev").addEventListener("click", function () { go(idx - 1); });
      root.querySelector(".carousel__next").addEventListener("click", function () { go(idx + 1); });
      toggleBtn.addEventListener("click", function () { setPlaying(!playing); });
      vp.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
      });
      // Al deslizar con el dedo o el trackpad: se actualiza el indicador y se reinicia la cuenta.
      vp.addEventListener("scroll", function () {
        clearTimeout(scrollT);
        scrollT = setTimeout(function () {
          var w = slides[0].offsetWidth || 1;
          var i = Math.round(vp.scrollLeft / w);
          if (i !== idx && i >= 0 && i < n) { idx = i; elapsed = 0; mark(); }
        }, 120);
      }, { passive: true });
      window.addEventListener("resize", function () { go(idx, true); });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.35 }).observe(root);
      } else { visible = true; }

      setPlaying(true);
      mark();
      root.classList.add("is-ready");
      setInterval(tick, STEP);
    });
  }

  /* ---------- Siluetas de la portada: mensaje de cada persona ----------
     Cursor (escritorio), toque (móvil) o teclado (Tab): se muestra un globo con el mensaje
     escrito en data-msg. El mismo texto está en aria-label para lectores de pantalla. */
  function setupFigures() {
    var hero = document.querySelector(".hero");
    var tip = byId("fig-tip");
    if (!hero || !tip) return;
    tip.setAttribute("aria-hidden", "true");
    tip.removeAttribute("role"); tip.removeAttribute("aria-live");
    var figs = Array.prototype.slice.call(hero.querySelectorAll(".hero__art .fig"));
    var current = null;

    function show(fig) {
      if (current && current !== fig) current.classList.remove("is-active");
      current = fig;
      fig.classList.add("is-active");
      tip.textContent = fig.getAttribute("data-msg") || "";
      tip.hidden = false;
      var hr = hero.getBoundingClientRect();
      var fr = (fig.querySelector(".sway") || fig).getBoundingClientRect();
      var cx = fr.left + fr.width / 2 - hr.left;
      var half = tip.offsetWidth / 2, pad = 10;
      var x = Math.min(Math.max(cx, half + pad), hr.width - half - pad);
      tip.style.left = x + "px";
      tip.style.top = (fr.top - hr.top) + "px";
      tip.style.setProperty("--arrow", "calc(50% + " + (cx - x) + "px)");
    }
    function hide(fig) {
      if (fig && fig !== current) return;
      if (current) current.classList.remove("is-active");
      current = null;
      tip.hidden = true;
    }
    figs.forEach(function (fig) {
      fig.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") show(fig); });
      fig.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hide(fig); });
      // Solo el foco de teclado abre el globo; el toque y el clic lo controla el evento "click".
      fig.addEventListener("focus", function () {
        var kb = true; try { kb = fig.matches(":focus-visible"); } catch (err) {}
        if (kb) show(fig);
      });
      fig.addEventListener("blur", function () { hide(fig); });
      fig.addEventListener("click", function (e) {
        e.stopPropagation();
        if (current === fig && !tip.hidden && e.pointerType !== "mouse") hide(fig); else show(fig);
      });
      fig.addEventListener("keydown", function (e) { if (e.key === "Escape") { hide(fig); } });
    });
    document.addEventListener("click", function (e) { if (current && !e.target.closest(".hero__art .fig")) hide(); });
    window.addEventListener("resize", function () { if (current) show(current); });
  }

  /* ---------- Galería "Campamentos y momentos que compartimos" (D.gallery) ----------
     Mosaico; cada foto se amplía en un visor (<dialog>) con flechas, teclado y deslizar.
     Se muestran las mejores `pageSize` fotos al inicio y el resto con "Ver todas las fotos" (y "Ver menos").
     El texto de cada foto se muestra dentro de la imagen, abajo.
     Las secciones permanecen ocultas si no hay fotos con permiso confirmado. */
  var viewer = null; // controlador único del visor
  function getViewer() {
    if (viewer) return viewer;
    var dlg = byId("visor");
    if (!dlg || typeof dlg.showModal !== "function") return (viewer = { ok: false });
    var set = [], cur = 0, x0 = null;
    function show(i) {
      if (!set.length) return;
      cur = (i + set.length) % set.length;
      var it = set[cur].item;
      var vi = byId("visor-img");
      vi.src = it.src; vi.alt = it.alt;
      byId("visor-pie").textContent = it.caption || "";
      byId("visor-cuenta").textContent = (cur + 1) + " de " + set.length;
    }
    byId("visor-ant").addEventListener("click", function () { show(cur - 1); });
    byId("visor-sig").addEventListener("click", function () { show(cur + 1); });
    byId("visor-cerrar").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); }); // clic en el fondo
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(cur - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); show(cur + 1); }
    });
    dlg.addEventListener("pointerdown", function (e) { x0 = e.pointerType === "mouse" ? null : e.clientX; });
    dlg.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    });
    dlg.addEventListener("close", function () { byId("visor-img").removeAttribute("src"); });
    return (viewer = {
      ok: true,
      open: function (entries, entry) {
        set = entries; show(Math.max(0, set.indexOf(entry)));
        if (!dlg.open) dlg.showModal();
      }
    });
  }

  function buildGallery(G, ids) {
    var section = byId(ids.section);
    var list = byId(ids.list);
    if (!G || !section || !list || G.consentConfirmed !== true || !G.items || !G.items.length) return;
    var V = getViewer();
    var entries = [];

    function live() { return entries.filter(function (e) { return e.li.isConnected; }); }
    var size = Math.max(1, G.pageSize || 9);
    var more = byId(ids.more), moreWrap = byId(ids.moreWrap);
    var expanded = false;
    function refresh() {
      var L = live();
      if (!L.length) { section.hidden = true; return; }
      var limit = expanded ? L.length : size;
      L.forEach(function (e, i) { e.li.hidden = i >= limit; });
      if (moreWrap) moreWrap.hidden = L.length <= size;
      if (more) {
        more.textContent = expanded ? "Ver menos fotos" : "Ver todas las fotos";
        more.setAttribute("aria-expanded", String(expanded));
      }
    }

    G.items.forEach(function (item) {
      if (!item.src || !item.alt) {
        console.warn("Foto omitida: falta src o alt (texto alternativo sin nombres).");
        return;
      }
      var li = el("li", "gallery__item" + (item.tall ? " is-tall" : ""));
      var fig = el("figure");
      var img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", function () { li.remove(); refresh(); });
      var holder = img;
      var entry = { item: item, li: li };
      if (V.ok) {
        holder = el("button", "gallery__btn");
        holder.type = "button";
        holder.setAttribute("aria-label", "Ampliar foto: " + (item.caption || item.alt));
        holder.appendChild(img);
        holder.addEventListener("click", function () { V.open(live(), entry); });
      }
      fig.appendChild(holder);
      if (item.caption) fig.appendChild(el("figcaption", null, item.caption));
      li.appendChild(fig);
      entries.push(entry);
      list.appendChild(li);
    });

    if (more) more.addEventListener("click", function () {
      var L = live();
      var first = L[size];
      expanded = !expanded;
      refresh();
      if (expanded) {
        var f = first && first.li.querySelector("button, img");
        if (f && f.focus) f.focus({ preventScroll: true });
      } else {
        section.scrollIntoView({ block: "start" });
      }
    });

    var notice = byId(ids.notice);
    if (notice) {
      notice.appendChild(document.createTextNode(G.noticeBefore || ""));
      if (MAIN) {
        notice.appendChild(externalLink(null, whatsappHref(MAIN, D.messages.photoRequestWhatsApp),
          MAIN.name + " (" + MAIN.display + ")", NEW_TAB));
      }
      notice.appendChild(document.createTextNode("."));
    }
    section.hidden = false;
    refresh();
  }

  function renderGallery() {
    buildGallery(D.gallery, { section: "galeria", list: "galeria-lista", more: "galeria-mas", moreWrap: "galeria-mas-wrap", notice: "galeria-aviso" });
  }

  /* ---------- Impacto y meta ---------- */
  function renderImpact() {
    var I = D.impact;
    byId("impacto-valor").textContent = I.headline.value;
    byId("impacto-frase").textContent = I.headline.sentence;
    byId("impacto-mide").textContent = I.headline.measures;
    byId("impacto-porque").textContent = I.headline.why;
    byId("impacto-nota").textContent = I.headline.note;
    byId("impacto-nota-cifras").textContent = I.secondaryNote;

    // Cada cifra: lo destacado (valor y etiqueta) siempre visible; periodo y "por qué importa"
    // se muestran al pasar el cursor, al tocar la tarjeta o al activarla con el teclado.
    var list = byId("impacto-cifras");
    I.secondary.forEach(function (s, i) {
      var li = el("li");
      li.setAttribute("data-reveal", "");
      var btn = el("button", "reveal__btn stat__btn");
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", "cifra-" + i);
      btn.appendChild(el("span", "stat__value", s.value));
      var label = el("span", "stat__label", s.label);
      var pulse = el("span", "pulse"); pulse.setAttribute("aria-hidden", "true");
      label.appendChild(pulse);
      btn.appendChild(label);
      li.appendChild(btn);
      var body = el("div", "reveal__body"); body.id = "cifra-" + i;
      var inner = el("div");
      var meta = el("dl", "stat__meta");
      // El periodo ya no se muestra en las tarjetas (oct. 2026); el dato sigue en SITE_DATA.
      var b = el("div"); b.appendChild(el("dt", null, "Por qué importa")); b.appendChild(el("dd", null, s.why)); meta.appendChild(b);
      inner.appendChild(meta); body.appendChild(inner); li.appendChild(body);
      list.appendChild(li);
    });

    // La meta vigente se muestra junto a la misión y la visión.
    byId("meta-valor").textContent = I.goal.value;
    byId("meta-texto").textContent = I.goal.text;
    var mn = byId("meta-nota");
    if (mn) mn.textContent = I.goal.note;
  }

  /* ---------- Junta directiva ----------
     Tres estados, sin inventar nada:
       - Completa (nombre, cargo y retrato autorizado): el retrato es un botón; al pulsarlo (o al pasar el
         cursor, solo como apoyo visual) se muestran debajo el cargo en la fundación y el perfil profesional.
       - Con nombre y cargo pero sin retrato autorizado: se muestran el nombre y el dato profesional, sin
         retrato ni imagen simulada.
       - Sin datos: tarjeta discreta "Información próximamente" con un bloque geométrico (no una persona). */
  var PATTERN =
    '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M24 4l20 20-20 20L4 24Z" fill="none" stroke="currentColor" stroke-width="3"/>' +
    '<path d="M24 14l10 10-10 10-10-10Z" fill="currentColor"/></svg>'; // constante interna, sin datos externos

  function hasText(m) { return !!(m.name && m.role); }
  function hasPhoto(m) { return !!(m.photo && m.photoAuthorized === true); }
  // Cargo en la fundación (varias funciones se separan con " · ") y perfil profesional: se muestran por separado.
  function roleLines(m) { return String(m.role || "").split(" · ").map(function (t) { return t.trim(); }).filter(Boolean); }
  function profileLines(m) {
    var p = Array.isArray(m.profile) ? m.profile : [m.area, m.career];
    return p.filter(Boolean);
  }
  function infoBlock(kind, label, lines) {
    var b = el("div", "board__block board__block--" + kind);
    b.appendChild(lettered("p", "board__tag", label));
    lines.forEach(function (t) { b.appendChild(lettered("p", "board__line", t)); });
    return b;
  }

  // Texto letra por letra: cada letra es un <span> decorativo y el texto completo queda
  // disponible para lectores de pantalla en un span oculto.
  var letterIndex = 0;
  function lettered(tag, className, text) {
    var node = el(tag, className);
    node.appendChild(el("span", "visually-hidden", text));
    var vis = el("span"); vis.setAttribute("aria-hidden", "true");
    // Las letras se agrupan por palabra para que el salto de línea nunca corte una palabra.
    text.split(" ").forEach(function (word, wi) {
      if (wi) { vis.appendChild(document.createTextNode(" ")); letterIndex++; }
      var w = el("span", "w");
      Array.prototype.forEach.call(word, function (ch) {
        var c = el("span", "ch", ch);
        c.style.setProperty("--i", letterIndex++);
        w.appendChild(c);
      });
      vis.appendChild(w);
    });
    node.appendChild(vis);
    return node;
  }

  function boardCard(m, i) {
    var li = el("li", "board__card");
    var media;
    if (hasText(m) && hasPhoto(m)) {
      media = document.createElement("img");
      media.className = "board__photo";
      media.src = m.photo;
      media.alt = "Retrato de " + m.name;
      media.loading = "lazy";
      media.addEventListener("error", function () {
        // Si la foto no existe, no se muestra una imagen rota: queda el bloque geométrico.
        var ph = el("div", "board__placeholder"); ph.innerHTML = PATTERN; ph.setAttribute("aria-hidden", "true");
        media.replaceWith(ph);
      });
    } else {
      media = el("div", "board__placeholder");
      media.innerHTML = PATTERN; // solo el SVG constante de arriba
      media.setAttribute("aria-hidden", "true");
    }
    li.appendChild(media);

    var cap = el("div", "board__caption");
    cap.id = "junta-detalle-" + i;
    letterIndex = 0;
    if (hasText(m)) {
      li.classList.add(hasPhoto(m) ? "is-complete" : "is-textonly");
      cap.classList.add("board__caption--blocks");
      cap.appendChild(lettered("p", "board__name", m.name));
      cap.appendChild(infoBlock("role", "Cargo en la fundación", roleLines(m)));
      var prof = profileLines(m);
      if (prof.length) cap.appendChild(infoBlock("profile", "Perfil profesional", prof));
    } else {
      li.classList.add("is-pending");
      cap.appendChild(lettered("p", "board__pending", "Información próximamente"));
    }
    li.appendChild(cap);

    // Táctil y teclado: tocar o pulsar Enter/Espacio muestra la línea y el texto (en escritorio también con el cursor).
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.setAttribute("aria-expanded", "false");
    li.setAttribute("aria-controls", cap.id);
    function toggle() {
      var open = li.getAttribute("aria-expanded") !== "true";
      li.setAttribute("aria-expanded", String(open));
      li.classList.toggle("is-open", open);
    }
    li.addEventListener("click", toggle);
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
    return li;
  }

  function renderBoard() {
    var list = byId("junta-lista");
    var interactive = false;
    D.board.members.forEach(function (m, i) {
      if (!hasText(m) && !D.board.showIncompleteCards) return;
      list.appendChild(boardCard(m, i));
      interactive = true;
    });
    var hint = byId("junta-ayuda");
    // La ayuda solo aplica si hay tarjetas con retrato (las demás ya muestran su texto).
    if (hint && interactive && list.querySelector(".is-complete")) {
      hint.textContent = "Pasa el cursor o toca cada tarjeta para ver el cargo y el perfil profesional de cada persona.";
      hint.hidden = false;
    }
  }

  /* ---------- Aliados (oculta hasta que la fundación confirme) ---------- */
  function renderAllies() {
    var A = D.allies;
    var section = byId("aliados");
    var list = byId("aliados-lista");
    if (!A || A.confirmed !== true || !A.items || !A.items.length) return;

    A.items.forEach(function (a) {
      // Solo se muestra un aliado con nombre, logo y autorización explícita.
      if (!a.name || !a.logo || a.authorized !== true) return;
      var li = el("li", "ally");
      var img = document.createElement("img");
      img.src = a.logo;
      img.alt = "Logo de " + a.name;
      img.loading = "lazy";
      img.addEventListener("error", function () {
        li.remove();
        if (!list.children.length) section.hidden = true;
      });

      var holder = a.url ? externalLink("ally__link", a.url, "", NEW_TAB) : el("div", "ally__link");
      holder.insertBefore(img, holder.firstChild);
      holder.appendChild(el("span", "ally__name", a.name));
      li.appendChild(holder);
      if (a.description) li.appendChild(el("p", "ally__desc", a.description));
      list.appendChild(li);
    });

    if (list.children.length) section.hidden = false;
  }

  /* ---------- Voluntariado ---------- */
  function renderVolunteer() {
    var areas = byId("voluntariado-areas");
    D.volunteer.areas.forEach(function (a) { areas.appendChild(el("li", null, a)); });

    var academic = byId("voluntariado-academico");
    D.volunteer.academic.forEach(function (a) {
      var li = el("li");
      li.appendChild(el("strong", null, a.title));
      li.appendChild(document.createTextNode(a.text));
      academic.appendChild(li);
    });

    byId("voluntariado-edad").textContent = D.volunteer.minAgeText;
    var vmail = byId("voluntariado-correo");
    if (vmail) vmail.href = mailtoHref(D.messages.volunteerEmailSubject, D.messages.volunteerEmailBody);

    var wa = byId("voluntariado-wa");
    if (MAIN) {
      wa.href = whatsappHref(MAIN, D.messages.volunteerWhatsApp);
      wa.target = "_blank";
      wa.rel = "noopener noreferrer";
      wa.textContent = "Escribir por WhatsApp";
      wa.appendChild(el("span", "visually-hidden", " " + NEW_TAB));
    }
  }

  /* ---------- Donaciones (Donorbox) ----------
     El formulario es el código oficial exacto de Donorbox, escrito directamente
     en index.html (script de módulo + elemento dbox-widget). Aquí solo se
     rellena el enlace alterno por si el navegador bloquea el formulario.
     Este sitio no recoge ni procesa datos de pago: lo hace Donorbox. */
  function renderDonation() {
    var cfg = D.donorbox || {};
    var alt = byId("donaciones-alterna");
    if (!alt) return;
    if (cfg.campaignUrl) {
      alt.href = cfg.campaignUrl;
    } else {
      alt.closest("p").hidden = true;
    }
  }

  /* ---------- Contacto ----------
     El número es un enlace tel: más un botón para copiarlo. WhatsApp abre un chat con un
     mensaje SIN enviar, y el correo abre un borrador: ambos solo cuando la persona los pulsa. */
  var ICON_WA = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4 20l1.3-4.2A8 8 0 1 1 8.300 18.800Z" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linejoin="round"/><path d="M9.200 8.800c.4 2.600 2.400 4.600 5 5l1.100-1.200-1.800-1-.8.7c-.8-.4-1.500-1.100-1.900-1.900l.7-.8-1-1.800Z" fill="currentColor"/></svg>';
  var ICON_MAIL = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" fill="none" stroke="currentColor" stroke-width="2.200"/><path d="M3.500 6l8.500 7 8.500-7" fill="none" stroke="currentColor" stroke-width="2.200"/></svg>';

  function withIcon(node, svg, hidden) {
    var holder = document.createElement("span");
    holder.className = "btn__icon";
    holder.innerHTML = svg; // constantes internas de arriba, sin datos externos
    node.insertBefore(holder, node.firstChild);
    if (hidden) node.appendChild(el("span", "visually-hidden", " " + hidden));
  }

  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else fallback();
  }

  function renderContact() {
    var mailBtn = byId("contacto-correo-btn");
    if (mailBtn) { mailBtn.href = mailtoHref(); withIcon(mailBtn, ICON_MAIL); }
    var mail = byId("contacto-correo");
    if (mail) { mail.href = mailtoHref(); mail.textContent = D.org.email; }

    var waBtn = byId("contacto-wa");
    if (waBtn && MAIN) {
      waBtn.href = whatsappHref(MAIN, D.messages.generalWhatsApp);
      waBtn.target = "_blank"; waBtn.rel = "noopener noreferrer";
      withIcon(waBtn, ICON_WA, NEW_TAB);
    }
    var vwa = byId("voluntariado-wa");
    if (vwa && !vwa.querySelector(".btn__icon")) withIcon(vwa, ICON_WA);

    var people = byId("contacto-personas");
    if (people) {
      D.contacts.forEach(function (c) {
        var box = el("div", "person");
        box.appendChild(el("p", "person__name", c.role ? c.name + ", " + c.role.toLowerCase() : c.name));
        var row = el("div", "person__row");
        // Número como enlace tel: (en el celular abre el marcador; no llama solo).
        var num = el("p", "person__number");
        var tel = el("a", "person__tel", c.display);
        tel.href = "tel:+" + D.countryCode + c.phone;
        tel.setAttribute("aria-label", "Llamar al " + c.display);
        num.appendChild(tel);
        row.appendChild(num);
        var copy = el("button", "btn btn--outline btn--sm", "Copiar número");
        copy.type = "button";
        var status = el("span", "visually-hidden");
        status.setAttribute("role", "status");
        copy.addEventListener("click", function () {
          copyText(c.display, function (ok) {
            copy.textContent = ok ? "Número copiado" : "No se pudo copiar";
            status.textContent = copy.textContent;
            setTimeout(function () { copy.textContent = "Copiar número"; status.textContent = ""; }, 2400);
          });
        });
        row.appendChild(copy);
        box.appendChild(row);
        box.appendChild(status);
        box.appendChild(el("p", "person__hint small muted", "Llamadas y WhatsApp. Toca el número para llamar o cópialo."));
        people.appendChild(box);
      });
    }

    // Redes sociales: solo si existen perfiles reales en siteData.js
    if (D.socials && D.socials.length) {
      var list = byId("contacto-redes-lista");
      D.socials.forEach(function (s) {
        if (!s.url) return;
        var li = el("li");
        li.appendChild(externalLink("btn btn--outline", s.url, s.label, NEW_TAB));
        list.appendChild(li);
      });
      if (list.children.length) byId("contacto-redes").hidden = false;
    }
  }

  /* ---------- Pie ---------- */
  function renderFooter() {
    byId("pie-privacidad").textContent = D.privacyText;
    byId("pie-anio").textContent = D.org.foundedYear + "–" + new Date().getFullYear();
  }

  /* ---------- Menú adaptable ---------- */
  var DESKTOP_NAV = "(min-width: 1360px)"; // debe coincidir con styles.css

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = byId("menu-principal");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    // Si se agranda la ventana, el menú vuelve a su estado normal.
    window.matchMedia(DESKTOP_NAV).addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });
  }


  /* ---------- Tema claro / oscuro ----------
     data-theme ya lo fijó el script del <head> (elección guardada o tema del
     sistema). Aquí se maneja el botón, se guarda SOLO cuando la persona elige,
     y se sigue al sistema mientras no haya elección guardada. */
  function setupTheme() {
    var root = document.documentElement;
    var btn = document.querySelector(".theme-toggle");
    var meta = document.querySelector('meta[name="theme-color"]');
    var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

    function stored() {
      try { var t = localStorage.getItem("cjnh-theme"); return (t === "dark" || t === "light") ? t : null; }
      catch (e) { return null; }
    }
    function apply(theme) {
      root.setAttribute("data-theme", theme);
      if (btn) btn.setAttribute("aria-pressed", String(theme === "dark"));
      if (meta) meta.setAttribute("content", theme === "dark" ? "#0b181c" : "#00D1C6");
    }

    apply(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

    if (btn) {
      btn.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        apply(next);
        try { localStorage.setItem("cjnh-theme", next); } catch (e) { /* sin almacenamiento: solo esta visita */ }
      });
    }
    if (mq) {
      var follow = function (e) { if (!stored()) apply(e.matches ? "dark" : "light"); };
      if (mq.addEventListener) mq.addEventListener("change", follow);
      else if (mq.addListener) mq.addListener(follow);
    }
  }

  /* ---------- Animaciones por scroll (se repiten al salir y volver a entrar) ----------
     Un observador por tipo, que atiende ENTRADA y SALIDA del área visible:
       - Tarjetas (.reveal-ready): al entrar suben y aparecen (.is-in); al salir por completo
         vuelven a su estado inicial, así reaparecen cada vez.
       - Títulos de sección: la barra de color se dibuja al entrar (.is-seen) y se reinicia al salir.
       - Cifras: cuentan desde 0 cada vez que entran; fuera de pantalla muestran su valor final real.
       - Portada: .in-view reinicia la animación del sol y las personas y la pausa mientras no se ve.
     Solo anima cifras que ya existen en siteData.js. Con "movimiento reducido" (o sin
     IntersectionObserver) no se anima nada y todo se ve en su estado final. */
  function setupMotion() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;

    function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

    /* --- Tarjetas y títulos: histéresis (entra al ver ~12 %, se reinicia al salir del todo) --- */
    var inOut = function (cls) {
      return new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && e.intersectionRatio >= 0.1) e.target.classList.add(cls);
          else if (!e.isIntersecting) e.target.classList.remove(cls);
        });
      }, { threshold: [0, 0.1], rootMargin: "0px 0px -6% 0px" });
    };
    var cards = inOut("is-in"), titles = inOut("is-seen");
    document.querySelectorAll(".panel, .group, .mv__card, .stats li, .goal, .legal-card, .principle, .cat, .milestone, .timeline__item, .photo, .carousel, .step, .board__card, .volunteer-cta, .ally, .donate-card").forEach(function (n) {
      n.classList.add("reveal-ready");
      cards.observe(n);
    });
    document.querySelectorAll(".section").forEach(function (sec) { titles.observe(sec); });

    /* --- Cifras --- */
    function prepCounter(node) {
      var raw = (node.textContent || "").trim();
      var m = raw.match(/^([^\d]*)(\d{1,3}(?:\.\d{3})*|\d+)(.*)$/);
      if (!m) return null;
      var target = parseInt(m[2].replace(/\./g, ""), 10);
      if (!isFinite(target) || target <= 0) return null;
      var vis = el("span", "visually-hidden", raw);              // valor real para lectores de pantalla
      var shown = el("span", "count", raw);                      // lo animado es decorativo
      shown.setAttribute("aria-hidden", "true");
      node.textContent = "";
      node.appendChild(vis);
      node.appendChild(shown);
      return { shown: shown, pre: m[1], post: m[3], target: target, raf: 0, timer: 0 };
    }
    function finish(c) {
      if (c.raf) cancelAnimationFrame(c.raf);
      clearTimeout(c.timer); c.raf = 0;
      c.shown.textContent = c.pre + fmt(c.target) + c.post;
    }
    function run(c) {
      finish(c);
      var start = null, dur = 1400;
      c.shown.textContent = c.pre + "0" + c.post;
      function step(t) {
        if (start === null) start = t;
        var p = Math.min(1, (t - start) / dur);
        c.shown.textContent = c.pre + fmt(Math.round(c.target * (1 - Math.pow(1 - p, 3)))) + c.post;
        if (p < 1) c.raf = requestAnimationFrame(step); else c.raf = 0;
      }
      c.raf = requestAnimationFrame(step);
      c.timer = setTimeout(function () { finish(c); }, dur + 600);   // respaldo si la pestaña estaba en segundo plano
    }
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var c = e.target.__counter; if (!c) return;
        if (e.isIntersecting) { if (!c.active) { c.active = true; run(c); } }
        else { c.active = false; finish(c); }                    // al salir: valor final, listo para repetir
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -8% 0px" });
    var counters = [byId("impacto-valor"), byId("meta-valor")];
    document.querySelectorAll(".stat__value").forEach(function (n) { counters.push(n); });
    counters.forEach(function (n) {
      if (!n) return;
      var c = prepCounter(n); if (!c) return;
      n.__counter = c; cio.observe(n);
    });

    /* --- Portada: la animación del sol y las personas se reinicia cada vez que vuelve a verse --- */
    var hero = document.querySelector(".hero");
    if (hero) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && e.intersectionRatio >= 0.25) hero.classList.add("in-view");
          else if (!e.isIntersecting) hero.classList.remove("in-view");
        });
      }, { threshold: [0, 0.25] }).observe(hero);
    }
  }

  /* ---------- Al navegar a una sección, mover el foco a ella (teclado/lector) ---------- */
  function setupAnchorFocus() {
    window.addEventListener("hashchange", function () {
      var id = decodeURIComponent(location.hash.slice(1));
      var target = id && byId(id);
      if (!target) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  }

  /* ---------- Inicio ----------
     El menú y el foco por anclas van primero y cada bloque se ejecuta aislado:
     si uno falla (por ejemplo, por un archivo desactualizado), el resto sigue
     funcionando y se avisa en la consola del navegador. */
  function safely(fn) {
    try { fn(); } catch (err) { console.error("CJNH: error en " + (fn.name || "bloque"), err); }
  }

  [
    setupMenu, setupTheme, setupAnchorFocus,
    setupToggles, setupReveal, setupCarousels, setupFigures, bindSimple, renderLogo, renderGroupLogos, renderGallery, renderImpact,
    renderBoard, renderAllies, renderVolunteer, renderDonation, renderContact,
    renderFooter, setupMotion
  ].forEach(safely);

  window.__cjnhReady = true; // index.html lo usa para saber que el script cargó
})();
