"use client";

import { useMemo } from "react";
import { useLang } from "@/i18n";
import { buildings } from "@/lib/landlord";

const W = 1200;
const H = 760;

export default function BuildingMap() {
  const { t } = useLang();
  const dots = useMemo(() => {
    const pts = buildings.filter((b) => b.lat != null && b.lon != null);
    const lats = pts.map((b) => Number(b.lat));
    const lons = pts.map((b) => Number(b.lon));
    const latMin = Math.min(...lats), latMax = Math.max(...lats);
    const lonMin = Math.min(...lons), lonMax = Math.max(...lons);
    const order = { green: 0, yellow: 1, red: 2, unknown: -1 } as Record<string, number>;
    const sorted = [...pts].sort((a, b) => order[a.sign] - order[b.sign]);
    return sorted.map((b) => ({
      x: ((Number(b.lon) - lonMin) / (lonMax - lonMin)) * W,
      y: H - ((Number(b.lat) - latMin) / (latMax - latMin)) * H,
      sign: b.sign,
      key: b.rsn,
    }));
  }, []);

  const color = (s: string) => (s === "red" ? "#d80621" : s === "yellow" ? "#d9a021" : "#2e7d4f");
  const r = (s: string) => (s === "red" ? 4.5 : 3);

  return (
    <div>
      <div className="overflow-hidden rounded-[24px] border border-line bg-paper-warm">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={t.map.title}>
          {dots.map((d) => (
            <circle key={d.key} cx={d.x} cy={d.y} r={r(d.sign)} fill={color(d.sign)} opacity={d.sign === "green" ? 0.35 : 0.9} />
          ))}
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-5 text-[14px] font-medium text-ink/70">
        <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-[#2e7d4f]" />{t.map.green}</span>
        <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-[#d9a021]" />{t.map.yellow}</span>
        <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-canada" />{t.map.red}</span>
        <span className="text-ink/50">{dots.length.toLocaleString("en-CA")} {t.map.buildings}</span>
      </div>
    </div>
  );
}
