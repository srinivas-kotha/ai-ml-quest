/* ============================================================
   AI/ML Quest — Game Engine
   Vanilla JS, no frameworks, no build tools
   ============================================================ */

// ---- Utilities ----
function createElement(tag, className, innerHTML) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---- GameState ----
const GameState = {
  xp: 0,
  level: 1,
  streak: 0,
  combo: 1,
  completedLevels: [],
  achievements: [],
  chapterScores: {},
  soundEnabled: true,

  save() {
    try {
      localStorage.setItem(
        "aiquest_state",
        JSON.stringify({
          xp: this.xp,
          level: this.level,
          streak: this.streak,
          combo: this.combo,
          completedLevels: this.completedLevels,
          achievements: this.achievements,
          chapterScores: this.chapterScores,
          soundEnabled: this.soundEnabled,
        }),
      );
    } catch (e) {
      /* quota exceeded */
    }
  },

  load() {
    try {
      const d = JSON.parse(localStorage.getItem("aiquest_state"));
      if (d) {
        this.xp = d.xp || 0;
        this.level = d.level || 1;
        this.streak = d.streak || 0;
        this.combo = d.combo || 1;
        this.completedLevels = d.completedLevels || [];
        this.achievements = d.achievements || [];
        this.chapterScores = d.chapterScores || {};
        this.soundEnabled = d.soundEnabled !== false;
      }
    } catch (e) {
      /* corrupt data */
    }
  },

  xpForNextLevel() {
    return this.level * 200 + 100;
  },

  addXP(base) {
    const earned = Math.round(base * this.combo);
    this.xp += earned;
    while (this.xp >= this.xpForNextLevel()) {
      this.xp -= this.xpForNextLevel();
      this.level++;
      SoundFX.play("levelUp");
      HUD.showToast("Level Up!", `You reached level ${this.level}`, "⬆️");
    }
    this.save();
    HUD.refresh();
    return earned;
  },

  completeLevel(id) {
    if (!this.completedLevels.includes(id)) {
      this.completedLevels.push(id);
      this.save();
    }
  },

  isLevelCompleted(id) {
    return this.completedLevels.includes(id);
  },

  isChapterUnlocked(ch) {
    const deps = CHAPTER_DEPS[ch] || [];
    if (deps.length === 0) return true;
    return deps.every((dep) => this.isLevelCompleted(`${dep.ch}.${dep.level}`));
  },

  getChapterProgress(ch) {
    const total = ch === 4 ? 11 : ch === 6 ? 3 : 10;
    let done = 0;
    for (let i = 1; i <= total; i++) {
      if (this.isLevelCompleted(`${ch}.${i}`)) done++;
    }
    return Math.round((done / total) * 100);
  },

  incrementCombo() {
    this.streak++;
    this.combo = Math.min(5, 1 + Math.floor(this.streak / 3));
    this.save();
  },

  resetCombo() {
    this.streak = 0;
    this.combo = 1;
    this.save();
  },
};

// ---- SoundFX (Web Audio API) ----
const SoundFX = {
  ctx: null,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  _tone(freq, type, dur, vol = 0.12) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, this.ctx.currentTime);
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(
      0.001,
      this.ctx.currentTime + dur / 1000,
    );
    o.connect(g).connect(this.ctx.destination);
    o.start();
    o.stop(this.ctx.currentTime + dur / 1000);
  },

  correct() {
    this._tone(440, "sine", 80, 0.1);
    setTimeout(() => this._tone(660, "sine", 100, 0.1), 80);
  },

  wrong() {
    this._tone(200, "square", 150, 0.06);
  },

  levelUp() {
    this._tone(523, "sine", 80, 0.1);
    setTimeout(() => this._tone(659, "sine", 80, 0.1), 90);
    setTimeout(() => this._tone(784, "sine", 120, 0.1), 180);
  },

  click() {
    this._tone(800, "sine", 25, 0.04);
  },

  comboUp() {
    this._tone(400, "sine", 60, 0.08);
    setTimeout(() => this._tone(800, "sine", 80, 0.08), 60);
  },

  achievement() {
    [523, 587, 659, 784, 880].forEach((f, i) => {
      setTimeout(() => this._tone(f, "sine", 100, 0.1), i * 80);
    });
  },

  play(name) {
    if (GameState.soundEnabled && this[name]) this[name]();
  },
};

// ---- Particles ----
const Particles = {
  canvas: null,
  ctx: null,
  particles: [],
  animating: false,

  init(canvas) {
    if (!canvas) return;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.resize();
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  burst(x, y, color, count = 40) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 3 + Math.random() * 4,
        color: color || "#3b82f6",
        alpha: 1,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      });
    }
    if (!this.animating) {
      this.animating = true;
      this.update();
    }
  },

  update() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.alpha -= 0.015;
      if (p.alpha <= 0) return false;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      if (p.shape === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
      }
      return true;
    });
    this.ctx.globalAlpha = 1;
    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.update());
    } else {
      this.animating = false;
    }
  },
};

// ---- Typewriter ----
const Typewriter = {
  async type(element, text, speed = 22) {
    element.textContent = "";
    for (const char of text) {
      element.textContent += char;
      await new Promise((r) => setTimeout(r, speed));
    }
    const cursor = createElement("span", "typewriter-cursor");
    cursor.innerHTML = "&nbsp;";
    element.appendChild(cursor);
  },
};

// ---- HUD ----
const HUD = {
  els: {},

  init() {
    this.els = {
      fill: document.getElementById("hud-xp-fill"),
      xpText: document.getElementById("hud-xp-text"),
      level: document.getElementById("hud-level-num"),
      streak: document.getElementById("hud-streak"),
      combo: document.getElementById("hud-combo"),
      sound: document.getElementById("hud-sound"),
      toasts: document.getElementById("toast-container"),
    };
    if (this.els.sound) {
      this.els.sound.addEventListener("click", () => {
        GameState.soundEnabled = !GameState.soundEnabled;
        this.els.sound.textContent = GameState.soundEnabled ? "🔊" : "🔇";
        GameState.save();
      });
    }
  },

  refresh() {
    const e = this.els;
    if (!e.fill) return;
    const pct = Math.min(
      100,
      (GameState.xp / GameState.xpForNextLevel()) * 100,
    );
    e.fill.style.width = pct + "%";
    if (e.xpText)
      e.xpText.textContent = `${GameState.xp} / ${GameState.xpForNextLevel()} XP`;
    if (e.level) e.level.textContent = GameState.level;
    if (e.streak) e.streak.textContent = "🔥 " + GameState.streak;
    if (e.combo) {
      e.combo.textContent = GameState.combo + "x";
      e.combo.classList.toggle("active", GameState.combo > 1);
    }
  },

  showToast(title, desc, icon = "🏆") {
    const container =
      this.els.toasts || document.getElementById("toast-container");
    if (!container) return;
    const toast = createElement(
      "div",
      "toast",
      `
      <span class="toast-icon">${icon}</span>
      <div class="toast-text">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${desc}</div>
      </div>
    `,
    );
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
};

// ---- Timer ----
const Timer = {
  interval: null,

  start(barEl, seconds, onTick, onExpire) {
    let remaining = seconds;
    this.stop();
    this.interval = setInterval(() => {
      remaining -= 0.1;
      const pct = Math.max(0, (remaining / seconds) * 100);
      barEl.style.width = pct + "%";
      if (pct < 20) barEl.classList.add("urgent");
      else barEl.classList.remove("urgent");
      if (onTick) onTick(remaining);
      if (remaining <= 0) {
        this.stop();
        if (onExpire) onExpire();
      }
    }, 100);
  },

  stop() {
    clearInterval(this.interval);
    this.interval = null;
  },
};

// ============================================================
// VISUAL LEARNING COMPONENTS
// ============================================================

// ---- A. PipelineDiagram ----
const PipelineDiagram = {
  render(container, config) {
    const { nodes, edges, animate = true } = config;
    const nodeWidth = 130;
    const nodeHeight = 64;
    const gap = 40;
    const padding = 20;
    const totalWidth = nodes.length * (nodeWidth + gap) - gap + padding * 2;
    const svgHeight = nodeHeight + padding * 2 + 20;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${totalWidth} ${svgHeight}`);
    svg.setAttribute("class", "pipeline-diagram");
    svg.style.width = "100%";
    svg.style.height = "auto";

    const nodePositions = {};
    nodes.forEach((node, i) => {
      const x = padding + i * (nodeWidth + gap);
      const y = padding + 10;
      nodePositions[node.id] = { x: x + nodeWidth / 2, y: y + nodeHeight / 2 };

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "pipeline-node");

      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", nodeWidth);
      rect.setAttribute("height", nodeHeight);
      rect.setAttribute("rx", "12");
      rect.setAttribute("fill", "rgba(20,20,34,0.85)");
      rect.setAttribute("stroke", "var(--accent)");
      rect.setAttribute("stroke-width", "1");
      g.appendChild(rect);

      const icon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      icon.setAttribute("x", x + nodeWidth / 2);
      icon.setAttribute("y", y + 24);
      icon.setAttribute("text-anchor", "middle");
      icon.setAttribute("font-size", "18");
      icon.textContent = node.icon || "";
      g.appendChild(icon);

      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      label.setAttribute("x", x + nodeWidth / 2);
      label.setAttribute("y", y + 48);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("class", "pipeline-node-label");
      label.setAttribute("fill", "var(--text-primary)");
      label.setAttribute("font-size", "11");
      label.setAttribute("font-family", "var(--font-body)");
      label.textContent = node.label;
      g.appendChild(label);

      if (node.dataPreview) {
        const title = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "title",
        );
        title.textContent = node.dataPreview;
        g.appendChild(title);
      }

      svg.appendChild(g);
    });

    edges.forEach(([fromId, toId]) => {
      const from = nodePositions[fromId];
      const to = nodePositions[toId];
      if (!from || !to) return;

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", from.x + nodeWidth / 2 - 5);
      line.setAttribute("y1", from.y);
      line.setAttribute("x2", to.x - nodeWidth / 2 + 5);
      line.setAttribute("y2", to.y);
      line.setAttribute("class", "pipeline-edge");
      line.setAttribute("stroke", "var(--accent)");
      line.setAttribute("stroke-width", "2");
      if (animate) {
        line.style.strokeDasharray = "8 12";
        line.style.animation = "flowPulse 1s linear infinite";
      }
      svg.insertBefore(line, svg.firstChild);
    });

    const wrapper = createElement("div", "pipeline-diagram-wrap");
    wrapper.style.overflowX = "auto";
    wrapper.appendChild(svg);
    container.appendChild(wrapper);
  },
};

// ---- B. AnnotatedCode ----
const AnnotatedCode = {
  PYTHON_KEYWORDS: new Set([
    "from",
    "import",
    "def",
    "class",
    "return",
    "if",
    "else",
    "elif",
    "for",
    "while",
    "with",
    "as",
    "not",
    "in",
    "True",
    "False",
    "None",
    "and",
    "or",
    "is",
    "lambda",
    "try",
    "except",
    "raise",
    "yield",
    "async",
    "await",
    "pass",
    "break",
    "continue",
    "finally",
    "del",
    "global",
    "nonlocal",
    "assert",
    "print",
  ]),

  highlightPython(code) {
    // Escape HTML first
    let escaped = escapeHtml(code);

    // Comments (# ...)
    escaped = escaped.replace(/(#.*)$/gm, '<span class="cmt">$1</span>');

    // Triple-quoted strings
    escaped = escaped.replace(
      /("""[\s\S]*?"""|'''[\s\S]*?''')/g,
      '<span class="str">$1</span>',
    );

    // Double and single quoted strings
    escaped = escaped.replace(/(&quot;.*?&quot;|"[^"]*"|'[^']*')/g, (m) => {
      if (m.includes('class="')) return m; // skip already-wrapped
      return `<span class="str">${m}</span>`;
    });

    // Decorators
    escaped = escaped.replace(/(@\w+)/g, '<span class="dec">$1</span>');

    // Numbers
    escaped = escaped.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="num">$1</span>',
    );

    // Keywords
    const kwPattern = new RegExp(
      "\\b(" + Array.from(this.PYTHON_KEYWORDS).join("|") + ")\\b",
      "g",
    );
    escaped = escaped.replace(kwPattern, (m) => {
      return `<span class="kw">${m}</span>`;
    });

    // Function calls
    escaped = escaped.replace(/\b(\w+)(\s*\()/g, (m, fn, paren) => {
      if (this.PYTHON_KEYWORDS.has(fn)) return m;
      return `<span class="fn">${fn}</span>${paren}`;
    });

    return escaped;
  },

  render(container, config) {
    const { language = "python", title, code, annotations = [] } = config;
    const lines = code.split("\n");

    const wrapper = createElement("div", "code-block-container");

    // Title bar
    if (title) {
      const titleBar = createElement("div", "code-block-title");
      titleBar.innerHTML = `<span>${escapeHtml(title)}</span>`;
      wrapper.appendChild(titleBar);
    }

    // Copy button
    const copyBtn = createElement("button", "code-copy-btn", "Copy");
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 1500);
      });
    });
    wrapper.appendChild(copyBtn);

    // Build annotation map: line number -> annotation index
    const lineAnnotations = {};
    annotations.forEach((ann, idx) => {
      (ann.lines || []).forEach((ln) => {
        if (!lineAnnotations[ln]) lineAnnotations[ln] = [];
        lineAnnotations[ln].push(idx);
      });
    });

    const codeEl = createElement("div", "code-block learn-code-block");
    lines.forEach((line, i) => {
      const lineNum = i + 1;
      const isHighlighted = lineAnnotations[lineNum];
      const highlighted =
        language === "python" ? this.highlightPython(line) : escapeHtml(line);

      const lineEl = createElement(
        "div",
        "code-line" + (isHighlighted ? " highlighted" : ""),
      );
      lineEl.innerHTML = `<span class="code-line-num">${lineNum}</span><span class="code-line-content">${highlighted}</span>`;

      if (isHighlighted) {
        lineAnnotations[lineNum].forEach((annIdx) => {
          const marker = createElement("span", "code-annotation-marker");
          marker.textContent = annIdx + 1;
          marker.title = annotations[annIdx].text;
          marker.addEventListener("click", (e) => {
            e.stopPropagation();
            const existing = codeEl.querySelector(
              `.code-annotation-body[data-ann="${annIdx}"]`,
            );
            if (existing) {
              existing.remove();
              return;
            }
            // Remove any other open annotations
            codeEl
              .querySelectorAll(".code-annotation-body")
              .forEach((el) => el.remove());
            const body = createElement("div", "code-annotation-body");
            body.dataset.ann = annIdx;
            body.textContent = annotations[annIdx].text;
            lineEl.after(body);
          });
          lineEl.querySelector(".code-line-content").appendChild(marker);
        });
      }

      codeEl.appendChild(lineEl);
    });

    wrapper.appendChild(codeEl);
    container.appendChild(wrapper);
  },
};

// ---- C. BeforeAfter ----
const BeforeAfter = {
  render(container, config) {
    const { before, after } = config;
    const wrapper = createElement("div", "comparison-container");

    const tabs = createElement("div", "comparison-tabs");
    const btnBefore = createElement(
      "button",
      "comparison-tab active",
      before.label || "Before",
    );
    const btnAfter = createElement(
      "button",
      "comparison-tab",
      after.label || "After",
    );
    tabs.appendChild(btnBefore);
    tabs.appendChild(btnAfter);
    wrapper.appendChild(tabs);

    const contentArea = createElement("div", "comparison-content");
    contentArea.innerHTML = before.content;
    wrapper.appendChild(contentArea);

    let showingBefore = true;
    const toggle = (showBefore) => {
      if (showBefore === showingBefore) return;
      showingBefore = showBefore;
      btnBefore.classList.toggle("active", showBefore);
      btnAfter.classList.toggle("active", !showBefore);
      contentArea.style.opacity = "0";
      contentArea.style.transform = "translateY(6px)";
      setTimeout(() => {
        contentArea.innerHTML = showBefore ? before.content : after.content;
        contentArea.style.opacity = "1";
        contentArea.style.transform = "translateY(0)";
      }, 150);
    };

    btnBefore.addEventListener("click", () => toggle(true));
    btnAfter.addEventListener("click", () => toggle(false));

    container.appendChild(wrapper);
  },
};

// ---- D. StepReveal ----
const StepReveal = {
  render(container, config) {
    const { steps } = config;
    let current = 0;

    const wrapper = createElement("div", "step-reveal-container");

    const counter = createElement("div", "step-counter");
    const contentArea = createElement("div", "step-content");
    const nav = createElement("div", "step-nav");
    const prevBtn = createElement("button", "btn btn-secondary btn-sm", "Prev");
    const nextBtn = createElement("button", "btn btn-primary btn-sm", "Next");
    const indicators = createElement("div", "step-indicator");

    const render = () => {
      counter.textContent = `Step ${current + 1} of ${steps.length}`;
      contentArea.style.opacity = "0";
      setTimeout(() => {
        contentArea.innerHTML = `<h4>${steps[current].title}</h4><p>${steps[current].content}</p>`;
        contentArea.style.opacity = "1";
      }, 120);

      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === steps.length - 1;

      indicators.innerHTML = "";
      steps.forEach((_, i) => {
        const dot = createElement(
          "span",
          "step-dot" +
            (i === current ? " active" : "") +
            (i < current ? " done" : ""),
        );
        indicators.appendChild(dot);
      });
    };

    prevBtn.addEventListener("click", () => {
      if (current > 0) {
        current--;
        render();
      }
    });
    nextBtn.addEventListener("click", () => {
      if (current < steps.length - 1) {
        current++;
        render();
      }
    });

    nav.appendChild(prevBtn);
    nav.appendChild(indicators);
    nav.appendChild(nextBtn);

    wrapper.appendChild(counter);
    wrapper.appendChild(contentArea);
    wrapper.appendChild(nav);

    render();
    container.appendChild(wrapper);
  },
};

// ---- E. SliderPlayground ----
const SliderPlayground = {
  renderers: {
    chunkPreview(previewEl, values, previewText) {
      const chunkSize = values.chunk_size || 512;
      const overlap = values.overlap || 10;
      const overlapChars = Math.round(chunkSize * (overlap / 100));
      const text = previewText || "Sample text for chunking preview...";
      const chunks = [];
      let pos = 0;
      while (pos < text.length) {
        const end = Math.min(pos + chunkSize, text.length);
        chunks.push({ start: pos, end, text: text.slice(pos, end) });
        pos = end - overlapChars;
        if (pos >= text.length || overlapChars <= 0) break;
      }
      const colors = [
        "rgba(59,130,246,0.15)",
        "rgba(139,92,246,0.15)",
        "rgba(16,185,129,0.15)",
        "rgba(245,158,11,0.15)",
      ];
      previewEl.innerHTML =
        `<div class="text-muted" style="font-size:0.75rem;margin-bottom:0.5rem;">${chunks.length} chunks, ~${chunkSize} chars each, ${overlap}% overlap (${overlapChars} chars)</div>` +
        chunks
          .map(
            (c, i) =>
              `<div style="background:${colors[i % colors.length]};padding:0.4rem 0.6rem;border-radius:6px;margin-bottom:0.25rem;font-size:0.8rem;font-family:var(--font-mono);border-left:3px solid ${colors[i % colors.length].replace("0.15", "0.6")}">
            <span class="text-muted" style="font-size:0.65rem;">Chunk ${i + 1}</span><br>${escapeHtml(c.text.slice(0, 120))}${c.text.length > 120 ? "..." : ""}
          </div>`,
          )
          .join("");
    },

    costCalculator(previewEl, values) {
      const queries = values.queries_per_month || 100000;
      const embeddingCost = ((queries * 500) / 1e6) * 0.02;
      const vectorDbCost = queries < 100000 ? 0 : queries < 1000000 ? 25 : 70;
      const rerankCost = queries * 0.005;
      const llmCost = queries * 0.003;
      const total = embeddingCost + vectorDbCost + rerankCost + llmCost;
      previewEl.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          <div class="gauge-card"><div class="gauge-value" style="font-size:1rem;">$${embeddingCost.toFixed(2)}</div><div class="gauge-label">Embedding</div></div>
          <div class="gauge-card"><div class="gauge-value" style="font-size:1rem;">$${vectorDbCost}</div><div class="gauge-label">Vector DB</div></div>
          <div class="gauge-card"><div class="gauge-value" style="font-size:1rem;">$${rerankCost.toFixed(2)}</div><div class="gauge-label">Re-ranking</div></div>
          <div class="gauge-card"><div class="gauge-value" style="font-size:1rem;">$${llmCost.toFixed(2)}</div><div class="gauge-label">LLM Inference</div></div>
        </div>
        <div style="text-align:center;margin-top:0.75rem;font-family:var(--font-mono);font-size:1.25rem;font-weight:700;color:var(--accent);">Total: $${total.toFixed(2)}/mo</div>`;
    },

    dimensionPreview(previewEl, values) {
      const dims = values.dimensions || 1536;
      const storagePerVec = dims * 4; // 4 bytes per float32
      const vectors = 1000000;
      const storageMB = (vectors * storagePerVec) / (1024 * 1024);
      const quality =
        dims >= 1024 ? 99 : dims >= 512 ? 98 : dims >= 256 ? 96 : 93;
      previewEl.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;">
          <div class="gauge-card"><div class="gauge-value" style="font-size:1rem;">${dims}d</div><div class="gauge-label">Dimensions</div></div>
          <div class="gauge-card"><div class="gauge-value" style="font-size:1rem;">${storageMB.toFixed(0)} MB</div><div class="gauge-label">Storage/1M vecs</div></div>
          <div class="gauge-card"><div class="gauge-value" style="font-size:1rem;color:${quality >= 97 ? "var(--success)" : "var(--warning)"};">${quality}%</div><div class="gauge-label">Quality Retained</div></div>
        </div>`;
    },
  },

  render(container, config) {
    const { title, sliders, previewText, render: renderFn } = config;
    const values = {};
    sliders.forEach((s) => {
      values[s.name] = s.default;
    });

    const wrapper = createElement("div", "playground-container");

    if (title) {
      const titleEl = createElement("h4", "playground-title", title);
      wrapper.appendChild(titleEl);
    }

    const slidersEl = createElement("div", "playground-sliders");
    const previewEl = createElement("div", "playground-preview");

    const updatePreview = () => {
      const fn = this.renderers[renderFn];
      if (fn) fn(previewEl, values, previewText);
    };

    sliders.forEach((s) => {
      const group = createElement("div", "playground-slider-group");
      group.innerHTML = `
        <label><span>${s.label}</span><span class="mono" style="color:var(--accent);" id="pg-val-${s.name}">${s.default}${s.unit || ""}</span></label>
        <input type="range" min="${s.min}" max="${s.max}" step="${s.step || 1}" value="${s.default}" data-name="${s.name}">
      `;
      group.querySelector("input").addEventListener("input", (e) => {
        const v = parseFloat(e.target.value);
        values[s.name] = v;
        group.querySelector(`#pg-val-${s.name}`).textContent =
          v + (s.unit || "");
        updatePreview();
      });
      slidersEl.appendChild(group);
    });

    wrapper.appendChild(slidersEl);
    wrapper.appendChild(previewEl);
    updatePreview();
    container.appendChild(wrapper);
  },
};

// ============================================================
// LEARN PANEL RENDERER
// ============================================================

const LearnPanel = {
  parseMarkdown(text) {
    let html = "";
    const lines = text.split("\n");
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === "") {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += "<br>";
        continue;
      }

      if (trimmed.startsWith("## ")) {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += `<h3>${trimmed.slice(3)}</h3>`;
        continue;
      }

      if (trimmed.startsWith("- ")) {
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += `<li>${this.inlineFormat(trimmed.slice(2))}</li>`;
        continue;
      }

      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<p>${this.inlineFormat(trimmed)}</p>`;
    }

    if (inList) html += "</ul>";
    return html;
  },

  inlineFormat(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  },

  renderSection(container, section) {
    const sectionEl = createElement("div", "learn-section");

    switch (section.type) {
      case "text":
        const textEl = createElement("div", "learn-text");
        textEl.innerHTML = this.parseMarkdown(section.content);
        sectionEl.appendChild(textEl);
        break;

      case "diagram":
        PipelineDiagram.render(sectionEl, section.config);
        break;

      case "code":
        AnnotatedCode.render(sectionEl, section);
        break;

      case "comparison":
        BeforeAfter.render(sectionEl, section);
        break;

      case "steps":
        StepReveal.render(sectionEl, section);
        break;

      case "playground":
        SliderPlayground.render(sectionEl, section);
        break;
    }

    container.appendChild(sectionEl);
  },

  render(container, learnContent, onChallengeClick) {
    container.innerHTML = "";

    // Tab bar
    const tabBar = createElement("div", "learn-challenge-tabs");
    const learnTab = createElement("button", "lc-tab active", "Learn");
    const challengeTab = createElement("button", "lc-tab", "Challenge");
    tabBar.appendChild(learnTab);
    tabBar.appendChild(challengeTab);
    container.appendChild(tabBar);

    // Learn panel content
    const learnPanel = createElement("div", "learn-panel");
    learnContent.forEach((section) => this.renderSection(learnPanel, section));
    container.appendChild(learnPanel);

    // Challenge area (lazy loaded)
    const challengeArea = createElement("div", "challenge-area hidden");
    container.appendChild(challengeArea);

    // Skip button
    const skipBtn = createElement(
      "button",
      "skip-to-challenge",
      "Skip to Challenge →",
    );
    container.appendChild(skipBtn);

    let challengeLoaded = false;

    const showChallenge = () => {
      learnTab.classList.remove("active");
      challengeTab.classList.add("active");
      learnPanel.classList.add("hidden");
      challengeArea.classList.remove("hidden");
      skipBtn.classList.add("hidden");
      if (!challengeLoaded) {
        challengeLoaded = true;
        onChallengeClick(challengeArea);
      }
    };

    const showLearn = () => {
      challengeTab.classList.remove("active");
      learnTab.classList.add("active");
      challengeArea.classList.add("hidden");
      learnPanel.classList.remove("hidden");
      skipBtn.classList.remove("hidden");
    };

    learnTab.addEventListener("click", showLearn);
    challengeTab.addEventListener("click", showChallenge);
    skipBtn.addEventListener("click", showChallenge);
  },
};

// ============================================================
// CHAPTER DEPENDENCY MAP
// ============================================================

const CHAPTER_DEPS = {
  1: [],
  2: [{ ch: 1, level: 5 }],
  3: [{ ch: 1, level: 5 }],
  4: [{ ch: 1, level: 10 }],
  5: [],
  6: [],
};

// ============================================================
// GAME TYPES
// ============================================================

// ---- Architecture Battle ----
class ArchitectureBattle {
  init(container, config) {
    const { scenario, options, correctId, explanation, onComplete } = config;
    let selectedId = null;
    let submitted = false;

    container.innerHTML = `
      <div class="scenario-card">${scenario}</div>
      <div class="options-grid" id="ab-options"></div>
      <div style="margin-top:1rem;text-align:center;">
        <button class="btn btn-primary" id="ab-submit">Submit Answer</button>
      </div>
      <div id="ab-explanation" class="hidden"></div>
    `;

    const grid = container.querySelector("#ab-options");
    options.forEach((opt) => {
      const card = createElement("div", "option-card");
      card.dataset.id = opt.id;
      card.innerHTML = `<div class="option-label">${opt.label}</div><div class="option-desc">${opt.description || ""}</div>`;
      card.addEventListener("click", () => {
        if (submitted) return;
        SoundFX.play("click");
        grid
          .querySelectorAll(".option-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedId = opt.id;
      });
      grid.appendChild(card);
    });

    container.querySelector("#ab-submit").addEventListener("click", () => {
      if (submitted || !selectedId) return;
      submitted = true;
      const correct = selectedId === correctId;
      grid.querySelectorAll(".option-card").forEach((c) => {
        if (c.dataset.id === correctId) c.classList.add("correct");
        else if (c.dataset.id === selectedId) c.classList.add("wrong");
      });
      SoundFX.play(correct ? "correct" : "wrong");
      const expEl = container.querySelector("#ab-explanation");
      expEl.className = "explanation-panel";
      expEl.innerHTML = `<h4>${correct ? "✓ Correct!" : "✗ Not quite"}</h4><p>${explanation}</p>`;
      container.querySelector("#ab-submit").classList.add("hidden");
      setTimeout(
        () => onComplete({ score: correct ? 1 : 0, total: 1, passed: correct }),
        500,
      );
    });
  }
}

// ---- Speed Quiz ----
class SpeedQuiz {
  init(container, config) {
    const { questions, timePerQuestion = 30, onComplete } = config;
    let qIdx = 0,
      score = 0;

    const render = () => {
      if (qIdx >= questions.length) {
        Timer.stop();
        const passed = score / questions.length >= 0.6;
        onComplete({ score, total: questions.length, passed });
        return;
      }
      const q = questions[qIdx];
      const keys = ["A", "B", "C", "D"];
      container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
          <span class="text-muted" style="font-size:0.8rem;">Question ${qIdx + 1} of ${questions.length}</span>
          <span class="mono text-muted" style="font-size:0.8rem;" id="sq-timer">${timePerQuestion}s</span>
        </div>
        <div class="timer-bar-wrap"><div class="timer-bar" id="sq-bar" style="width:100%"></div></div>
        <div class="quiz-question">${q.question}</div>
        <div class="quiz-options" id="sq-opts"></div>
        <div id="sq-expl" class="hidden"></div>
      `;

      const optsEl = container.querySelector("#sq-opts");
      q.options.forEach((opt, i) => {
        const btn = createElement("div", "quiz-option");
        btn.innerHTML = `<span class="opt-key">${keys[i]}</span>${opt}`;
        btn.addEventListener("click", () => answer(i));
        optsEl.appendChild(btn);
      });

      let answered = false;
      const barEl = container.querySelector("#sq-bar");
      const timerText = container.querySelector("#sq-timer");

      Timer.start(
        barEl,
        timePerQuestion,
        (rem) => {
          timerText.textContent = Math.ceil(rem) + "s";
        },
        () => {
          if (!answered) answer(-1);
        },
      );

      const answer = (idx) => {
        if (answered) return;
        answered = true;
        Timer.stop();
        const correct = idx === q.correct;
        if (correct) score++;
        SoundFX.play(correct ? "correct" : "wrong");
        const opts = optsEl.querySelectorAll(".quiz-option");
        opts.forEach((o, i) => {
          if (i === q.correct) o.classList.add("correct");
          else if (i === idx) o.classList.add("wrong");
          o.style.pointerEvents = "none";
        });
        if (q.explanation) {
          const expl = container.querySelector("#sq-expl");
          expl.className = "explanation-panel";
          expl.innerHTML = `<h4>${correct ? "✓ Correct" : "✗ Incorrect"}</h4><p>${q.explanation}</p>`;
        }
        setTimeout(() => {
          qIdx++;
          render();
        }, 1800);
      };
    };
    render();
  }
}

// ---- Concept Matcher ----
class ConceptMatcher {
  init(container, config) {
    const { pairs, onComplete } = config;
    const leftItems = shuffleArray(
      pairs.map((p, i) => ({ text: p.left, idx: i })),
    );
    const rightItems = shuffleArray(
      pairs.map((p, i) => ({ text: p.right, idx: i })),
    );
    let selectedLeft = null;
    let matchedCount = 0;

    container.innerHTML = `
      <div class="matcher-columns">
        <div class="matcher-col" id="cm-left"></div>
        <div class="matcher-col" id="cm-right"></div>
      </div>
    `;

    const leftCol = container.querySelector("#cm-left");
    const rightCol = container.querySelector("#cm-right");

    leftItems.forEach((item) => {
      const el = createElement("div", "matcher-item");
      el.textContent = item.text;
      el.dataset.idx = item.idx;
      el.addEventListener("click", () => {
        if (el.classList.contains("matched")) return;
        SoundFX.play("click");
        leftCol
          .querySelectorAll(".matcher-item")
          .forEach((e) => e.classList.remove("active"));
        el.classList.add("active");
        selectedLeft = item.idx;
      });
      leftCol.appendChild(el);
    });

    rightItems.forEach((item) => {
      const el = createElement("div", "matcher-item");
      el.textContent = item.text;
      el.dataset.idx = item.idx;
      el.addEventListener("click", () => {
        if (el.classList.contains("matched") || selectedLeft === null) return;
        if (item.idx === selectedLeft) {
          el.classList.add("matched");
          leftCol
            .querySelector(`.matcher-item[data-idx="${selectedLeft}"]`)
            .classList.add("matched");
          leftCol
            .querySelector(`.matcher-item[data-idx="${selectedLeft}"]`)
            .classList.remove("active");
          SoundFX.play("correct");
          matchedCount++;
          selectedLeft = null;
          if (matchedCount === pairs.length) {
            setTimeout(
              () =>
                onComplete({
                  score: pairs.length,
                  total: pairs.length,
                  passed: true,
                }),
              500,
            );
          }
        } else {
          el.classList.add("wrong");
          setTimeout(() => el.classList.remove("wrong"), 400);
          SoundFX.play("wrong");
          leftCol
            .querySelector(`.matcher-item.active`)
            ?.classList.remove("active");
          selectedLeft = null;
        }
      });
      rightCol.appendChild(el);
    });
  }
}

// ---- Parameter Tuner ----
class ParameterTuner {
  init(container, config) {
    const { description, sliders, gauges, onComplete } = config;
    const values = {};
    sliders.forEach((s) => {
      values[s.name] = s.default;
    });

    container.innerHTML = `
      ${description ? `<p class="text-secondary" style="font-size:0.85rem;margin-bottom:1rem;">${description}</p>` : ""}
      <div class="tuner-controls" id="pt-sliders"></div>
      <div class="gauges-grid" id="pt-gauges"></div>
      <div style="text-align:center;margin-top:1.25rem;">
        <button class="btn btn-primary" id="pt-submit">Submit Configuration</button>
      </div>
    `;

    const slidersEl = container.querySelector("#pt-sliders");
    const gaugesEl = container.querySelector("#pt-gauges");

    const updateGauges = () => {
      gauges.forEach((g, i) => {
        const val = g.compute(values);
        const card = gaugesEl.children[i];
        if (!card) return;
        card.querySelector(".gauge-value").textContent =
          (typeof val === "number" ? val.toFixed(g.decimals || 1) : val) +
          (g.unit || "");
        const inRange = g.good && val >= g.good[0] && val <= g.good[1];
        card.className =
          "gauge-card" + (g.good ? (inRange ? " good" : " bad") : "");
      });
    };

    sliders.forEach((s) => {
      const group = createElement("div", "tuner-slider-group");
      group.innerHTML = `
        <label>${s.name} <span id="sv-${s.name}">${s.default}${s.unit || ""}</span></label>
        <input type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${s.default}" data-name="${s.name}">
      `;
      group.querySelector("input").addEventListener("input", (e) => {
        const v = parseFloat(e.target.value);
        values[s.name] = v;
        group.querySelector("span").textContent = v + (s.unit || "");
        updateGauges();
      });
      slidersEl.appendChild(group);
    });

    gauges.forEach((g) => {
      const card = createElement("div", "gauge-card");
      card.innerHTML = `<div class="gauge-value">-</div><div class="gauge-label">${g.name}</div>`;
      gaugesEl.appendChild(card);
    });

    updateGauges();

    container.querySelector("#pt-submit").addEventListener("click", () => {
      let goodCount = 0;
      gauges.forEach((g) => {
        if (!g.good) {
          goodCount++;
          return;
        }
        const val = g.compute(values);
        if (val >= g.good[0] && val <= g.good[1]) goodCount++;
      });
      SoundFX.play(goodCount === gauges.length ? "correct" : "wrong");
      onComplete({
        score: goodCount,
        total: gauges.length,
        passed: goodCount >= gauges.length * 0.6,
      });
    });
  }
}

// ---- Code Debugger ----
class CodeDebugger {
  init(container, config) {
    const { code, bugs, onComplete } = config;
    const lines = code.split("\n");
    const selected = new Set();
    let submitted = false;

    container.innerHTML = `
      <p class="text-secondary" style="font-size:0.8rem;margin-bottom:0.75rem;">Click on the lines that contain bugs, then submit.</p>
      <div class="code-block" id="cd-code"></div>
      <div style="text-align:center;margin-top:1rem;">
        <button class="btn btn-primary" id="cd-submit">Submit (${bugs.length} bugs to find)</button>
      </div>
    `;

    const codeEl = container.querySelector("#cd-code");
    lines.forEach((line, i) => {
      const lineNum = i + 1;
      const el = createElement("div", "code-line");
      el.innerHTML = `<span class="code-line-num">${lineNum}</span><span class="code-line-content">${escapeHtml(line)}</span>`;
      el.addEventListener("click", () => {
        if (submitted) return;
        SoundFX.play("click");
        if (selected.has(lineNum)) {
          selected.delete(lineNum);
          el.classList.remove("selected");
        } else {
          selected.add(lineNum);
          el.classList.add("selected");
        }
        container.querySelector("#cd-submit").textContent =
          `Submit (${selected.size} selected, ${bugs.length} bugs)`;
      });
      codeEl.appendChild(el);
    });

    container.querySelector("#cd-submit").addEventListener("click", () => {
      if (submitted) return;
      submitted = true;
      const bugLines = new Set(bugs.map((b) => b.line));
      let found = 0;
      codeEl.querySelectorAll(".code-line").forEach((el, i) => {
        const ln = i + 1;
        if (bugLines.has(ln)) {
          el.classList.remove("selected");
          el.classList.add("found-bug");
          if (selected.has(ln)) found++;
        } else if (selected.has(ln)) {
          el.classList.add("wrong");
          el.classList.remove("selected");
        }
      });
      const falsePos = selected.size - found;
      const finalScore = Math.max(0, found - falsePos);
      SoundFX.play(found === bugs.length ? "correct" : "wrong");

      const expl = createElement("div", "explanation-panel");
      expl.innerHTML =
        `<h4>Bugs Found: ${found}/${bugs.length}</h4>` +
        bugs
          .map(
            (b) =>
              `<p style="margin:0.3rem 0;font-size:0.8rem;"><strong>Line ${b.line}:</strong> ${b.description}<br><em style="color:var(--success)">Fix: ${b.fix}</em></p>`,
          )
          .join("");
      container.appendChild(expl);
      container.querySelector("#cd-submit").classList.add("hidden");
      setTimeout(
        () =>
          onComplete({
            score: found,
            total: bugs.length,
            passed: found >= bugs.length * 0.6,
          }),
        500,
      );
    });
  }
}

// ---- Pipeline Builder ----
class PipelineBuilder {
  init(container, config) {
    const { description, components, correctOrder, onComplete } = config;
    const slots = [];
    const usedIds = new Set();

    container.innerHTML = `
      ${description ? `<p class="text-secondary" style="font-size:0.85rem;margin-bottom:1rem;">${description}</p>` : ""}
      <div class="pipeline-available" id="pb-available"></div>
      <div class="pipeline-slots" id="pb-slots"></div>
      <div style="text-align:center;margin-top:1.25rem;">
        <button class="btn btn-primary" id="pb-check">Check Pipeline</button>
      </div>
    `;

    const availEl = container.querySelector("#pb-available");
    const slotsEl = container.querySelector("#pb-slots");

    const renderAvailable = () => {
      availEl.innerHTML = "";
      components.forEach((comp) => {
        const chip = createElement(
          "div",
          "pipeline-chip" + (usedIds.has(comp.id) ? " used" : ""),
        );
        chip.textContent = comp.label;
        chip.addEventListener("click", () => {
          if (usedIds.has(comp.id) || slots.length >= correctOrder.length)
            return;
          SoundFX.play("click");
          usedIds.add(comp.id);
          slots.push(comp.id);
          renderSlots();
          renderAvailable();
        });
        availEl.appendChild(chip);
      });
    };

    const renderSlots = () => {
      slotsEl.innerHTML = "";
      for (let i = 0; i < correctOrder.length; i++) {
        if (i > 0)
          slotsEl.appendChild(createElement("span", "pipeline-arrow", "→"));
        const slot = createElement(
          "div",
          "pipeline-slot" + (slots[i] ? " filled" : ""),
        );
        const comp = slots[i]
          ? components.find((c) => c.id === slots[i])
          : null;
        slot.textContent = comp ? comp.label : `Step ${i + 1}`;
        if (slots[i]) {
          slot.addEventListener("click", () => {
            SoundFX.play("click");
            usedIds.delete(slots[i]);
            slots.splice(i, 1);
            renderSlots();
            renderAvailable();
          });
        }
        slotsEl.appendChild(slot);
      }
    };

    renderAvailable();
    renderSlots();

    container.querySelector("#pb-check").addEventListener("click", () => {
      if (slots.length < correctOrder.length) return;
      let correct = 0;
      slotsEl.querySelectorAll(".pipeline-slot").forEach((el, i) => {
        if (slots[i] === correctOrder[i]) {
          el.classList.add("correct");
          correct++;
        } else {
          el.classList.add("wrong");
        }
      });
      SoundFX.play(correct === correctOrder.length ? "correct" : "wrong");
      container.querySelector("#pb-check").classList.add("hidden");
      setTimeout(
        () =>
          onComplete({
            score: correct,
            total: correctOrder.length,
            passed: correct >= correctOrder.length * 0.7,
          }),
        600,
      );
    });
  }
}

// ---- Diagnosis Lab ----
class DiagnosisLab {
  init(container, config) {
    const { scenario, metrics, options, correctId, explanation, onComplete } =
      config;
    let selectedId = null;
    let submitted = false;

    container.innerHTML = `
      <div class="scenario-card">${scenario}</div>
      <div class="metrics-dashboard" id="dl-metrics"></div>
      <h4 style="margin:1rem 0 0.5rem;font-size:0.85rem;">What's the root cause?</h4>
      <div class="options-grid" id="dl-options"></div>
      <div style="text-align:center;margin-top:1rem;">
        <button class="btn btn-primary" id="dl-submit">Submit Diagnosis</button>
      </div>
      <div id="dl-expl" class="hidden"></div>
    `;

    const metricsEl = container.querySelector("#dl-metrics");
    metrics.forEach((m) => {
      const card = createElement("div", "metric-card " + (m.status || "ok"));
      card.innerHTML = `<div class="metric-value">${m.value}</div><div class="metric-label">${m.name}</div>`;
      metricsEl.appendChild(card);
    });

    const optsEl = container.querySelector("#dl-options");
    options.forEach((opt) => {
      const card = createElement("div", "option-card");
      card.dataset.id = opt.id;
      card.innerHTML = `<div class="option-label">${opt.label}</div>`;
      card.addEventListener("click", () => {
        if (submitted) return;
        SoundFX.play("click");
        optsEl
          .querySelectorAll(".option-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedId = opt.id;
      });
      optsEl.appendChild(card);
    });

    container.querySelector("#dl-submit").addEventListener("click", () => {
      if (submitted || !selectedId) return;
      submitted = true;
      const correct = selectedId === correctId;
      optsEl.querySelectorAll(".option-card").forEach((c) => {
        if (c.dataset.id === correctId) c.classList.add("correct");
        else if (c.dataset.id === selectedId) c.classList.add("wrong");
      });
      SoundFX.play(correct ? "correct" : "wrong");
      const expl = container.querySelector("#dl-expl");
      expl.className = "explanation-panel";
      expl.innerHTML = `<h4>${correct ? "✓ Correct diagnosis!" : "✗ Not quite"}</h4><p>${explanation}</p>`;
      container.querySelector("#dl-submit").classList.add("hidden");
      setTimeout(
        () => onComplete({ score: correct ? 1 : 0, total: 1, passed: correct }),
        500,
      );
    });
  }
}

// ---- Cost Optimizer ----
class CostOptimizer {
  init(container, config) {
    const { scenario, sliders, budget, onComplete } = config;
    const values = {};
    sliders.forEach((s) => {
      values[s.name] = s.default;
    });

    container.innerHTML = `
      <div class="scenario-card">${scenario}</div>
      <div class="cost-display">
        <div class="cost-label">Total Cost</div>
        <div class="cost-value" id="co-total">$0.00</div>
        <div class="cost-budget">Budget: $${budget}</div>
      </div>
      <div class="tuner-controls" id="co-sliders"></div>
      <div style="text-align:center;margin-top:1rem;">
        <button class="btn btn-primary" id="co-submit">Submit Optimization</button>
      </div>
    `;

    const slidersEl = container.querySelector("#co-sliders");
    const totalEl = container.querySelector("#co-total");

    const updateCost = () => {
      let total = 0;
      sliders.forEach((s) => {
        total += s.costImpact(values[s.name]);
      });
      totalEl.textContent = "$" + total.toFixed(2);
      totalEl.className =
        "cost-value " + (total <= budget ? "under-budget" : "over-budget");
    };

    sliders.forEach((s) => {
      const group = createElement("div", "tuner-slider-group");
      group.innerHTML = `
        <label>${s.name} <span>${s.default}${s.unit || ""}</span></label>
        <input type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${s.default}">
      `;
      group.querySelector("input").addEventListener("input", (e) => {
        const v = parseFloat(e.target.value);
        values[s.name] = v;
        group.querySelector("span").textContent = v + (s.unit || "");
        updateCost();
      });
      slidersEl.appendChild(group);
    });

    updateCost();

    container.querySelector("#co-submit").addEventListener("click", () => {
      let total = 0;
      sliders.forEach((s) => {
        total += s.costImpact(values[s.name]);
      });
      const underBudget = total <= budget;
      const savingsPct = Math.max(0, ((budget - total) / budget) * 100);
      const score = underBudget ? Math.min(1, savingsPct / 50) : 0;
      SoundFX.play(underBudget ? "correct" : "wrong");
      onComplete({
        score: Math.round(score * 10),
        total: 10,
        passed: underBudget,
      });
    });
  }
}

// ============================================================
// LEVEL RUNNER
// ============================================================

const LevelRunner = {
  async run(container, levelConfig) {
    container.innerHTML = "";
    container.className = "game-panel";

    // Level header
    const header = createElement("div", "level-header");
    header.innerHTML = `
      <div class="level-tag">Level ${levelConfig.id}</div>
      <div class="level-title">${levelConfig.title}</div>
      <div class="level-subtitle">${levelConfig.subtitle || ""}</div>
    `;
    container.appendChild(header);

    // If learnContent exists, show Learn/Challenge tabs
    if (levelConfig.learnContent && levelConfig.learnContent.length > 0) {
      const lcWrapper = createElement("div", "learn-challenge-wrapper");
      container.appendChild(lcWrapper);

      return new Promise((resolve) => {
        LearnPanel.render(
          lcWrapper,
          levelConfig.learnContent,
          (challengeArea) => {
            // When challenge tab is clicked, load the game
            this._runGame(challengeArea, levelConfig, resolve);
          },
        );
      });
    }

    // No learnContent — original behavior
    // Typewriter context
    if (levelConfig.context) {
      const tw = createElement("div", "typewriter-container");
      container.appendChild(tw);
      await Typewriter.type(tw, levelConfig.context);
      await new Promise((r) => setTimeout(r, 400));
    }

    // Game area
    const gameArea = createElement("div", "game-area");
    container.appendChild(gameArea);

    const baseXP = {
      ArchitectureBattle: 110,
      SpeedQuiz: 100,
      ConceptMatcher: 80,
      ParameterTuner: 120,
      CodeDebugger: 130,
      PipelineBuilder: 150,
      DiagnosisLab: 140,
      CostOptimizer: 120,
    };

    return new Promise((resolve) => {
      const gameConfig = {
        ...levelConfig.gameConfig,
        onComplete: (result) => {
          const base = baseXP[levelConfig.gameType] || 100;
          const earned = GameState.addXP(
            Math.round(base * (result.score / Math.max(1, result.total))),
          );

          if (result.score === result.total) {
            GameState.incrementCombo();
            if (GameState.combo > 1) SoundFX.play("comboUp");
          } else {
            GameState.resetCombo();
          }

          if (result.passed) GameState.completeLevel(levelConfig.id);
          GameState.save();
          HUD.refresh();

          // Particles on pass
          if (result.passed && Particles.canvas) {
            const rect = container.getBoundingClientRect();
            const accentColors = {
              1: "#3b82f6",
              2: "#8b5cf6",
              3: "#10b981",
              4: "#f59e0b",
              5: "#ef4444",
              6: "#ec4899",
            };
            const ch = parseInt(levelConfig.id);
            Particles.burst(
              rect.left + rect.width / 2,
              rect.top + 100,
              accentColors[ch] || "#3b82f6",
            );
          }

          // Result panel
          const resultDiv = createElement("div", "result-summary");
          resultDiv.innerHTML = `
            <div class="result-score">${result.score}/${result.total}</div>
            <div class="result-label">${result.passed ? "Level Complete!" : "Keep Practicing"}</div>
            <div class="result-xp">+${earned} XP${GameState.combo > 1 ? ` (${GameState.combo}x combo!)` : ""}</div>
            ${
              levelConfig.keyInsight
                ? `
              <div class="key-insight" style="text-align:left;">
                <strong>Key Insight</strong>
                <p>${levelConfig.keyInsight}</p>
              </div>
            `
                : ""
            }
            <div style="margin-top:1.5rem;display:flex;gap:0.75rem;justify-content:center;">
              <button class="btn btn-secondary" id="lr-hub">Back to Hub</button>
              <button class="btn btn-primary" id="lr-next">${result.passed ? "Next Level →" : "Retry"}</button>
            </div>
          `;
          container.appendChild(resultDiv);

          container.querySelector("#lr-hub")?.addEventListener("click", () => {
            window.location.href = "index.html";
          });
          container.querySelector("#lr-next")?.addEventListener("click", () => {
            resolve({
              ...result,
              xp: earned,
              action: result.passed ? "next" : "retry",
            });
          });
        },
      };

      const GameClasses = {
        ArchitectureBattle,
        SpeedQuiz,
        ConceptMatcher,
        ParameterTuner,
        CodeDebugger,
        PipelineBuilder,
        DiagnosisLab,
        CostOptimizer,
      };
      const GameClass = GameClasses[levelConfig.gameType];
      if (GameClass) new GameClass().init(gameArea, gameConfig);
    });
  },

  _runGame(gameArea, levelConfig, resolve) {
    // Context
    if (levelConfig.context) {
      const tw = createElement("div", "typewriter-container");
      tw.textContent = levelConfig.context;
      gameArea.appendChild(tw);
    }

    const gameEl = createElement("div", "game-area");
    gameArea.appendChild(gameEl);

    const container = gameArea.closest(".game-panel") || gameArea;

    const baseXP = {
      ArchitectureBattle: 110,
      SpeedQuiz: 100,
      ConceptMatcher: 80,
      ParameterTuner: 120,
      CodeDebugger: 130,
      PipelineBuilder: 150,
      DiagnosisLab: 140,
      CostOptimizer: 120,
    };

    const gameConfig = {
      ...levelConfig.gameConfig,
      onComplete: (result) => {
        const base = baseXP[levelConfig.gameType] || 100;
        const earned = GameState.addXP(
          Math.round(base * (result.score / Math.max(1, result.total))),
        );
        if (result.score === result.total) {
          GameState.incrementCombo();
          if (GameState.combo > 1) SoundFX.play("comboUp");
        } else {
          GameState.resetCombo();
        }
        if (result.passed) GameState.completeLevel(levelConfig.id);
        GameState.save();
        HUD.refresh();

        if (result.passed && Particles.canvas) {
          const rect = container.getBoundingClientRect();
          const accentColors = {
            1: "#3b82f6",
            2: "#8b5cf6",
            3: "#10b981",
            4: "#f59e0b",
            5: "#ef4444",
            6: "#ec4899",
          };
          const ch = parseInt(levelConfig.id);
          Particles.burst(
            rect.left + rect.width / 2,
            rect.top + 100,
            accentColors[ch] || "#3b82f6",
          );
        }

        const resultDiv = createElement("div", "result-summary");
        resultDiv.innerHTML = `
          <div class="result-score">${result.score}/${result.total}</div>
          <div class="result-label">${result.passed ? "Level Complete!" : "Keep Practicing"}</div>
          <div class="result-xp">+${earned} XP${GameState.combo > 1 ? ` (${GameState.combo}x combo!)` : ""}</div>
          ${levelConfig.keyInsight ? `<div class="key-insight" style="text-align:left;"><strong>Key Insight</strong><p>${levelConfig.keyInsight}</p></div>` : ""}
          <div style="margin-top:1.5rem;display:flex;gap:0.75rem;justify-content:center;">
            <button class="btn btn-secondary" id="lr-hub">Back to Hub</button>
            <button class="btn btn-primary" id="lr-next">${result.passed ? "Next Level →" : "Retry"}</button>
          </div>
        `;
        gameArea.appendChild(resultDiv);

        gameArea.querySelector("#lr-hub")?.addEventListener("click", () => {
          window.location.href = "index.html";
        });
        gameArea.querySelector("#lr-next")?.addEventListener("click", () => {
          resolve({
            ...result,
            xp: earned,
            action: result.passed ? "next" : "retry",
          });
        });
      },
    };

    const GameClasses = {
      ArchitectureBattle,
      SpeedQuiz,
      ConceptMatcher,
      ParameterTuner,
      CodeDebugger,
      PipelineBuilder,
      DiagnosisLab,
      CostOptimizer,
    };
    const GameClass = GameClasses[levelConfig.gameType];
    if (GameClass) new GameClass().init(gameEl, gameConfig);
  },
};

// ============================================================
// HUB (index.html bento grid)
// ============================================================

const Hub = {
  chapters: [
    {
      id: 1,
      title: "Production RAG Pipeline",
      subtitle: '"Ask My Docs" — Enterprise Retrieval-Augmented Generation',
      levels: 10,
      file: "chapter1-rag.html",
    },
    {
      id: 2,
      title: "Local SLM with Ollama",
      subtitle: '"Run AI Offline" — Privacy, Latency, Cost Control',
      levels: 10,
      file: "chapter2-slm.html",
    },
    {
      id: 3,
      title: "ML Monitoring & Observability",
      subtitle: '"70% of Production AI Work Nobody Shows"',
      levels: 10,
      file: "chapter3-monitoring.html",
    },
    {
      id: 4,
      title: "Fine-Tuning Mastery",
      subtitle: '"LoRA, QLoRA, DPO, RLHF" — Make Models Do What You Want',
      levels: 11,
      file: "chapter4-finetuning.html",
    },
    {
      id: 5,
      title: "Real-Time Multimodal AI",
      subtitle: '"Voice, Vision, Streaming" — The Future of AI Interfaces',
      levels: 10,
      file: "chapter5-multimodal.html",
    },
    {
      id: 6,
      title: "The AI Engineer's Edge",
      subtitle: "Capstone — What Makes Top 1% Different",
      levels: 3,
      file: "chapter5-multimodal.html#capstone",
    },
  ],

  init(container) {
    if (!container) return;
    container.innerHTML = "";

    this.chapters.forEach((ch) => {
      const unlocked = GameState.isChapterUnlocked(ch.id);
      const progress = GameState.getChapterProgress(ch.id);
      const completed = this.countCompleted(ch.id, ch.levels);

      const card = createElement(
        "div",
        "chapter-card" + (unlocked ? "" : " locked"),
      );
      card.dataset.ch = ch.id;
      // Build dependency info for locked chapters
      let lockInfo = "";
      if (!unlocked) {
        const deps = CHAPTER_DEPS[ch.id] || [];
        if (deps.length > 0) {
          const depTexts = deps.map((d) => `Chapter ${d.ch}, Level ${d.level}`);
          lockInfo = `<div class="card-lock-info">Complete ${depTexts.join(" and ")} to unlock</div>`;
        }
      }

      card.innerHTML = `
        ${!unlocked ? '<div class="card-lock-icon">🔒</div>' : ""}
        <div class="card-chapter-num">Chapter ${ch.id}</div>
        <div class="card-title">${ch.title}</div>
        <div class="card-subtitle">${ch.subtitle}</div>
        ${lockInfo}
        <div class="card-meta">
          <span>${completed}/${ch.levels} levels</span>
          <span>${progress}%</span>
        </div>
        <div class="card-progress-bar">
          <div class="card-progress-fill" style="width:${progress}%"></div>
        </div>
      `;

      if (unlocked) {
        card.addEventListener("click", () => {
          SoundFX.play("click");
          window.location.href = ch.file;
        });
      }

      container.appendChild(card);
    });
  },

  countCompleted(ch, total) {
    let count = 0;
    for (let i = 1; i <= total; i++) {
      if (GameState.isLevelCompleted(`${ch}.${i}`)) count++;
    }
    return count;
  },
};

// ============================================================
// CHAPTER NAV (sidebar for chapter pages)
// ============================================================

const ChapterNav = {
  init(container, chapterId, levels, onSelect) {
    if (!container) return;
    container.innerHTML = `<div class="level-nav-title">Chapter ${chapterId} Levels</div>`;

    levels.forEach((level, i) => {
      const id = `${chapterId}.${i + 1}`;
      const completed = GameState.isLevelCompleted(id);
      const unlocked =
        i === 0 || GameState.isLevelCompleted(`${chapterId}.${i}`);

      const item = createElement(
        "div",
        "level-nav-item" +
          (completed ? " completed" : "") +
          (!unlocked ? " locked" : ""),
      );
      item.dataset.level = i;
      item.innerHTML = `
        <span class="nav-icon">${completed ? "✓" : unlocked ? "○" : "🔒"}</span>
        <span>${id} ${level.title || ""}</span>
      `;

      if (unlocked) {
        item.addEventListener("click", () => {
          SoundFX.play("click");
          onSelect(i);
        });
      }
      container.appendChild(item);
    });
  },

  setActive(container, levelIndex) {
    if (!container) return;
    container.querySelectorAll(".level-nav-item").forEach((el, i) => {
      el.classList.toggle("active", parseInt(el.dataset.level) === levelIndex);
    });
  },
};

// ============================================================
// CHAPTER PAGE RUNNER (used by chapter HTML pages)
// ============================================================

const ChapterRunner = {
  async start(chapterId, levels, gamePanel, navContainer) {
    let currentLevel = 0;

    // Find first incomplete level
    for (let i = 0; i < levels.length; i++) {
      if (!GameState.isLevelCompleted(`${chapterId}.${i + 1}`)) {
        currentLevel = i;
        break;
      }
      if (i === levels.length - 1) currentLevel = 0; // all done, start from beginning
    }

    const runLevel = async (idx) => {
      currentLevel = idx;
      ChapterNav.init(navContainer, chapterId, levels, (i) => runLevel(i));
      ChapterNav.setActive(navContainer, idx);

      const level = levels[idx];
      const result = await LevelRunner.run(gamePanel, {
        ...level,
        id: `${chapterId}.${idx + 1}`,
      });

      // Refresh nav
      ChapterNav.init(navContainer, chapterId, levels, (i) => runLevel(i));
      ChapterNav.setActive(navContainer, idx);

      if (result.action === "next" && idx < levels.length - 1) {
        runLevel(idx + 1);
      } else if (result.action === "retry") {
        runLevel(idx);
      }
    };

    runLevel(currentLevel);
  },
};

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  GameState.load();

  // Particles
  const canvas = document.getElementById("particle-canvas");
  if (canvas) Particles.init(canvas);

  // Sound: init on first click (AudioContext needs user gesture)
  document.addEventListener("click", () => SoundFX.init(), { once: true });

  // HUD
  HUD.init();
  HUD.refresh();

  // Hub page
  if (document.body.dataset.page === "hub") {
    Hub.init(document.getElementById("main-content"));
  }
});

window.addEventListener("resize", () => {
  if (Particles.canvas) Particles.resize();
});
