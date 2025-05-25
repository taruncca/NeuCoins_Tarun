const categoryBrands = {
  Electronics: ["Croma"],
  Fashion: ["Tata CliQ", "Westside"],
  Travel: ["IHCL", "Air India Express", "Air India"],
  Others: ["1Mg", "Cult", "Tata Play"],
  BillPayments: ["Tata Pay"],
  Groceries: ["Big Basket"],
  Jewellery: ["Titan", "Tanishq"],
  FoodDelivery: ["Qmin", "Food Delivery via Tata Neu"]
};

const excludedCategories = [
  "Fuel",
  "WalletLoads",
  "GiftCard",
  "VoucherPurchase",
  "Government"
];

const brandCaps = {
  Croma: 21000,
  "Tata CliQ": 10500,
  Westside: 10500,
  IHCL: 28000,
  "Air India Express": 28000,
  "Air India": 28000,
  "1Mg": 7000,
  Cult: 7000,
  "Tata Play": 7000,
  "Tata Pay": 3500,
  "Big Basket": 3500,
  Titan: 21000,
  Tanishq: 21000,
  Qmin: 1750,
  "Food Delivery via Tata Neu": 1750,
  BillPayments: 3500 // Add capping for Bill Payments Bonus NeuCoins
};

document.addEventListener("DOMContentLoaded", () => {
  const cardTypeRadios = document.getElementsByName("cardType");
  const txnTypeRadios = document.getElementsByName("txnType");
  const upiSection = document.getElementById("upiSection");
  const categorySection = document.getElementById("categorySection");
  const billPaymentSection = document.getElementById("billPaymentSection");
  const partnerSection = document.getElementById("partnerSection");
  const brandSection = document.getElementById("brandSection");
  const brandSelect = document.getElementById("brandSelect");
  const calculateBtn = document.getElementById("calculate");
  const resetBtn = document.getElementById("reset");
  const output = document.getElementById("output");
  const amountInput = document.getElementById("amount");
  const categorySelect = document.getElementById("category");
  const body = document.body;

  // Set card color palette
  function updatePalette() {
    const cardType = getRadioValue("cardType");
    if (cardType === "Plus") {
      body.classList.add("plus-card");
    } else {
      body.classList.remove("plus-card");
    }
  }

  cardTypeRadios.forEach(radio => {
    radio.addEventListener("change", updatePalette);
  });
  updatePalette();

  // Format number with commas
  function formatWithCommas(num) {
    if (typeof num === "number") num = num.toString();
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Format input as user types
  amountInput.addEventListener("input", (e) => {
    let raw = e.target.value.replace(/,/g, "").replace(/[^\d.]/g, "");
    if ((raw.match(/\./g) || []).length > 1) {
      raw = raw.replace(/\.+$/, "");
    }
    let parts = raw.split(".");
    parts[0] = formatWithCommas(parts[0]);
    e.target.value = parts.length > 1 ? parts[0] + "." + parts[1] : parts[0];
  });

  function showSection(section, show = true) {
    section.classList.toggle("hidden", !show);
    section.setAttribute("aria-hidden", !show);
  }

  function resetRadioGroup(name, defaultValue = null) {
    const radios = document.getElementsByName(name);
    radios.forEach(radio => {
      radio.checked = defaultValue !== null && radio.value === defaultValue;
    });
  }

  function updateVisibility() {
    const txnType = getRadioValue("txnType");
    showSection(upiSection, txnType === "UPI");
    showSection(categorySection, true);
    showSection(billPaymentSection, false);
    showSection(partnerSection, false);
    showSection(brandSection, false);
  }

  function getRadioValue(name) {
    const radios = document.getElementsByName(name);
    for (const radio of radios) {
      if (radio.checked) return radio.value;
    }
    return null;
  }

  function validateInputs() {
    const amount = parseFloat(amountInput.value.replace(/,/g, ""));
    if (isNaN(amount) || amount < 1) {
      showError("Please enter a valid transaction amount (at least ₹1).");
      amountInput.focus();
      return false;
    }
    if (!categorySelect.value) {
      showError("Please select a transaction category.");
      categorySelect.focus();
      return false;
    }
    const txnType = getRadioValue("txnType");
    if (txnType === "UPI" && !getRadioValue("upiType")) {
      showError("Please select UPI type.");
      return false;
    }
    if (categorySelect.value === "BillPayments" && !getRadioValue("billNeuApp")) {
      showError("Please specify if Bill Payment was via Tata Neu App/Website.");
      return false;
    }
    if (
      categoryBrands[categorySelect.value] &&
      categorySelect.value !== "BillPayments" &&
      !excludedCategories.includes(categorySelect.value) &&
      !getRadioValue("partnerTxn")
    ) {
      showError("Please specify if this was on a partner Tata brand.");
      return false;
    }
    if (
      getRadioValue("partnerTxn") === "Yes" &&
      (!brandSelect.value || brandSelect.options.length === 0)
    ) {
      showError("Please select a partner Tata brand.");
      return false;
    }
    if (!getRadioValue("cardType")) {
      showError("Please select a card type.");
      return false;
    }
    return true;
  }

  function showError(msg) {
    output.innerHTML = `<span style="color: #e11d48;"><i class="fa-solid fa-circle-exclamation"></i> ${msg}</span>`;
    output.classList.remove("hidden");
    output.classList.add("output-card");
  }

  function populateBrands(category) {
    const brands = categoryBrands[category] || [];
    brandSelect.innerHTML = brands.length
      ? `<option value="">Select brand</option>` +
        brands.map(b => `<option value="${b}">${b}</option>`).join("")
      : "";
  }

  categorySelect.addEventListener("change", e => {
    const category = e.target.value;
    if (category === "BillPayments") {
      showSection(billPaymentSection, true);
      showSection(partnerSection, false);
      showSection(brandSection, false);
      resetRadioGroup("partnerTxn");
      brandSelect.innerHTML = "";
    } else if (categoryBrands[category] && !excludedCategories.includes(category)) {
      showSection(billPaymentSection, false);
      showSection(partnerSection, true);
      showSection(brandSection, false);
      resetRadioGroup("billNeuApp");
      brandSelect.innerHTML = "";
    } else {
      showSection(billPaymentSection, false);
      showSection(partnerSection, false);
      showSection(brandSection, false);
      resetRadioGroup("partnerTxn");
      resetRadioGroup("billNeuApp");
      brandSelect.innerHTML = "";
    }
  });

  document.getElementsByName("partnerTxn").forEach(radio => {
    radio.addEventListener("change", e => {
      if (e.target.value === "Yes") {
        const category = categorySelect.value;
        populateBrands(category);
        showSection(brandSection, true);
      } else {
        showSection(brandSection, false);
        brandSelect.innerHTML = "";
      }
    });
  });

  txnTypeRadios.forEach(radio => {
    radio.addEventListener("change", updateVisibility);
  });

  calculateBtn.addEventListener("click", () => {
    output.classList.add("hidden");
    if (!validateInputs()) return;

    const amount = parseFloat(amountInput.value.replace(/,/g, ""));
    const cardType = getRadioValue("cardType"); // Infinity or Plus
    const txnType = getRadioValue("txnType");
    const category = categorySelect.value;
    const upiType = getRadioValue("upiType");
    const billNeuApp = getRadioValue("billNeuApp");
    const partnerTxn = getRadioValue("partnerTxn");
    const brand = brandSelect.value;

    let baseRate = 0, bonusRate = 0, baseCap = null, bonusCap = null;

    // Excluded categories
    if (excludedCategories.includes(category)) {
      output.innerHTML = `<strong><i class="fa-solid fa-circle-info"></i> No NeuCoins earned for this category.</strong>`;
      output.classList.remove("hidden");
      output.classList.add("output-card");
      return;
    }

    if (cardType === "Infinity") {
      // EMI
      if (txnType === "EMI") {
        baseRate = 0.015;
      } else if (txnType === "UPI") {
        baseRate = 0.005;
        if (upiType === "TataNeu") bonusRate = 0.01;
        baseCap = 500;
        bonusCap = 500;
      } else { // Regular
        baseRate = 0.015;
        if (partnerTxn === "Yes" && categoryBrands[category]?.includes(brand)) {
          bonusRate = 0.035;
        } else if (category === "BillPayments") {
          if (billNeuApp === "Yes") {
            bonusRate = 0.035;
            bonusCap = brandCaps.BillPayments;
          }
        }
      }
    } else if (cardType === "Plus") {
      // EMI - for Plus, treating as regular (1% base, 0 bonus)
      if (txnType === "EMI") {
        baseRate = 0.01;
      } else if (txnType === "UPI") {
        baseRate = 0.0025;
        if (upiType === "TataNeu") bonusRate = 0.0075;
        baseCap = 500;
        bonusCap = 500;
      } else { // Regular
        baseRate = 0.01;
        if (partnerTxn === "Yes" && categoryBrands[category]?.includes(brand)) {
          bonusRate = 0.01;
        } else if (category === "BillPayments") {
          if (billNeuApp === "Yes") {
            bonusRate = 0.01;
            bonusCap = brandCaps.BillPayments;
          }
        }
      }
    }

    if (["Groceries", "BillPayments", "Insurance", "Telecom"].includes(category)) {
      baseCap = 2000;
    }
    if (partnerTxn === "Yes" && brandCaps[brand]) {
      bonusCap = brandCaps[brand];
    }

    let baseNeuCoins = amount * baseRate;
    let bonusNeuCoins = amount * bonusRate;

    if (baseCap !== null && baseNeuCoins > baseCap) baseNeuCoins = baseCap;
    if (bonusCap !== null && bonusNeuCoins > bonusCap) bonusNeuCoins = bonusCap;

    let totalNeuCoins = baseNeuCoins + bonusNeuCoins;

    // Build output card
    let paletteClass = cardType === "Plus" ? "blue" : "purple";
    let icon = totalNeuCoins > 0 ? '<span class="success-icon"><i class="fa-solid fa-circle-check"></i></span>' : '';
    let cardTitle = "Your NeuCoins Summary";
    let infoMsg = "";

    // Cap info
    if (baseCap !== null && baseNeuCoins === baseCap) {
      infoMsg += `<div class="neucoins-cap"><i class="fa-solid fa-arrow-up"></i> Base NeuCoins capped at ${baseCap}.</div>`;
    }
    if (bonusCap !== null && bonusNeuCoins === bonusCap && bonusRate > 0) {
      infoMsg += `<div class="neucoins-cap"><i class="fa-solid fa-arrow-up"></i> Bonus NeuCoins capped at ${bonusCap}.</div>`;
    }

    let result = `
      ${icon}
      <h2>${cardTitle}</h2>
      <div class="neucoins-total ${paletteClass}">Total: <span>${totalNeuCoins.toFixed(2)}</span></div>
      <div class="neucoins-breakdown">
        <div>Base: <span>${baseNeuCoins.toFixed(2)}</span></div>
        <div>Bonus: <span>${bonusNeuCoins.toFixed(2)}</span></div>
      </div>
      ${infoMsg}
      <div class="info">Based on <b>${cardType} Card</b> rewards structure.</div>
    `;
    output.innerHTML = result;
    output.classList.remove("hidden");
    output.classList.add("output-card");
  });

  resetBtn.addEventListener("click", () => {
    amountInput.value = "";
    categorySelect.value = "";
    resetRadioGroup("cardType", "Infinity");
    resetRadioGroup("txnType", "Regular");
    resetRadioGroup("upiType");
    resetRadioGroup("billNeuApp");
    resetRadioGroup("partnerTxn");
    brandSelect.innerHTML = "";
    showSection(upiSection, false);
    showSection(billPaymentSection, false);
    showSection(partnerSection, false);
    showSection(brandSection, false);
    output.classList.add("hidden");
    output.innerHTML = "";
    updatePalette();
    updateVisibility();
  });

  updatePalette();
  updateVisibility();
});