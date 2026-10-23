import { getAnalystAPI } from "../../../../lib/http-api.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request) {
  return getAnalystAPI().status(request);
}
