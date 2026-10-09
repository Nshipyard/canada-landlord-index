"use client";

import { useEffect, useRef } from "react";
import { useLang } from "@/i18n";
import { buildings } from "@/lib/landlord";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

const COLOR: Record<string, string> = { red: "#d80621", yellow: "#d9a021", green: "#2e7d4f" };
const SIGN_ORDER = ["green", "yellow", "red"];

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export default function BuildingMap() {
  const { t, lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: LeafletMap | null = null;
    let cancelled = false;
    (async () => {
      const mod = (await import("leaflet")) as unknown as { default?: typeof import("leaflet") } & typeof import("leaflet");
      const L = mod.default ?? (mod as unknown as typeof import("leaflet"));
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, { preferCanvas: true }).setView([43.7, -79.38], 11);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const pts = buildings
        .filter((b) => b.lat != null && b.lon != null)
        .sort((a, b) => SIGN_ORDER.indexOf(a.sign) - SIGN_ORDER.indexOf(b.sign));

      for (const b of pts) {
        const c = COLOR[b.sign] ?? "#2e7d4f";
        const m = L.circleMarker([Number(b.lat), Number(b.lon)], {
          radius: b.sign === "red" ? 5 : 3.5,
          color: c,
          fillColor: c,
          fillOpacity: b.sign === "green" ? 0.5 : 0.95,
          weight: 1,
          opacity: 0.9,
        });
        const op = b.operator_name ? `<br/>${esc(t.map.operator)}: ${esc(b.operator_name)}` : "";
        const signLabel: string = b.sign === "green" ? t.map.green : b.sign === "yellow" ? t.map.yellow : b.sign === "red" ? t.map.red : b.sign;
        m.bindPopup(
          `<div style="font-family:Inter,system-ui,sans-serif;font-size:13px;line-height:1.5">` +
            `<strong>${esc(b.address)}</strong><br/>` +
            `${esc(t.drill.cols.score)}: ${b.score != null ? b.score.toFixed(1) : "–"} · ${esc(signLabel)}` +
            `${op}</div>`
        );
        m.addTo(map);
      }
    })();
    return () => {
      cancelled = true;
      if (map) map.remove();
      map = null;
    };
  }, [lang, t]);

  const plotted = buildings.filter((b) => b.lat != null && b.lon != null).length;

  return (
    <div>
      <div className="overflow-hidden rounded-[24px] border border-line bg-paper-warm">
        <div ref={ref} className="z-0 h-[560px] w-full md:h-[680px]" role="img" aria-label={t.map.title} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-5 text-[14px] font-medium text-ink/70">
        <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-[#2e7d4f]" />{t.map.green}</span>
        <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-[#d9a021]" />{t.map.yellow}</span>
        <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-canada" />{t.map.red}</span>
        <span className="text-ink/50">{plotted.toLocaleString("en-CA")} {t.map.buildings}</span>
      </div>
    </div>
  );
}
