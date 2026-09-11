import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  if (mode === "production" && !env.VITE_APIGW_PSP_URL) {
    throw new Error(
      "[onboarding-psp] Build de producción sin VITE_APIGW_PSP_URL. " +
        "Completá .env.production (o inyectá la variable) con la URL pública de apigateway-psp."
    );
  }

  return {
    base: "/",
    plugins: [
      react(),
      federation({
        name: "onboardingPsp",
        filename: "remoteEntry.js",
        exposes: {
          "./App": "./src/AppWrapper",
        },
        shared: {
          react: { singleton: true, eager: true },
          "react-dom": { singleton: true, eager: true },
          "react-router-dom": { singleton: true },
          "react-redux": { singleton: true },
          "redux-persist": { singleton: true },
        },
      }),
    ],
    resolve: {
      alias: {
        src: "/src",
        components: "/src/components",
        layout: "/src/layout",
        hooks: "/src/hooks",
        assets: "/src/assets",
      },
    },
    cacheDir: "node_modules/.cacheDir",
    build: {
      modulePreload: false,
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
    },
    test: {
      environment: "jsdom",
      globals: false,
    },
  };
});
