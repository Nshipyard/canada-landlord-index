import { NextResponse } from "next/server";
import { searchBuildings } from "@/lib/landlord";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const res = searchBuildings({
    q: searchParams.get("q") ?? "",
    operator_id: searchParams.get("operator_id") ?? "",
    sign: searchParams.get("sign") ?? "",
    ward: searchParams.get("ward") ?? "",
    limit: parseInt(searchParams.get("limit") ?? "100", 10) || 100,
  });
  return NextResponse.json(res);
}
