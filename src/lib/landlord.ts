import operatorsRaw from "../../data/operators.json";
import buildingsRaw from "../../data/buildings.json";
import summaryRaw from "../../data/summary.json";

export interface Operator {
  id: string;
  name: string;
  buildings: number;
  red: number;
  yellow: number;
  green: number;
  avg_score: number | null;
  scored_buildings: number;
  total_units: number | null;
  share_red: number;
  share_red_yellow: number;
}

export interface Building {
  rsn: number;
  address: string;
  ward: string;
  year_built: number | null;
  units: number | null;
  year_evaluated: number | null;
  evaluated_on: string | null;
  score: number | null;
  sign: "green" | "yellow" | "red" | "unknown";
  operator_id: string;
  operator_name: string | null;
  lat: string | number | null;
  lon: string | number | null;
}

export const operators = operatorsRaw as Operator[];
export const buildings = buildingsRaw as Building[];
export const summary = summaryRaw as Record<string, unknown>;

export const operatorById: Record<string, Operator> = Object.fromEntries(
  operators.map((o) => [o.id, o])
);

export const buildingsByOperator: Record<string, Building[]> = {};
for (const b of buildings) {
  if (b.operator_id === "unattributed") continue;
  (buildingsByOperator[b.operator_id] ||= []).push(b);
}

const cityScores = buildings.map((b) => b.score).filter((s): s is number => s != null);
export const cityAvg = cityScores.reduce((a, b) => a + b, 0) / cityScores.length;

export type SortId = "red" | "share" | "score" | "buildings";

export function rankOperators(sort: SortId = "red", limit = 200): Operator[] {
  const rows = [...operators];
  switch (sort) {
    case "red":
      rows.sort((a, b) => b.red - a.red || b.share_red_yellow - a.share_red_yellow || b.buildings - a.buildings);
      break;
    case "share":
      rows.sort((a, b) => b.share_red_yellow - a.share_red_yellow || b.red - a.red || (a.avg_score ?? 0) - (b.avg_score ?? 0));
      break;
    case "score":
      rows.sort((a, b) => (a.avg_score ?? 100) - (b.avg_score ?? 100) || b.buildings - a.buildings);
      break;
    case "buildings":
      rows.sort((a, b) => b.buildings - a.buildings || b.red - a.red);
      break;
  }
  return rows.slice(0, Math.min(Math.max(limit, 1), 1000));
}

export function searchOperators(q: string, sort: SortId = "red", limit = 200): Operator[] {
  const needle = q.trim().toUpperCase();
  const ranked = rankOperators(sort, 1000);
  if (!needle) return ranked.slice(0, Math.min(Math.max(limit, 1), 1000));
  return ranked.filter((o) => o.name.toUpperCase().includes(needle)).slice(0, Math.min(Math.max(limit, 1), 1000));
}

export function searchBuildings(opts: {
  q?: string; operator_id?: string; sign?: string; ward?: string; limit?: number;
}) {
  const { q = "", operator_id = "", sign = "", ward = "" } = opts;
  const limit = Math.min(Math.max(opts.limit ?? 100, 1), 1000);
  const needle = q.trim().toUpperCase();
  const hits = buildings.filter((b) => {
    if (operator_id && b.operator_id !== operator_id) return false;
    if (sign && b.sign !== sign) return false;
    if (ward && b.ward !== ward) return false;
    if (needle && !b.address.toUpperCase().includes(needle)) return false;
    return true;
  });
  return { total: hits.length, limit, hits: hits.slice(0, limit) };
}
