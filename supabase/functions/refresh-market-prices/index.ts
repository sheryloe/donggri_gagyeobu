import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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

function normalizeSymbol(symbol: string, type: string) {
    const normalized = String(symbol || "").trim().toUpperCase();
    if (type === "crypto" && normalized && !normalized.includes("-")) {
        return `${normalized}-USD`;
    }
    return normalized;
}

function calculateRoi(quantity: number, averageBuyPrice: number, currentPrice: number) {
    const cost = Number(quantity || 0) * Number(averageBuyPrice || 0);
    if (cost <= 0) return 0;
    const value = Number(quantity || 0) * Number(currentPrice || 0);
    return ((value - cost) / cost) * 100;
}

function extractMarketQuote(payload: any): { price: number | null; currency: string } {
    const result = payload?.chart?.result?.[0];
    if (!result) return { price: null, currency: "" };

    const currency = String(result?.meta?.currency || "").toUpperCase();

    const price = result?.meta?.regularMarketPrice;
    if (price != null) return { price: Number(price), currency };

    const closes = result?.indicators?.quote?.[0]?.close || [];
    for (let index = closes.length - 1; index >= 0; index -= 1) {
        if (closes[index] != null) {
            return { price: Number(closes[index]), currency };
        }
    }
    return { price: null, currency };
}

async function fetchMarketQuote(symbol: string) {
    const encoded = encodeURIComponent(symbol);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1m&range=1d`;
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        },
    });
    if (!response.ok) {
        throw new Error(`Yahoo Finance request failed: ${response.status}`);
    }
    const payload = await response.json();
    return extractMarketQuote(payload);
}

async function fetchUsdKrwRate() {
    for (const symbol of ["KRW=X", "USDKRW=X"]) {
        try {
            const quote = await fetchMarketQuote(symbol);
            const rate = normalizeFxRate(quote.price);
            if (rate != null) {
                return rate;
            }
        } catch {
            // Try the next fallback symbol when Yahoo Finance rejects one of them.
        }
    }
    throw new Error("USD/KRW rate fetch failed");
}

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
            return jsonResponse({ error: "Missing Authorization header" }, 401);
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
        if (!supabaseUrl || !supabaseAnonKey) {
            return jsonResponse({ error: "Supabase environment is not configured" }, 500);
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
            return jsonResponse({ error: "Unauthorized" }, 401);
        }

        const { data: investments, error: investmentError } = await supabase
            .from("investments")
            .select("id, symbol, type, quantity, average_buy_price")
            .in("type", ["stock", "crypto", "etf"]);

        if (investmentError) {
            return jsonResponse({ error: investmentError.message }, 400);
        }

        let updated = 0;
        let usdKrwRate: number | null = null;
        for (const investment of investments || []) {
            try {
                const symbol = normalizeSymbol(investment.symbol, investment.type);
                const quote = await fetchMarketQuote(symbol);
                if (quote.price == null) continue;

                let marketPrice = Number(quote.price);
                if (quote.currency === "USD") {
                    usdKrwRate = usdKrwRate ?? await fetchUsdKrwRate();
                    marketPrice *= usdKrwRate;
                }

                const roi = calculateRoi(
                    Number(investment.quantity || 0),
                    Number(investment.average_buy_price || 0),
                    marketPrice
                );

                const { error: updateError } = await supabase
                    .from("investments")
                    .update({
                        current_price: marketPrice,
                        roi,
                        last_updated: new Date().toISOString(),
                    })
                    .eq("id", investment.id);

                if (!updateError) {
                    updated += 1;
                }
            } catch {
                // Skip symbols that fail to fetch so the rest of the batch can continue.
            }
        }

        return jsonResponse({
            ok: true,
            total: (investments || []).length,
            updated,
        });
    } catch (error) {
        return jsonResponse(
            { error: describeError(error) },
            500
        );
    }
});
