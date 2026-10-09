import { NextResponse } from "next/server";
import { summary } from "@/lib/landlord";

export async function GET() {
  return NextResponse.json(summary);
}
