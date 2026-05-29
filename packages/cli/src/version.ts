import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function resolveCliVersion(): string {
  try {
    const packageJsonPath = join(__dirname, "..", "..", "package.json");
    if (existsSync(packageJsonPath)) {
      const content = readFileSync(packageJsonPath, "utf-8");
      const pkg = JSON.parse(content);
      return pkg.version || "0.1.0";
    }
  } catch {
    // ignore
  }
  return "0.1.0";
}
