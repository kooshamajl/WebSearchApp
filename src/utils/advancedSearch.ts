export const ADVANCED_SEARCH_FIELDS = [
    { id: "all", name: "as_q", label: "All these words" },
    { id: "exact", name: "as_epq", label: "Exact word or phrase" },
    { id: "any", name: "as_oq", label: "Any of these words" },
    { id: "none", name: "as_eq", label: "None of these words" },
] as const;

type AdvancedSearchFieldName = (typeof ADVANCED_SEARCH_FIELDS)[number]["name"];
export type AdvancedSearchFields = Partial<Record<AdvancedSearchFieldName, string>>;

export function buildAdvancedSearchUrl(fields: AdvancedSearchFields): string | null {
    const params = new URLSearchParams();

    for (const { name } of ADVANCED_SEARCH_FIELDS) {
        const value = fields[name]?.trim();
        if (value) params.set(name, value);
    }

    return params.size > 0 ? `https://www.google.com/search?${params}` : null;
}
