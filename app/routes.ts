import {
  type RouteConfig,
  index,
  route,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  // Landing page — role selector
  index("routes/landing.tsx"),

  // Auth routes (shared card layout)
  layout("routes/auth.layout.tsx", [
    route("auth/customer", "routes/auth.customer.tsx"),
    route("auth/store-owner", "routes/auth.store-owner.tsx"),
  ]),

  // Store owner routes
  ...prefix("store", [
    layout("routes/store/layout.tsx", [
      index("routes/store/index.tsx"),
      route("catalog", "routes/store/catalog.tsx"),
      route("catalog/:id", "routes/store/catalog.$id.tsx"),
      route("trends", "routes/store/trends.tsx"),
      route("stores", "routes/store/stores.tsx"),
    ]),
  ]),

  // Customer routes
  ...prefix("customer", [
    layout("routes/customer/layout.tsx", [
      index("routes/customer/index.tsx"),
      route("catalog", "routes/customer/catalog.tsx"),
      route("checklist", "routes/customer/checklist.tsx"),
      route("promos", "routes/customer/promos.tsx"),
    ]),
  ]),

  // Admin routes
  route("admin/login", "routes/admin/login.tsx"),
  ...prefix("admin", [
    layout("routes/admin/layout.tsx", [
      index("routes/admin/index.tsx"),
      route("settings", "routes/admin/settings.tsx"),
      route("audit", "routes/admin/audit.tsx"),
      route("data", "routes/admin/data.tsx"),
      route("bulk", "routes/admin/bulk.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
