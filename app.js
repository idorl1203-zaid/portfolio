(() => {
  const { I18N, CATEGORIES, PROJECTS } = window;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  let lang = store.get("lang") || ((navigator.language || "").startsWith("he") ? "he" : "en");
  let filter = "all";
  let reveal;

  const t = (k) => I18N[lang][k];
  const img = (name) => `assets/img/${name}.webp`;

  const linkBtn = (l, cls = "btn btn-ghost") => {
    const label = l.type === "showcase" ? t("showcase") : t(l.type);
    return `<a class="${cls}" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(label)}</a>`;
  };

  function renderFeatured() {
    $("#featured").innerHTML = PROJECTS.filter((p) => p.featured).map((p) => {
      const c = p[lang];
      const primary = p.links[0];
      return `
      <article class="tile reveal" style="--accent:${p.accent}">
        <img class="tile-icon" src="${p.icon}" alt="" width="64" height="64">
        <div class="status-pill" data-s="${p.status}">${esc(t("status")[p.status])}</div>
        <h2>${esc(c.name)}</h2>
        <p class="tagline">${esc(c.tagline)}</p>
        <p class="summary">${esc(c.summary)}</p>
        <div class="hero-cta">
          ${primary ? linkBtn(primary, "btn btn-primary") : ""}
          <a class="btn-link" href="#" data-open="${p.id}">${esc(t("learnMore"))} <span class="chev">›</span></a>
        </div>
        <div class="phones">
          ${p.images.slice(0, 3).map((n) => `<div class="phone"><img src="${img(n)}" alt="${esc(c.name)}" loading="lazy"></div>`).join("")}
        </div>
      </article>`;
    }).join("");
  }

  function renderFilters() {
    const used = new Set(PROJECTS.filter((p) => !p.featured).flatMap((p) => p.cats));
    const cats = [{ id: "all", he: t("all"), en: t("all") }, ...CATEGORIES.filter((c) => used.has(c.id))];
    $("#filters").innerHTML = cats.map((c) =>
      `<button class="chip" role="tab" data-filter="${c.id}" aria-selected="${c.id === filter}">${esc(c[lang])}</button>`
    ).join("");
  }

  function renderGrid() {
    $("#grid").innerHTML = PROJECTS.filter((p) => !p.featured).map((p) => {
      const c = p[lang];
      const hidden = filter !== "all" && !p.cats.includes(filter);
      return `
      <button class="card reveal${hidden ? " hidden" : ""}" data-open="${p.id}" style="--accent:${p.accent}" aria-label="${esc(c.name)}">
        <div class="card-body">
          <div class="status-pill" data-s="${p.status}">${esc(t("status")[p.status])}</div>
          <h3>${esc(c.name)}</h3>
          <p class="tagline">${esc(c.tagline)}</p>
          <div class="tags">${p.stack.slice(0, 4).map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
          <div class="card-foot">
            <span class="more">${esc(t("learnMore"))} <span class="chev">›</span></span>
            ${p.code === "private" ? `<span class="lock">🔒 ${esc(lang === "he" ? "קוד פרטי" : "Private code")}</span>` : `<span class="lock">GitHub ↗</span>`}
          </div>
        </div>
        <div class="card-media"><img src="${img(p.images[0])}" alt="" loading="lazy"></div>
      </button>`;
    }).join("");
  }

  function renderStack() {
    const all = [...new Set(PROJECTS.flatMap((p) => p.stack))];
    $("#stack").innerHTML = all.map((s) => `<span>${esc(s)}</span>`).join("");
  }

  function applyStatic() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll(".seg button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    $("#pdf-link").href = `Ido-Rafael-Portfolio-${lang.toUpperCase()}.pdf`;
    document.title = lang === "he" ? "עידו רפאל — פורטפוליו" : "Ido Rafael — Portfolio";
  }

  function render() {
    applyStatic();
    renderFeatured();
    renderFilters();
    renderGrid();
    renderStack();
    observe();
    if (openId) openSheet(openId, true);
  }

  /* Reveal on scroll */
  function observe() {
    reveal?.disconnect();
    reveal = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); reveal.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => reveal.observe(el));
  }

  /* Sheet */
  const sheet = $("#sheet");
  let openId = null, lastFocus = null;
  function openSheet(id, silent) {
    const p = PROJECTS.find((x) => x.id === id);
    if (!p) return;
    const c = p[lang];
    openId = id;
    const links = p.links.map((l, i) => linkBtn(l, i === 0 ? "btn btn-primary" : "btn btn-ghost")).join("");
    const priv = p.code === "private" ? `<span class="lock">🔒 ${esc(t("private"))}</span>` : "";
    $("#sheet-body").innerHTML = `
      <header class="sheet-head" style="--accent:${p.accent}">
        <div class="status-pill" data-s="${p.status}">${esc(t("status")[p.status])}</div>
        <h2 id="sheet-title">${esc(c.name)}</h2>
        <p class="tagline">${esc(c.tagline)}</p>
        <p class="summary">${esc(c.summary)}</p>
        <div class="sheet-links">${links}${priv}</div>
      </header>
      <div class="gallery${p.phone ? " phone-g" : ""}">
        ${p.images.map((n) => `<img src="${img(n)}" alt="${esc(c.name)}" loading="lazy">`).join("")}
      </div>
      <div class="sheet-cols" style="--accent:${p.accent}">
        <section><h4>${esc(t("highlights"))}</h4><ul class="hl">${c.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></section>
        <section><h4>${esc(t("stackLabel"))}</h4><div class="tags">${p.stack.map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div></section>
      </div>`;
    if (silent) return;
    lastFocus = document.activeElement;
    sheet.classList.add("open");
    sheet.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".sheet-panel").scrollTop = 0;
    setTimeout(() => $(".sheet-close").focus(), 50);
    history.replaceState(null, "", "#" + id);
  }
  function closeSheet() {
    openId = null;
    sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    history.replaceState(null, "", location.pathname);
    lastFocus?.focus();
  }

  /* Events */
  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    if (open) { e.preventDefault(); openSheet(open.dataset.open); return; }
    if (e.target.closest("[data-close]")) { closeSheet(); return; }
    const chip = e.target.closest("[data-filter]");
    if (chip) {
      filter = chip.dataset.filter;
      document.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-selected", String(c === chip)));
      document.querySelectorAll(".card").forEach((card) => {
        const p = PROJECTS.find((x) => x.id === card.dataset.open);
        card.classList.toggle("hidden", filter !== "all" && !p.cats.includes(filter));
        card.classList.add("in");
      });
      return;
    }
    const lb = e.target.closest(".seg button");
    if (lb && lb.dataset.lang !== lang) { lang = lb.dataset.lang; store.set("lang", lang); render(); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && sheet.classList.contains("open")) closeSheet(); });

  $("#year").textContent = new Date().getFullYear();
  render();
  const hash = location.hash.slice(1);
  if (PROJECTS.some((p) => p.id === hash)) openSheet(hash);
})();
