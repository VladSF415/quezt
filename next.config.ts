import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname } from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next does not pick up a stray
  // package-lock.json in the parent directory.
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
  images: {
    // Next 16 defaults images.qualities to [75] only; anything else 400s.
    // Allow the qualities this site uses.
    qualities: [75, 80, 90],
  },
};

export default nextConfig;
