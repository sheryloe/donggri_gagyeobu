import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const webDir = path.join(rootDir, "web");
const distDir = path.join(rootDir, "dist");

const config = {
    SUPABASE_URL: process.env.SUPABASE_URL || "YOUR_SUPABASE_URL",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY",
    APP_NAME: process.env.APP_NAME || "Donggri Ledger",
};

const configSource = `window.APP_CONFIG = ${JSON.stringify(config, null, 4)};\n`;

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const filename of ["index.html", "app.js"]) {
    await cp(path.join(webDir, filename), path.join(distDir, filename));
}

await writeFile(path.join(distDir, "app-config.js"), configSource, "utf8");

for (const entry of ["assets", "favicon.ico", "site.webmanifest"]) {
    const sourcePath = path.join(webDir, entry);
    try {
        await cp(sourcePath, path.join(distDir, entry), { recursive: true });
    } catch {
        // Optional assets are copied only when they exist.
    }
}

const indexHtml = await readFile(path.join(distDir, "index.html"), "utf8");
if (!indexHtml.includes("app-config.js")) {
    throw new Error("index.html is missing app-config.js reference.");
}
