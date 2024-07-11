// vite.config.js
import path from "path";
import process from "process";
import vuePlugin from "file:///Users/mzc01-kimub1204/Documents/ub/spaceone/projects/console-sb-migration/node_modules/@vitejs/plugin-vue2/dist/index.mjs";
import { visualizer } from "file:///Users/mzc01-kimub1204/Documents/ub/spaceone/projects/console-sb-migration/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { defineConfig, loadEnv } from "file:///Users/mzc01-kimub1204/Documents/ub/spaceone/projects/console-sb-migration/node_modules/vite/dist/node/index.js";
import StylelintPlugin from "file:///Users/mzc01-kimub1204/Documents/ub/spaceone/projects/console-sb-migration/node_modules/vite-plugin-stylelint/dist/index.mjs";
import VueTypeImports from "file:///Users/mzc01-kimub1204/Documents/ub/spaceone/projects/console-sb-migration/node_modules/vite-plugin-vue-type-imports/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/mzc01-kimub1204/Documents/ub/spaceone/projects/console-sb-migration/apps/web";
var vite_config_default = defineConfig(async ({ command, mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  if (command === "serve")
    console.log("serve mode");
  else
    console.log("build mode");
  return {
    optimizeDeps: {
      include: [
        "@spaceone/design-system/tailwind.config.cjs",
        "prosemirror-state",
        "prosemirror-transform",
        "prosemirror-model",
        "prosemirror-view"
      ]
    },
    plugins: [
      vuePlugin(),
      VueTypeImports(),
      StylelintPlugin({
        include: ["src/**/*.{css,vue,pcss,scss}"],
        exclude: ["node_modules"],
        lintOnStart: false,
        emitErrorAsWarning: true
      }),
      ...process.env.NODE_ENV === "production" ? [] : [visualizer({
        emitFile: true,
        filename: "stats.html"
      })],
      visualizer({
        filename: "./dist/report.html",
        open: true,
        brotliSize: true,
        sourcemap: false,
        gzipSize: true
      })
    ],
    build: {
      rollupOptions: {
        external: ["@spaceone/design-system/css/*"]
      }
    },
    server: { port: 8080 },
    preview: { port: 8080 },
    test: {
      globals: true,
      environment: "jsdom",
      include: ["./src/**/__tests__/**/*.+(ts|js)"],
      coverage: {
        provider: "istanbul"
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        "@cloudforet/core-lib": path.resolve(__vite_injected_original_dirname, "../../packages/core-lib/dist/"),
        "@cloudforet/utils": path.resolve(__vite_injected_original_dirname, "../../packages/utils/dist/"),
        "@cloudforet/language-pack": path.resolve(__vite_injected_original_dirname, "../../packages/language-pack/"),
        vue: path.resolve(__vite_injected_original_dirname, "../../node_modules/vue/dist/vue.js")
      }
    },
    define: {
      VITE_APP_VER: JSON.stringify(process.env.npm_package_version)
      // Add env variables here
      // Usage references => SignInLeftContainer.vue / env.d.ts
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbXpjMDEta2ltdWIxMjA0L0RvY3VtZW50cy91Yi9zcGFjZW9uZS9wcm9qZWN0cy9jb25zb2xlLXNiLW1pZ3JhdGlvbi9hcHBzL3dlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL216YzAxLWtpbXViMTIwNC9Eb2N1bWVudHMvdWIvc3BhY2VvbmUvcHJvamVjdHMvY29uc29sZS1zYi1taWdyYXRpb24vYXBwcy93ZWIvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL216YzAxLWtpbXViMTIwNC9Eb2N1bWVudHMvdWIvc3BhY2VvbmUvcHJvamVjdHMvY29uc29sZS1zYi1taWdyYXRpb24vYXBwcy93ZWIvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBwcm9jZXNzIGZyb20gJ3Byb2Nlc3MnO1xuXG5pbXBvcnQgdnVlUGx1Z2luIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZTInO1xuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcic7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCBTdHlsZWxpbnRQbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tc3R5bGVsaW50JztcbmltcG9ydCBWdWVUeXBlSW1wb3J0cyBmcm9tICd2aXRlLXBsdWdpbi12dWUtdHlwZS1pbXBvcnRzJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xuICAgIHByb2Nlc3MuZW52ID0geyAuLi5wcm9jZXNzLmVudiwgLi4ubG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpKSB9O1xuICAgIGlmIChjb21tYW5kID09PSAnc2VydmUnKSBjb25zb2xlLmxvZygnc2VydmUgbW9kZScpO1xuICAgIGVsc2UgY29uc29sZS5sb2coJ2J1aWxkIG1vZGUnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG9wdGltaXplRGVwczoge1xuICAgICAgICAgICAgaW5jbHVkZTogW1xuICAgICAgICAgICAgICAgICdAc3BhY2VvbmUvZGVzaWduLXN5c3RlbS90YWlsd2luZC5jb25maWcuY2pzJyxcbiAgICAgICAgICAgICAgICAncHJvc2VtaXJyb3Itc3RhdGUnLFxuICAgICAgICAgICAgICAgICdwcm9zZW1pcnJvci10cmFuc2Zvcm0nLFxuICAgICAgICAgICAgICAgICdwcm9zZW1pcnJvci1tb2RlbCcsXG4gICAgICAgICAgICAgICAgJ3Byb3NlbWlycm9yLXZpZXcnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgICAgdnVlUGx1Z2luKCksXG4gICAgICAgICAgICBWdWVUeXBlSW1wb3J0cygpLFxuICAgICAgICAgICAgU3R5bGVsaW50UGx1Z2luKHtcbiAgICAgICAgICAgICAgICBpbmNsdWRlOiBbJ3NyYy8qKi8qLntjc3MsdnVlLHBjc3Msc2Nzc30nXSxcbiAgICAgICAgICAgICAgICBleGNsdWRlOiBbJ25vZGVfbW9kdWxlcyddLFxuICAgICAgICAgICAgICAgIGxpbnRPblN0YXJ0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlbWl0RXJyb3JBc1dhcm5pbmc6IHRydWUsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIC4uLihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nID8gW10gOiBbdmlzdWFsaXplcih7XG4gICAgICAgICAgICAgICAgZW1pdEZpbGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6ICdzdGF0cy5odG1sJyxcbiAgICAgICAgICAgIH0pXSksXG4gICAgICAgICAgICB2aXN1YWxpemVyKHtcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogJy4vZGlzdC9yZXBvcnQuaHRtbCcsXG4gICAgICAgICAgICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBicm90bGlTaXplOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgICAgICAgICAgICAgZ3ppcFNpemU6IHRydWUsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBleHRlcm5hbDogWydAc3BhY2VvbmUvZGVzaWduLXN5c3RlbS9jc3MvKiddLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgc2VydmVyOiB7IHBvcnQ6IDgwODAgfSxcbiAgICAgICAgcHJldmlldzogeyBwb3J0OiA4MDgwIH0sXG4gICAgICAgIHRlc3Q6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IHRydWUsXG4gICAgICAgICAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICAgICAgICAgIGluY2x1ZGU6IFsnLi9zcmMvKiovX190ZXN0c19fLyoqLyouKyh0c3xqcyknXSxcbiAgICAgICAgICAgIGNvdmVyYWdlOiB7XG4gICAgICAgICAgICAgICAgcHJvdmlkZXI6ICdpc3RhbmJ1bCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICAgICAgICAgICAgJ0BjbG91ZGZvcmV0L2NvcmUtbGliJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2NvcmUtbGliL2Rpc3QvJyksXG4gICAgICAgICAgICAgICAgJ0BjbG91ZGZvcmV0L3V0aWxzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3V0aWxzL2Rpc3QvJyksXG4gICAgICAgICAgICAgICAgJ0BjbG91ZGZvcmV0L2xhbmd1YWdlLXBhY2snOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvbGFuZ3VhZ2UtcGFjay8nKSxcbiAgICAgICAgICAgICAgICB2dWU6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9ub2RlX21vZHVsZXMvdnVlL2Rpc3QvdnVlLmpzJyksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBkZWZpbmU6IHtcbiAgICAgICAgICAgIFZJVEVfQVBQX1ZFUjogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYubnBtX3BhY2thZ2VfdmVyc2lvbiksXG4gICAgICAgICAgICAvLyBBZGQgZW52IHZhcmlhYmxlcyBoZXJlXG4gICAgICAgICAgICAvLyBVc2FnZSByZWZlcmVuY2VzID0+IFNpZ25JbkxlZnRDb250YWluZXIudnVlIC8gZW52LmQudHNcbiAgICAgICAgfSxcbiAgICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJhLE9BQU8sVUFBVTtBQUM1YixPQUFPLGFBQWE7QUFFcEIsT0FBTyxlQUFlO0FBQ3RCLFNBQVMsa0JBQWtCO0FBQzNCLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLE9BQU8scUJBQXFCO0FBQzVCLE9BQU8sb0JBQW9CO0FBUDNCLElBQU0sbUNBQW1DO0FBU3pDLElBQU8sc0JBQVEsYUFBYSxPQUFPLEVBQUUsU0FBUyxLQUFLLE1BQU07QUFDckQsVUFBUSxNQUFNLEVBQUUsR0FBRyxRQUFRLEtBQUssR0FBRyxRQUFRLE1BQU0sUUFBUSxJQUFJLENBQUMsRUFBRTtBQUNoRSxNQUFJLFlBQVk7QUFBUyxZQUFRLElBQUksWUFBWTtBQUFBO0FBQzVDLFlBQVEsSUFBSSxZQUFZO0FBRTdCLFNBQU87QUFBQSxJQUNILGNBQWM7QUFBQSxNQUNWLFNBQVM7QUFBQSxRQUNMO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDTCxVQUFVO0FBQUEsTUFDVixlQUFlO0FBQUEsTUFDZixnQkFBZ0I7QUFBQSxRQUNaLFNBQVMsQ0FBQyw4QkFBOEI7QUFBQSxRQUN4QyxTQUFTLENBQUMsY0FBYztBQUFBLFFBQ3hCLGFBQWE7QUFBQSxRQUNiLG9CQUFvQjtBQUFBLE1BQ3hCLENBQUM7QUFBQSxNQUNELEdBQUksUUFBUSxJQUFJLGFBQWEsZUFBZSxDQUFDLElBQUksQ0FBQyxXQUFXO0FBQUEsUUFDekQsVUFBVTtBQUFBLFFBQ1YsVUFBVTtBQUFBLE1BQ2QsQ0FBQyxDQUFDO0FBQUEsTUFDRixXQUFXO0FBQUEsUUFDUCxVQUFVO0FBQUEsUUFDVixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixXQUFXO0FBQUEsUUFDWCxVQUFVO0FBQUEsTUFDZCxDQUFDO0FBQUEsSUFDTDtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0gsZUFBZTtBQUFBLFFBQ1gsVUFBVSxDQUFDLCtCQUErQjtBQUFBLE1BQzlDO0FBQUEsSUFDSjtBQUFBLElBQ0EsUUFBUSxFQUFFLE1BQU0sS0FBSztBQUFBLElBQ3JCLFNBQVMsRUFBRSxNQUFNLEtBQUs7QUFBQSxJQUN0QixNQUFNO0FBQUEsTUFDRixTQUFTO0FBQUEsTUFDVCxhQUFhO0FBQUEsTUFDYixTQUFTLENBQUMsa0NBQWtDO0FBQUEsTUFDNUMsVUFBVTtBQUFBLFFBQ04sVUFBVTtBQUFBLE1BQ2Q7QUFBQSxJQUNKO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDTCxPQUFPO0FBQUEsUUFDSCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsUUFDcEMsd0JBQXdCLEtBQUssUUFBUSxrQ0FBVywrQkFBK0I7QUFBQSxRQUMvRSxxQkFBcUIsS0FBSyxRQUFRLGtDQUFXLDRCQUE0QjtBQUFBLFFBQ3pFLDZCQUE2QixLQUFLLFFBQVEsa0NBQVcsK0JBQStCO0FBQUEsUUFDcEYsS0FBSyxLQUFLLFFBQVEsa0NBQVcsb0NBQW9DO0FBQUEsTUFDckU7QUFBQSxJQUNKO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDSixjQUFjLEtBQUssVUFBVSxRQUFRLElBQUksbUJBQW1CO0FBQUE7QUFBQTtBQUFBLElBR2hFO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
