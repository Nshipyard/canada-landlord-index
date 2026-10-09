"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/i18n";
import { operators, buildingsByOperator, cityAvg, type SortId, type Operator } from "@/lib/landlord";

function pct(x: number) {
  return `${(x * 100).toFixed(1)}%`;
}

function Sign({ sign }: { sign: string }) {
  const { t } = useLang();
  const label = sign === "red" ? t.drill.red : sign === "yellow" ? t.drill.yellow : t.drill.green;
  const cls =
    sign === "red"
      ? "bg-canada text-white"
      : sign === "yellow"
        ? "bg-[#d9a021] text-white"
        : "bg-[#2e7d4f] text-white";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${cls}`}>{label}</span>
  );
}

function Drilldown({ op, onClose }: { op: Operator; onClose: () => void }) {
  const { t } = useLang();
  const bs = useMemo(() => {
    const rows = [...(buildingsByOperator[op.id] ?? [])];
    rows.sort((a, b) => (a.score ?? 101) - (b.score ?? 101));
    return rows;
  }, [op.id]);
  return (
    <div className="mt-8 rounded-[24px] border border-line bg-paper-warm p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.drill.title}</p>
          <h3 className="display mt-2 text-[28px] md:text-[36px]">{op.name}</h3>
          <p className="mt-2 text-[15px] text-ink/65">
            {op.buildings} {t.drill.buildings} · {op.total_units?.toLocaleString("en-CA") ?? "–"} {t.drill.units} ·{" "}
            {t.drill.avgScore}: {op.avg_score?.toFixed(1) ?? "–"} ({t.drill.cityAvg}: {cityAvg.toFixed(1)}) ·{" "}
            {pct(op.share_red_yellow)} {t.drill.redYellow}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full border border-line px-5 py-2 text-[14px] font-semibold hover:border-ink"
        >
          {t.drill.back}
        </button>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-line text-[12px] uppercase tracking-wide text-ink/55">
              <th className="py-2.5 pr-4 font-semibold">{t.drill.cols.address}</th>
              <th className="py-2.5 pr-4 font-semibold">{t.drill.cols.ward}</th>
              <th className="py-2.5 pr-4 font-semibold">{t.drill.cols.units}</th>
              <th className="py-2.5 pr-4 font-semibold">{t.drill.cols.evaluated}</th>
              <th className="py-2.5 pr-4 font-semibold">{t.drill.cols.score}</th>
              <th className="py-2.5 font-semibold">{t.drill.cols.sign}</th>
            </tr>
          </thead>
          <tbody>
            {bs.map((b) => (
              <tr key={b.rsn} className="border-b border-line/60 last:border-0">
                <td className="py-2.5 pr-4 font-medium">{b.address}</td>
                <td className="py-2.5 pr-4 text-ink/65">{b.ward || "–"}</td>
                <td className="py-2.5 pr-4 text-ink/65">{b.units ?? "–"}</td>
                <td className="py-2.5 pr-4 text-ink/65">{b.evaluated_on ?? "–"}</td>
                <td className="py-2.5 pr-4 font-semibold">{b.score != null ? b.score.toFixed(1) : "–"}</td>
                <td className="py-2.5"><Sign sign={b.sign} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Ranking() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortId>("red");
  const [selected, setSelected] = useState<Operator | null>(null);
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => {
    const needle = q.trim().toUpperCase();
    const filtered = needle ? operators.filter((o) => o.name.toUpperCase().includes(needle)) : operators;
    const sorted = [...filtered];
    switch (sort) {
      case "red":
        sorted.sort((a, b) => b.red - a.red || b.share_red_yellow - a.share_red_yellow || b.buildings - a.buildings);
        break;
      case "share":
        sorted.sort((a, b) => b.share_red_yellow - a.share_red_yellow || b.red - a.red || (a.avg_score ?? 0) - (b.avg_score ?? 0));
        break;
      case "score":
        sorted.sort((a, b) => (a.avg_score ?? 100) - (b.avg_score ?? 100) || b.buildings - a.buildings);
        break;
      case "buildings":
        sorted.sort((a, b) => b.buildings - a.buildings || b.red - a.red);
        break;
    }
    return sorted;
  }, [q, sort]);

  const visible = expanded ? rows : rows.slice(0, 100);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.ranking.search}
          className="w-full max-w-[420px] rounded-full border border-line bg-paper px-5 py-3 text-[15px] outline-none placeholder:text-ink/40 focus:border-ink"
          aria-label={t.ranking.search}
        />
        <label className="flex items-center gap-3 text-[15px] font-medium text-ink/70">
          {t.ranking.sortLabel}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
            className="rounded-full border border-line bg-paper px-4 py-2.5 text-[15px] font-medium outline-none"
          >
            {t.ranking.sorts.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 text-[14px] text-ink/55">
        {t.ranking.showing} {visible.length} {t.ranking.of} {rows.length} {t.ranking.companies}
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 text-[16px] text-ink/60">{t.ranking.noResult}</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-[24px] border border-line">
          <table className="w-full min-w-[860px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-line bg-paper-warm text-[12px] uppercase tracking-wide text-ink/55">
                <th className="px-4 py-3 font-semibold">{t.ranking.cols.rank}</th>
                <th className="px-4 py-3 font-semibold">{t.ranking.cols.company}</th>
                <th className="px-4 py-3 text-right font-semibold">{t.ranking.cols.buildings}</th>
                <th className="px-4 py-3 text-right font-semibold">{t.ranking.cols.red}</th>
                <th className="px-4 py-3 text-right font-semibold">{t.ranking.cols.yellow}</th>
                <th className="px-4 py-3 text-right font-semibold">{t.ranking.cols.avg}</th>
                <th className="px-4 py-3 text-right font-semibold">{t.ranking.cols.units}</th>
                <th className="px-4 py-3 text-right font-semibold">{t.ranking.cols.share}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o, i) => (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="cursor-pointer border-b border-line/60 last:border-0 hover:bg-paper-warm"
                >
                  <td className="px-4 py-3 font-semibold text-ink/50">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{o.name}</td>
                  <td className="px-4 py-3 text-right">{o.buildings}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${o.red > 0 ? "text-canada" : "text-ink/50"}`}>{o.red}</td>
                  <td className="px-4 py-3 text-right">{o.yellow}</td>
                  <td className="px-4 py-3 text-right font-semibold">{o.avg_score?.toFixed(1) ?? "–"}</td>
                  <td className="px-4 py-3 text-right text-ink/65">{o.total_units?.toLocaleString("en-CA") ?? "–"}</td>
                  <td className="px-4 py-3 text-right font-semibold">{pct(o.share_red_yellow)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 100 && !q && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-6 rounded-full border border-line px-6 py-2.5 text-[15px] font-semibold hover:border-ink"
        >
          {expanded ? t.drill.back : `${t.ranking.showing} ${rows.length} ${t.ranking.companies}`}
        </button>
      )}

      <p className="mt-6 max-w-[760px] text-[13px] leading-relaxed text-ink/55">{t.ranking.unattributedNote}</p>

      {selected && <Drilldown op={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
