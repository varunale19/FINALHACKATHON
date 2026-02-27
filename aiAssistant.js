// Campus Clarity – Official in‑app AI assistant
// IMPORTANT: This assistant is ONLY for Campus Clarity and its internal college database.
// It can:
// - Look up colleges from the in‑memory database (e.g. "Tell me about CBIT")
// - Explain how the AI scoring works (weights, match percentage)
// - Summarise / explain current recommendations when available
//
// It DOES NOT:
// - Call external APIs
// - Answer general, non‑Campus‑Clarity questions

class CampusAIAssistant {
  constructor() {
    this.rootEl = null;
    this.messagesEl = null;
    this.inputEl = null;
    this.sendBtn = null;
    this.toggleBtn = null;
    this.panelEl = null;

    this.context = {
      recommendations: [],
      userPreferences: {},
    };

    // Attach to global in‑browser college database if present
    this.collegeDatabase =
      typeof collegeDatabase !== "undefined" ? collegeDatabase : [];
  }

  initialize(recommendations, userPreferences) {
    this.context.recommendations = recommendations || [];
    this.context.userPreferences = userPreferences || {};
    if (typeof collegeDatabase !== "undefined") {
      this.collegeDatabase = collegeDatabase;
    }

    if (!this.rootEl) {
      this.createUI();
      this.addSystemMessage(
        "You are talking to the Campus Clarity AI assistant.\n\nI ONLY answer questions about:\n- This project (Campus Clarity)\n- Colleges present in the internal database\n- How the recommendation AI and match percentage work\n\nExamples:\n- \"Tell me about CBIT\"\n- \"How does the AI scoring work?\"\n- \"Why are these colleges recommended for me?\""
      );
    }
  }

  createUI() {
    this.rootEl = document.createElement("div");
    this.rootEl.className = "ai-assistant";

    this.rootEl.innerHTML = `
      <button class="ai-assistant-toggle" type="button">
        🤖 Ask CampusBot
      </button>
      <div class="ai-assistant-panel ai-assistant-panel--hidden">
        <div class="ai-assistant-header">
          <div>
            <div class="ai-assistant-title">CampusBot</div>
            <div class="ai-assistant-subtitle">Campus Clarity assistant</div>
          </div>
          <button class="ai-assistant-close" type="button" aria-label="Close assistant">×</button>
        </div>
        <div class="ai-assistant-messages"></div>
        <form class="ai-assistant-input-row">
          <input
            type="text"
            class="ai-assistant-input"
            placeholder="Ask about a college, or how the AI works..."
          />
          <button type="submit" class="btn-primary ai-assistant-send">
            Send
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(this.rootEl);

    this.messagesEl = this.rootEl.querySelector(".ai-assistant-messages");
    this.inputEl = this.rootEl.querySelector(".ai-assistant-input");
    this.sendBtn = this.rootEl.querySelector(".ai-assistant-send");
    this.toggleBtn = this.rootEl.querySelector(".ai-assistant-toggle");
    this.panelEl = this.rootEl.querySelector(".ai-assistant-panel");

    this.toggleBtn.addEventListener("click", () => this.togglePanel());
    this.rootEl
      .querySelector(".ai-assistant-close")
      .addEventListener("click", () => this.hidePanel());

    this.rootEl
      .querySelector(".ai-assistant-input-row")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleUserMessage();
      });
  }

  togglePanel() {
    if (!this.panelEl) return;
    const isHidden = this.panelEl.classList.contains("ai-assistant-panel--hidden");
    if (isHidden) {
      this.panelEl.classList.remove("ai-assistant-panel--hidden");
      if (this.inputEl) this.inputEl.focus();
    } else {
      this.panelEl.classList.add("ai-assistant-panel--hidden");
    }
  }

  hidePanel() {
    if (!this.panelEl) return;
    this.panelEl.classList.add("ai-assistant-panel--hidden");
  }

  addMessage(role, text) {
    if (!this.messagesEl) return;

    const bubble = document.createElement("div");
    bubble.className =
      "ai-assistant-message " +
      (role === "user"
        ? "ai-assistant-message--user"
        : "ai-assistant-message--bot");
    bubble.textContent = text;

    this.messagesEl.appendChild(bubble);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  addSystemMessage(text) {
    this.addMessage("bot", text);
  }

  handleUserMessage() {
    const raw = (this.inputEl?.value || "").trim();
    if (!raw) return;

    this.addMessage("user", raw);
    this.inputEl.value = "";

    this.respond(raw).catch((err) => {
      console.error("CampusBot error:", err);
      this.addSystemMessage(
        "Sorry, something went wrong while answering. Please try another question."
      );
    });
  }

  async respond(text) {
    const lower = text.toLowerCase().trim();

    // 1) College lookup from internal database
    const lookupQuery = this.detectCollegeLookup(lower);
    if (lookupQuery) {
      this.answerCollegeLookup(lookupQuery);
      return;
    }

    // 2) How does the AI / scoring work
    if (
      lower.includes("how does") ||
      lower.includes("how the ai") ||
      lower.includes("ai work") ||
      lower.includes("scoring") ||
      lower.includes("weights") ||
      lower.includes("match percentage")
    ) {
      this.answerHowAiWorks();
      return;
    }

    // 3) Project capabilities
    if (
      lower.includes("what can you do") ||
      lower.includes("capabilities") ||
      lower.includes("what is campus clarity") ||
      lower.includes("project") ||
      lower.includes("features")
    ) {
      this.answerCapabilities();
      return;
    }

    const { recommendations } = this.context;

    // 4) Recommendation‑dependent questions (only if results exist)
    if (recommendations && recommendations.length > 0) {
      if (lower.includes("placement") || lower.includes("package")) {
        this.answerBestPlacements();
        return;
      }

      if (
        lower.includes("why") &&
        (lower.includes("recommended") || lower.includes("these colleges"))
      ) {
        this.answerExplainRecommendations();
        return;
      }

      if (
        lower.includes("summary") ||
        lower.includes("overview") ||
        lower.includes("explain my results")
      ) {
        this.answerExplainRecommendations();
        return;
      }
    }

    // 5) Fallback: restrict scope
    this.addSystemMessage(
      "I only answer questions related to Campus Clarity, its recommendation logic, and colleges present in the internal database.\n\nTry things like:\n- Tell me about CBIT\n- How does the AI scoring work?\n- Why are these colleges recommended for me?"
    );
  }

  // ===== Intents & answers tied to the spec =====

  detectCollegeLookup(lower) {
    const triggers = [
      "tell me about",
      "info on",
      "info about",
      "information on",
      "information about",
      "details of",
      "details about",
      "what is",
      "college ",
    ];

    for (const t of triggers) {
      if (lower.includes(t)) {
        const part = lower.split(t).pop().trim();
        if (!part) continue;
        const words = part.split(/\s+/).slice(0, 4);
        const q = words.join(" ").trim();
        if (q.length >= 2) return q;
      }
    }

    // Simple fallback: if the user typed only a possible name (e.g. "CBIT")
    if (lower.length >= 2 && lower.length <= 32 && !lower.includes(" ")) {
      return lower;
    }

    return null;
  }

  answerCollegeLookup(query) {
    const db = this.collegeDatabase || [];
    const q = query.toLowerCase();

    const matches = db.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.shortName && c.shortName.toLowerCase().includes(q))
    );

    if (!matches.length) {
      this.addSystemMessage(
        "This college is currently not available in our dataset, but the system is scalable and can integrate additional institutions."
      );
      return;
    }

    const c = matches[0];
    const typeMap = {
      government: "Government",
      "private-autonomous": "Private Autonomous",
      "private-jntuh-ou": "Private (JNTUH/OU Affiliated)",
    };
    const type = typeMap[c.type] || c.type;

    const ocFee = c.fees && (c.fees.OC || c.fees[Object.keys(c.fees)[0]]);
    const ocCutoff =
      c.cutoffRanks &&
      c.cutoffRanks.OC &&
      c.cutoffRanks.OC.CSE;

    const msgLines = [
      c.name,
      `Location: ${c.location}`,
      `Type: ${type || "N/A"}`,
      `NAAC Grade: ${c.naacGrade || "N/A"}`,
      `Entrance exams: ${(c.entranceExams || []).join(", ") || "N/A"}`,
      `Approx annual fee (OC): ${
        ocFee ? "₹" + ocFee.toLocaleString() : "N/A"
      }`,
      `Average package: ${
        c.avgPackage ? "₹" + c.avgPackage.toLocaleString() : "N/A"
      }`,
      `Hostel: ${c.hostelAvailable ? "Available" : "Not available"}`,
      `Area: ${c.urban ? "Urban" : "Rural"}`,
      `OC CSE cutoff (last year, approx): ${
        ocCutoff ? "~" + ocCutoff : "N/A"
      }`,
      `Facilities: ${(c.facilities || []).join(", ") || "N/A"}`,
    ];

    this.addSystemMessage(msgLines.join("\n"));
  }

  answerHowAiWorks() {
    const msg = [
      "Campus Clarity AI – scoring system:",
      "",
      "We calculate a match percentage using these weights:",
      "• Rank Fit – 30%",
      "• Budget Fit – 20%",
      "• Location Fit – 15%",
      "• Facilities Fit – 10%",
      "• Placement Fit – 10%",
      "• College Type Fit – 8%",
      "• NAAC Fit – 7%",
      "",
      "This gives you:",
      "- Personalised recommendations based on your rank, budget, and preferences",
      "- Explainable AI (we can show top reasons for each match)",
      "- Multi‑factor optimisation instead of only rank‑vs‑cutoff",
    ].join("\n");
    this.addSystemMessage(msg);
  }

  answerCapabilities() {
    const msg = [
      "Campus Clarity – what I can help with:",
      "- College lookup from our internal database (CBIT, VNR VJIET, JNTUH CEH, IITs, NITs, IIITs, etc.)",
      "- Explaining how the AI scoring and match percentage work",
      "- Interpreting your current recommendations (top matches, placements, cutoffs) when results are available",
      "",
      "Ask for example:",
      "- Tell me about CBIT",
      "- How does the AI scoring work?",
      "- Why are these colleges recommended for me?",
    ].join("\n");
    this.addSystemMessage(msg);
  }

  answerBestPlacements() {
    const { recommendations } = this.context;
    if (!recommendations || !recommendations.length) {
      this.addSystemMessage(
        "Generate recommendations first, then I can highlight which options look strongest for placements."
      );
      return;
    }

    const sorted = [...recommendations].sort(
      (a, b) => (b.avgPackage || 0) - (a.avgPackage || 0)
    );
    const top = sorted.slice(0, 3);

    const lines = top.map((c, idx) => {
      const pkg = c.avgPackage
        ? "₹" + c.avgPackage.toLocaleString()
        : "N/A";
      return `${idx + 1}. ${c.name} – avg package ${pkg}, NAAC ${c.naacGrade ||
        "N/A"}`;
    });

    this.addSystemMessage(
      "Based on your current recommendations, these look strongest for placements:\n\n" +
        lines.join("\n")
    );
  }

  answerExplainRecommendations() {
    const { recommendations, userPreferences } = this.context;
    if (!recommendations || !recommendations.length) {
      this.addSystemMessage(
        "Generate recommendations first, then I can explain the matches."
      );
      return;
    }

    const exam = userPreferences.examName || "your exam";
    const branch = userPreferences.requiredBranch || "your chosen branch";
    const top = recommendations.slice(0, 3);

    const lines = top.map((c, idx) => {
      const reasons = (c.matchReasons || []).join("; ");
      return `${idx + 1}. ${c.name} (${c.location}) – match ${Math.round(
        c.score
      )}%\n   Reasons: ${reasons || "no detailed reasons stored"}`;
    });

    this.addSystemMessage(
      `For ${exam} and ${branch}, here is an explanation of your top matches:\n\n` +
        lines.join("\n\n")
    );
  }
}

// Expose on window so app.js can initialize it
if (typeof window !== "undefined") {
  window.CampusAIAssistant = CampusAIAssistant;
}



