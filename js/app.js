const ROWS = [
  ["й", "ц", "у", "к", "е", "ё", "н", "г", "ш", "щ", "з", "х", "ъ"],
  ["ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э"],
  ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю"],
];

const UPPER = Object.fromEntries(
  ROWS.flat().map((letter) => [letter, letter.toUpperCase()])
);

const textDisplay = document.getElementById("text-display");
const clearBtn = document.getElementById("clear-btn");
const keyboard = document.querySelector(".keyboard");

let shiftActive = false;
let shiftBtn = null;
const letterKeys = new Map();

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
  ROWS.forEach((row, index) => {
    const rowEl = keyboard.querySelector(`[data-row="${index + 1}"]`);
    row.forEach((letter) => {
      const key = createKey(letter, "", () => {
        appendText(getLetter(letter));
        if (navigator.vibrate) navigator.vibrate(10);
      });
      letterKeys.set(letter, key);
      rowEl.appendChild(key);
    });
  });

  const bottomRow = keyboard.querySelector(".keyboard-row--bottom");

  shiftBtn = createKey("⇧ Shift", "key--shift", () => {
    handleShiftToggle();
    if (navigator.vibrate) navigator.vibrate(10);
  });
  shiftBtn.setAttribute("aria-pressed", "false");
  shiftBtn.setAttribute("aria-label", "Переключить регистр");

  const spaceKey = createKey("пробел", "key--space", () => {
    appendText(" ");
    if (navigator.vibrate) navigator.vibrate(10);
  });
  spaceKey.setAttribute("aria-label", "Пробел");

  const backspaceKey = createKey("⌫", "key--backspace", () => {
    deleteLastChar();
    if (navigator.vibrate) navigator.vibrate(10);
  });
  backspaceKey.setAttribute("aria-label", "Удалить символ");

  const enterKey = createKey("↵ Enter", "key--enter", () => {
    appendText("\n");
    if (navigator.vibrate) navigator.vibrate(10);
  });
  enterKey.setAttribute("aria-label", "Новая строка");

  bottomRow.append(shiftBtn, spaceKey, backspaceKey, enterKey);
}

clearBtn.addEventListener("click", () => {
  textDisplay.textContent = "";
});

buildKeyboard();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
