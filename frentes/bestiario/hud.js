const actions = [
  { name: "Regar", icon: "drop", x: 0, y: -35, shape: "52% 48% 56% 44%/51% 47% 53% 49%", copy: "O preenchimento e o pulso visual indicam a seleção." },
  { name: "Polinizar", icon: "flower", x: 30, y: -17, shape: "59% 41% 46% 54%/50% 57% 43% 50%", copy: "O ícone permanece estável enquanto a superfície ganha foco." },
  { name: "Coletar", icon: "collect", x: 30, y: 17, shape: "44% 56% 58% 42%/45% 55% 45% 55%", copy: "A posição fixa ajuda a reencontrar a ação depois do primeiro uso." },
  { name: "Construir", icon: "build", x: 0, y: 35, shape: "56% 44% 45% 55%/56% 48% 52% 44%", copy: "O contorno duplo e o texto reforçam o estado selecionado." },
  { name: "Inspecionar", icon: "inspect", x: -30, y: 17, shape: "52% 48% 61% 39%/56% 51% 49% 44%", copy: "Traço e rótulo se completam quando o ícone é visto em escala pequena." },
  { name: "Cuidar", icon: "care", x: -30, y: -17, shape: "51% 49% 47% 53%/43% 50% 50% 57%", copy: "O pulso sai do centro e se dissolve antes do próximo gesto." }
];

const stage = document.querySelector("#stage");
const slots = document.querySelector("#orbit-items");
const core = stage.querySelector(".core");
const coreLabel = stage.querySelector(".core-label");
const ripple = stage.querySelector("[data-ripple]");
const status = document.querySelector("#stage-state");
const desc = document.querySelector("#action-desc");
const variantNote = document.querySelector("#variant-note");
const forms = [...document.querySelectorAll("[data-form].switch button, .switch button[data-form]")];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
let selected = 0;
let replayTimer;

function paintIcon(canvas, name, color) {
  const ctx = canvas.getContext("2d");
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  ctx.clearRect(0, 0, 32, 32);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.65;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const line = (path) => ctx.stroke(new Path2D(path));
  const circle = (x, y, size) => {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.stroke();
  };
  switch (name) {
    case "drop":
      line("M16 4 C14 9 8.3 14.3 8.3 19.5 A7.7 7.7 0 1 0 23.7 19.5 C23.7 14.3 18 9 16 4 Z M12 20 C12.3 22.2 13.4 23.3 15 23.8");
      break;
    case "flower":
      line("M13.2 12.3 C9.3 4 19 3.6 18.6 11.8 C25.4 6.7 29 16 21.1 17.9 C27.5 23.5 20.5 29.2 16.4 22.1 C12.8 29.5 5.2 24.5 10.9 18.4 C2.8 17 5.8 7.6 13.2 12.3 Z");
      circle(16, 16.5, 2.8);
      break;
    case "collect":
      line("M6 17 L9 26 H23 L26 17 Z M10 17 L14 12 M22 17 L18 12 M16 4 V10 M13 7 L16 10 L19 7");
      break;
    case "build":
      line("M5 23 H27 M7 22 V14 L16 8 L25 14 V22 M12 23 V17 Q16 13 20 17 V23");
      break;
    case "inspect":
      circle(13.2, 13.5, 7.1);
      line("M18.4 18.7 L25.9 26.2 M10.5 13.5 H15.9 M13.2 10.8 V16.2");
      break;
    case "care":
      line("M16 25 C12.7 22.2 5.5 17.4 6 12.1 C6.4 7.4 12.3 6 16 10.7 C19.7 6 25.6 7.4 26 12.1 C26.5 17.4 19.3 22.2 16 25 Z");
      break;
  }
}

const buttons = actions.map((action, index) => {
  const slot = document.createElement("div");
  slot.className = "orbit-slot";
  slot.style.setProperty("--x", action.x + "%");
  slot.style.setProperty("--y", action.y + "%");
  slot.style.setProperty("--shape", action.shape);
  slot.style.setProperty("--delay", index * 27 + "ms");

  const button = document.createElement("button");
  button.type = "button";
  button.className = "orbit-item";
  button.setAttribute("aria-pressed", String(index === selected));
  const icon = document.createElement("canvas");
  icon.width = icon.height = 64;
  icon.setAttribute("aria-hidden", "true");
  const label = document.createElement("span");
  label.textContent = action.name;
  button.append(icon, label);
  button.addEventListener("click", () => select(index));
  slot.append(button);
  slots.append(slot);
  return button;
});

function redraw() {
  buttons.forEach((button, index) => {
    paintIcon(button.querySelector("canvas"), actions[index].icon, stage.dataset.form === "orbita" && index !== selected ? "#f1edfb" : "#262336");
  });
}

function pulse() {
  if (reduceMotion.matches) return;
  ripple.classList.remove("play");
  void ripple.offsetWidth;
  ripple.classList.add("play");
}

function select(index) {
  selected = index;
  buttons.forEach((button, current) => button.setAttribute("aria-pressed", String(index === current)));
  status.textContent = actions[index].name + " · em foco";
  desc.querySelector("strong").textContent = actions[index].name;
  desc.querySelector("span").textContent = actions[index].copy;
  redraw();
  pulse();
}

function setOpen(open) {
  stage.dataset.open = String(open);
  core.setAttribute("aria-expanded", String(open));
  core.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  coreLabel.textContent = open ? "Fechar" : "Abrir";
  slots.inert = !open;
  status.textContent = open ? actions[selected].name + " · em foco" : "Menu recolhido";
}

forms.forEach((button) => button.addEventListener("click", () => {
  stage.dataset.form = button.dataset.form;
  forms.forEach((form) => form.setAttribute("aria-pressed", String(form === button)));
  variantNote.textContent = button.dataset.form === "petalas"
    ? "Superfícies macias agrupam as ações em torno de um centro livre."
    : "Discos regulares e contorno fino deixam o anel mais leve.";
  redraw();
}));

core.addEventListener("click", () => {
  clearTimeout(replayTimer);
  const open = stage.dataset.open !== "true";
  setOpen(open);
  if (open) { pulse(); buttons[0].focus(); }
});

stage.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && stage.dataset.open === "true") {
    event.preventDefault();
    clearTimeout(replayTimer);
    core.focus();
    setOpen(false);
  }
});

document.querySelector("#replay").addEventListener("click", () => {
  clearTimeout(replayTimer);
  if (reduceMotion.matches) { setOpen(true); return; }
  setOpen(false);
  replayTimer = setTimeout(() => { setOpen(true); pulse(); }, 430);
});

redraw();
