import { chmod, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

await mkdir(dist, { recursive: true });

for (const name of ["worker", "server"]) {
  const source = await readFile(path.join(root, "src", `${name}.ts`), "utf8");
  await writeFile(path.join(dist, `${name}.js`), source, "utf8");
}

await mkdir(path.join(dist, "bin"), { recursive: true });
for (const name of ["ollama-worker-mcp", "ollama-worker-cli"]) {
  await cp(path.join(root, "bin", name), path.join(dist, "bin", name));
  await chmod(path.join(dist, "bin", name), 0o755);
}
