"use client";

import { useLang } from "@/i18n";

export default function Downloads() {
  const { t } = useLang();
  return (
    <section id="data" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.downloads.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.downloads.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-ink/70">{t.downloads.body}</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {t.downloads.files.map((f) => (
            <div key={f.name} className="flex items-center justify-between gap-4 rounded-[24px] border border-line p-6">
              <div>
                <p className="font-mono text-[14px] font-semibold">{f.name}</p>
                <p className="mt-1 text-[14px] text-ink/60">{f.desc}</p>
              </div>
              <a
                href={`/data/${f.name}`}
                download
                className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-canada"
              >
                {t.downloads.download}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
