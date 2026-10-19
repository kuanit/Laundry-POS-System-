/**
 * =========================================================
 * ESC/POS THERMAL RECEIPT ENGINE (VOZY G80 & COMPATIBLE 80MM)
 * High-performance binary ESC/POS generator and direct USB/Serial driver
 * =========================================================
 */
const EscPosService = {
  // Remember paired device during session
  _pairedUsbDevice: null,

  isUsbSupported() {
    return typeof navigator !== "undefined" && !!navigator.usb;
  },

  isSerialSupported() {
    return typeof navigator !== "undefined" && !!navigator.serial;
  },

  /**
   * Generates a Uint8Array containing pure ESC/POS commands
   * calibrated for 80mm thermal rolls (48 columns Font A)
   */
  buildReceiptBytes(sale, customSettings) {
    const data = (typeof StorageManager !== "undefined") ? StorageManager.get() : {};
    const settings = customSettings || data.settings || {};

    const chunks = [];
    const textEncoder = new TextEncoder();

    function write(text) {
      chunks.push(textEncoder.encode(text));
    }

    function raw(bytes) {
      chunks.push(new Uint8Array(bytes));
    }

    // --- 1. INITIALIZE PRINTER ---
    raw([0x1B, 0x40]); // ESC @ : Reset to defaults
    raw([0x1B, 0x74, 0x00]); // ESC t 0 : Code page PC437 (Standard English)

    // --- 2. HEADER: BRAND & STORE INFO ---
    raw([0x1B, 0x61, 0x01]); // ESC a 1 : Center align

    // Double Width + Double Height for Brand Name
    raw([0x1D, 0x21, 0x11]); // GS ! 0x11
    write((settings.storeName || "BRAND NAME").toUpperCase() + "\n");
    
    // Normal Text
    raw([0x1D, 0x21, 0x00]); // GS ! 0x00
    if (settings.tagline) write(settings.tagline + "\n");
    if (settings.address) write(settings.address + "\n");
    if (settings.contact) write(settings.contact + "\n");

    // Title: SALES RECEIPT
    raw([0x1B, 0x45, 0x01]); // ESC E 1 : Bold ON
    write("SALES RECEIPT\n");
    raw([0x1B, 0x45, 0x00]); // ESC E 0 : Bold OFF

    // --- 3. METADATA SECTION ---
    raw([0x1B, 0x61, 0x00]); // ESC a 0 : Left align
    write("------------------------------------------------\n"); // 48 dashes

    const dateFormatted = new Date(sale.createdAt || Date.now()).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true
    });

    write(`Receipt #: #${sale.transactionNumber}\n`);
    write(`Date:      ${dateFormatted}\n`);
    write(`Cashier:   ${sale.cashierName || "Staff"}\n`);
    write(`Payment:   ${sale.paymentMethod || "CASH"}\n`);
    if (sale.customerName && sale.customerName !== "Walk-in Customer") {
      write(`Customer:  ${sale.customerName}\n`);
    }

    // --- 4. ITEMS TABLE ---
    write("------------------------------------------------\n");
    write("ITEM                     QTY    PRICE      TOTAL\n");
    write("------------------------------------------------\n");

    (sale.items || []).forEach(item => {
      const fullItemName = item.productName || "Item";
      const namePart = fullItemName.length > 22 ? fullItemName.slice(0, 22) : fullItemName.padEnd(22);
      const qtyUnit = `${item.quantity}${item.unit || "pc"}`.padStart(6);
      const priceStr = `P${(item.unitPrice || 0).toFixed(2)}`.padStart(8);
      const subtotalStr = `P${(item.subtotal || 0).toFixed(2)}`.padStart(10);

      write(`${namePart} ${qtyUnit} ${priceStr} ${subtotalStr}\n`);

      // If name was truncated, print the remaining name on a second indented line
      if (fullItemName.length > 22) {
        write(`  ${fullItemName.slice(22, 46)}\n`);
      }
    });

    // --- 5. TOTALS SECTION ---
    write("------------------------------------------------\n");
    const subtotalVal = `P${(sale.subtotal || 0).toFixed(2)}`.padStart(10);
    write(`Subtotal:`.padEnd(38) + subtotalVal + "\n");

    if (sale.discount && sale.discount > 0) {
      const discLabel = `Discount (${sale.discountLabel || "Promo"}):`;
      const discVal = `-P${sale.discount.toFixed(2)}`.padStart(10);
      write(discLabel.padEnd(38) + discVal + "\n");
    }

    // Bold + Double Height TOTAL
    raw([0x1B, 0x45, 0x01]); // Bold ON
    raw([0x1D, 0x21, 0x01]); // Double height
    const totalVal = `P${(sale.total || 0).toFixed(2)}`.padStart(10);
    write(`TOTAL:`.padEnd(38) + totalVal + "\n");
    raw([0x1D, 0x21, 0x00]); // Normal
    raw([0x1B, 0x45, 0x00]); // Bold OFF

    const receivedVal = `P${(sale.amountReceived || sale.total || 0).toFixed(2)}`.padStart(10);
    write(`Amount Received:`.padEnd(38) + receivedVal + "\n");

    const changeVal = `P${(sale.changeAmount || 0).toFixed(2)}`.padStart(10);
    write(`Change:`.padEnd(38) + changeVal + "\n");
    write("------------------------------------------------\n");

    // --- 6. FOOTER ---
    raw([0x1B, 0x61, 0x01]); // Center align
    const rawFooter = settings.receiptFooter || "Thank you for your business!";
    const cleanFooter = rawFooter.replace(/Please present this Claim Stub upon pickup\.?/gi, "")
                                 .replace(/Keep this stub safe\.?/gi, "")
                                 .replace(/Claim Stub.*$/gi, "")
                                 .trim() || "Thank you for your business!";
    write(cleanFooter + "\n");

    // --- 7. AUTO-CUT & PAPER FEED ---
    // Feed 4 lines so text clears the cutter blade
    raw([0x1B, 0x64, 0x04]); // ESC d 4
    // Partial Cut Command (GS V 66 0): standard on Vozy G80, Epson, Xprinter
    raw([0x1D, 0x56, 0x42, 0x00]); // GS V 66 0

    // Combine all chunks into single Uint8Array
    const totalLen = chunks.reduce((sum, ch) => sum + ch.length, 0);
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const ch of chunks) {
      combined.set(ch, offset);
      offset += ch.length;
    }

    return combined;
  },

  /**
   * Direct WebUSB Print: sends binary ESC/POS stream directly to USB thermal printer
   * Bypasses the browser print dialog completely; cuts immediately after content!
   */
  async printUsb(sale, customSettings) {
    if (!this.isUsbSupported()) {
      throw new Error("WebUSB is not supported in this browser. Please use Google Chrome or Microsoft Edge on Desktop/Android.");
    }

    const escPosBytes = this.buildReceiptBytes(sale, customSettings);

    let device = this._pairedUsbDevice;

    // If no previously paired device in session or device closed, prompt user to select USB printer
    if (!device || !device.opened) {
      try {
        device = await navigator.usb.requestDevice({
          filters: [] // Allow user to select any connected USB device (Vozy G80, POS-80, etc.)
        });
        this._pairedUsbDevice = device;
      } catch (err) {
        if (err.name === "NotFoundError") {
          throw new Error("Printer selection was cancelled.");
        }
        throw err;
      }
    }

    if (!device.opened) {
      await device.open();
    }

    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    // Locate the bulk OUT endpoint (printer write channel)
    let targetInterface = null;
    let targetEndpoint = null;

    for (const iface of device.configuration.interfaces) {
      for (const alt of iface.alternates) {
        const outEp = alt.endpoints.find(e => e.direction === "out");
        if (outEp) {
          targetInterface = iface;
          targetEndpoint = outEp;
          break;
        }
      }
      if (targetEndpoint) break;
    }

    if (!targetInterface || !targetEndpoint) {
      throw new Error("Could not find a valid USB OUT endpoint on the selected device. Make sure it is an ESC/POS printer.");
    }

    try {
      await device.claimInterface(targetInterface.interfaceNumber);
    } catch (claimErr) {
      // If Windows spooler/driver has exclusive lock on the USB device
      if (claimErr.name === "SecurityError" || claimErr.message.includes("claim")) {
        throw new Error("Windows printer driver currently has exclusive lock on this USB port. Use 'Browser Print' or switch driver to WinUSB.");
      }
      throw claimErr;
    }

    // Send ESC/POS binary data
    await device.transferOut(targetEndpoint.endpointNumber, escPosBytes);

    try {
      await device.releaseInterface(targetInterface.interfaceNumber);
    } catch (e) {}

    return true;
  },

  /**
   * Direct Web Serial Print: sends ESC/POS over Virtual COM / Serial port
   */
  async printSerial(sale, customSettings, baudRate = 9600) {
    if (!this.isSerialSupported()) {
      throw new Error("Web Serial is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
    }

    const escPosBytes = this.buildReceiptBytes(sale, customSettings);
    const port = await navigator.serial.requestPort();

    await port.open({ baudRate: baudRate, dataBits: 8, stopBits: 1, parity: "none" });
    const writer = port.writable.getWriter();
    await writer.write(escPosBytes);
    writer.releaseLock();
    await port.close();

    return true;
  },

  /**
   * Download raw ESC/POS binary file (.bin) for local spoolers or testing
   */
  downloadBin(sale, customSettings) {
    const escPosBytes = this.buildReceiptBytes(sale, customSettings);
    const blob = new Blob([escPosBytes], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt_${sale.transactionNumber || "print"}.bin`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
};

if (typeof window !== "undefined") {
  window.EscPosService = EscPosService;
}
