/**
 * Prefer rustup's cargo/rustc over standalone "Rust stable LLVM" (gnullvm)
 * installs that expect x86_64-w64-mingw32-clang.
 *
 * Also ensures common MinGW bins stay on PATH for the windows-gnu toolchain.
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const env = { ...process.env };
const sep = path.delimiter;
const home = os.homedir();
const cargoBin = path.join(home, ".cargo", "bin");

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function collectExtraBins() {
  const bins = [cargoBin];

  // Prefer active/default rustup toolchain bins when present.
  const toolchainsRoot = path.join(home, ".rustup", "toolchains");
  for (const name of [
    "stable-x86_64-pc-windows-gnu",
    "stable-x86_64-pc-windows-msvc",
  ]) {
    const bin = path.join(toolchainsRoot, name, "bin");
    if (exists(bin)) bins.push(bin);
  }

  // WinLibs / MSYS / common MinGW locations (needed for windows-gnu).
  const candidates = [
    process.env.MINGW_BIN,
    path.join(
      home,
      "AppData",
      "Local",
      "Microsoft",
      "WinGet",
      "Packages",
    ),
    "C:\\msys64\\mingw64\\bin",
    "C:\\mingw64\\bin",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (!exists(candidate)) continue;
    if (candidate.toLowerCase().endsWith(`${path.sep}bin`) || /mingw.*bin$/i.test(candidate)) {
      bins.push(candidate);
      continue;
    }
    // Scan one level for .../mingw64/bin under WinGet packages.
    try {
      for (const entry of fs.readdirSync(candidate, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const mingwBin = path.join(candidate, entry.name, "mingw64", "bin");
        if (exists(path.join(mingwBin, "gcc.exe")) || exists(path.join(mingwBin, "gcc"))) {
          bins.push(mingwBin);
        }
      }
    } catch {
      // ignore
    }
  }

  return bins;
}

const blocked = (p) => /Rust stable LLVM/i.test(p);
const normalize = (p) => p.replace(/[/\\]+$/, "").toLowerCase();
const existing = (env.PATH || "").split(sep).filter((p) => p && !blocked(p));
const extras = collectExtraBins().filter(exists);
const seen = new Set();
const ordered = [];

for (const p of [...extras, ...existing]) {
  const key = normalize(p);
  if (!key || seen.has(key)) continue;
  seen.add(key);
  ordered.push(p);
}

env.PATH = ordered.join(sep);
// Avoid accidental gnullvm host selection from standalone installer.
delete env.RUSTC;
delete env.CARGO;

const result = spawnSync("cargo", process.argv.slice(2), {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
