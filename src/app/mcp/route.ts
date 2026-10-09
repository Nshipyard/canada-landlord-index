import { NextResponse } from "next/server";
import { searchOperators, searchBuildings, summary, type SortId } from "@/lib/landlord";

// Minimal MCP server over streamable HTTP (JSON-RPC 2.0 via POST).
// Supports: initialize, tools/list, tools/call. Stateless.

const SERVER = { name: "canada-landlord-index", version: "1.0.0" };

const TOOLS = [
  {
    name: "operator_ranking",
    description:
      "Rank Toronto property management companies by RentSafeTO evaluation scores (3,593 buildings, 831 operators): red-rated building counts, average scores, units under management, share of portfolio rated red or yellow. Operator = management company from the registration file, not the legal owner.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Company name fragment, e.g. 'greenwin'" },
        sort: { type: "string", description: "red | share | score | buildings (default red)" },
        limit: { type: "integer", description: "Max results, default 20, max 200" },
      },
    },
  },
  {
    name: "building_lookup",
    description:
      "Look up evaluated buildings by address, operator id, door sign (green/yellow/red), or ward. Returns score, sign, address, ward, units, operator name.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Address fragment, e.g. 'gerrard'" },
        operator_id: { type: "string", description: "Operator id, e.g. 'OP0001'" },
        sign: { type: "string", description: "green | yellow | red" },
        ward: { type: "string", description: "Ward number, e.g. '13'" },
        limit: { type: "integer", description: "Max results, default 20, max 200" },
      },
    },
  },
  {
    name: "methodology",
    description:
      "How the index was built: data sources and vintages, deduplication, RSN join, operator name normalization (953 spellings to 831 operators), blank-name handling, and the management-not-ownership caveat.",
    inputSchema: { type: "object", properties: {} },
  },
];

function ok(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}
function err(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
function textResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function handle(msg: any) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return err(msg?.id ?? null, -32600, "Invalid Request");
  }
  const id = msg.id ?? null;
  switch (msg.method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER,
      });
    case "notifications/initialized":
      return null;
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const { name, arguments: args } = msg.params ?? {};
      try {
        if (name === "operator_ranking") {
          const sort = (["red", "share", "score", "buildings"].includes(String(args?.sort ?? ""))
            ? args.sort
            : "red") as SortId;
          const limit = Math.min(Math.max(parseInt(String(args?.limit ?? "20"), 10) || 20, 1), 200);
          const hits = searchOperators(String(args?.q ?? ""), sort, limit);
          return ok(id, textResult({ q: args?.q ?? "", sort, limit, hits }));
        }
        if (name === "building_lookup") {
          const limit = Math.min(Math.max(parseInt(String(args?.limit ?? "20"), 10) || 20, 1), 200);
          const res = searchBuildings({
            q: String(args?.q ?? ""),
            operator_id: String(args?.operator_id ?? ""),
            sign: String(args?.sign ?? ""),
            ward: String(args?.ward ?? ""),
            limit,
          });
          return ok(id, textResult(res));
        }
        if (name === "methodology") {
          return ok(id, textResult(summary));
        }
        return err(id, -32601, `Unknown tool ${name}`);
      } catch (e) {
        return err(id, -32000, `Tool failed: ${String(e)}`);
      }
    }
    default:
      return err(id, -32601, `Unknown method ${msg.method}`);
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(err(null, -32700, "Parse error"), { status: 400 });
  }
  const out = handle(body);
  if (out === null) return new NextResponse(null, { status: 202 });
  return NextResponse.json(out);
}

export async function GET() {
  return NextResponse.json({ name: SERVER.name, version: SERVER.version, transport: "streamable-http", tools: TOOLS.map((t) => t.name) });
}
