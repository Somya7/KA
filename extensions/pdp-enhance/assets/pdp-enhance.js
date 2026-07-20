(function () {
  "use strict";

  var STEPS = [
    {
      id: "goal",
      prompt: "What are you hoping to support?",
      options: [
        { value: "calm_focus", label: "Calm focus", hint: "Steady mind through the day" },
        { value: "steady_energy", label: "Steady energy", hint: "Without a stimulant edge" },
        { value: "daily_resilience", label: "Daily resilience", hint: "Everyday stress response" },
        { value: "sleep_wind_down", label: "Evening wind-down", hint: "A gentler close to the day" },
      ],
    },
    {
      id: "experience",
      prompt: "How familiar are you with Ashwagandha?",
      options: [
        { value: "new", label: "New to it" },
        { value: "occasional", label: "Tried it before" },
        { value: "consistent", label: "Use it regularly" },
      ],
    },
    {
      id: "routine",
      prompt: "When would this fit your day?",
      options: [
        { value: "morning", label: "Morning" },
        { value: "evening", label: "Evening" },
        { value: "both", label: "Morning & evening" },
      ],
    },
    {
      id: "constraint",
      prompt: "Anything we should factor in?",
      options: [
        { value: "none", label: "Nothing specific" },
        { value: "medication", label: "I take medication" },
        { value: "pregnancy_nursing", label: "Pregnant or nursing" },
        { value: "thyroid_autoimmune", label: "Thyroid / autoimmune context" },
      ],
    },
  ];

  var DEFAULT_BENEFITS = [
    "Supports a healthy stress response",
    "Helps calm the mind and mood",
    "Supports natural energy production",
    "Nourishes immune and nervous system function",
  ];

  function parseBenefits(raw) {
    if (!raw) return DEFAULT_BENEFITS;
    try {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (e) {
      /* fall through */
    }
    return DEFAULT_BENEFITS;
  }

  function bandLabel(band) {
    if (band === "strong") return "Strong fit";
    if (band === "possible") return "Possible fit";
    return "Consider with care";
  }

  function initRoot(root) {
    var form = root.querySelector("[data-ka-product-form]");
    var variantInput = root.querySelector("[data-ka-variant-input]");
    var priceEl = root.querySelector("[data-ka-price]");
    var atc = root.querySelector("[data-ka-atc]");
    var atcLabel = root.querySelector("[data-ka-atc-label]");
    var spinner = root.querySelector("[data-ka-spinner]");
    var cartMsg = root.querySelector("[data-ka-cart-msg]");
    var benefitsList = root.querySelector("[data-ka-benefits-list]");
    var quizBody = root.querySelector("[data-ka-quiz-body]");
    var progress = root.querySelector("[data-ka-progress]");
    var headlineEl = root.querySelector("[data-ka-quiz-headline]");

    var apiUrl = root.getAttribute("data-api-url") || "";
    var productHandle = root.getAttribute("data-product-handle") || "";
    var disclaimer = root.getAttribute("data-disclaimer") || "";
    var ctaLabel = root.getAttribute("data-quiz-cta") || "Find my fit";
    var benefits = parseBenefits(root.getAttribute("data-benefits"));

    if (headlineEl && root.getAttribute("data-quiz-headline")) {
      headlineEl.textContent = root.getAttribute("data-quiz-headline");
    }

    if (benefitsList) {
      benefitsList.innerHTML = benefits
        .map(function (b) {
          return "<li>" + escapeHtml(b) + "</li>";
        })
        .join("");
    }

    root.querySelectorAll("[data-ka-variant]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.getAttribute("data-available") === "false") return;
        root.querySelectorAll("[data-ka-variant]").forEach(function (el) {
          el.classList.remove("is-selected");
        });
        btn.classList.add("is-selected");
        if (variantInput) variantInput.value = btn.getAttribute("data-variant-id") || "";
        if (priceEl) priceEl.textContent = btn.getAttribute("data-variant-price") || "";
        if (atc) atc.disabled = false;
        if (atcLabel) atcLabel.textContent = "Add to cart";
        if (cartMsg) cartMsg.hidden = true;
      });
    });

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!atc || atc.disabled) return;

        var formData = new FormData(form);
        setAtcState("loading");

        fetch(window.Shopify && window.Shopify.routes ? window.Shopify.routes.root + "cart/add.js" : "/cart/add.js", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData,
        })
          .then(function (res) {
            if (!res.ok) throw new Error("Add to cart failed");
            return res.json();
          })
          .then(function () {
            setAtcState("success");
            if (cartMsg) {
              cartMsg.hidden = false;
              cartMsg.textContent = "Added to cart";
            }
            window.setTimeout(function () {
              setAtcState("idle");
            }, 2200);
          })
          .catch(function () {
            setAtcState("error");
            if (cartMsg) {
              cartMsg.hidden = false;
              cartMsg.textContent = "Could not add to cart. Please try again.";
            }
          });
      });
    }

    function setAtcState(state) {
      if (!atc || !atcLabel) return;
      atc.classList.toggle("is-success", state === "success");
      if (spinner) spinner.hidden = state !== "loading";
      if (state === "loading") {
        atc.disabled = true;
        atcLabel.textContent = "Adding…";
      } else if (state === "success") {
        atc.disabled = false;
        atcLabel.textContent = "Added to cart";
      } else if (state === "error") {
        atc.disabled = false;
        atcLabel.textContent = "Try again";
      } else {
        atc.disabled = false;
        atcLabel.textContent = "Add to cart";
      }
    }

    var answers = {};
    var stepIndex = 0;

    function renderIdle() {
      if (progress) progress.style.width = "0%";
      quizBody.innerHTML =
        '<button type="button" class="ka-pdp__start" data-ka-start>' +
        escapeHtml(ctaLabel) +
        "</button>" +
        '<p class="ka-pdp__disclaimer">' +
        escapeHtml(disclaimer) +
        "</p>";
      var startBtn = quizBody.querySelector("[data-ka-start]");
      if (startBtn) startBtn.addEventListener("click", startQuiz);
    }

    function startQuiz() {
      answers = {};
      stepIndex = 0;
      renderStep();
    }

    function renderStep() {
      var step = STEPS[stepIndex];
      if (progress) progress.style.width = Math.round((stepIndex / STEPS.length) * 100) + "%";
      quizBody.innerHTML =
        '<p class="ka-pdp__step-count">Question ' +
        (stepIndex + 1) +
        " of " +
        STEPS.length +
        "</p>" +
        "<h4>" +
        escapeHtml(step.prompt) +
        '</h4><div class="ka-pdp__options">' +
        step.options
          .map(function (opt) {
            return (
              '<button type="button" class="ka-pdp__option" data-value="' +
              escapeHtml(opt.value) +
              '"><strong>' +
              escapeHtml(opt.label) +
              "</strong>" +
              (opt.hint ? "<small>" + escapeHtml(opt.hint) + "</small>" : "") +
              "</button>"
            );
          })
          .join("") +
        "</div>";

      quizBody.querySelectorAll(".ka-pdp__option").forEach(function (btn) {
        btn.addEventListener("click", function () {
          answers[step.id] = btn.getAttribute("data-value");
          if (stepIndex < STEPS.length - 1) {
            stepIndex += 1;
            window.setTimeout(renderStep, 160);
          } else {
            fetchGuidance();
          }
        });
      });
    }

    function renderLoading() {
      if (progress) progress.style.width = "100%";
      quizBody.innerHTML =
        '<div class="ka-pdp__shimmer"></div><div class="ka-pdp__shimmer" style="width:60%"></div><p class="ka-pdp__disclaimer">Personalizing your guidance…</p>';
    }

    function fetchGuidance() {
      renderLoading();
      if (!apiUrl || apiUrl.indexOf("YOUR_DEPLOYMENT") !== -1) {
        renderError(
          "Set a real Guidance API URL in the Theme Editor (merchant setting). Local demo: run the Next.js app and point this block at that /api/guidance URL."
        );
        return;
      }

      var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      var timeout = window.setTimeout(function () {
        if (controller) controller.abort();
      }, 10000);

      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ productHandle: productHandle, answers: answers }),
        signal: controller ? controller.signal : undefined,
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Guidance request failed");
          return res.json();
        })
        .then(function (data) {
          window.clearTimeout(timeout);
          if (!data || !data.headline) {
            renderError("No guidance returned. Please try again.");
            return;
          }
          renderResult(data);
        })
        .catch(function () {
          window.clearTimeout(timeout);
          renderError("We couldn’t personalize right now. Please try again.");
        });
    }

    function renderResult(data) {
      quizBody.innerHTML =
        '<div class="ka-pdp__result">' +
        '<div class="ka-pdp__band">' +
        escapeHtml(bandLabel(data.fitBand)) +
        "</div>" +
        "<h4>" +
        escapeHtml(data.headline) +
        "</h4>" +
        "<p>" +
        escapeHtml(data.body) +
        "</p>" +
        "<ol>" +
        (data.routineSteps || [])
          .map(function (step) {
            return (
              "<li><strong>" +
              escapeHtml(step.title) +
              "</strong><br><span>" +
              escapeHtml(step.detail) +
              "</span></li>"
            );
          })
          .join("") +
        "</ol>" +
        "<p><strong>Suggested pack:</strong> " +
        escapeHtml(data.suggestedPack && data.suggestedPack.label ? data.suggestedPack.label : "") +
        "</p>" +
        '<p class="ka-pdp__disclaimer">' +
        escapeHtml(data.disclaimer || disclaimer) +
        "</p>" +
        '<button type="button" class="ka-pdp__restart" data-ka-restart>Retake quiz</button>' +
        "</div>";

      var restart = quizBody.querySelector("[data-ka-restart]");
      if (restart) restart.addEventListener("click", startQuiz);

      maybeSelectPack(data);
    }

    function maybeSelectPack(data) {
      var size = data.suggestedPack && data.suggestedPack.size;
      if (!size) return;
      var match = Array.prototype.find.call(root.querySelectorAll("[data-ka-variant]"), function (btn) {
        return (
          btn.getAttribute("data-available") !== "false" &&
          (btn.textContent || "").toLowerCase().indexOf(String(size)) !== -1
        );
      });
      if (match) match.click();
    }

    function renderError(message) {
      quizBody.innerHTML =
        "<p role=\"alert\">" +
        escapeHtml(message) +
        '</p><button type="button" class="ka-pdp__restart" data-ka-restart>Retry</button>';
      var restart = quizBody.querySelector("[data-ka-restart]");
      if (restart) restart.addEventListener("click", startQuiz);
    }

    renderIdle();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function boot() {
    document.querySelectorAll("[data-ka-pdp]").forEach(initRoot);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
