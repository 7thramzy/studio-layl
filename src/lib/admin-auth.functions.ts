import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credentials = z.object({
  username: z.string().trim().min(3).max(80),
  password: z.string().min(8).max(200),
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator(credentials)
  .handler(async ({ data }) => {
    const { loginAdmin } = await import("./admin-auth.server");
    return loginAdmin(data.username, data.password);
  });

export const adminSession = createServerFn({ method: "GET" }).handler(async () => {
  const { getAdminSession } = await import("./admin-auth.server");
  return getAdminSession();
});

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { logoutAdmin } = await import("./admin-auth.server");
  return logoutAdmin();
});
