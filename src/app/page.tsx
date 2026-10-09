"use client";

import { useLang } from "@/i18n";
import { Banner, Nav, Footer } from "@/components/chrome";
import Ranking from "@/components/Ranking";
import BuildingMap from "@/components/BuildingMap";
import Methodology from "@/components/Methodology";
import Developers from "@/components/Developers";
import Downloads from "@/components/Downloads";

function Hero() {
  const { t } = useLang();
  return (
    <section id="top" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 pb-16 pt-16 md:pb-24 md:pt-24">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.hero.kicker}</p>
        <h1 className="display mt-5 max-w-[880px] text-[52px] md:text-[84px]">{t.hero.title}</h1>
        <p className="mt-6 max-w-[680px] text-[19px] leading-relaxed text-ink/70 md:text-[21px]">{t.hero.sub}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#ranking" className="rounded-full bg-canada px-7 py-3.5 text-[16px] font-semibold text-white hover:bg-canada-dark">
            {t.hero.cta1}
          </a>
          <a href="#methodology" className="rounded-full border border-line px-7 py-3.5 text-[16px] font-semibold hover:border-ink">
            {t.hero.cta2}
          </a>
        </div>
        <div className="mt-16 grid gap-px overflow-hidden rounded-[24px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {t.stats.map((s) => (
            <div key={s.value} className="bg-paper p-7">
              <p className="display text-[44px] text-canada">{s.value}</p>
              <p className="mt-2 text-[15px] leading-snug text-ink/65">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Caveats() {
  const { t } = useLang();
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 pb-20">
        <div className="rounded-[24px] border-2 border-canada/60 bg-paper-warm p-6 md:p-8">
          <h2 className="display text-[28px] md:text-[32px]">{t.caveats.title}</h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {t.caveats.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink/75">
                <span className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-canada" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function RankingSection() {
  const { t } = useLang();
  return (
    <section id="ranking" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.ranking.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.ranking.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-ink/70">{t.ranking.sub}</p>
        <div className="mt-10">
          <Ranking />
        </div>
      </div>
    </section>
  );
}

function MapSection() {
  const { t } = useLang();
  return (
    <section id="map" className="bg-paper-warm">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.map.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.map.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-ink/70">{t.map.sub}</p>
        <div className="mt-10">
          <BuildingMap />
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <>
      <Banner />
      <Nav />
      <main>
        <Hero />
        <Caveats />
        <RankingSection />
        <MapSection />
        <Methodology />
        <Developers />
        <Downloads />
      </main>
      <Footer />
    </>
  );
}
