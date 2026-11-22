(() => {
  const key = "ecoeco-aprovacao-visual-v1";
  const labels = { aprovado: "Aprovado", reprovado: "Reprovado" };
  const sections = [...document.querySelectorAll("[data-review]")];
  const status = document.querySelector("#review-status");
  const copyButton = document.querySelector("#review-copy");
  const fallback = document.querySelector("#review-fallback");
  const state = Object.create(null);

  try {
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    for (const section of sections) {
      const item = saved?.[section.id];
      if (item && typeof item === "object") state[section.id] = {
        decision: Object.hasOwn(labels, item.decision) ? item.decision : "",
        comment: typeof item.comment === "string" ? item.comment : ""
      };
    }
  } catch { status.textContent = "O navegador não liberou as respostas salvas."; }

  const record = (id) => state[id] ??= { decision: "", comment: "" };
  const sectionTitle = (section) => document.getElementById(section.getAttribute("aria-labelledby")).textContent.trim();
  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch { status.textContent = "As respostas estão só nesta aba. Copie o resumo antes de fechar."; }
  }

  const make = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  };

  for (const section of sections) {
    const id = section.id;
    const data = record(id);
    const review = make("fieldset", "visual-review");
    const legend = make("legend", null, "Aprovação visual");
    const decisions = make("div", "review-decisions");
    decisions.setAttribute("role", "group");
    decisions.setAttribute("aria-label", sectionTitle(section));
    const buttons = Object.entries(labels).map(([decision, label]) => {
      const button = make("button", "review-choice", label);
      button.type = "button";
      button.dataset.decision = decision;
      button.setAttribute("aria-pressed", String(data.decision === decision));
      button.addEventListener("click", () => {
        data.decision = data.decision === decision ? "" : decision;
        buttons.forEach((choice) => choice.setAttribute("aria-pressed", String(data.decision === choice.dataset.decision)));
        save();
      });
      decisions.append(button);
      return button;
    });
    const label = make("label", "review-comment", "Comentários");
    const input = make("textarea");
    input.rows = 2;
    input.value = data.comment;
    input.addEventListener("input", () => { data.comment = input.value; save(); });
    label.append(input);
    review.append(legend, decisions, label);
    section.append(review);
  }

  copyButton.addEventListener("click", async () => {
    const lines = sections.filter(({ id }) => state[id].decision || state[id].comment.trim())
      .map((section) => {
        const { decision, comment } = state[section.id];
        return `• ${sectionTitle(section)} · ${labels[decision] || "Sem decisão"}${comment.trim() ? "\n  " + comment.trim() : ""}`;
      });
    if (!lines.length) { status.textContent = "Ainda não há respostas para copiar."; return; }
    const text = ["ecoeco™ · Revisão visual", ...lines].join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      fallback.hidden = true;
      status.textContent = "Resumo copiado.";
    } catch {
      fallback.hidden = false;
      fallback.value = text;
      fallback.focus();
      fallback.select();
      status.textContent = "Selecione e copie o resumo abaixo.";
    }
  });

  const anchors = [...document.querySelectorAll(".site-head nav a[href^='#']")];
  function markAnchor() {
    for (const a of anchors) {
      if (a.hash === location.hash) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    }
  }
  markAnchor();
  window.addEventListener("hashchange", markAnchor);
})();
