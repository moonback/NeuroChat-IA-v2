// Recherche Web côté client avec fallback
// - Essaie d'abord Tavily si VITE_TAVILY_API_KEY est présent
// - Sinon, fallback DuckDuckGo Instant Answer API
// - Optionnellement, tente d'extraire le contenu via r.jina.ai pour des extraits plus riches

export type WebSearchResult = {
	title: string;
	url: string;
	snippet: string;
};

async function fetchJson(url: string, options?: RequestInit) {
	const res = await fetch(url, options);
	if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
	return res.json();
}

async function tryTavily(query: string, maxResults: number): Promise<WebSearchResult[]> {
	const apiKey = (import.meta as { env?: { VITE_TAVILY_API_KEY?: string } }).env?.VITE_TAVILY_API_KEY;
	if (!apiKey) return [];
	try {
		const res = await fetch('https://api.tavily.com/search', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				api_key: apiKey,
				query,
				search_depth: 'advanced',
				max_results: Math.max(1, Math.min(10, maxResults)),
				include_answer: false,
				include_raw_content: true,
			}),
		});
		if (!res.ok) throw new Error(`Tavily HTTP ${res.status}`);
		const data = await res.json();
		const items: Array<{ title?: string; url?: string; content?: string; snippet?: string }> = Array.isArray(data?.results) ? data.results : [];
		return items.map((r) => ({
			title: String(r.title || 'Résultat web'),
			url: String(r.url || ''),
			snippet: String(r.content || r.snippet || '').slice(0, 500),
		}));
	} catch {
		return [];
	}
}

	async function tryDuckDuckGo(query: string, maxResults: number): Promise<WebSearchResult[]> {
	try {
		// CORS: utiliser un proxy en lecture seule qui renvoie des en-têtes permissifs
		const url = `https://r.jina.ai/http://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
		const data = await fetchJson(url);
		const results: WebSearchResult[] = [];
		if (data?.AbstractText && data?.AbstractURL) {
			results.push({ title: data.Heading || 'DuckDuckGo', url: data.AbstractURL, snippet: data.AbstractText });
		}
		const topics: Array<{ Topics?: Array<{ FirstURL?: string; Text?: string }>; FirstURL?: string; Text?: string }> = Array.isArray(data?.RelatedTopics) ? data.RelatedTopics : [];
		for (const t of topics) {
			if (Array.isArray(t?.Topics)) {
				for (const sub of t.Topics) {
					if (sub?.FirstURL && sub?.Text) {
						results.push({ title: String(sub.Text).split(' - ')[0] || 'Résultat', url: sub.FirstURL, snippet: String(sub.Text) });
					}
					if (results.length >= maxResults) break;
				}
			} else if (t?.FirstURL && t?.Text) {
				results.push({ title: String(t.Text).split(' - ')[0] || 'Résultat', url: t.FirstURL, snippet: String(t.Text) });
			}
			if (results.length >= maxResults) break;
		}
		return results.slice(0, maxResults);
	} catch {
		return [];
	}
}

const BLOCKED_HOSTS = [
	'britannica.com',
	'linkedin.com',
	'facebook.com',
	'instagram.com',
	'x.com',
	'twitter.com',
	'tiktok.com',
	'bloomberg.com',
	'esil-events.fr',
];

async function enrichWithReader(results: WebSearchResult[], maxToFetch = 2): Promise<WebSearchResult[]> {
	const limited = results.slice(0, maxToFetch);
	const enriched = await Promise.all(limited.map(async (r) => {
		try {
			// Skip hosts frequently returning 4xx to readers
			let host = '';
			try { host = new URL(r.url).hostname.replace(/^www\./, ''); } catch {
				// Ignore URL parsing errors
			}
			if (BLOCKED_HOSTS.some(h => host.endsWith(h))) return r;
			// r.jina.ai récupère un extrait lisible de la page (CORS friendly)
			const originalScheme = r.url.startsWith('https://') ? 'https://' : 'http://';
			const withoutScheme = r.url.replace(/^https?:\/\//, '');
			const readerUrl = `https://r.jina.ai/${originalScheme}${withoutScheme}`;
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), 3500);
			const res = await fetch(readerUrl, { method: 'GET', signal: controller.signal });
			clearTimeout(timer);
			if (res.ok) {
				const text = await res.text();
				if (text && text.length > 0) {
					return { ...r, snippet: text.slice(0, 1200) };
				}
			}
		} catch {
			return results;
		}
		return r;
	}));
	// Concat enriched for first N with the rest unchanged
	return [...enriched, ...results.slice(maxToFetch)];
}

export async function searchWeb(query: string, maxResults = 5, options?: { enrich?: boolean }): Promise<WebSearchResult[]> {
	if (!query) return [];
	// 1) Tavily si dispo
	let results = await tryTavily(query, maxResults);
	// 2) Fallback DuckDuckGo
	if (results.length === 0) {
		results = await tryDuckDuckGo(query, maxResults);
	}
	// 3) Enrichissement facultatif (extraits plus longs)
	if ((options?.enrich ?? false) && results.length > 0) {
		try {
			results = await enrichWithReader(results, Math.min(2, maxResults));
		} catch {
			return results;
		}
	}
	return results.slice(0, maxResults);
}


