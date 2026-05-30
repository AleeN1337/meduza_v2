import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
