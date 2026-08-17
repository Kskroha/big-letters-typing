const ROWS_DESKTOP = [
  ["й", "ц", "у", "к", "е", "ё", "н", "г", "ш", "щ", "з", "х", "ъ"],
  ["ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э"],
  ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю"],
];

const ROWS_MOBILE = [
  ["й", "ц", "у", "к", "е", "ё", "н"],
  ["г", "ш", "щ", "з", "х", "ъ"],
  ["ф", "ы", "в", "а", "п", "р", "о"],
  ["л", "д", "ж", "э"],
  ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю"],
];

const ALL_LETTERS = [...new Set([...ROWS_DESKTOP, ...ROWS_MOBILE].flat())];
const UPPER = Object.fromEntries(ALL_LETTERS.map((letter) => [letter, letter.toUpperCase()]));

const textDisplay = document.getElementById("text-display");
const clearBtn = document.getElementById("clear-btn");
const keyboard = document.getElementById("keyboard");

let shiftActive = false;
let shiftBtn = null;
const letterKeys = new Map();

function isMobileLayout() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function getRows() {
  return isMobileLayout() ? ROWS_MOBILE : ROWS_DESKTOP;
}

function getLetter(char) {
  return shiftActive ? UPPER[char] : char;
}

function updateKeyLabels() {
  letterKeys.forEach((btn, letter) => {
    btn.textContent = getLetter(letter);
  });
}

function appendText(char) {
  textDisplay.textContent += char;
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

function deleteLastChar() {
  const text = textDisplay.textContent;
  if (!text) return;
  textDisplay.textContent = [...text].slice(0, -1).join("");
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

function handleShiftToggle() {
  shiftActive = !shiftActive;
  if (shiftBtn) {
    shiftBtn.classList.toggle("active", shiftActive);
    shiftBtn.setAttribute("aria-pressed", String(shiftActive));
  }
  updateKeyLabels();
}

function createKey(label, className, action) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `key ${className}`.trim();
  btn.textContent = label;
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    btn.classList.add("pressed");
  });
  btn.addEventListener("pointerup", () => btn.classList.remove("pressed"));
  btn.addEventListener("pointerleave", () => btn.classList.remove("pressed"));
  btn.addEventListener("pointercancel", () => btn.classList.remove("pressed"));
  btn.addEventListener("click", action);
  return btn;
}

function buildKeyboard() {
  const mobile = isMobileLayout();
  letterKeys.clear();
  shiftBtn = null;
  keyboard.innerHTML = "";
  keyboard.classList.toggle("keyboard--mobile", mobile);

  getRows().forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "keyboard-row";
    row.forEach((letter) => {
      const key = createKey(letter, "", () => {
        appendText(getLetter(letter));
        if (navigator.vibrate) navigator.vibrate(10);
      });
      letterKeys.set(letter, key);
      rowEl.appendChild(key);
    });
    keyboard.appendChild(rowEl);
  });

  const bottomRow = document.createElement("div");
  bottomRow.className = "keyboard-row keyboard-row--bottom";

  shiftBtn = createKey(mobile ? "⇧" : "⇧ Shift", "key--shift", () => {
    handleShiftToggle();
    if (navigator.vibrate) navigator.vibrate(10);
  });
  shiftBtn.setAttribute("aria-pressed", String(shiftActive));
  shiftBtn.setAttribute("aria-label", "Переключить регистр");
  if (shiftActive) shiftBtn.classList.add("active");

  const spaceKey = createKey(mobile ? "␣" : "пробел", "key--space", () => {
    appendText(" ");
    if (navigator.vibrate) navigator.vibrate(10);
  });
  spaceKey.setAttribute("aria-label", "Пробел");

  const backspaceKey = createKey("⌫", "key--backspace", () => {
    deleteLastChar();
    if (navigator.vibrate) navigator.vibrate(10);
  });
  backspaceKey.setAttribute("aria-label", "Удалить символ");

  const enterKey = createKey(mobile ? "↵" : "↵ Enter", "key--enter", () => {
    appendText("\n");
    if (navigator.vibrate) navigator.vibrate(10);
  });
  enterKey.setAttribute("aria-label", "Новая строка");

  bottomRow.append(shiftBtn, spaceKey, backspaceKey, enterKey);
  keyboard.appendChild(bottomRow);
  updateKeyLabels();
}

clearBtn.addEventListener("click", () => {
  textDisplay.textContent = "";
});

buildKeyboard();

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const wasMobile = keyboard.classList.contains("keyboard--mobile");
    const isMobile = isMobileLayout();
    if (wasMobile !== isMobile) buildKeyboard();
  }, 150);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
