import { createClient } from "npm:@supabase/supabase-js@2";

const USERNAME_PATTERN = /^[a-z0-9_]{4,20}$/;
const RECOVERY_MAX_ATTEMPTS = 5;
const RECOVERY_LOCK_MINUTES = 30;

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

function getLockMinutes(lockedUntil: string) {
    const ms = new Date(lockedUntil).getTime() - Date.now();
    if (ms <= 0) return 0;
    return Math.max(1, Math.ceil(ms / 60000));
}

async function loadProfileAndQuestions(admin: any, username: string) {
    const { data: profile, error: profileError } = await admin
        .from("profiles")
        .select("id, username, recovery_failed_attempts, recovery_locked_until")
        .eq("username", username)
        .maybeSingle();
    if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
    }
    if (!profile) {
        return { profile: null, questions: [] };
    }

    const { data: questions, error: questionError } = await admin
        .from("security_question_answers")
        .select("question_order, question_key, answer_salt, answer_hash")
        .eq("user_id", profile.id)
        .order("question_order", { ascending: true });
    if (questionError) {
        throw questionError;
    }

    return {
        profile,
        questions: questions || [],
    };
}

async function recordFailure(admin: any, profileId: string, currentCount: number) {
    const nextCount = Number(currentCount || 0) + 1;
    if (nextCount >= RECOVERY_MAX_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + RECOVERY_LOCK_MINUTES * 60000).toISOString();
        const { error } = await admin
            .from("profiles")
            .update({
                recovery_failed_attempts: 0,
                recovery_locked_until: lockedUntil,
            })
            .eq("id", profileId);
        if (error) throw error;
        return fail(`답변 오류가 누적되어 ${RECOVERY_LOCK_MINUTES}분 동안 다시 시도할 수 없습니다.`);
    }

    const remaining = RECOVERY_MAX_ATTEMPTS - nextCount;
    const { error } = await admin
        .from("profiles")
        .update({
            recovery_failed_attempts: nextCount,
            recovery_locked_until: null,
        })
        .eq("id", profileId);
    if (error) throw error;
    return fail(`답변이 맞지 않습니다. ${remaining}번 더 틀리면 ${RECOVERY_LOCK_MINUTES}분 잠깁니다.`);
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
        const action = String(payload.action || "questions");
        const username = normalizeUsername(payload.username);

        if (!USERNAME_PATTERN.test(username)) {
            return fail("아이디 형식을 다시 확인해주세요.");
        }

        const { profile, questions } = await loadProfileAndQuestions(admin, username);
        if (!profile) {
            return fail("아이디를 찾지 못했습니다.");
        }
        if (!questions.length) {
            return fail("이 계정은 보안질문이 아직 설정되지 않았습니다.");
        }

        const lockedUntil = profile.recovery_locked_until;
        if (lockedUntil && new Date(lockedUntil).getTime() > Date.now()) {
            return fail(`현재 잠금 상태입니다. ${getLockMinutes(lockedUntil)}분 뒤에 다시 시도해주세요.`);
        }

        if (action === "questions") {
            return ok({
                questions: questions.map((item) => ({
                    order: item.question_order,
                    key: item.question_key,
                })),
            });
        }

        if (action !== "reset_password") {
            return fail("지원하지 않는 작업입니다.");
        }

        const newPassword = String(payload.newPassword || "");
        const answers = Array.isArray(payload.answers) ? payload.answers : [];
        if (newPassword.length < 8) {
            return fail("새 비밀번호는 8자 이상으로 입력해주세요.");
        }
        if (answers.length !== 3) {
            return fail("질문 3개 답변을 모두 입력해주세요.");
        }

        const answerMap = new Map<string, string>();
        answers.forEach((item: any) => {
            answerMap.set(String(item?.key || ""), String(item?.answer || ""));
        });

        let isMatch = true;
        for (const question of questions) {
            const rawAnswer = answerMap.get(question.question_key) || "";
            if (normalizeAnswer(rawAnswer).length < 2) {
                isMatch = false;
                break;
            }
            const hashed = await hashAnswer(rawAnswer, question.answer_salt);
            if (hashed !== question.answer_hash) {
                isMatch = false;
                break;
            }
        }

        if (!isMatch) {
            return await recordFailure(
                admin,
                profile.id,
                Number(profile.recovery_failed_attempts || 0)
            );
        }

        const { error: updatePasswordError } = await admin.auth.admin.updateUserById(profile.id, {
            password: newPassword,
        });
        if (updatePasswordError) {
            throw updatePasswordError;
        }

        const { error: resetCounterError } = await admin
            .from("profiles")
            .update({
                recovery_failed_attempts: 0,
                recovery_locked_until: null,
            })
            .eq("id", profile.id);
        if (resetCounterError) {
            throw resetCounterError;
        }

        return ok();
    } catch (error) {
        return jsonResponse(
            { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
            500
        );
    }
});
