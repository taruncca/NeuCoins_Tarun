const categoryBrands = {
  Electronics: ["Croma"],
  Fashion: ["Tata CliQ", "Westside"],
  Travel: ["IHCL", "Air India Express", "Air India"],
  Others: ["1Mg", "Cult", "Tata Play"],
  BillPayments: ["Tata Pay"],
  Groceries: ["Big Basket"],
  Jewellery: ["Titan", "Tanishq"],
  FoodDelivery: ["Qmin", "Food Delivery via Tata Neu"],
  Insurance: []
};

const excludedCategories = [
  "Fuel",
  "WalletLoads",
  "GiftCard",
  "VoucherPurchase",
  "Government"
];

const plusBonusCaps = {
  Electronics: 6000,
  Fashion: 3000,
  Travel: 8000,
  Others: 2000,
  BillPayments: 1000,
  Groceries: 1000,
  Jewellery: 6000,
  FoodDelivery: 500
};

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
  BillPayments: 3500
};

const insuranceProductBonusEligibility = {
  "SSIP": true,
  "Term Life": true,
  "Health Insurance": true,
  "Motor Insurance": true,
  "Super Top-Up": true,
  "Cyber": false,
  "Personal Accident": false,
  "Home Protect": false,
  "Card Protect": false
};

document.addEventListener("DOMContentLoaded", () => {
  const cardTypeRadios = document.getElementsByName("cardType");
  const txnTypeRadios = document.getElementsByName("txnType");
  const upiSection = document.getElementById("upiSection");
  const categorySection = document.getElementById("categorySection");
  const billPaymentSection = document.getElementById("billPaymentSection");
  const insuranceViaNeuSection = document.getElementById("insuranceViaNeuSection");
  const insuranceTypeSection = document.getElementById("insuranceTypeSection");
  const insuranceProductSection = document.getElementById("insuranceProductSection");
  const insuranceProductSelect = document.getElementById("insuranceProduct");
  const partnerSection = document.getElementById("partnerSection");
  const brandSection = document.getElementById("brandSection");
  const brandSelect = document.getElementById("brandSelect");
  const calculateBtn = document.getElementById("calculate");
  const resetBtn = document.getElementById("reset");
  const output = document.getElementById("output");
  const amountInput = document.getElementById("amount");
  const categorySelect = document.getElementById("category");
  const body = document.body;

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

  function formatWithCommas(num) {
    if (typeof num === "number") num = num.toString();
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

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
    showSection(insuranceViaNeuSection, false);
    showSection(insuranceTypeSection, false);
    showSection(insuranceProductSection, false);
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
    if (categorySelect.value === "Insurance") {
      const insuranceNeuApp = getRadioValue("insuranceNeuApp");
      if (!insuranceNeuApp) {
        showError("Please specify if Insurance transaction was via Tata Neu App/Website.");
        return false;
      }
      if (insuranceNeuApp === "Yes") {
        const insuranceType = getRadioValue("insuranceType");
        if (!insuranceType) {
          showError("Please specify if it was a purchase or premium payment transaction.");
          return false;
        }
        if (insuranceType === "Purchase" && !insuranceProductSelect.value) {
          showError("Please select the insurance product.");
          return false;
        }
      }
    }
    if (
      categoryBrands[categorySelect.value] &&
      categorySelect.value !== "BillPayments" &&
      categorySelect.value !== "Insurance" &&
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
      showSection(insuranceViaNeuSection, false);
      showSection(insuranceTypeSection, false);
      showSection(insuranceProductSection, false);
      showSection(partnerSection, false);
      showSection(brandSection, false);
      resetRadioGroup("partnerTxn");
      brandSelect.innerHTML = "";
    } else if (category === "Insurance") {
      showSection(billPaymentSection, false);
      showSection(insuranceViaNeuSection, true);
      showSection(insuranceTypeSection, false);
      showSection(insuranceProductSection, false);
      showSection(partnerSection, false);
      showSection(brandSection, false);
      resetRadioGroup("billNeuApp");
      resetRadioGroup("partnerTxn");
      brandSelect.innerHTML = "";
    } else if (categoryBrands[category] && !excludedCategories.includes(category)) {
      showSection(billPaymentSection, false);
      showSection(insuranceViaNeuSection, false);
      showSection(insuranceTypeSection, false);
      showSection(insuranceProductSection, false);
      showSection(partnerSection, true);
      showSection(brandSection, false);
      resetRadioGroup("billNeuApp");
      brandSelect.innerHTML = "";
    } else {
      showSection(billPaymentSection, false);
      showSection(insuranceViaNeuSection, false);
      showSection(insuranceTypeSection, false);
      showSection(insuranceProductSection, false);
      showSection(partnerSection, false);
      showSection(brandSection, false);
      resetRadioGroup("partnerTxn");
      resetRadioGroup("billNeuApp");
      brandSelect.innerHTML = "";
    }
  });

  document.getElementsByName("insuranceNeuApp").forEach(radio => {
    radio.addEventListener("change", e => {
      if (e.target.value === "Yes") {
        showSection(insuranceTypeSection, true);
        showSection(insuranceProductSection, false);
      } else {
        showSection(insuranceTypeSection, false);
        showSection(insuranceProductSection, false);
      }
    });
  });

  document.getElementsByName("insuranceType").forEach(radio => {
    radio.addEventListener("change", e => {
      if (e.target.value === "Purchase") {
        showSection(insuranceProductSection, true);
      } else {
        showSection(insuranceProductSection, false);
      }
    });
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
    const cardType = getRadioValue("cardType");
    const txnType = getRadioValue("txnType");
    const category = categorySelect.value;
    const upiType = getRadioValue("upiType");
    const billNeuApp = getRadioValue("billNeuApp");
    const partnerTxn = getRadioValue("partnerTxn");
    const brand = brandSelect.value;

    const insuranceNeuApp = getRadioValue("insuranceNeuApp");
    const insuranceType = getRadioValue("insuranceType");
    const insuranceProduct = insuranceProductSelect.value;

    let baseRate = 0, bonusRate = 0, baseCap = null, bonusCap = null;
    let baseNeuCoins = 0, bonusNeuCoins = 0, totalNeuCoins = 0;
    let capped = false;

    if (excludedCategories.includes(category)) {
      output.innerHTML = `<strong><i class="fa-solid fa-circle-info"></i> No NeuCoins earned for this category.</strong>`;
      output.classList.remove("hidden");
      output.classList.add("output-card");
      return;
    }

    // INSURANCE LOGIC
    if (category === "Insurance") {
      baseCap = (cardType === "Plus") ? 2000 : 2000;
      bonusCap = (cardType === "Plus") ? plusBonusCaps.BillPayments : brandCaps.BillPayments;
      baseRate = (cardType === "Plus") ? 0.01 : 0.015;
      bonusRate = 0;
      if (insuranceNeuApp === "Yes") {
        if (insuranceType === "PremiumPayment") {
          bonusRate = (cardType === "Plus") ? 0.01 : 0.035;
        } else if (insuranceType === "Purchase") {
          if (insuranceProductBonusEligibility[insuranceProduct]) {
            bonusRate = (cardType === "Plus") ? 0.01 : 0.035;
          }
        }
      }
      baseNeuCoins = amount * baseRate;
      bonusNeuCoins = amount * bonusRate;
      if (baseCap !== null && baseNeuCoins > baseCap) baseNeuCoins = baseCap;
      if (bonusCap !== null && bonusNeuCoins > bonusCap) bonusNeuCoins = bonusCap;
      totalNeuCoins = baseNeuCoins + bonusNeuCoins;

      let paletteClass = cardType === "Plus" ? "blue" : "purple";
      let icon = totalNeuCoins > 0 ? '<span class="success-icon"><i class="fa-solid fa-circle-check"></i></span>' : '';
      let cardTitle = "Your NeuCoins Summary";
      let infoMsg = "";

      if (baseCap !== null && baseNeuCoins === baseCap) {
        infoMsg += `<div class="neucoins-cap"><i class="fa-solid fa-arrow-up"></i> Base NeuCoins capped at ${baseCap}.</div>`;
      }
      if (bonusCap !== null && bonusNeuCoins === bonusCap && bonusRate > 0) {
        infoMsg += `<div class="neucoins-cap"><i class="fa-solid fa-arrow-up"></i> Bonus NeuCoins capped at ${bonusCap}.</div>`;
      }
      let breakdownHtml = `
        <div class="neucoins-breakdown">
          <div>Base: <span>${baseNeuCoins.toFixed(2)}</span></div>
          <div>Bonus: <span>${bonusNeuCoins.toFixed(2)}</span></div>
        </div>
      `;
      let result = `
        ${icon}
        <h2>${cardTitle}</h2>
        <div class="neucoins-total ${paletteClass}">Total: <span>${totalNeuCoins.toFixed(2)}</span></div>
        ${breakdownHtml}
        ${infoMsg}
        <div class="info">Based on <b>${cardType} Card</b> rewards structure.</div>
      `;
      output.innerHTML = result;
      output.classList.remove("hidden");
      output.classList.add("output-card");
      return;
    }

    if (txnType === "UPI") {
      let rawBase = amount * ((cardType === "Infinity") ? 0.005 : 0.0025);
      let rawBonus = 0;
      if ((cardType === "Infinity" && upiType === "TataNeu") || (cardType === "Plus" && upiType === "TataNeu")) {
        rawBonus = amount * ((cardType === "Infinity") ? 0.01 : 0.0075);
      }
      let rawTotal = rawBase + rawBonus;
      if (rawTotal > 500) {
        let ratioBase = rawBase / rawTotal;
        let ratioBonus = rawBonus / rawTotal;
        baseNeuCoins = +(500 * ratioBase).toFixed(2);
        bonusNeuCoins = +(500 * ratioBonus).toFixed(2);
        totalNeuCoins = 500;
        capped = true;
      } else {
        baseNeuCoins = rawBase;
        bonusNeuCoins = rawBonus;
        totalNeuCoins = rawTotal;
        capped = false;
      }
    } else {
      if (cardType === "Infinity") {
        if (txnType === "EMI") {
          baseRate = 0.015;
        } else {
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
        if (txnType === "EMI") {
          baseRate = 0.01;
        } else {
          baseRate = 0.01;
          if (partnerTxn === "Yes" && categoryBrands[category]?.includes(brand)) {
            bonusRate = 0.01;
          } else if (category === "BillPayments") {
            if (billNeuApp === "Yes") {
              bonusRate = 0.01;
              bonusCap = plusBonusCaps.BillPayments;
            }
          }
        }
      }
      if (cardType === "Plus") {
        if (category === "Groceries") {
          baseCap = 1000;
        } else if (["BillPayments", "Insurance", "Telecom"].includes(category)) {
          baseCap = 2000;
        }
      } else {
        if (["Groceries", "BillPayments", "Insurance", "Telecom"].includes(category)) {
          baseCap = 2000;
        }
      }
      if (cardType === "Plus") {
        let plusCapKey = category;
        if (plusBonusCaps.hasOwnProperty(plusCapKey)) {
          bonusCap = plusBonusCaps[plusCapKey];
        }
      }
      if (partnerTxn === "Yes" && brandCaps[brand]) {
        if (!(cardType === "Plus" && plusBonusCaps.hasOwnProperty(category))) {
          bonusCap = brandCaps[brand];
        }
      }

      baseNeuCoins = amount * baseRate;
      bonusNeuCoins = amount * bonusRate;
      if (baseCap !== null && baseNeuCoins > baseCap) baseNeuCoins = baseCap;
      if (bonusCap !== null && bonusNeuCoins > bonusCap) bonusNeuCoins = bonusCap;
      totalNeuCoins = baseNeuCoins + bonusNeuCoins;
    }

    let paletteClass = cardType === "Plus" ? "blue" : "purple";
    let icon = totalNeuCoins > 0 ? '<span class="success-icon"><i class="fa-solid fa-circle-check"></i></span>' : '';
    let cardTitle = "Your NeuCoins Summary";
    let infoMsg = "";

    if (txnType === "UPI" && capped) {
      infoMsg += `<div class="neucoins-cap"><i class="fa-solid fa-arrow-up"></i> UPI NeuCoins capped at 500 per month (Base + Bonus).</div>`;
    }
    if (txnType !== "UPI" && baseCap !== null && baseNeuCoins === baseCap) {
      infoMsg += `<div class="neucoins-cap"><i class="fa-solid fa-arrow-up"></i> Base NeuCoins capped at ${baseCap}.</div>`;
    }
    if (txnType !== "UPI" && bonusCap !== null && bonusNeuCoins === bonusCap && bonusRate > 0) {
      infoMsg += `<div class="neucoins-cap"><i class="fa-solid fa-arrow-up"></i> Bonus NeuCoins capped at ${bonusCap}.</div>`;
    }

    let breakdownHtml = `
      <div class="neucoins-breakdown">
        <div>Base: <span>${baseNeuCoins.toFixed(2)}</span></div>
        <div>Bonus: <span>${bonusNeuCoins.toFixed(2)}</span></div>
      </div>
    `;

    let result = `
      ${icon}
      <h2>${cardTitle}</h2>
      <div class="neucoins-total ${paletteClass}">Total: <span>${totalNeuCoins.toFixed(2)}</span></div>
      ${breakdownHtml}
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
    resetRadioGroup("insuranceNeuApp");
    resetRadioGroup("insuranceType");
    resetRadioGroup("partnerTxn");
    insuranceProductSelect.value = "";
    brandSelect.innerHTML = "";
    showSection(upiSection, false);
    showSection(billPaymentSection, false);
    showSection(insuranceViaNeuSection, false);
    showSection(insuranceTypeSection, false);
    showSection(insuranceProductSection, false);
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
