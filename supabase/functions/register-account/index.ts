import { createClient } from "npm:@supabase/supabase-js@2";

const AUTH_EMAIL_DOMAIN = "users.donggri.local";
const USERNAME_PATTERN = /^[a-z0-9_]{4,20}$/;
const SECURITY_QUESTION_KEYS = new Set([
    "nickname",
    "first_school",
    "first_pet",
    "favorite_food",
    "favorite_movie",
    "dream_job",
    "memorable_place",
    "treasured_item",
    "first_concert",
    "role_model",
]);

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

function ok(body: Record<string, unknown> = {}) {
    return jsonResponse({ ok: true, ...body });
}

function fail(error: string, status = 200) {
    return jsonResponse({ ok: false, error }, status);
}

function normalizeUsername(value: unknown) {
    return String(value || "").trim().toLowerCase();
}

function normalizeAnswer(value: unknown) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function makeAuthEmail(username: string) {
    return `${username}@${AUTH_EMAIL_DOMAIN}`;
}

function generateSalt() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashAnswer(answer: string, salt: string) {
    return sha256Hex(`${salt}:${normalizeAnswer(answer)}`);
}

function readConfig() {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.");
    }
    return { supabaseUrl, serviceRoleKey };
}

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return fail("Method not allowed", 405);
    }

    try {
        const { supabaseUrl, serviceRoleKey } = readConfig();
        const admin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        const payload = await request.json().catch(() => ({}));
        const username = normalizeUsername(payload.username);
        const password = String(payload.password || "");
        const questions = Array.isArray(payload.questions) ? payload.questions : [];

        if (!USERNAME_PATTERN.test(username)) {
            return fail("아이디는 영문 소문자, 숫자, 밑줄만 사용해서 4~20자로 입력해주세요.");
        }
        if (password.length < 8) {
            return fail("비밀번호는 8자 이상으로 입력해주세요.");
        }
        if (questions.length !== 3) {
            return fail("보안질문 3개를 모두 선택해주세요.");
        }

        const normalizedQuestions = questions.map((item: any, index: number) => ({
            order: index + 1,
            key: String(item?.key || ""),
            answer: String(item?.answer || ""),
        }));

        const uniqueKeys = new Set(normalizedQuestions.map((item) => item.key));
        if (uniqueKeys.size !== 3) {
            return fail("보안질문은 서로 다른 3개를 골라주세요.");
        }
        if (
            normalizedQuestions.some(
                (item) => !SECURITY_QUESTION_KEYS.has(item.key) || normalizeAnswer(item.answer).length < 2
            )
        ) {
            return fail("보안질문과 답변을 다시 확인해주세요.");
        }

        const { count, error: countError } = await admin
            .from("profiles")
            .select("id", { count: "exact", head: true });
        if (countError) {
            throw countError;
        }
        if ((count || 0) >= 50) {
            return fail("회원가입 가능 인원이 가득 찼습니다.");
        }

        const { data: existingProfile, error: existingError } = await admin
            .from("profiles")
            .select("id")
            .eq("username", username)
            .maybeSingle();
        if (existingError && existingError.code !== "PGRST116") {
            throw existingError;
        }
        if (existingProfile) {
            return fail("이미 사용 중인 아이디입니다.");
        }

        const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
            email: makeAuthEmail(username),
            password,
            email_confirm: true,
            user_metadata: {
                username,
            },
        });

        if (createError) {
            const message = String(createError.message || "");
            if (message.includes("already")) {
                return fail("이미 사용 중인 아이디입니다.");
            }
            if (message.includes("회원가입 가능 인원")) {
                return fail("회원가입 가능 인원이 가득 찼습니다.");
            }
            throw createError;
        }

        const userId = createdUser.user?.id;
        if (!userId) {
            return fail("회원가입 처리 중 사용자 ID를 만들지 못했습니다.");
        }

        const answerRows = [];
        for (const item of normalizedQuestions) {
            const salt = generateSalt();
            answerRows.push({
                user_id: userId,
                question_order: item.order,
                question_key: item.key,
                answer_salt: salt,
                answer_hash: await hashAnswer(item.answer, salt),
            });
        }

        const { error: answerError } = await admin.from("security_question_answers").upsert(answerRows);
        if (answerError) {
            await admin.auth.admin.deleteUser(userId);
            throw answerError;
        }

        return ok();
    } catch (error) {
        return jsonResponse(
            { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
            500
        );
    }
});
