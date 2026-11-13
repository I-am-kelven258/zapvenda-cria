import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appScriptSchema } from "./app-script.schema";
import { generateAppScript } from "./app-script.server";

export const gerarScriptComIA = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => appScriptSchema.parse(data))
  .handler(async ({ data }) => generateAppScript(data, process.env["OPENAI_API_KEY"]));