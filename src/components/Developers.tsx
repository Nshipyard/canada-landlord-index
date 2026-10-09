"use client";

import { useLang } from "@/i18n";
import McpConnect from "./McpConnect";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/operators?q=greenwin&sort=red&limit=5",
    desc: "Search 831 ranked operators; sort by red, share, score, or buildings",
    response: `{
  "q": "greenwin", "total": 3,
  "hits": [ {
    "name": "GREENWIN INC.", "buildings": 42,
    "red": 0, "yellow": 5, "avg_score": 88.1,
    "share_red_yellow": 0.119
  } ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/buildings?operator_id=OP0001&limit=3",
    desc: "Per-building records: score, door sign, address, ward, units",
    response: `{
  "total": 38, "limit": 3,
  "hits": [ {
    "rsn": 4153437, "address": "181-183 GERRARD ST E",
    "score": 91.2, "sign": "green",
    "operator_name": "LANDLORD PROPERTY & RENTAL MANAGEMENT INC"
  } ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/summary",
    desc: "Vintages, join counts, blank-name counts, and build notes",
    response: `{ "eval_vintage": "2026-10-08",
  "registration_vintage": "2026-07-05",
  "buildings_in_index": 3593,
  "operators": 831,
  "blank_operator_name_rows": 473 }`,
  },
];

export default function Developers() {
  const { t } = useLang();
  return (
    <section id="developers" className="bg-ink text-white">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.developers.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-white/70">{t.developers.body}</p>

        <h3 className="mt-14 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.endpoints}</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {endpoints.map((e) => (
            <article key={e.path} className="flex min-w-0 flex-col rounded-[24px] border border-white/15 bg-white/5 p-6">
              <p className="font-mono text-[12px] font-semibold text-white/60">{e.method}</p>
              <code className="mt-1 break-all font-mono text-[13px] text-white">{e.path}</code>
              <p className="mt-2 text-[14px] text-white/65">{e.desc}</p>
              <pre className="mt-4 flex-1 overflow-x-auto rounded-[16px] bg-black/40 p-4 font-mono text-[12px] leading-relaxed text-white/80">
                {e.response}
              </pre>
              <a
                href={e.path}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block self-start rounded-full border border-white/25 px-5 py-2 text-[14px] font-semibold hover:border-white"
              >
                {t.developers.tryIt} →
              </a>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-[24px] border border-white/15 bg-white/5 p-6 md:p-8">
          <h3 className="display text-[28px]">{t.developers.mcpTitle}</h3>
          <p className="mt-2 max-w-[640px] text-[15px] text-white/65">{t.developers.mcpBody}</p>
          <div className="mt-6">
            <McpConnect
              config={{
                slug: "canada-landlord-index",
                displayName: "Landlord Operator Index",
                exampleEn: "Rank the property management companies with the most red-rated buildings",
                exampleFr: "Classe les sociétés de gestion avec le plus d'immeubles notés rouge",
              }}
            />
          </div>
        </div>

        <a
          href="/api/openapi.json"
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-block rounded-full border border-white/25 px-6 py-3 text-[15px] font-semibold hover:border-white"
        >
          {t.developers.openapi} →
        </a>
      </div>
    </section>
  );
}
