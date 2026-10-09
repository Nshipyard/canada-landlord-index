import { NextResponse } from "next/server";
import { searchOperators, operators, type SortId } from "@/lib/landlord";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const sort = (["red", "share", "score", "buildings"].includes(searchParams.get("sort") ?? "")
    ? searchParams.get("sort")
    : "red") as SortId;
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "200", 10) || 200, 1), 1000);
  const hits = searchOperators(q, sort, limit);
  return NextResponse.json({ q, sort, limit, total: operators.length, hits });
}
