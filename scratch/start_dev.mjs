import { spawn } from "child_process";
import path from "path";

// Align cwd with physical drive location to eliminate NTFS junction drive concatenation
const targetDir = "D:\\KERJAAN\\CODING\\COMBO\\bias-ristek-app";
process.chdir(targetDir);

console.log("Current working directory set to physical location:", process.cwd());

const child = spawn("npx.cmd", ["next", "dev"], {
  cwd: targetDir,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => {
  console.log("Next.js exited with code:", code);
  process.exit(code || 0);
});
