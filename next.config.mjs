import { fileURLToPath } from "node:url";
const nextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  experimental: { cpus: 1 },
  devIndicators: false,
};
export default nextConfig;
