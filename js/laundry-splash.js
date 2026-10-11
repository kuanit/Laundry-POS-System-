/**
 * Cool Laundry Opening Screen (Splash Animation Module)
 * Features an animated washing machine drum with swirling water vortex, tumbling clothes,
 * soap bubbles, wash cycle phases (WASH -> RINSE -> SPIN -> READY), and smooth reveal transitions.
 */

const LaundrySplash = {
  _isDismissed: false,
  _progress: 0,
  _intervalId: null,

  init(options = {}) {
    const autoPlay = options.autoPlay !== false;
    const durationMs = options.durationMs || 2500;
    const onComplete = options.onComplete || null;

    this._isDismissed = false;
    this._progress = 0;

    // Build splash screen markup if not already present in DOM
    let splashEl = document.getElementById("laundry-splash-screen");
    if (!splashEl) {
      splashEl = this.createSplashMarkup();
      document.body.prepend(splashEl);
    }

    splashEl.style.display = "flex";
    splashEl.classList.remove("fade-out");

    if (window.lucide) lucide.createIcons();

    // Generate ambient floating soap bubbles
    this.generateBubbles();

    // Sync Store Name if configured
    if (typeof StorageManager !== "undefined") {
      const data = StorageManager.get();
      const titleEl = document.getElementById("splash-store-title");
      if (titleEl && data?.settings?.storeName) {
        titleEl.textContent = data.settings.storeName;
      }
    }

    if (autoPlay) {
      this.startCycle(durationMs, onComplete);
    }
  },

  createSplashMarkup() {
    const div = document.createElement("div");
    div.id = "laundry-splash-screen";
    div.className = "laundry-splash-screen";
    div.setAttribute("aria-label", "Loading Laundry POS System");

    div.innerHTML = `
      <div class="splash-bubbles-container" id="splash-bubbles"></div>

      <div class="splash-content-wrapper">
        <!-- Smart Washer Machine Hub -->
        <div class="washer-machine-cabinet">
          <div class="washer-top-bar">
            <div class="washer-power-led"></div>
            <div class="washer-program-display" id="washer-program-display">AUTO CYCLE • 40°C</div>
            <div class="washer-rpm-badge" id="washer-rpm-badge">800 RPM</div>
          </div>

          <div class="washer-door-rim">
            <div class="washer-led-track">
              <div class="washer-led-runner" id="washer-led-runner"></div>
            </div>
            
            <div class="washer-drum-porthole">
              <div class="drum-glass-reflection"></div>

              <div class="drum-interior">
                <div class="water-vortex-layer layer-back"></div>
                <div class="water-vortex-layer layer-front"></div>

                <div class="tumbling-clothes-container" id="splash-tumbling-clothes">
                  <div class="tumble-item item-shirt" title="Clean Shirt">
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
                    </svg>
                  </div>
                  <div class="tumble-item item-towel" title="Soft Towel">
                    <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                      <rect x="3" y="5" width="18" height="14" rx="3" />
                    </svg>
                  </div>
                  <div class="tumble-item item-sock" title="Fabric Sock">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                      <path d="M14 2H8a2 2 0 0 0-2 2v9l-2.6 2.6A3 3 0 0 0 2 17.7V19a3 3 0 0 0 3 3h4.3a3 3 0 0 0 2.1-.9L14 18.5V4a2 2 0 0 0 0-2z"/>
                    </svg>
                  </div>
                </div>

                <div class="soap-suds-cloud suds-1"></div>
                <div class="soap-suds-cloud suds-2"></div>
                <div class="soap-suds-cloud suds-3"></div>
                <div class="soap-suds-cloud suds-4"></div>
              </div>
            </div>
          </div>

          <div class="washer-door-handle"></div>
        </div>

        <!-- Brand Info & Wash Cycle Progress -->
        <div class="splash-info-box">
          <div class="splash-badge">
            <i data-lucide="droplets"></i>
            <span>PROFESSIONAL LAUNDRY SYSTEM</span>
          </div>
          <h1 class="splash-store-title" id="splash-store-title">POS System</h1>
          <p class="splash-status-sub" id="splash-status-sub">Agitating fresh soapy water & suds...</p>

          <!-- Wash Cycle Stepper -->
          <div class="wash-cycle-stepper">
            <div class="cycle-step step-wash active" id="step-wash">
              <i data-lucide="droplets"></i>
              <span>WASH</span>
            </div>
            <div class="cycle-step-arrow">›</div>
            <div class="cycle-step step-rinse" id="step-rinse">
              <i data-lucide="waves"></i>
              <span>RINSE</span>
            </div>
            <div class="cycle-step-arrow">›</div>
            <div class="cycle-step step-spin" id="step-spin">
              <i data-lucide="rotate-cw"></i>
              <span>SPIN</span>
            </div>
            <div class="cycle-step-arrow">›</div>
            <div class="cycle-step step-clean" id="step-clean">
              <i data-lucide="sparkles"></i>
              <span>READY</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="splash-progress-track">
            <div class="splash-progress-fill" id="splash-progress-fill"></div>
          </div>
          <div class="splash-progress-meta">
            <span id="splash-phase-label">Dispensing gentle detergent...</span>
            <span id="splash-percent-label" class="font-mono">0%</span>
          </div>
        </div>

        <!-- Quick Skip Button -->
        <button type="button" class="splash-skip-btn" id="btn-skip-splash" onclick="LaundrySplash.dismiss()">
          <span>Enter System</span>
          <i data-lucide="arrow-right"></i>
        </button>
      </div>
    `;

    return div;
  },

  generateBubbles() {
    const container = document.getElementById("splash-bubbles");
    if (!container) return;

    container.innerHTML = "";
    const bubbleCount = 18;

    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement("div");
      bubble.className = "soap-bubble";

      const size = Math.floor(Math.random() * 32) + 14; // 14px to 46px
      const left = Math.floor(Math.random() * 96) + 2; // 2% to 98%
      const duration = (Math.random() * 4.5 + 4).toFixed(1); // 4.0s to 8.5s
      const delay = (Math.random() * 4).toFixed(1); // 0s to 4s stagger

      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${left}%`;
      bubble.style.animationDuration = `${duration}s`;
      bubble.style.animationDelay = `-${delay}s`;

      container.appendChild(bubble);
    }
  },

  startCycle(totalMs, onComplete) {
    this._isDismissed = false;
    this._progress = 0;

    const fillEl = document.getElementById("splash-progress-fill");
    const percentEl = document.getElementById("splash-percent-label");
    const statusSubEl = document.getElementById("splash-status-sub");
    const phaseLabelEl = document.getElementById("splash-phase-label");
    const rpmEl = document.getElementById("washer-rpm-badge");
    const progDispEl = document.getElementById("washer-program-display");
    const tumblingClothes = document.getElementById("splash-tumbling-clothes");

    const stepWash = document.getElementById("step-wash");
    const stepRinse = document.getElementById("step-rinse");
    const stepSpin = document.getElementById("step-spin");
    const stepClean = document.getElementById("step-clean");

    const intervalTime = 30; // ms
    const increment = 100 / (totalMs / intervalTime);

    if (this._intervalId) clearInterval(this._intervalId);

    this._intervalId = setInterval(() => {
      if (this._isDismissed) {
        clearInterval(this._intervalId);
        return;
      }

      this._progress = Math.min(100, this._progress + increment);
      const p = Math.floor(this._progress);

      if (fillEl) fillEl.style.width = `${p}%`;
      if (percentEl) percentEl.textContent = `${p}%`;

      // Phase 1: Wash (0 - 25%)
      if (p <= 25) {
        if (stepWash) { stepWash.className = "cycle-step active"; }
        if (stepRinse) { stepRinse.className = "cycle-step"; }
        if (stepSpin) { stepSpin.className = "cycle-step"; }
        if (stepClean) { stepClean.className = "cycle-step"; }
        if (rpmEl) rpmEl.textContent = "600 RPM";
        if (progDispEl) progDispEl.textContent = "WASH CYCLE • 40°C";
        if (statusSubEl) statusSubEl.textContent = "Agitating fresh soapy water & suds...";
        if (phaseLabelEl) phaseLabelEl.textContent = "Dispensing gentle detergent & bubbles...";
        if (tumblingClothes) tumblingClothes.classList.remove("spin-fast");
      }
      // Phase 2: Rinse (26 - 55%)
      else if (p <= 55) {
        if (stepWash) { stepWash.className = "cycle-step completed"; }
        if (stepRinse) { stepRinse.className = "cycle-step active"; }
        if (stepSpin) { stepSpin.className = "cycle-step"; }
        if (stepClean) { stepClean.className = "cycle-step"; }
        if (rpmEl) rpmEl.textContent = "900 RPM";
        if (progDispEl) progDispEl.textContent = "RINSE CYCLE • FRESH WATER";
        if (statusSubEl) statusSubEl.textContent = "Rinsing fabrics with aromatic softener...";
        if (phaseLabelEl) phaseLabelEl.textContent = "Purifying laundry fibers with clean water...";
        if (tumblingClothes) tumblingClothes.classList.remove("spin-fast");
      }
      // Phase 3: Spin Extraction (56 - 88%)
      else if (p <= 88) {
        if (stepWash) { stepWash.className = "cycle-step completed"; }
        if (stepRinse) { stepRinse.className = "cycle-step completed"; }
        if (stepSpin) { stepSpin.className = "cycle-step active"; }
        if (stepClean) { stepClean.className = "cycle-step"; }
        if (rpmEl) rpmEl.textContent = "1400 RPM";
        if (progDispEl) progDispEl.textContent = "SPIN CYCLE • HIGH EXTRACTION";
        if (statusSubEl) statusSubEl.textContent = "High-speed spin drying at 1,400 RPM...";
        if (phaseLabelEl) phaseLabelEl.textContent = "Extracting moisture from load...";
        if (tumblingClothes) tumblingClothes.classList.add("spin-fast");
      }
      // Phase 4: Ready (89 - 100%)
      else {
        if (stepWash) { stepWash.className = "cycle-step completed"; }
        if (stepRinse) { stepRinse.className = "cycle-step completed"; }
        if (stepSpin) { stepSpin.className = "cycle-step completed"; }
        if (stepClean) { stepClean.className = "cycle-step active"; }
        if (rpmEl) rpmEl.textContent = "0 RPM • DONE";
        if (progDispEl) progDispEl.textContent = "FRESH & CLEAN • READY";
        if (statusSubEl) statusSubEl.textContent = "All laundry systems sparkling clean & ready!";
        if (phaseLabelEl) phaseLabelEl.textContent = "Loading POS Terminal...";
        if (tumblingClothes) tumblingClothes.classList.remove("spin-fast");
      }

      if (this._progress >= 100) {
        clearInterval(this._intervalId);
        setTimeout(() => {
          this.dismiss(onComplete);
        }, 320);
      }
    }, intervalTime);
  },

  dismiss(onComplete) {
    if (this._isDismissed) return;
    this._isDismissed = true;

    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    const splashEl = document.getElementById("laundry-splash-screen");
    if (splashEl) {
      if (typeof Sound !== "undefined" && Sound.playBeep) {
        try { Sound.playBeep(); } catch (e) {}
      }

      splashEl.classList.add("fade-out");

      setTimeout(() => {
        splashEl.style.display = "none";
        splashEl.classList.remove("fade-out");
        if (typeof onComplete === "function") {
          onComplete();
        }
      }, 700);
    }
  }
};

// Global Helper to trigger or test the laundry opening screen anytime
function playLaundryIntro() {
  let splashEl = document.getElementById("laundry-splash-screen");
  if (!splashEl) {
    LaundrySplash.init({ autoPlay: true, durationMs: 2500 });
  } else {
    splashEl.style.display = "flex";
    splashEl.classList.remove("fade-out");
    LaundrySplash._isDismissed = false;
    LaundrySplash._progress = 0;
    LaundrySplash.generateBubbles();
    LaundrySplash.startCycle(2500);
  }
}

window.LaundrySplash = LaundrySplash;
window.playLaundryIntro = playLaundryIntro;
