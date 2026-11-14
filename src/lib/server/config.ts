import "server-only";

export const config = {
  mangoAuthUrl: process.env.MANGO_AUTH_URL ?? "http://localhost:8003",
  mangoAuthApp: process.env.MANGO_AUTH_APP ?? "erp",
  services: {
    warehouse: process.env.LIME_WAREHOUSE_URL ?? "http://localhost:8004",
  } as Record<string, string>,
};
