import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SearchResult = {
    symbol: string;
    name: string;
    type: string;
    market: string;
    currency: string;
    currentPrice: number | null;
    fxRateKrw: number;
    priceSource: string;
};

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
        },
    });
}

function describeError(error: unknown) {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (typeof error === "string" && error.trim()) {
        return error;
    }
    if (error && typeof error === "object") {
        const parts = [
            (error as { message?: string }).message,
            (error as { error?: string }).error,
            (error as { details?: string }).details,
            (error as { hint?: string }).hint,
            (error as { code?: string }).code,
        ].filter((value): value is string => Boolean(value && String(value).trim()));
        if (parts.length) {
            return parts.join(" | ");
        }
        try {
            return JSON.stringify(error);
        } catch {
            return "Unexpected error";
        }
    }
    return "Unexpected error";
}

function normalizeFxRate(value: number | null | undefined): number | null {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return null;
    if (numeric > 500 && numeric < 3000) return numeric;
    if (numeric > 0 && numeric < 1) return 1 / numeric;
    return null;
}

function normalizeAppType(quote: any): string {
    const quoteType = String(quote?.quoteType || "").toUpperCase();
    if (quoteType.includes("CRYPTO")) return "crypto";
    if (quoteType === "ETF") return "etf";
    if (quoteType === "EQUITY") return "stock";
    if (quoteType === "MUTUALFUND" || quoteType === "MONEYMARKET") return "fund";
    return "";
}

function inferMarket(quote: any, type: string): string {
    const symbol = String(quote?.symbol || "").toUpperCase();
    const exchangeText = [
        quote?.exchange,
        quote?.exchDisp,
        quote?.exchangeDisplay,
    ]
        .filter(Boolean)
        .join(" ")
        .toUpperCase();

    if (type === "crypto") return "CRYPTO";
    if (symbol.endsWith(".KS") || symbol.endsWith(".KQ")) return "KRX";
    if (exchangeText.includes("KOSPI") || exchangeText.includes("KOSDAQ") || exchangeText.includes("KOREA") || exchangeText.includes("KSC")) {
        return "KRX";
    }
    if (exchangeText.includes("NASDAQ") || exchangeText.includes("NMS")) return "NASDAQ";
    if (exchangeText.includes("NYSE") || exchangeText.includes("NYQ")) return "NYSE";
    if (exchangeText.includes("AMEX") || exchangeText.includes("ASE") || exchangeText.includes("ARCX")) return "AMEX";
    return String(quote?.exchDisp || quote?.exchange || "UNKNOWN").toUpperCase();
}

function inferCurrency(quote: any, market: string): string {
    const currency = String(quote?.currency || "").toUpperCase();
    if (currency) return currency;
    if (market === "KRX") return "KRW";
    if (["NASDAQ", "NYSE", "AMEX", "CRYPTO"].includes(market)) return "USD";
    return "KRW";
}

function getDisplayName(quote: any): string {
    return String(quote?.shortname || quote?.longname || quote?.name || quote?.symbol || "").trim();
}

function getCurrentPrice(quote: any): number | null {
    const numeric = Number(quote?.regularMarketPrice ?? quote?.price ?? quote?.regularMarketPreviousClose ?? NaN);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

async function fetchYahooSearch(query: string) {
    const encoded = encodeURIComponent(query);
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encoded}&quotesCount=12&newsCount=0&listsCount=0&enableFuzzyQuery=true`;
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0",
            Accept: "application/json",
        },
    });
    if (!response.ok) {
        throw new Error(`Yahoo Finance search failed: ${response.status}`);
    }
    return response.json();
}

async function fetchUsdKrwRate() {
    for (const symbol of ["KRW=X", "USDKRW=X"]) {
        try {
            const response = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`,
                {
                    headers: {
                        "User-Agent": "Mozilla/5.0",
                        Accept: "application/json",
                    },
                }
            );
            if (!response.ok) continue;
            const payload = await response.json();
            const result = payload?.chart?.result?.[0];
            const rate = normalizeFxRate(
                result?.meta?.regularMarketPrice ??
                    result?.indicators?.quote?.[0]?.close?.slice(-1)?.[0] ??
                    null
            );
            if (rate != null) {
                return rate;
            }
        } catch {
            // Try the next fallback symbol.
        }
    }
    return 1;
}

function scoreResult(item: SearchResult, query: string) {
    const q = query.toUpperCase();
    let score = 0;
    if (item.symbol.toUpperCase() === q) score += 100;
    else if (item.symbol.toUpperCase().startsWith(q)) score += 60;
    if (item.name.toUpperCase().includes(q)) score += 20;
    if (item.market === "KRX") score += 8;
    if (item.market === "NASDAQ") score += 6;
    if (item.market === "NYSE") score += 5;
    if (item.market === "CRYPTO") score += 4;
    return score;
}

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
    }

    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
            return jsonResponse({ ok: false, error: "Missing Authorization header" }, 401);
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
        if (!supabaseUrl || !supabaseAnonKey) {
            return jsonResponse({ ok: false, error: "Supabase environment is not configured" }, 500);
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: authHeader,
                },
            },
        });

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
            return jsonResponse({ ok: false, error: "Unauthorized" }, 401);
        }

        const payload = await request.json().catch(() => ({}));
        const query = String(payload?.query || "").trim();
        const requestedType = String(payload?.type || "").trim();
        if (query.length < 2) {
            return jsonResponse({ ok: false, error: "검색어를 2글자 이상 입력해주세요." }, 400);
        }

        const searchPayload = await fetchYahooSearch(query);
        const rawQuotes = Array.isArray(searchPayload?.quotes) ? searchPayload.quotes : [];
        const results = rawQuotes
            .map((quote: any) => {
                const type = normalizeAppType(quote);
                if (!type || type === "fund") return null;
                const market = inferMarket(quote, type);
                const currency = inferCurrency(quote, market);
                return {
                    symbol: String(quote?.symbol || "").toUpperCase(),
                    name: getDisplayName(quote),
                    type,
                    market,
                    currency,
                    currentPrice: getCurrentPrice(quote),
                    fxRateKrw: currency === "USD" ? 0 : 1,
                    priceSource: "yahoo",
                };
            })
            .filter((item): item is SearchResult => Boolean(item && item.symbol))
            .filter((item) => (requestedType ? item.type === requestedType : true));

        const needsUsdRate = results.some((item) => item.currency === "USD");
        const usdKrwRate = needsUsdRate ? await fetchUsdKrwRate() : 1;
        results.forEach((item) => {
            item.fxRateKrw = item.currency === "USD" ? usdKrwRate : 1;
        });

        const deduped = Array.from(
            results.reduce((map, item) => {
                const key = `${item.symbol}::${item.market}`;
                if (!map.has(key)) {
                    map.set(key, item);
                }
                return map;
            }, new Map<string, SearchResult>()).values()
        )
            .sort((a, b) => scoreResult(b, query) - scoreResult(a, query))
            .slice(0, 8);

        return jsonResponse({ ok: true, results: deduped });
    } catch (error) {
        return jsonResponse({ ok: false, error: describeError(error) }, 500);
    }
});
