import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    // מבטיח ש־Next ירוץ מתוך תיקיית הפרויקט TALAM
    root: __dirname,
  },
};

export default nextConfig;
