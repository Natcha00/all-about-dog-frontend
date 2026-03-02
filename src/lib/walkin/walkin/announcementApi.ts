import type { RuleLine, ServiceKey, ServiceRulesDTO } from "./mockServiceRules";

/** Raw shape from GET /offering/announcement */
export type AnnouncementContentItem = {
  priceLabel: string;
  description?: string | null;
  breeds?: string[];
};

export type AnnouncementServiceBlock = {
  title: string;
  intro: string[];
  highlights: string[];
  pricingTitle: string;
  pricingNote: string;
  contents: AnnouncementContentItem[];
  conditionTitle: string;
  conditions: string[];
};

export type AnnouncementApiResponse = {
  swimming: AnnouncementServiceBlock;
  boarding: AnnouncementServiceBlock;
};

function mapConditions(lines: string[]): RuleLine[] {
  return lines.map((text) => ({ type: "number" as const, text }));
}

function mapToServiceRulesDTO(
  key: ServiceKey,
  block: AnnouncementServiceBlock
): ServiceRulesDTO {
  return {
    key,
    title: block.title,
    intro: block.intro ?? [],
    highlights: block.highlights ?? [],
    pricingTitle: block.pricingTitle,
    pricingNote: block.pricingNote,
    priceGroups: (block.contents ?? []).map((c) => ({
      priceLabel: c.priceLabel,
      description: c.description ?? undefined,
      breeds: c.breeds ?? [],
    })),
    extraNotes: [],
    conditionsTitle: block.conditionTitle,
    conditions: mapConditions(block.conditions ?? []),
  };
}

export function mapAnnouncementToServiceRules(
  data: AnnouncementApiResponse
): Record<ServiceKey, ServiceRulesDTO> {
  return {
    swimming: mapToServiceRulesDTO("swimming", data.swimming),
    boarding: mapToServiceRulesDTO("boarding", data.boarding),
  };
}
