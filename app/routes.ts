import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("catalog", "routes/catalog.tsx"),
  route("catalog/:id", "routes/catalog.$id.tsx"),
  route("trends", "routes/trends.tsx"),
] satisfies RouteConfig;
