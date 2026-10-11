/**
 * Cool Laundry Opening Screen (Splash Animation Module)
 * Ultra-Modern Futuristic Appliance UI with 3D-effect Washing Machine Drum,
 * Liquid Vortex, Tumbling Clothes, Soap Suds, and Real-time Telemetry HUD.
 */

const LaundrySplash = {
  _isDismissed: false,
  _progress: 0,
  _intervalId: null,

  init(options = {}) {
    const autoPlay = options.autoPlay !== false;
    const durationMs = options.durationMs || 3500;
    const onComplete = options.onComplete || null;

    this._isDismissed = false;
    this._progress = 0;

    let splashEl = document.getElementById("laundry-splash-screen");
    if (!splashEl) {
      splashEl = this.createSplashMarkup();
      document.body.prepend(splashEl);
    }

    splashEl.style.display = "flex";
    splashEl.classList.remove("fade-out");

    if (window.lucide) lucide.createIcons();

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
      <!-- Ambient Glowing Aurora Mesh -->
      <div class="splash-ambient-glow glow-1"></div>
      <div class="splash-ambient-glow glow-2"></div>
      <div class="splash-bubbles-container" id="splash-bubbles"></div>

      <!-- Modern Glassmorphism Appliance Pod -->
      <div class="splash-modern-pod">
        
        <!-- Console Top Telemetry Bar -->
        <div class="pod-header">
          <div class="pod-header-left">
            <span class="pod-live-indicator">
              <span class="live-dot"></span>
              <span class="live-text">AI DIRECT DRIVE 6.0</span>
            </span>
          </div>
          <div class="pod-header-right">
            <span class="pod-eco-badge">
              <i data-lucide="zap"></i> ECO INVERTER
            </span>
          </div>
        </div>

        <!-- Washing Machine Drum Assembly -->
        <div class="washer-drum-section">
          
          <!-- Left Telemetry Pill -->
          <div class="washer-telemetry-chip chip-left">
            <div class="chip-icon"><i data-lucide="gauge"></i></div>
            <div class="chip-data">
              <span class="chip-val" id="washer-rpm-value">800</span>
              <span class="chip-lbl">RPM</span>
            </div>
          </div>

          <!-- Futuristic Outer Bezel & Drum -->
          <div class="washer-modern-door">
            <!-- Hex Accent Bolts -->
            <span class="bezel-bolt bolt-top"></span>
            <span class="bezel-bolt bolt-right"></span>
            <span class="bezel-bolt bolt-bottom"></span>
            <span class="bezel-bolt bolt-left"></span>

            <!-- Tachometer LED Glow Ring -->
            <div class="door-neon-ring">
              <div class="door-neon-runner"></div>
            </div>

            <!-- Convex Crystal Glass Porthole -->
            <div class="door-glass-window">
              <div class="glass-specular-glare"></div>
              <div class="glass-lens-glint"></div>

              <!-- Drum Interior (Perforations & Wash Chamber) -->
              <div class="drum-chamber">
                <div class="drum-stainless-bg"></div>

                <!-- Swirling Water Layers -->
                <div class="water-vortex-layer back-vortex"></div>
                <div class="water-vortex-layer front-vortex"></div>

                <!-- Tumbling Clothes in Wash -->
                <div class="tumbling-clothes-container" id="splash-tumbling-clothes">
                  <div class="tumble-item item-shirt" title="Cotton Tee">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
                      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
                    </svg>
                  </div>
                  <div class="tumble-item item-towel" title="Plush Towel">
                    <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor">
                      <rect x="3" y="5" width="18" height="14" rx="3"/>
                    </svg>
                  </div>
                  <div class="tumble-item item-sock" title="Sport Sock">
                    <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                      <path d="M14 2H8a2 2 0 0 0-2 2v9l-2.6 2.6A3 3 0 0 0 2 17.7V19a3 3 0 0 0 3 3h4.3a3 3 0 0 0 2.1-.9L14 18.5V4a2 2 0 0 0 0-2z"/>
                    </svg>
                  </div>
                  <div class="tumble-item item-linen" title="Fresh Fabric">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                </div>

                <!-- Foamy Soap Suds Clouds -->
                <div class="soap-suds-cloud suds-1"></div>
                <div class="soap-suds-cloud suds-2"></div>
                <div class="soap-suds-cloud suds-3"></div>
                <div class="soap-suds-cloud suds-4"></div>
              </div>
            </div>
          </div>

          <!-- Right Telemetry Pill -->
          <div class="washer-telemetry-chip chip-right">
            <div class="chip-icon"><i data-lucide="thermometer"></i></div>
            <div class="chip-data">
              <span class="chip-val" id="washer-temp-value">40°C</span>
              <span class="chip-lbl">STEAM</span>
            </div>
          </div>
        </div>

        <!-- Brand Title & Program Status -->
        <div class="pod-info-center">
          <div class="splash-badge">
          </div>
          <h1 class="splash-store-title" id="splash-store-title">POS System</h1>
          <p class="splash-status-sub" id="splash-status-sub">Agitating fresh soapy water & oxygen suds...</p>

          <!-- High-Tech Wash Cycle Segmented Stepper -->
          <div class="modern-cycle-stepper">
            <div class="modern-step step-wash active" id="step-wash">
              <div class="step-num">01</div>
              <div class="step-label">WASH</div>
            </div>
            <div class="step-divider"></div>
            <div class="modern-step step-rinse" id="step-rinse">
              <div class="step-num">02</div>
              <div class="step-label">RINSE</div>
            </div>
            <div class="step-divider"></div>
            <div class="modern-step step-spin" id="step-spin">
              <div class="step-num">03</div>
              <div class="step-label">SPIN</div>
            </div>
            <div class="step-divider"></div>
            <div class="modern-step step-clean" id="step-clean">
              <div class="step-num">04</div>
              <div class="step-label">READY</div>
            </div>
          </div>

          <!-- Shimmer Fluid Progress Bar -->
          <div class="modern-progress-box">
            <div class="modern-progress-track">
              <div class="modern-progress-fill" id="splash-progress-fill"></div>
              <div class="modern-progress-shimmer"></div>
            </div>
            <div class="modern-progress-meta">
              <span id="splash-phase-label">Dispensing gentle detergent & bubbles...</span>
              <span id="splash-percent-label" class="modern-percent-num font-mono">0%</span>
            </div>
          </div>

          <!-- Skip / Launch Button -->
          <button type="button" class="modern-skip-btn" id="btn-skip-splash" onclick="LaundrySplash.dismiss()">
            <span>Skip to Terminal</span>
            <i data-lucide="arrow-right"></i>
          </button>
        </div>

      </div>
    `;

    return div;
  },

  generateBubbles() {
    const container = document.getElementById("splash-bubbles");
    if (!container) return;

    container.innerHTML = "";
    const bubbleCount = 20;

    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement("div");
      bubble.className = "soap-bubble";

      const size = Math.floor(Math.random() * 34) + 16; // 16px to 50px
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
    const rpmValEl = document.getElementById("washer-rpm-value");
    const tempValEl = document.getElementById("washer-temp-value");
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
        if (stepWash) { stepWash.className = "modern-step step-wash active"; }
        if (stepRinse) { stepRinse.className = "modern-step step-rinse"; }
        if (stepSpin) { stepSpin.className = "modern-step step-spin"; }
        if (stepClean) { stepClean.className = "modern-step step-clean"; }
        if (rpmValEl) rpmValEl.textContent = "650";
        if (tempValEl) tempValEl.textContent = "40°C";
        if (statusSubEl) statusSubEl.textContent = "Dispensing premium detergent & agitating rich bubbles...";
        if (phaseLabelEl) phaseLabelEl.textContent = "Washing fabrics with soft enzyme lather...";
        if (tumblingClothes) tumblingClothes.classList.remove("spin-fast");
      }
      // Phase 2: Rinse (26 - 55%)
      else if (p <= 55) {
        if (stepWash) { stepWash.className = "modern-step step-wash completed"; }
        if (stepRinse) { stepRinse.className = "modern-step step-rinse active"; }
        if (stepSpin) { stepSpin.className = "modern-step step-spin"; }
        if (stepClean) { stepClean.className = "modern-step step-clean"; }
        if (rpmValEl) rpmValEl.textContent = "950";
        if (tempValEl) tempValEl.textContent = "30°C";
        if (statusSubEl) statusSubEl.textContent = "Rinsing fabrics with aromatic conditioner & fresh water...";
        if (phaseLabelEl) phaseLabelEl.textContent = "Cleansing fibers & neutralizing wash residue...";
        if (tumblingClothes) tumblingClothes.classList.remove("spin-fast");
      }
      // Phase 3: Spin Extraction (56 - 88%)
      else if (p <= 88) {
        if (stepWash) { stepWash.className = "modern-step step-wash completed"; }
        if (stepRinse) { stepRinse.className = "modern-step step-rinse completed"; }
        if (stepSpin) { stepSpin.className = "modern-step step-spin active"; }
        if (stepClean) { stepClean.className = "modern-step step-clean"; }
        if (rpmValEl) rpmValEl.textContent = "1,400";
        if (tempValEl) tempValEl.textContent = "COLD";
        if (statusSubEl) statusSubEl.textContent = "High-speed centrifugal spin extraction at 1,400 RPM...";
        if (phaseLabelEl) phaseLabelEl.textContent = "Turbo air-drying & moisture elimination...";
        if (tumblingClothes) tumblingClothes.classList.add("spin-fast");
      }
      // Phase 4: Ready (89 - 100%)
      else {
        if (stepWash) { stepWash.className = "modern-step step-wash completed"; }
        if (stepRinse) { stepRinse.className = "modern-step step-rinse completed"; }
        if (stepSpin) { stepSpin.className = "modern-step step-spin completed"; }
        if (stepClean) { stepClean.className = "modern-step step-clean active"; }
        if (rpmValEl) rpmValEl.textContent = "0";
        if (tempValEl) tempValEl.textContent = "READY";
        if (statusSubEl) statusSubEl.textContent = "Fresh, sanitized & sparkling clean. Welcome!";
        if (phaseLabelEl) phaseLabelEl.textContent = "Launching POS Management Terminal...";
        if (tumblingClothes) tumblingClothes.classList.remove("spin-fast");
      }

      if (this._progress >= 100) {
        clearInterval(this._intervalId);
        setTimeout(() => {
          this.dismiss(onComplete);
        }, 360);
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
        try { Sound.playBeep(); } catch (e) { }
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
function playLaundryIntro(duration = 3500) {
  let splashEl = document.getElementById("laundry-splash-screen");
  if (!splashEl) {
    LaundrySplash.init({ autoPlay: true, durationMs: duration });
  } else {
    if (LaundrySplash._intervalId) {
      clearInterval(LaundrySplash._intervalId);
      LaundrySplash._intervalId = null;
    }
    splashEl.style.display = "flex";
    splashEl.classList.remove("fade-out");
    LaundrySplash._isDismissed = false;
    LaundrySplash._progress = 0;

    const barEl = document.getElementById("splash-progress-bar");
    if (barEl) barEl.style.width = "0%";
    const pctEl = document.getElementById("splash-percent-label");
    if (pctEl) pctEl.textContent = "0%";

    LaundrySplash.generateBubbles();
    LaundrySplash.startCycle(duration);
  }
}

window.LaundrySplash = LaundrySplash;
window.playLaundryIntro = playLaundryIntro;
