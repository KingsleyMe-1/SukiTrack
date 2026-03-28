import type { Config } from "@react-router/dev/config";

export default {
  // SSR is intentionally enabled because admin auth now uses server loaders/actions
  // with httpOnly cookies.
  ssr: true,
} satisfies Config;
