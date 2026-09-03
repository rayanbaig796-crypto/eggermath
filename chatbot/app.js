/**
 * app.js — Production-ready Serverless WebLLM Chatbot
 * ----------------------------------------------------
 * Stack: @mlc-ai/web-llm (ESM) + Vanilla JS (ES6+)
 * Model: Qwen2.5-0.5B-Instruct-q4f16_1-MLC — runs 100% in-browser via WebGPU
 *         Weights are auto-cached via IndexedDB / Cache API after first load.
 *
 * HTML expectations (IDs/classes must exist in index.html):
 *  #loading-overlay, #loading-text, #loading-detail,
 *  #progress-fill, #progress-text,
 *  #chat-container, #user-input, #send-btn, #stop-btn, #clear-btn,
 *  #status-dot, #status-text, #webgpu-warning, #banner,
 *  #temp-slider, #temp-value, #max-tokens-select, #system-prompt,
 *  .example-chip, #menu-toggle, #sidebar
 *
 * ESM import — requires <script type="module"> and an import map or bundler
 * that resolves "@mlc-ai/web-llm" to the ESM build (e.g. esm.run / jsdelivr +esm).
 */

import * as webllm from "@mlc-ai/web-llm";

// ---------------------------------------------------------------------------
// 0. Constants & Global State
// ---------------------------------------------------------------------------

/** Model identifier hosted by MLC. Must match exactly the prebuilt artifact name. */
const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

/** Engine singleton — assigned in initEngine(), nulled on fatal error. */
let engine = null;

/** Whether engine finished init and is ready to serve completions. */
let isEngineReady = false;

/** Streaming flag — true while a generation is in-flight. */
let isGenerating = false;

/** Set true when user clicks Stop; checked inside streaming loop. */
let isStopped = false;

/** Chat history sent to the model. Always starts with a system prompt. */
let messages = [];

/** Reference to the current assistant bubble element during streaming. */
let currentAssistantBubble = null;

// ---------------------------------------------------------------------------
// 1. DOM References — cached once at startup for perf & readability
// ---------------------------------------------------------------------------

/** @type {Record<string, HTMLElement|null>} */
const els = {
  // Loading / progress overlay
  loadingOverlay: document.getElementById("loading-overlay"),
  loadingText: document.getElementById("loading-text"),
  loadingDetail: document.getElementById("loading-detail"),
  progressFill: document.getElementById("progress-fill"),
  progressText: document.getElementById("progress-text"),

  // Chat
  chatContainer: document.getElementById("chat-container"),
  // scroll parent (index.html wraps #chat-container in #chat-scroll)
  chatScroll: document.getElementById("chat-scroll"),
  userInput: document.getElementById("user-input"),
  sendBtn: document.getElementById("send-btn"),
  stopBtn: document.getElementById("stop-btn"),
  // alias: index uses #clear-chat, fallback to #clear-btn
  clearBtn: document.getElementById("clear-chat") || document.getElementById("clear-btn"),

  // Status
  statusDot: document.getElementById("status-dot"),
  // aliases: index uses #status-label, app legacy uses #status-text, fallback to #webgpu-status
  statusText: document.getElementById("status-label") || document.getElementById("status-text") || document.getElementById("webgpu-status"),
  webgpuStatusDot: document.getElementById("webgpu-status-dot"),
  webgpuStatusText: document.getElementById("webgpu-status"),

  // Warnings / banners
  webgpuWarning: document.getElementById("webgpu-warning"),
  banner: document.getElementById("banner") || document.getElementById("webgpu-warning"), // generic banner (alias for warning)

  // Controls — aliases to match both index.html and legacy IDs
  tempSlider: document.getElementById("temperature") || document.getElementById("temp-slider"),
  tempValue: document.getElementById("temperature-value") || document.getElementById("temp-value"),
  maxTokensSelect: document.getElementById("max-tokens") || document.getElementById("max-tokens-select"),
  systemPrompt: document.getElementById("system-prompt"),

  // Layout
  sidebar: document.getElementById("sidebar"),
  sidebarBackdrop: document.getElementById("sidebar-backdrop"),
  menuToggle: document.getElementById("menu-toggle"),
  sidebarClose: document.getElementById("sidebar-close"),
};

// Example chips are multiple elements — cached as NodeList (index uses .example-chip with data-prompt)
const exampleChips = document.querySelectorAll(".example-chip, [data-prompt], [data-example], .chip--example");

// Empty-state placeholder inside chatContainer (optional)
const emptyState = document.getElementById("empty-state") || document.querySelector(".empty-state");

// ---------------------------------------------------------------------------
// Helpers — escape, markdown, scroll, clipboard
// ---------------------------------------------------------------------------

/**
 * Escape HTML to prevent XSS when rendering untrusted model/user text as fallback.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Render markdown to HTML.
 * Uses `marked.parse` if available (via window.marked or imported), else falls back
 * to escaped HTML with minimal formatting and fenced code block support.
 * Post-processes code blocks to inject a header with a Copy button.
 * @param {string} md
 * @returns {string}
 */
function renderMarkdown(md) {
  let html = "";

  // Prefer marked if present (loaded via CDN: e.g. <script src="marked.min.js">)
  const markedLib = window.marked || null;

  if (markedLib && typeof markedLib.parse === "function") {
    try {
      // marked options: break line breaks, GFM
      html = markedLib.parse(md, { gfm: true, breaks: true });
    } catch {
      html = `<pre><code>${escapeHtml(md)}</code></pre>`;
    }
  } else if (markedLib && typeof markedLib === "function") {
    // Some builds export marked as a function
    try {
      html = markedLib(md);
    } catch {
      html = `<pre><code>${escapeHtml(md)}</code></pre>`;
    }
  } else {
    // Lightweight fallback: escape then handle ```fenced blocks and inline `code`
    // and **bold** / *italic* minimally so UI still looks decent without marked.
    const parts = md.split(/(```[\s\S]*?```)/g);
    html = parts
      .map((part) => {
        if (part.startsWith("```")) {
          const inner = part.replace(/^```[a-z]*\n?/, "").replace(/```$/, "");
          return `<pre><code>${escapeHtml(inner)}</code></pre>`;
        }
        // Inline transforms on non-code segments
        let seg = escapeHtml(part);
        seg = seg.replace(/`([^`]+)`/g, "<code>$1</code>");
        seg = seg.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        seg = seg.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
        seg = seg.replace(/\n/g, "<br>");
        return seg;
      })
      .join("");
  }

  // Inject copy-header for each <pre><code> block for UX parity with marked path
  // We wrap each pre block: <div class="code-block"><div class="code-header">...copy...
  html = html.replace(
    /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g,
    (_m, attrs, code) =>
      `<div class="code-block"><div class="code-header"><span>code</span><button class="copy-code-btn" data-copy-code title="Copy code">Copy</button></div><pre><code${attrs}>${code}</code></pre></div>`
  );

  return html;
}

/**
 * Scroll chat container to bottom.
 * During streaming we use instant auto-scroll; otherwise smooth.
 * Handles both #chat-container and its wrapper #chat-scroll (index.html).
 * @param {boolean} smooth
 */
function scrollToBottom(smooth = true) {
  // Prefer the actual scrollable parent if it exists (#chat-scroll wraps #chat-container)
  const c = els.chatScroll || els.chatContainer;
  if (!c) return;
  requestAnimationFrame(() => {
    // scroll both the wrapper and inner container to be safe
    const target = els.chatScroll || c;
    target.scrollTo({
      top: target.scrollHeight,
      behavior: smooth ? "smooth" : "instant",
    });
    // also ensure inner container bottom is visible
    if (els.chatScroll && els.chatContainer) {
      els.chatScroll.scrollTop = els.chatScroll.scrollHeight;
    }
  });
}

/**
 * Copy text to clipboard with execCommand fallback for insecure contexts.
 * Shows a transient tooltip on the trigger button.
 * @param {string} text
 * @param {HTMLElement} [btn] — button to show "Copied!" feedback on
 */
async function copyToClipboard(text, btn) {
  let ok = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      ok = true;
    } else {
      throw new Error("clipboard API unavailable");
    }
  } catch {
    // Fallback: hidden textarea + execCommand
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
  }

  if (btn) {
    const prev = btn.textContent;
    btn.textContent = ok ? "Copied!" : "Failed";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = prev;
      btn.classList.remove("copied");
    }, 1500);
  }
  return ok;
}

/**
 * Update enabled/disabled state of composer controls.
 * @param {boolean} enabled
 */
function setComposerEnabled(enabled) {
  if (els.userInput) {
    els.userInput.disabled = !enabled;
    els.userInput.placeholder = enabled
      ? "Ask anything… (Shift+Enter for new line)"
      : "Model not ready — check WebGPU support";
  }
  if (els.sendBtn) els.sendBtn.disabled = !enabled || isGenerating;
  // Stop button is inverse
  if (els.stopBtn) {
    els.stopBtn.hidden = !isGenerating;
    els.stopBtn.style.display = isGenerating ? "inline-flex" : "none";
    els.stopBtn.disabled = !isGenerating;
  }
}

/**
 * Set status indicator (dot + text).
 * Updates both top-bar dot (#status-dot) and sidebar dot (#webgpu-status-dot)
 * @param {"idle"|"loading"|"ready"|"error"|"generating"} state
 * @param {string} text
 */
function setStatus(state, text) {
  if (els.statusText) els.statusText.textContent = text;
  if (els.webgpuStatusText) els.webgpuStatusText.textContent = text;
  const colors = {
    idle: "#9ca3af",
    loading: "#f59e0b",
    ready: "#10b981",
    error: "#ef4444",
    generating: "#3b82f6",
  };
  const bg = colors[state] || colors.idle;
  // Update main status dot
  if (els.statusDot) {
    els.statusDot.className = "inline-block h-2.5 w-2.5 rounded-full ring-2";
    els.statusDot.classList.add(`status--${state}`);
    els.statusDot.style.backgroundColor = bg;
    els.statusDot.style.borderColor = bg + "30";
    els.statusDot.setAttribute("data-state", state);
  }
  // Update sidebar dot
  if (els.webgpuStatusDot) {
    els.webgpuStatusDot.style.backgroundColor = bg;
    els.webgpuStatusDot.setAttribute("data-state", state);
  }
}

// ---------------------------------------------------------------------------
// 2. Hardware Feature Detection — WebGPU
// ---------------------------------------------------------------------------

/**
 * Check for WebGPU availability.
 * navigator.gpu is the entry point (Chrome/Edge 113+, behind flag in some builds).
 * If missing, we show a persistent warning, mark status as error, disable the
 * composer but keep the rest of the UI interactive so users can read guidance.
 * @returns {boolean} true if WebGPU appears available
 */
function checkWebGPU() {
  const hasGPU = typeof navigator !== "undefined" && "gpu" in navigator && !!navigator.gpu;

  if (!hasGPU) {
    const warning = els.webgpuWarning || els.banner;
    if (warning) {
      warning.hidden = false;
      warning.style.display = "block";
      // Ensure warning has helpful content even if HTML was minimal
      if (!warning.textContent || warning.textContent.trim().length < 10) {
        warning.innerHTML = `
          <strong>WebGPU not detected</strong> — This browser does not expose <code>navigator.gpu</code>.<br>
          Use <strong>Chrome or Edge 113+</strong> on desktop, enable <code>chrome://flags/#enable-unsafe-webgpu</code> if needed,
          and ensure hardware acceleration is on. The chatbot UI will remain visible but the model cannot load without WebGPU.
        `;
      }
    }

    setStatus("error", "WebGPU unavailable");

    if (els.loadingText) els.loadingText.textContent = "WebGPU not available";
    if (els.loadingDetail) {
      els.loadingDetail.textContent =
        "Enable WebGPU in Chrome/Edge 113+ (chrome://flags/#enable-unsafe-webgpu) and reload.";
    }
    if (els.progressText) els.progressText.textContent = "—";

    setComposerEnabled(false);

    // Keep overlay visible but not stuck at 0% — show error state
    if (els.loadingOverlay) {
      els.loadingOverlay.classList.remove("hidden");
      els.loadingOverlay.style.display = "flex";
    }

    console.warn(
      "[WebLLM] navigator.gpu not found. WebGPU is required to run the model. " +
        "Advise user to use Chrome/Edge 113+ with WebGPU enabled."
    );
    return false;
  }

  // Optional: try to probe adapter (non-fatal if it fails — engine will surface error)
  // We don't block on this; just log.
  if (navigator.gpu && typeof navigator.gpu.requestAdapter === "function") {
    navigator.gpu
      .requestAdapter()
      .then((adapter) => {
        if (!adapter) console.warn("[WebLLM] navigator.gpu.requestAdapter() returned null — device may still fail.");
      })
      .catch(() => {
        // Ignore — CreateMLCEngine will provide a better error message
      });
  }

  // Hide warning if previously shown
  if (els.webgpuWarning) {
    els.webgpuWarning.hidden = true;
    els.webgpuWarning.style.display = "none";
  }
  if (els.banner) {
    // Only hide banner if it was the WebGPU warning; don't hide app banners
    if (els.banner === els.webgpuWarning) {
      // already handled
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// 3. Loading / Progress Overlay
// ---------------------------------------------------------------------------

/**
 * Callback passed to CreateMLCEngine to report download / init progress.
 * The MLC SDK calls this repeatedly with { text: string, progress?: number }.
 * Examples: "Downloading model...", "Loading ... 45%", "Fetching param cache 2/5"
 * We parse percentage and file counters to give a polished progress bar.
 * @param {import("@mlc-ai/web-llm").InitProgressReport} progress
 */
function initProgressCallback(progress) {
  const text = progress?.text ?? "";
  const pct = typeof progress?.progress === "number" ? progress.progress : null;

  // Update main loading text
  if (els.loadingText) {
    // Keep first line concise; SDK text can be long
    els.loadingText.textContent = text.split("\n")[0].slice(0, 120) || "Loading model…";
  }
  if (els.loadingDetail) {
    // Show secondary detail if SDK provides multi-line, else hint about caching
    const detail = text.includes("\n") ? text.split("\n").slice(1).join(" ") : "";
    els.loadingDetail.textContent =
      detail || "First load downloads ~300–500 MB and caches in IndexedDB — next loads are instant.";
  }

  // Try to extract percentage from text as fallback if progress is missing
  // Matches "45%", "45.2 %", "[45/100]" etc.
  let percent = pct !== null ? Math.round(pct * 100) : null;
  if (percent === null) {
    const m = text.match(/(\d+(?:\.\d+)?)\s*%/);
    if (m) percent = Math.round(parseFloat(m[1]));
  }

  // Special handling for "X/Y" file counters: "Downloading ... file 2 of 5"
  const fileMatch = text.match(/(\d+)\s*\/\s*(\d+)/);
  if (fileMatch && els.loadingDetail) {
    const cur = fileMatch[1];
    const total = fileMatch[2];
    els.loadingDetail.textContent = `Downloading file ${cur} of ${total}… ${text.slice(0, 100)}`;
  }

  if (percent !== null && !Number.isNaN(percent)) {
    const clamped = Math.max(0, Math.min(100, percent));
    if (els.progressFill) {
      els.progressFill.style.width = `${clamped}%`;
      els.progressFill.setAttribute("aria-valuenow", String(clamped));
    }
    if (els.progressText) els.progressText.textContent = `${clamped}%`;
    setStatus("loading", `Downloading… ${clamped}%`);
  } else {
    // Indeterminate — pulse animation via CSS if width is 100% with opacity
    if (els.progressText) {
      // Show spinner-like text when no percent available
      els.progressText.textContent = text.includes("Downloading") ? "Downloading…" : "Loading…";
    }
    setStatus("loading", "Loading model…");
  }

  // Ensure overlay is visible during progress
  if (els.loadingOverlay && els.loadingOverlay.classList.contains("hidden")) {
    els.loadingOverlay.classList.remove("hidden");
    els.loadingOverlay.style.display = "flex";
  }
}

/**
 * Show the loading overlay (called before initEngine).
 */
function showLoadingOverlay() {
  if (!els.loadingOverlay) return;
  els.loadingOverlay.classList.remove("hidden");
  els.loadingOverlay.style.display = "flex";
  // Reset progress
  if (els.progressFill) els.progressFill.style.width = "0%";
  if (els.progressText) els.progressText.textContent = "0%";
  if (els.loadingText) els.loadingText.textContent = "Initializing WebLLM…";
  if (els.loadingDetail) els.loadingDetail.textContent = "Checking cache…";
  setStatus("loading", "Initializing…");
  setComposerEnabled(false);
}

/**
 * Hide the overlay with a fade transition (relies on .hidden { opacity:0; pointer-events:none }).
 * Falls back to display:none after transition.
 */
function hideLoadingOverlay() {
  if (!els.loadingOverlay) return;
  els.loadingOverlay.classList.add("hidden");
  // After CSS transition (typically 300ms), remove from layout
  setTimeout(() => {
    // Only fully hide if still marked hidden (not re-shown by an error)
    if (els.loadingOverlay.classList.contains("hidden")) {
      els.loadingOverlay.style.display = "none";
    }
  }, 350);
}

/**
 * Show loading overlay in error state (keeps it visible with red status).
 * @param {string} message
 * @param {Error|unknown} err
 */
function showLoadingError(message, err) {
  console.error("[WebLLM] Load error:", err);
  if (els.loadingText) els.loadingText.textContent = "Failed to load model";
  if (els.loadingDetail) els.loadingDetail.textContent = message;
  if (els.progressText) els.progressText.textContent = "Error";
  if (els.progressFill) {
    els.progressFill.style.width = "100%";
    els.progressFill.style.backgroundColor = "#ef4444";
  }
  setStatus("error", "Load failed — see details");
  // Keep overlay visible so user sees error; don't auto-hide
  if (els.loadingOverlay) {
    els.loadingOverlay.classList.remove("hidden");
    els.loadingOverlay.style.display = "flex";
  }
}

// ---------------------------------------------------------------------------
// 4. Engine Creation
// ---------------------------------------------------------------------------

/**
 * Create and initialize the WebLLM engine.
 * Uses IndexedDB + Cache API under the hood — subsequent loads are served
 * from cache without re-downloading. This is automatic in @mlc-ai/web-llm.
 */
async function initEngine() {
  if (isEngineReady && engine) return engine;

  showLoadingOverlay();

  try {
    // Note: CreateMLCEngine handles fetching wasm, weights, and tokenizer assets.
    // initProgressCallback is invoked on the main thread; keep it lightweight.
    engine = await webllm.CreateMLCEngine(MODEL_ID, {
      initProgressCallback,
      // Optional: log level — useful in production to diagnose WebGPU issues
      // logLevel: "INFO",
    });

    isEngineReady = true;
    hideLoadingOverlay();
    setStatus("ready", "Ready – 100% local");
    setComposerEnabled(true);

    // Focus composer for immediate typing
    if (els.userInput) els.userInput.focus();

    console.info(`[WebLLM] Engine ready: ${MODEL_ID} (cached via IndexedDB/Cache API)`);

    // Announce readiness in chat as a subtle system notice (optional)
    // We don't push this into `messages` — it's UI-only.
    showBanner("Model ready — all inference runs locally in your browser (offline capable after first load).", "success", 4000);

    return engine;
  } catch (err) {
    // Common causes: WebGPU disabled, out-of-memory, network failure, CORS
    const msg =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error during engine creation.";
    // Provide actionable guidance
    let hint = msg;
    if (/webgpu/i.test(msg) || /gpu/i.test(msg)) {
      hint += " — Ensure Chrome/Edge 113+ with WebGPU enabled (chrome://flags/#enable-unsafe-webgpu).";
    } else if (/network|fetch|download/i.test(msg)) {
      hint += " — Check your network connection and reload. Weights are cached after first success.";
    } else if (/memory/i.test(msg)) {
      hint += " — Try closing other tabs or use a device with more GPU memory.";
    }

    showLoadingError(hint, err);
    setComposerEnabled(false);
    engine = null;
    isEngineReady = false;
    throw err;
  }
}

/**
 * Show a transient banner at the top of the app.
 * @param {string} text
 * @param {"info"|"success"|"error"} variant
 * @param {number} ms — auto-hide after ms (0 = sticky)
 */
function showBanner(text, variant = "info", ms = 3000) {
  const b = els.banner || els.webgpuWarning;
  if (!b) return;
  // Don't overwrite a sticky WebGPU warning with a transient success banner
  if (b === els.webgpuWarning && b.style.display !== "none" && variant !== "error") {
    // Use a separate toast instead
    const toast = document.createElement("div");
    toast.className = `toast toast--${variant}`;
    toast.textContent = text;
    toast.style.cssText =
      "position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);background:#1f2937;color:#fff;padding:.6rem 1rem;border-radius:.5rem;z-index:9999;font-size:.9rem;box-shadow:0 4px 12px rgba(0,0,0,.3)";
    document.body.appendChild(toast);
    if (ms) setTimeout(() => toast.remove(), ms);
    return;
  }
  b.textContent = text;
  b.className = `banner banner--${variant}`;
  b.hidden = false;
  b.style.display = "block";
  if (ms) {
    setTimeout(() => {
      b.hidden = true;
      b.style.display = "none";
    }, ms);
  }
}

// ---------------------------------------------------------------------------
// 5. Chat State
// ---------------------------------------------------------------------------

/**
 * Read current system prompt from textarea, trim, fallback to default.
 * @returns {string}
 */
function getSystemPromptValue() {
  const fallback = "You are a helpful, concise assistant running locally in the browser via WebLLM.";
  if (!els.systemPrompt) return fallback;
  const v = els.systemPrompt.value.trim();
  return v || fallback;
}

/**
 * Update the system message in `messages` when user edits the system prompt textarea.
 * Preserves conversation but replaces the leading system entry.
 */
function updateSystemPrompt() {
  const content = getSystemPromptValue();
  if (messages.length === 0) {
    messages = [{ role: "system", content }];
  } else if (messages[0].role === "system") {
    messages[0].content = content;
  } else {
    messages.unshift({ role: "system", content });
  }
}

/**
 * Initialize messages with the current system prompt.
 */
function initMessages() {
  messages = [{ role: "system", content: getSystemPromptValue() }];
}

// ---------------------------------------------------------------------------
// 6. Rendering
// ---------------------------------------------------------------------------

/**
 * Create a message DOM node and append to chatContainer.
 * @param {"user"|"assistant"|"system"|"error"} role
 * @param {string} content — raw markdown/text
 * @param {boolean} [isStreaming=false] — if true, bubble gets a blinking cursor
 * @returns {{wrapper: HTMLElement, bubble: HTMLElement, avatar: HTMLElement}}
 */
function addMessage(role, content, isStreaming = false) {
  const container = els.chatContainer;
  if (!container) {
    console.warn("[Chat] #chat-container not found — cannot render message");
    return { wrapper: null, bubble: null, avatar: null };
  }

  // Hide empty state on first real message
  if (emptyState) emptyState.style.display = "none";

  const wrapper = document.createElement("div");
  wrapper.className = `message message--${role}`;
  wrapper.dataset.role = role;

  const avatar = document.createElement("div");
  avatar.className = "message__avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = role === "user" ? "🧑" : role === "assistant" ? "🤖" : role === "error" ? "⚠️" : "⚙️";

  const bubble = document.createElement("div");
  bubble.className = "message__bubble";

  // Content rendering
  if (role === "assistant" || role === "error") {
    bubble.innerHTML = renderMarkdown(content) + (isStreaming ? '<span class="cursor">▌</span>' : "");
  } else if (role === "user") {
    // User content: escape and preserve line breaks, no markdown
    bubble.innerHTML = `<p>${escapeHtml(content).replace(/\n/g, "<br>")}</p>`;
  } else {
    bubble.innerHTML = `<em>${escapeHtml(content)}</em>`;
  }

  // Actions row: copy button for the whole message (assistant/error only)
  const actions = document.createElement("div");
  actions.className = "message__actions";

  if (role === "assistant" || role === "error" || role === "system") {
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "btn btn--ghost btn--copy";
    copyBtn.textContent = "Copy";
    copyBtn.setAttribute("aria-label", "Copy message");
    copyBtn.addEventListener("click", () => copyToClipboard(content, copyBtn));
    actions.appendChild(copyBtn);
  }

  // Timestamp
  const time = document.createElement("time");
  time.className = "message__time";
  time.dateTime = new Date().toISOString();
  time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  actions.appendChild(time);

  wrapper.appendChild(avatar);
  const body = document.createElement("div");
  body.className = "message__body";
  body.appendChild(bubble);
  body.appendChild(actions);
  wrapper.appendChild(body);

  container.appendChild(wrapper);

  // Bind per-code-block copy buttons inside this message
  wrapper.querySelectorAll("[data-copy-code], .copy-code-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pre = btn.closest(".code-block")?.querySelector("pre code") || btn.closest("pre")?.querySelector("code");
      const codeText = pre ? pre.textContent : "";
      copyToClipboard(codeText, btn);
    });
  });

  scrollToBottom(!isStreaming);

  return { wrapper, bubble, avatar };
}

/**
 * Update the streaming assistant bubble with new accumulated text.
 * Re-renders markdown on each chunk (debounced via rAF in practice by the loop).
 * @param {HTMLElement} bubble
 * @param {string} fullText
 * @param {boolean} streaming
 */
function updateAssistantBubble(bubble, fullText, streaming) {
  if (!bubble) return;
  const cursor = streaming ? '<span class="cursor" aria-hidden="true">▌</span>' : "";
  bubble.innerHTML = renderMarkdown(fullText) + cursor;

  // Re-bind code copy buttons that were just re-rendered
  bubble.querySelectorAll(".copy-code-btn").forEach((btn) => {
    // Avoid double-binding
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const codeEl = btn.closest(".code-block")?.querySelector("pre code");
      copyToClipboard(codeEl ? codeEl.textContent : "", btn);
    });
  });

  scrollToBottom(false);
}

// ---------------------------------------------------------------------------
// 7. Streaming — sendMessage + stopGeneration
// ---------------------------------------------------------------------------

/**
 * Interrupt the current generation if one is in-flight.
 * Uses engine.interruptGenerate() which is the WebLLM-supported abort path.
 */
async function stopGeneration() {
  if (!isGenerating) return;
  isStopped = true;
  try {
    if (engine && typeof engine.interruptGenerate === "function") {
      await engine.interruptGenerate();
    }
  } catch (e) {
    console.warn("[WebLLM] interruptGenerate failed:", e);
  } finally {
    isGenerating = false;
    setComposerEnabled(true);
    // Ensure stop button is hidden and status returns to ready
    if (els.stopBtn) {
      els.stopBtn.hidden = true;
      els.stopBtn.style.display = "none";
    }
    setStatus("ready", "Ready – 100% local");
    if (currentAssistantBubble) {
      // Remove cursor
      const cur = currentAssistantBubble.querySelector(".cursor");
      if (cur) cur.remove();
    }
    if (els.userInput) els.userInput.focus();
  }
}

/**
 * Send the current user input to the model and stream the response.
 * Handles UI states, builds the request with temperature/max_tokens, and
 * accumulates deltas from the async iterable.
 */
async function sendMessage() {
  const input = els.userInput;
  if (!input) return;

  const raw = input.value.trim();
  if (!raw) return;
  if (!isEngineReady || !engine) {
    addMessage("error", "Model is not ready yet. Please wait for the download to finish, or check the WebGPU warning above.");
    return;
  }
  if (isGenerating) return; // prevent concurrent generations

  // Ensure system prompt is fresh
  updateSystemPrompt();

  // 1) Render user message immediately
  addMessage("user", raw);
  messages.push({ role: "user", content: raw });

  // 2) Reset composer
  input.value = "";
  autoResizeTextarea();
  isGenerating = true;
  isStopped = false;
  setComposerEnabled(false);
  // Show stop button explicitly
  if (els.stopBtn) {
    els.stopBtn.hidden = false;
    els.stopBtn.style.display = "inline-flex";
    els.stopBtn.disabled = false;
  }
  setStatus("generating", "Generating…");

  // 3) Create assistant placeholder with typing indicator
  // Use three-dot typing indicator initially; it will be replaced on first delta
  const placeholder = addMessage("assistant", "⋯", true);
  currentAssistantBubble = placeholder.bubble;
  if (currentAssistantBubble) {
    currentAssistantBubble.innerHTML = '<span class="typing-indicator" aria-label="Generating"><span></span><span></span><span></span></span><span class="cursor">▌</span>';
  }

  // 4) Build request params from controls
  const temperature = els.tempSlider ? parseFloat(els.tempSlider.value) : 0.7;
  const maxTokensRaw = els.maxTokensSelect ? els.maxTokensSelect.value : "512";
  const max_tokens = parseInt(maxTokensRaw, 10);

  // Clamp temperature to [0,2] and max_tokens to sane range
  const tempClamped = Number.isFinite(temperature) ? Math.max(0, Math.min(2, temperature)) : 0.7;
  const maxTokensClamped = Number.isFinite(max_tokens) ? Math.max(1, Math.min(4096, max_tokens)) : 512;

  let fullText = "";
  let usage = null;

  try {
    // WebLLM OpenAI-compatible streaming API
    const stream = await engine.chat.completions.create({
      messages,
      temperature: tempClamped,
      max_tokens: maxTokensClamped,
      stream: true,
      stream_options: { include_usage: true },
    });

    // First delta received — clear typing indicator
    let firstChunk = true;

    for await (const chunk of stream) {
      // If user hit Stop, break out (interruptGenerate will cause stream to end)
      if (isStopped) break;

      // Extract delta content. WebLLM follows OpenAI shape:
      // chunk.choices[0].delta.content
      const delta = chunk?.choices?.[0]?.delta?.content ?? "";
      // Capture usage if provided on final chunk
      if (chunk?.usage) usage = chunk.usage;

      if (delta) {
        if (firstChunk) {
          fullText = "";
          firstChunk = false;
        }
        fullText += delta;
        updateAssistantBubble(currentAssistantBubble, fullText, true);
      }

      // Handle finish_reason if present (optional early exit)
      const finish = chunk?.choices?.[0]?.finish_reason;
      if (finish) {
        // Loop will exit naturally on next iteration if stream ends
      }
    }

    // If stopped, mark as interrupted
    if (isStopped) {
      if (fullText.trim()) {
        updateAssistantBubble(currentAssistantBubble, fullText + "\n\n*— generation stopped —*", false);
        messages.push({ role: "assistant", content: fullText });
      } else {
        // Remove empty placeholder if nothing was generated
        const wrapper = currentAssistantBubble?.closest(".message");
        if (wrapper) wrapper.remove();
        // Check if we need to show empty state again
        if (els.chatContainer && els.chatContainer.querySelectorAll(".message").length === 0 && emptyState) {
          emptyState.style.display = "";
        }
      }
    } else {
      // Normal completion — finalize
      if (!fullText.trim() && !isStopped) {
        // Edge: model returned empty
        updateAssistantBubble(currentAssistantBubble, "*No response generated. Try rephrasing or adjusting temperature.*", false);
        fullText = "";
      } else {
        updateAssistantBubble(currentAssistantBubble, fullText, false);
        messages.push({ role: "assistant", content: fullText });
      }
      if (usage) {
        console.debug("[WebLLM] usage:", usage);
      }
    }
  } catch (err) {
    // Streaming error — show error bubble, keep history consistent
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[WebLLM] Generation error:", err);

    // Remove placeholder cursor / typing indicator
    if (currentAssistantBubble) {
      const wrapper = currentAssistantBubble.closest(".message");
      // Replace placeholder content with error if no text accumulated
      if (!fullText.trim()) {
        if (wrapper) wrapper.remove();
        addMessage("error", `Generation failed: ${escapeHtml(msg)}\n\nTry again or reload the page. If the error mentions WebGPU or memory, check browser support.`);
      } else {
        updateAssistantBubble(currentAssistantBubble, fullText + `\n\n> ⚠️ Generation error: ${msg}`, false);
        messages.push({ role: "assistant", content: fullText });
      }
    } else {
      addMessage("error", `Generation failed: ${escapeHtml(msg)}`);
    }

    showBanner(`Generation error: ${msg.slice(0, 120)}`, "error", 5000);
  } finally {
    isGenerating = false;
    isStopped = false;
    currentAssistantBubble = null;
    setComposerEnabled(true);
    if (els.stopBtn) {
      els.stopBtn.hidden = true;
      els.stopBtn.style.display = "none";
    }
    setStatus("ready", "Ready – 100% local");
    if (els.userInput) els.userInput.focus();
  }
}

// ---------------------------------------------------------------------------
// 8. Utilities — clear, auto-resize, example chips, sidebar, controls
// ---------------------------------------------------------------------------

/**
 * Clear the conversation (keeps system prompt).
 * Removes all .message nodes, resets `messages`, shows empty state.
 */
function clearChat() {
  if (isGenerating) {
    // Optionally stop generation before clearing
    stopGeneration();
  }
  initMessages();
  if (els.chatContainer) {
    els.chatContainer.querySelectorAll(".message").forEach((el) => el.remove());
  }
  if (emptyState) emptyState.style.display = "";
  // Clear any engine-side history if the API exposes it
  // WebLLM keeps history client-side only, so resetting `messages` is sufficient.
  // If engine has resetChat, call it too for completeness.
  try {
    if (engine && typeof engine.resetChat === "function") {
      // Some versions expose resetChat; safe no-op if not.
      // We `await` but don't block UI on failure.
      Promise.resolve(engine.resetChat()).catch(() => {});
    }
  } catch {
    // ignore
  }
  if (els.userInput) {
    els.userInput.value = "";
    autoResizeTextarea();
    els.userInput.focus();
  }
  showBanner("Chat cleared", "info", 2000);
}

/**
 * Auto-resize the textarea to fit content up to a max height.
 */
function autoResizeTextarea() {
  const ta = els.userInput;
  if (!ta) return;
  ta.style.height = "auto";
  const maxH = 160; // px
  const newH = Math.min(ta.scrollHeight, maxH);
  ta.style.height = `${newH}px`;
  ta.style.overflowY = ta.scrollHeight > maxH ? "auto" : "hidden";
}

/**
 * Wire up temperature slider to live value label.
 */
function initTempControl() {
  const slider = els.tempSlider;
  const label = els.tempValue;
  if (!slider) return;
  const update = () => {
    if (label) label.textContent = parseFloat(slider.value).toFixed(2);
  };
  slider.addEventListener("input", update);
  update(); // initial
}

/**
 * Wire example chips — click to fill input (and optionally auto-send).
 * Behavior: fills #user-input and focuses it. If chip has data-autosend="true",
 * it will send immediately (useful for demos).
 */
function initExampleChips() {
  exampleChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const text = chip.getAttribute("data-prompt") || chip.getAttribute("data-example") || chip.textContent || "";
      const clean = text.trim();
      if (!clean) return;
      if (els.userInput) {
        els.userInput.value = clean;
        autoResizeTextarea();
        els.userInput.focus();
      }
      // Auto-send if explicitly opted in, otherwise let user press Send
      if (chip.getAttribute("data-autosend") === "true") {
        sendMessage();
      }
    });
  });
}

/**
 * Sidebar / mobile menu toggle.
 * Expects #sidebar and #menu-toggle; toggles .open class and aria-expanded.
 * Handles Tailwind's -translate-x-full toggle and backdrop.
 */
function initSidebarToggle() {
  const btn = els.menuToggle;
  const bar = els.sidebar;
  if (!btn || !bar) return;

  const backdrop = els.sidebarBackdrop;
  const closeBtn = els.sidebarClose;
  const warnDismiss = document.getElementById("webgpu-warning-dismiss");

  function setSidebarOpen(open) {
    // Tailwind uses translate-x-0 vs -translate-x-full
    if (open) {
      bar.classList.remove("-translate-x-full");
      bar.classList.add("translate-x-0");
      bar.classList.add("open");
    } else {
      bar.classList.add("-translate-x-full");
      bar.classList.remove("translate-x-0");
      bar.classList.remove("open");
    }
    btn.setAttribute("aria-expanded", String(open));
    if (backdrop) {
      backdrop.classList.toggle("hidden", !open);
      backdrop.classList.toggle("block", open);
    }
    document.body.classList.toggle("sidebar-open", open);
  }

  // Ensure initial state closed on mobile
  setSidebarOpen(false);

  btn.addEventListener("click", () => {
    const isOpen = bar.classList.contains("open");
    setSidebarOpen(!isOpen);
  });

  if (closeBtn) closeBtn.addEventListener("click", () => setSidebarOpen(false));
  if (backdrop) backdrop.addEventListener("click", () => setSidebarOpen(false));
  if (warnDismiss && els.webgpuWarning) {
    warnDismiss.addEventListener("click", () => {
      els.webgpuWarning.classList.add("hidden");
      els.webgpuWarning.style.display = "none";
    });
  }

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && bar.classList.contains("open")) {
      setSidebarOpen(false);
    }
  });
}

/**
 * Wire composer events: Send button, Stop button, Enter handling, etc.
 */
function initComposerEvents() {
  if (els.sendBtn) {
    els.sendBtn.addEventListener("click", sendMessage);
  }
  if (els.stopBtn) {
    els.stopBtn.addEventListener("click", stopGeneration);
    els.stopBtn.hidden = true;
    els.stopBtn.style.display = "none";
  }
  if (els.clearBtn) {
    els.clearBtn.addEventListener("click", clearChat);
  }
  if (els.userInput) {
    // Auto-resize
    els.userInput.addEventListener("input", autoResizeTextarea);
    // Enter to send, Shift+Enter for newline
    els.userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    // Initial sizing
    autoResizeTextarea();
  }
  if (els.systemPrompt) {
    // Update system prompt on change (debounced lightly)
    let t = null;
    els.systemPrompt.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(updateSystemPrompt, 300);
    });
    // Also handle blur immediately
    els.systemPrompt.addEventListener("blur", updateSystemPrompt);
  }
  if (els.maxTokensSelect) {
    // No extra logic — value is read per request
  }
}

// ---------------------------------------------------------------------------
// 9. Initialization — DOMContentLoaded -> check WebGPU -> init engine
// ---------------------------------------------------------------------------

/**
 * Main bootstrap. Handles both cases: script loaded before DOM ready and after.
 */
async function bootstrap() {
  // Cache original display for overlay if needed
  initMessages();
  initTempControl();
  initExampleChips();
  initSidebarToggle();
  initComposerEvents();

  // Initial UI state: composer disabled until engine ready
  setComposerEnabled(false);
  setStatus("idle", "Checking WebGPU…");

  // Feature detection — gate engine load
  const ok = checkWebGPU();
  if (!ok) {
    // Don't attempt to load model; leave warning visible
    return;
  }

  // Show overlay and kick off engine load
  try {
    await initEngine();
  } catch {
    // Error already handled in initEngine -> overlay shows error
  }
}

// Support both early and late script execution
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
  bootstrap();
}

// ---------------------------------------------------------------------------
// Global error visibility (helps diagnose WebGPU / CSP issues in production)
// ---------------------------------------------------------------------------
window.addEventListener("unhandledrejection", (e) => {
  console.error("[WebLLM] Unhandled rejection:", e.reason);
  // Only show banner for errors that look related to LLM
  const msg = e.reason instanceof Error ? e.reason.message : String(e.reason ?? "");
  if (/web-llm|webllm|webgpu|mlc/i.test(msg)) {
    showBanner(`Error: ${msg.slice(0, 140)}`, "error", 6000);
  }
});

// Expose for debugging in console (optional, harmless in production)
window.__webllm = { get engine() { return engine; }, get messages() { return messages; }, MODEL_ID };
