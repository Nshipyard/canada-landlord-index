import { NextResponse } from "next/server";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Landlord Operator Index API",
    version: "1.0.0",
    description:
      "Toronto RentSafeTO evaluation scores (3,593 buildings, 0-100%) joined to the City's open apartment building registration file and ranked by property management company (831 operators). Operator = property management company from the registration file, not the legal owner. MIT licensed.",
  },
  servers: [{ url: "https://landlord.canada.nshipyard.com/api/v1" }],
  paths: {
    "/operators": {
      get: {
        summary: "Search and rank 831 property management companies",
        parameters: [
          { name: "q", in: "query", required: false, schema: { type: "string" }, example: "greenwin" },
          { name: "sort", in: "query", required: false, schema: { type: "string", enum: ["red", "share", "score", "buildings"] }, example: "red" },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 200, maximum: 1000 } },
        ],
        responses: { "200": { description: "Ranked operator records with red/yellow/green counts, average score, units, portfolio shares" } },
      },
    },
    "/buildings": {
      get: {
        summary: "Search 3,593 evaluated buildings by address, operator, door sign, or ward",
        parameters: [
          { name: "q", in: "query", required: false, schema: { type: "string" }, example: "gerrard" },
          { name: "operator_id", in: "query", required: false, schema: { type: "string" }, example: "OP0001" },
          { name: "sign", in: "query", required: false, schema: { type: "string", enum: ["green", "yellow", "red"] } },
          { name: "ward", in: "query", required: false, schema: { type: "string" }, example: "13" },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 100, maximum: 1000 } },
        ],
        responses: { "200": { description: "Total plus matching building records" } },
      },
    },
    "/summary": {
      get: {
        summary: "Data vintages, join counts, blank-name counts, and build notes",
        responses: { "200": { description: "Summary metadata" } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
