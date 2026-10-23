import { getAnalystAPI } from "../../../../lib/http-api.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 70;
export async function POST(request) {
  return getAnalystAPI().analyze(request);
}
