const API_BASE = "/api";

export interface WebTextApi {
  _id: string;
  key: string;
  value: string;
  section: string;
  type: "text" | "textarea" | "markdown";
  locale: string;
}

export async function fetchWebTexts(section?: string, locale = "es"): Promise<WebTextApi[]> {
  const params = new URLSearchParams({ locale });
  if (section) {
    params.set("section", section);
  }

  const res = await fetch(`${API_BASE}/web-texts?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
  return res.json();
}
