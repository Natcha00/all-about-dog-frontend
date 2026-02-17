"use client";

import { ServiceRulesDTO } from "@/lib/walkin/walkin/mockServiceRules";
import React from "react";

export default function BoardingRulesTab({ data }: { data: ServiceRulesDTO }) {
  return <RulesContent data={data} />;
}

function RulesContent({ data }: { data: ServiceRulesDTO }) {
  return (
    <div className="text-sm leading-relaxed text-black/80 space-y-3">
      <Section title={data.title}>
        {data.intro.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </Section>

      <Section title="สรุปบริการ">
        <ul className="list-disc pl-5 space-y-1">
          {data.highlights.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </Section>

      {data.pricingTitle ? (
        <Section title={data.pricingTitle}>
          {data.pricingNote ? <p className="text-black/70">{data.pricingNote}</p> : null}

          <div className="mt-3 space-y-3">
            {(data.priceGroups ?? []).map((g, i) => (
              <div key={i} className="rounded-2xl ring-1 ring-black/10 bg-white p-3">
                <div className="font-extrabold text-gray-900">{g.priceLabel}</div>
                {g.description ? <div className="text-xs text-black/55 mt-0.5">{g.description}</div> : null}
                {g.breeds?.length ? (
                  <div className="mt-2 text-xs text-black/70 space-y-1">
                    {g.breeds.map((line, idx) => (
                      <div key={idx}>• {line}</div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {data.conditionsTitle ? (
        <Section title={data.conditionsTitle}>
          <ol className="list-decimal pl-5 space-y-1">
            {data.conditions
              .filter((x) => x.type === "number")
              .map((x, i) => (
                <li key={i}>{x.text}</li>
              ))}
          </ol>
        </Section>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-black/[0.03] ring-1 ring-black/5 p-4">
      <div className="font-extrabold text-gray-900 mb-2">{title}</div>
      {children}
    </div>
  );
}
