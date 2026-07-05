/* ==================================================================
   TERMINAL LINUX SIMULATOR — LÓGICA PRINCIPAL
   Organización del archivo:
     1. CONFIGURACIÓN  → datos editables (páginas, usuario, textos)
     2. ESTADO          → variables mutables de la sesión
     3. REFERENCIAS DOM
     4. UTILIDADES      → helpers genéricos (delay, escape, sonido...)
     5. RENDERIZADO     → funciones para pintar líneas en la terminal
     6. SECUENCIA DE ARRANQUE
     7. BANNER Y BIENVENIDA
     8. INTÉRPRETE DE COMANDOS
     9. AUTOCOMPLETADO (TAB)
     10. MANEJO DE INPUT Y EVENTOS DE TECLADO
     11. INICIALIZACIÓN
   ================================================================== */


/* ==================================================================
   1. CONFIGURACIÓN
   ------------------------------------------------------------------
   Toda la información "de negocio" vive aquí. Para agregar o quitar
   una página del comando `ls` / `open`, solo hay que editar el
   arreglo PAGES. Ninguna otra parte del código necesita tocarse.
   ================================================================== */

// Arreglo administrable de enlaces disponibles en la terminal.
// Cada objeto: { name, url, description }
const PAGES = [
  //Videojuegos
  { name: "Ankergames", url: "https://ankergames.net/", category: "Games", description: "Pre-Installed Steam games" },
  { name: "Astralgames", url: "https://astralgames.net/", category: "Games", description: "Pre-Installed games" },
  { name: "Steam_Underground", url: "https://cs.rin.ru/forum/", category: "Games", description: "Foro mas grande de Videojuegos (Requiere Registro)" },
  { name: "GameBounty", url: "https://gamebounty.world/", category: "Games", description: "Pre-Installed games" },
  { name: "GOG_Games", url: "https://gog-games.to/", category: "Games", description: "GOG games free" },
  { name: "SteamRip", url: "https://steamrip.com/", category: "Games", description: "Free games" },
  { name: "Abandonware_Games", url: "https://abandonwaregames.net/", category: "Games", description: "Videojuegos Antiguos de diversas plataformas" },
  { name: "Cracked_Games", url: "https://cracked-games.org/", category: "Games", description: "Free games" },
  { name: "El_Amigos", url: "https://elamigos.site/", category: "Games", description: "Free games" },
  { name: "El_Enemigos", url: "https://elenemigos.com/", category: "Games", description: "Free games" },
  { name: "OnlineFix", url: "https://online-fix.me/", category: "Games", description: "Unas de las mejores paginas para Videojuegos Online" },

  // Emuladores
   { name: "Retroarch", url: "https://www.retroarch.com/", category: "Emuladores", description: "Varias Emuladores instalables, ademas del Frontend del Emulador" },
   { name: "Retrodeck", url: "https://retrodeck.net/", category: "Emuladores", description: "Solucion de los Retro-games en Linux" },
   { name: "Xemu", url: "https://xemu.app/", category: "Emuladores", description: "Emulador de Xbox" },
   { name: "Xenia", url: "https://xenia.jp/", category: "Emuladores", description: "Emulador de Xbox 360" },
   { name: "Dolphin", url: "https://es.dolphin-emu.org/?cr=es", category: "Emuladores", description: "Emulador de Gamecube + Wii" },
   { name: "Cemu", url: "https://cemu.info/", category: "Emuladores", description: "Emulador de Wii U" },
   { name: "MelonDS", url: "https://melonds.kuribo64.net/", category: "Emuladores", description: "Emulador de DS" },
   { name: "Mesen2", url: "https://github.com/SourMesen/Mesen2", category: "Emuladores", description: "Emulador de Gameboy+nes+snes" },
   { name: "mGBA", url: "https://mgba.io/", category: "Emuladores", description: "Emulador de Gameboy Advance" },
   { name: "Project64", url: "https://www.pj64-emu.com/#google_vignette", category: "Emuladores", description: "Emulador de Nintendo 64" },
   { name: "PuNES", url: "https://github.com/punesemu/puNES", category: "Emuladores", description: "Emulador de NES" },
   { name: "EDEN", url: "https://eden-emu.dev/", category: "Emuladores", description: "Emulador de Nintendo Switch" },
   { name: "Yuzu", url: "https://rentry.co/megathread-yuzu", category: "Emuladores", description: "Emulador de Nintendo Switch (No recibe Actualizaciones)" },
   { name: "ePSXe", url: "https://www.epsxe.com/", category: "Emuladores", description: "Emulador de PS1" },
   { name: "Duckstation", url: "https://www.duckstation.org/", category: "Emuladores", description: "Emulador de PS1" },
   { name: "PCSX2", url: "https://pcsx2.net/", category: "Emuladores", description: "Emulador de PS2" },
   { name: "PPSSPP", url: "https://www.ppsspp.org//", category: "Emuladores", description: "Emulador de PPSSPP" },
   { name: "RPSC3", url: "https://rpcs3.net/?__cf_chl_f_tk=N7zUREZaUs_9WCVI64dquoOmAnOPma9ncLMiNo16HTo-1783218432-1.0.1.1-dkVELoF8EEZmt2NjFk8K3KcfdBZzXW68fyc1jtigrXc", category: "Emuladores", description: "Emulador de Playstation_3" },
   { name: "Vita3K", url: "https://vita3k.org/", category: "Emuladores", description: "Emulador de PS_Vita" },


];

// Identidad simulada de la sesión (usuario ficticio, host, ruta).
const SESSION = {
  user: "incognito",
  host: "piratas",
  homePath: "/home/incognito",
};

// Información falsa de "sistema operativo" para el comando `about`.
const SYSTEM_INFO = {
  os: "PiratasOS 1.0",
  kernel: "6.8.0",
  shell: "webbash 1.0",
  terminal: "Piraterm",
  resolution: "responsive",
  uptime: " ? ",
};

// Líneas que se muestran durante la animación de arranque del sistema.
const BOOT_LINES = [
  { text: "[    0.000000] Iniciando PiratasOS Kernel 6.8.0...", delay: 90 },
  { text: "[    0.412381] Montando sistema de archivos virtual...", delay: 90 },
  { text: "[    0.812204]     OK    Cargando módulo tty-emulator", delay: 70, className: "line-success" },
  { text: "[    1.104552]     OK    Iniciando servicio bash-interpreter", delay: 70, className: "line-success" },
  { text: "[    1.532990]     OK    Estableciendo conexión con piratas.local", delay: 70, className: "line-success" },
  { text: "[    1.903112] Cargando perfil de usuario 'incognito'...", delay: 90 },
  { text: "[    2.201044] Sistema listo.", delay: 60 },
];

// Velocidades de animación de escritura (ms por carácter).
const TYPING_SPEED_BANNER = 4;   // banner: rápido
const TYPING_SPEED_TEXT = 8;     // texto normal con efecto "máquina de escribir"


/* ==================================================================
   2. ESTADO
   Variables mutables que cambian a lo largo de la sesión.
   ================================================================== */
const state = {
  commandHistory: [],     // historial de comandos ejecutados
  historyIndex: -1,       // posición actual al navegar con flechas
  currentInput: "",       // texto que el usuario está escribiendo ahora
  soundEnabled: false,    // sonido de tecleo activado/desactivado
  sessionEnded: false,    // true tras ejecutar `exit`
  isBusy: false,          // true mientras se anima texto (bloquea input)
  audioContext: null,     // contexto de Web Audio (se crea bajo demanda)
};


/* ==================================================================
   3. REFERENCIAS AL DOM
   ================================================================== */
const dom = {
  terminalBody: document.getElementById("terminal-body"),
  terminalOutput: document.getElementById("terminal-output"),
  activeLine: document.getElementById("active-line"),
  promptLabel: document.getElementById("prompt-label"),
  currentInputDisplay: document.getElementById("current-input-display"),
  cursor: document.getElementById("cursor"),
  hiddenInput: document.getElementById("hidden-input"),
  soundToggle: document.getElementById("sound-toggle"),
  soundIcon: document.getElementById("sound-icon"),
};


/* ==================================================================
   4. UTILIDADES
   ================================================================== */

// Pausa asíncrona basada en promesas, usada por las animaciones.
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Escapa HTML para que el texto escrito por el usuario nunca se
// interprete como marcado (evita inyección de HTML en la salida).
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Lleva el scroll del cuerpo de la terminal siempre hasta el final.
function scrollToBottom() {
  dom.terminalBody.scrollTop = dom.terminalBody.scrollHeight;
}

// Devuelve el string del prompt como HTML coloreado:
// invitado@piratas:~$
function buildPromptHTML() {
  return (
    `<span class="prompt-user">${SESSION.user}</span>` +
    `<span class="prompt-symbol">@</span>` +
    `<span class="prompt-host">${SESSION.host}</span>` +
    `<span class="prompt-symbol">:~$&nbsp;</span>`
  );
}

// Reproduce un "clic" de tecla sintetizado con Web Audio API.
// No depende de archivos de sonido externos: genera un tono corto.
function playKeySound() {
  if (!state.soundEnabled) return;

  try {
    if (!state.audioContext) {
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = state.audioContext;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = 620 + Math.random() * 60; // ligera variación
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.05);
  } catch (err) {
    // Si el navegador bloquea audio sin interacción, fallamos en silencio.
  }
}


/* ==================================================================
   5. RENDERIZADO
   Funciones responsables de pintar contenido dentro de
   #terminal-output. Todo el texto pasa por escapeHTML salvo el HTML
   ya controlado que construimos nosotros mismos (prompt, tablas...).
   ================================================================== */

// Agrega una línea de texto plano con una clase CSS opcional.
// Aplica un pequeño efecto de aparición gradual (fade-in).
function appendLine(text = "", className = "") {
  const line = document.createElement("div");
  line.className = `terminal-line fade-in ${className}`.trim();
  line.innerHTML = escapeHTML(text) || "&nbsp;";
  dom.terminalOutput.appendChild(line);
  scrollToBottom();
  return line;
}

// Agrega una línea con HTML ya construido (para prompts, tablas, etc).
function appendHTML(html, className = "") {
  const line = document.createElement("div");
  line.className = `terminal-line fade-in ${className}`.trim();
  line.innerHTML = html;
  dom.terminalOutput.appendChild(line);
  scrollToBottom();
  return line;
}

// Imprime, con efecto de escritura tipo máquina, el comando que el
// usuario acaba de ejecutar (para que quede en el historial visual).
async function echoCommand(rawCommand) {
  const html = buildPromptHTML() + escapeHTML(rawCommand);
  appendHTML(html);
}

// Efecto "máquina de escribir": revela el texto carácter por carácter
// dentro de una línea nueva. Usado para el banner y mensajes clave.
async function typeLine(text, className = "", speed = TYPING_SPEED_TEXT) {
  const line = document.createElement("div");
  line.className = `terminal-line ${className}`.trim();
  dom.terminalOutput.appendChild(line);

  for (let i = 0; i < text.length; i++) {
    line.innerHTML += escapeHTML(text[i]);
    scrollToBottom();
    // eslint-disable-next-line no-await-in-loop
    await delay(speed);
  }
}

// Genera la tabla estilo terminal para el comando `ls`, a partir
// únicamente del arreglo PAGES. Columnas: Nombre | Descripción | Comando
function renderPagesTable() {
  // Agrupa las páginas por su categoría
  const groups = {};
  PAGES.forEach((page) => {
    const cat = page.category || "Otros";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(page);
  });

  // Imprime una tabla separada por cada categoría
  Object.keys(groups).forEach((categoryName) => {
    appendLine(`── ${categoryName} ──`, "line-heading");

    const rows = groups[categoryName].map((page) => {
      const openCmd = `open ${page.name.toLowerCase()}`;
      return `
        <div class="ls-row">
          <span class="ls-cell ls-cell--name">${escapeHTML(page.name)}</span>
          <span class="ls-cell ls-cell--desc">${escapeHTML(page.description)}</span>
          <span class="ls-cell ls-cell--cmd">${escapeHTML(openCmd)}</span>
        </div>`;
    }).join("");

    const table = `
      <div class="ls-table">
        <div class="ls-row ls-row--header">
          <span class="ls-cell">Nombre</span>
          <span class="ls-cell">Descripción</span>
          <span class="ls-cell">Comando</span>
        </div>
        ${rows}
      </div>`;

    appendHTML(table);
  });
}


/* ==================================================================
   6. SECUENCIA DE ARRANQUE
   Simula el encendido de un sistema Linux antes de entrar a la
   terminal interactiva. Se ejecuta una única vez al cargar la página.
   ================================================================== */
async function runBootSequence() {
  state.isBusy = true;

  for (const line of BOOT_LINES) {
    appendLine(line.text, `line-dim ${line.className || ""}`.trim());
    // eslint-disable-next-line no-await-in-loop
    await delay(line.delay);
  }

  await delay(250);
  dom.terminalOutput.innerHTML = ""; // el "clear" tras el arranque, como en un boot real

  await printWelcome();
  state.isBusy = false;
  refreshPromptDisplay();
  focusInput();
}


/* ==================================================================
   7. BANNER Y BIENVENIDA
   ================================================================== */

// Arte ASCII del banner de bienvenida. Se mantiene en una única
// constante para poder reutilizarse desde el comando `banner`.
const BANNER_ART = String.raw`
 ____  _           _
|  _ \(_)_ __ __ _| |_ __ _ ___
| |_) | | '__/ _\ | __/ _\ / __|
|  __/| | | | (_| | || (_| \__ \
|_|   |_|_|  \__,_|\__\__,_|___/
`;

async function printBanner() {
  appendHTML(
    `<pre style="margin:0;line-height:1.1;">${escapeHTML(BANNER_ART)}</pre>`,
    "line-banner fade-in"
  );
}

async function printWelcome() {
  await printBanner();
  appendLine(`Bienvenido a Piraterm — sitio incognito y seguro.`, "line-heading fade-in");
  appendLine(`Escribe "help" para ver la lista de comandos disponibles.`, "line-muted fade-in");
  appendLine(`Este sitio es totalmente seguro y trato de revisar cada WEB`, "line-muted fade-in");
  appendLine("", "");
}


/* ==================================================================
   8. INTÉRPRETE DE COMANDOS
   Cada comando es una función que recibe (args) — un arreglo de
   strings con los argumentos posteriores al nombre del comando — y
   se encarga de imprimir su propia salida mediante appendLine/HTML.
   ================================================================== */
const commands = {

  // Lista todos los comandos disponibles con una breve descripción.
  help(args) {
    appendLine("Comandos disponibles:", "line-heading");
    const entries = [
      ["help", "Muestra esta lista de comandos."],
      ["clear", "Limpia completamente la terminal."],
      ["date", "Muestra la fecha y hora actual."],
      ["whoami", "Muestra el usuario actual."],
      ["pwd", "Muestra el directorio de trabajo actual."],
      ["ls", "Lista todas las páginas disponibles."],
      ["open [nombre]", "Abre una página en una nueva pestaña."],
      ["about", "Muestra información del sistema."],
      ["banner", "Vuelve a mostrar el banner de inicio."],
      ["exit", "Cierra la sesión de la terminal."],
    ];
    entries.forEach(([cmd, desc]) => {
      appendHTML(
        `<span class="ls-cell--name" style="display:inline-block;min-width:160px;">${escapeHTML(cmd)}</span>` +
        `<span class="line-muted">${escapeHTML(desc)}</span>`
      );
    });
  },

  // Limpia toda la salida de la terminal.
  clear() {
    dom.terminalOutput.innerHTML = "";
  },

  // Muestra la fecha y hora actual del sistema del usuario.
  date() {
    const now = new Date();
    const formatted = now.toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    appendLine(formatted);
  },

  // Muestra el nombre de usuario ficticio.
  whoami() {
    appendLine(SESSION.user);
  },

  // Muestra la ruta de directorio ficticia.
  pwd() {
    appendLine(SESSION.homePath);
  },

  // Lista las páginas disponibles en formato de tabla.
  ls() {
    if (PAGES.length === 0) {
      appendLine("No hay páginas disponibles.", "line-muted");
      return;
    }
    renderPagesTable();
  },

  // Abre una página del arreglo PAGES en una nueva pestaña.
  // Uso: open <nombre>   (no distingue mayúsculas/minúsculas)
  open(args) {
    const target = (args[0] || "").toLowerCase();

    if (!target) {
      appendLine('Uso: open [nombre]. Ejecuta "ls" para ver las opciones.', "line-error");
      return;
    }

    const page = PAGES.find((p) => p.name.toLowerCase() === target);

    if (!page) {
      appendLine(`open: "${args[0]}" no es una página reconocida.`, "line-error");
      appendLine('Ejecuta "ls" para ver la lista de páginas disponibles.', "line-muted");
      return;
    }

    appendLine(`Abriendo ${page.name} (${page.url})...`, "line-success");
    window.open(page.url, "_blank", "noopener,noreferrer");
  },

  // Muestra información falsa de sistema, estilo "neofetch".
  about() {
    const info = [
      ["Sistema Operativo", SYSTEM_INFO.os],
      ["Kernel", SYSTEM_INFO.kernel],
      ["Shell", SYSTEM_INFO.shell],
      ["Terminal", SYSTEM_INFO.terminal],
      ["Resolución", SYSTEM_INFO.resolution],
      ["Uptime", SYSTEM_INFO.uptime],
      ["Usuario", SESSION.user],
      ["Host", SESSION.host],
    ];
    appendLine("── Información del sistema ──", "line-heading");
    info.forEach(([label, value]) => {
      appendHTML(
        `<span class="ls-cell--name" style="display:inline-block;min-width:160px;">${escapeHTML(label)}</span>` +
        `<span>${escapeHTML(value)}</span>`
      );
    });
  },

  // Vuelve a mostrar el banner de bienvenida.
  async banner() {
    await printBanner();
  },

  // Simula el cierre de sesión de la terminal.
  exit() {
    appendLine("");
    appendLine("logout", "line-muted");
    appendLine("Conexión con piratas cerrada.", "line-error");
    appendLine("Pulsa ENTER para reconectar...", "line-muted");
    state.sessionEnded = true;
  },
};

// Lista de nombres de comandos válidos (se usa en autocompletado y errores).
const COMMAND_NAMES = Object.keys(commands);

// Analiza y ejecuta una línea de comando cruda escrita por el usuario.
async function executeCommand(rawInput) {
  const trimmed = rawInput.trim();

  // Si el usuario solo presionó Enter sin texto, no hacemos nada más
  // que mostrar una nueva línea de prompt.
  if (trimmed === "") return;

  const [commandName, ...args] = trimmed.split(/\s+/);
  const normalizedName = commandName.toLowerCase();

  if (Object.prototype.hasOwnProperty.call(commands, normalizedName)) {
    await commands[normalizedName](args);
  } else {
    appendLine(
      `bash: ${commandName}: orden no encontrada`,
      "line-error"
    );
    appendLine('Escribe "help" para ver los comandos disponibles.', "line-muted");
  }
}


/* ==================================================================
   9. AUTOCOMPLETADO (TAB)
   ================================================================== */
function handleTabCompletion() {
  const value = state.currentInput;
  if (value.trim() === "") return;

  const parts = value.split(/\s+/);

  // Autocompleta el nombre de la página tras "open ".
  if (parts.length >= 2 && parts[0].toLowerCase() === "open") {
    const partial = parts.slice(1).join(" ").toLowerCase();
    const matches = PAGES.filter((p) => p.name.toLowerCase().startsWith(partial));

    if (matches.length === 1) {
      setCurrentInput(`open ${matches[0].name.toLowerCase()}`);
    } else if (matches.length > 1) {
      appendHTML(buildPromptHTML() + escapeHTML(value));
      appendLine(matches.map((p) => p.name.toLowerCase()).join("   "), "line-muted");
    }
    return;
  }

  // Autocompleta el nombre del comando.
  const partial = parts[0].toLowerCase();
  const matches = COMMAND_NAMES.filter((name) => name.startsWith(partial));

  if (matches.length === 1) {
    setCurrentInput(matches[0] + " ");
  } else if (matches.length > 1) {
    appendHTML(buildPromptHTML() + escapeHTML(value));
    appendLine(matches.join("   "), "line-muted");
  }
}


/* ==================================================================
   10. MANEJO DE INPUT Y EVENTOS DE TECLADO
   ================================================================== */

// Sincroniza el texto interno con lo que se ve en pantalla + cursor.
function setCurrentInput(text) {
  state.currentInput = text;
  dom.hiddenInput.value = text;
  refreshCurrentInputDisplay();
}

function refreshCurrentInputDisplay() {
  dom.currentInputDisplay.innerHTML = escapeHTML(state.currentInput);
}

// Vuelve a pintar el prompt (usuario@host:~$) en la línea activa.
function refreshPromptDisplay() {
  dom.promptLabel.innerHTML = buildPromptHTML();
}

function focusInput() {
  dom.hiddenInput.focus({ preventScroll: true });
}

// Envía el comando actual: lo imprime como eco, lo ejecuta, y
// prepara una nueva línea de prompt vacía.
async function submitCurrentCommand() {
  const commandText = state.currentInput;

  // Guarda en el historial solo si no está vacío y es distinto al último.
  if (commandText.trim() !== "") {
    const last = state.commandHistory[state.commandHistory.length - 1];
    if (commandText !== last) {
      state.commandHistory.push(commandText);
    }
  }
  state.historyIndex = state.commandHistory.length;

  await echoCommand(commandText);
  setCurrentInput("");

  state.isBusy = true;
  await executeCommand(commandText);
  state.isBusy = false;
  scrollToBottom();
}

// --- Listeners del input oculto -----------------------------------

dom.hiddenInput.addEventListener("input", () => {
  state.currentInput = dom.hiddenInput.value;
  refreshCurrentInputDisplay();
});

dom.hiddenInput.addEventListener("keydown", async (event) => {
  // Tras `exit`, cualquier ENTER reinicia la sesión (recarga la página).
  if (state.sessionEnded) {
    if (event.key === "Enter") {
      window.location.reload();
    }
    return;
  }

  if (state.isBusy && event.key !== "Enter") {
    // Mientras se anima una respuesta, evitamos que el usuario acumule
    // pulsaciones que rompan la sincronía visual.
    return;
  }

  switch (event.key) {
    case "Enter":
      event.preventDefault();
      await submitCurrentCommand();
      break;

    case "ArrowUp":
      event.preventDefault();
      if (state.commandHistory.length === 0) break;
      state.historyIndex = Math.max(0, state.historyIndex - 1);
      setCurrentInput(state.commandHistory[state.historyIndex] || "");
      break;

    case "ArrowDown":
      event.preventDefault();
      if (state.commandHistory.length === 0) break;
      state.historyIndex = Math.min(state.commandHistory.length, state.historyIndex + 1);
      setCurrentInput(state.commandHistory[state.historyIndex] || "");
      break;

    case "Tab":
      event.preventDefault();
      handleTabCompletion();
      break;

    default:
      // Sonido de tecleo para pulsaciones "imprimibles".
      if (event.key.length === 1) {
        playKeySound();
      }
      break;
  }
});

// Mantiene el foco en el input oculto sin importar dónde haga clic
// el usuario dentro de la terminal (comportamiento típico de un
// emulador de terminal real).
dom.terminalBody.addEventListener("click", focusInput);
document.getElementById("terminal-window").addEventListener("click", focusInput);

// --- Interruptor de sonido -----------------------------------------
dom.soundToggle.addEventListener("click", () => {
  state.soundEnabled = !state.soundEnabled;
  dom.soundIcon.textContent = state.soundEnabled ? "🔊" : "🔇";
  dom.soundToggle.setAttribute("aria-pressed", String(state.soundEnabled));
  focusInput();
});


/* ==================================================================
   11. INICIALIZACIÓN
   ================================================================== */
window.addEventListener("DOMContentLoaded", () => {
  refreshPromptDisplay();
  focusInput();
  runBootSequence();
});

// Si el usuario cambia de pestaña y vuelve, recuperamos el foco.
window.addEventListener("focus", focusInput);
