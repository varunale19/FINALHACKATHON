const TOTAL_STEPS = 5;

const form = document.getElementById("college-form");
const panels = Array.from(document.querySelectorAll(".wizard-panel"));
const steps = Array.from(document.querySelectorAll(".wizard-step"));
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const submitBtn = document.getElementById("submit-btn");
const currentStepEl = document.getElementById("current-step");
const summaryEl = document.getElementById("summary");
const collegeAreaField = document.getElementById("college-area-field");
const progressFill = document.getElementById("wizard-progress-fill");
const loadingOverlay = document.getElementById("global-loading");

let currentStep = 1;

function validateStep(step) {
  // Basic validation so the next slide only appears
  // after important fields in the current slide are filled.
  if (step === 1) {
    const branch = form.requiredBranch.value.trim();
    const category = form.category.value;

    const errors = [];
    if (!branch) {
      errors.push("Please enter your preferred branch.");
    }
    if (!category) {
      errors.push("Please select your category.");
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return false;
    }
  }

  return true;
}

function updateConditionalFields() {
  const hostelPreference = getRadioValue("hostelPreference");
  const showCollegeArea = hostelPreference === "yes";

  if (collegeAreaField) {
    collegeAreaField.classList.toggle("is-hidden", !showCollegeArea);
  }
}

function updateLocationFieldForExam() {
  const examSelect = form.examName;
  const eamcetSelect = document.getElementById("home-location-eamcet");
  const jeeSelect = document.getElementById("home-location-jee");

  if (!examSelect || !eamcetSelect || !jeeSelect) return;

  const exam = (examSelect.value || "").toUpperCase();

  if (exam.includes("EAMCET")) {
    eamcetSelect.classList.remove("is-hidden");
    eamcetSelect.name = "homeLocation";
    jeeSelect.classList.add("is-hidden");
    jeeSelect.name = "";
  } else {
    jeeSelect.classList.remove("is-hidden");
    jeeSelect.name = "homeLocation";
    eamcetSelect.classList.add("is-hidden");
    eamcetSelect.name = "";
  }
}

function showStep(step) {
  currentStep = step;

  panels.forEach((panel) => {
    const panelStep = Number(panel.dataset.step);
    panel.classList.toggle("active", panelStep === currentStep);
  });

  steps.forEach((stepItem) => {
    const stepIndex = Number(stepItem.dataset.step);
    stepItem.classList.toggle("active", stepIndex === currentStep);
    stepItem.classList.toggle("completed", stepIndex < currentStep);
  });

  prevBtn.disabled = currentStep === 1;
  nextBtn.hidden = currentStep === TOTAL_STEPS;
  submitBtn.hidden = currentStep !== TOTAL_STEPS;

  currentStepEl.textContent = String(currentStep);

  // Make the next button label feel more like a guided journey
  if (nextBtn) {
    const labels = {
      1: "Next: Location & stay →",
      2: "Next: Campus life →",
      3: "Next: Review & submit →",
      4: "See your suggestions →",
    };
    nextBtn.textContent = labels[currentStep] || "Next →";
  }

  // Update visual progress bar
  if (progressFill) {
    const percentage = (currentStep / TOTAL_STEPS) * 100;
    progressFill.style.width = `${percentage}%`;
  }

  // Build summary whenever we are on the Summary step (step 4)
  if (currentStep === 4) {
    buildSummary();
  }

  updateConditionalFields();
}

function nextStep() {
  if (currentStep < TOTAL_STEPS) {
    if (!validateStep(currentStep)) {
      return;
    }
    showStep(currentStep + 1);
  }
}

function prevStep() {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
}

function getCheckedValues(name) {
  return Array.from(
    document.querySelectorAll(`input[name="${name}"]:checked`)
  ).map((el) => el.value);
}

function getRadioValue(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : "";
}

function valueOr(label, value) {
  if (!value || String(value).trim() === "") {
    return `<span class="summary-item-label">${label}:</span> Not specified`;
  }
  return `<span class="summary-item-label">${label}:</span> ${value}`;
}

function buildSummary() {
  // Be defensive so summary still shows even if some optional
  // fields are missing or left blank.
  const data = {
    examName: form.examName?.value || "",
    examRank: form.examRank?.value || "",
    requiredBranch: form.requiredBranch?.value || "",
    category: form.category?.value || "",
    collegeType: getCheckedValues("collegeType"),
    budgetMin: form.budgetMin?.value || "",
    budgetMax: form.budgetMax?.value || "",
    naacGrade: form.naacGrade?.value || "",
    dualDegree: form.dualDegree?.value || "",
    hostelPreference: getRadioValue("hostelPreference"),
    collegeArea: getRadioValue("collegeArea"),
    homeLocation: form.homeLocation?.value || "",
    maxDistanceKm: form.maxDistanceKm?.value || "",
    transportImportance: getRadioValue("transportImportance"),
    festFrequency: form.festFrequency?.value || "",
    facilities: getCheckedValues("facilities"),
    genderRatio: form.genderRatio?.value || "",
    scholarshipImportance: form.scholarshipImportance?.value || "",
    placementImportance: form.placementImportance?.value || "",
    dreamColleges: form.dreamColleges?.value || "",
  };

  const budgetText =
    data.budgetMin || data.budgetMax
      ? `₹${data.budgetMin || "0"} – ₹${data.budgetMax || "N/A"}`
      : "";

  const rankText =
    data.examRank && String(data.examRank).trim() !== ""
      ? `Exact: ${data.examRank}`
      : "";

  const collegeTypeText =
    data.collegeType.length > 0 ? data.collegeType.join(", ") : "";

  const facilitiesText =
    data.facilities.length > 0 ? data.facilities.join(", ") : "";

  summaryEl.innerHTML = `
    <div class="summary-group">
      <h4>Academic profile</h4>
      <p class="summary-kv">${valueOr("Entrance exam", data.examName)}</p>
      <p class="summary-kv">${valueOr("Entrance rank", rankText)}</p>
      <p class="summary-kv">${valueOr("Preferred branch", data.requiredBranch)}</p>
      <p class="summary-kv">${valueOr("Category", data.category)}</p>
      <p class="summary-kv">${valueOr("Preferred college type", collegeTypeText)}</p>
      <p class="summary-kv">${valueOr("Budget (per year)", budgetText)}</p>
      <p class="summary-kv">${valueOr("Minimum NAAC grade", data.naacGrade)}</p>
      <p class="summary-kv">${valueOr("Dual degree preference", data.dualDegree)}</p>
    </div>

    <div class="summary-group">
      <h4>Location & stay</h4>
      <p class="summary-kv">${valueOr("Hostel preference", data.hostelPreference)}</p>
      ${
        data.hostelPreference === "yes"
          ? `<p class="summary-kv">${valueOr(
              "Preferred college area (urban/rural)",
              data.collegeArea
            )}</p>`
          : ""
      }
      <p class="summary-kv">${valueOr("Home location", data.homeLocation)}</p>
      <p class="summary-kv">${valueOr(
        "Max distance from home (km)",
        data.maxDistanceKm
      )}</p>
      <p class="summary-kv">${valueOr(
        "Transport importance",
        data.transportImportance
      )}</p>
    </div>

    <div class="summary-group">
      <h4>Campus life & extras</h4>
      <p class="summary-kv">${valueOr(
        "Fest / events frequency",
        data.festFrequency
      )}</p>
      <p class="summary-kv">${valueOr("Campus facilities", facilitiesText)}</p>
      <p class="summary-kv">${valueOr(
        "Gender ratio importance",
        data.genderRatio
      )}</p>
      <p class="summary-kv">${valueOr(
        "Scholarship importance",
        data.scholarshipImportance
      )}</p>
      <p class="summary-kv">${valueOr(
        "Placement record importance",
        data.placementImportance
      )}</p>
      <p class="summary-kv">${valueOr(
        "Dream colleges",
        data.dreamColleges
      )}</p>
    </div>
  `;
}

prevBtn.addEventListener("click", prevStep);
nextBtn.addEventListener("click", nextStep);

document
  .querySelectorAll('input[name="hostelPreference"]')
  .forEach((el) => el.addEventListener("change", updateConditionalFields));

// Update location selector when exam changes
form.examName.addEventListener("change", updateLocationFieldForExam);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  buildSummary();

  // Show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = "Finding colleges...";
  if (loadingOverlay) {
    loadingOverlay.classList.remove("is-hidden");
  }

  try {
    // Collect form data
    const formData = new FormData(form);
    const userPreferences = {};

    for (const [key, value] of formData.entries()) {
      if (userPreferences[key]) {
        if (!Array.isArray(userPreferences[key])) {
          userPreferences[key] = [userPreferences[key]];
        }
        userPreferences[key].push(value);
      } else {
        userPreferences[key] = value;
      }
    }

    console.log("College finder preferences:", userPreferences);

    // Initialize recommendation engine and results display
    const engine = new CollegeRecommendationEngine();
    window.resultsDisplay = new ResultsDisplay();
    window.resultsDisplay.initialize();

    // Get recommendations
    const recommendations = engine.getRecommendations(userPreferences, 10);

    // Display results and move to results slide
    window.resultsDisplay.displayResults(recommendations, userPreferences);
    showStep(5);

    // Initialize AI assistant with the current context (if available)
    if (typeof window.CampusAIAssistant === "function") {
      if (!window.campusAssistant) {
        window.campusAssistant = new window.CampusAIAssistant();
      }
      window.campusAssistant.initialize(recommendations, userPreferences);
    }

  } catch (error) {
    console.error("Error getting college recommendations:", error);
    alert("Sorry, there was an error finding colleges. Please try again.");
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitBtn.textContent = "Get college suggestions";
    if (loadingOverlay) {
      loadingOverlay.classList.add("is-hidden");
    }
  }
});

showStep(1);

// Expose step navigation for global handlers like newSearch()
if (typeof window !== "undefined") {
  window.showStep = showStep;

  // Initialize location field for default exam
  updateLocationFieldForExam();

  // Initialize AI assistant on page load so users can ask about colleges / AI before generating results
  if (typeof window.CampusAIAssistant === "function") {
    window.campusAssistant = new window.CampusAIAssistant();
    window.campusAssistant.initialize([], {});
  }
}

function newSearch() {
  // 1️⃣ Reset form completely
  const form = document.getElementById("college-form");
  form.reset();

  // 2️⃣ Clear comparison list (if using compare feature)
  if (typeof compareList !== "undefined") {
    compareList = [];
  }

  // 3️⃣ Clear results container
  const resultsContainer = document.getElementById("results-container");
  if (resultsContainer) {
    resultsContainer.innerHTML = "";
  }

  // 4️⃣ Reset wizard to Step 1
  showStep(1);

  // 5️⃣ Scroll to top smoothly
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}