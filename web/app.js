const APP_STORAGE_KEYS = {
    activeTab: "UL_ACTIVE_TAB",
};

const DEFAULT_CATEGORIES = {
    expense: ["식비", "교통", "주거", "통신", "의료", "할부", "기타"],
    income: ["월급", "상여", "부수입"],
    investment: ["주식", "코인", "예적금"],
    fixed: ["고정지출"],
};

const AUTH_EMAIL_DOMAIN = "users.donggri.local";
const USERNAME_PATTERN = /^[a-z0-9_]{4,20}$/;
const RECOVERY_MAX_ATTEMPTS = 5;
const RECOVERY_LOCK_MINUTES = 30;
const SECURITY_QUESTION_OPTIONS = [
    { key: "nickname", label: "어릴 때 자주 불리던 별명은?" },
    { key: "first_school", label: "가장 기억에 남는 초등학교 이름은?" },
    { key: "first_pet", label: "처음 키운 반려동물 이름은?" },
    { key: "favorite_food", label: "지금도 자주 찾는 음식은?" },
    { key: "favorite_movie", label: "가장 여러 번 본 영화 제목은?" },
    { key: "dream_job", label: "어릴 때 되고 싶었던 직업은?" },
    { key: "memorable_place", label: "다시 가고 싶은 여행지 또는 도시 이름은?" },
    { key: "treasured_item", label: "잃어버리면 가장 먼저 떠오를 물건은?" },
    { key: "first_concert", label: "처음 갔던 공연이나 축제 이름은?" },
    { key: "role_model", label: "학창 시절 가장 좋아했던 인물은?" },
];
const SECURITY_QUESTION_MAP = Object.fromEntries(
    SECURITY_QUESTION_OPTIONS.map((item) => [item.key, item.label])
);
function cloneDefaultData() {
    return {
        assets: [],
        categories: Object.fromEntries(
            Object.entries(DEFAULT_CATEGORIES).map(([key, values]) => [key, [...values]])
        ),
        categoryItems: [],
        transactions: [],
        fixed: [],
        budgets: {},
        investments: [],
    };
}

function getTodayIso() {
    return new Date().toISOString().slice(0, 10);
}

function parseSupabaseError(error, fallback = "요청 실패") {
    if (!error) return fallback;
    if (typeof error === "string" && error.trim()) return error.trim();
    const message =
        error.message ||
        error.error_description ||
        error.details ||
        error.hint ||
        error.msg;
    return typeof message === "string" && message.trim() ? message.trim() : fallback;
}

function getAppConfig() {
    const cfg = window.APP_CONFIG || {};
    return {
        supabaseUrl: cfg.SUPABASE_URL || "",
        supabaseAnonKey: cfg.SUPABASE_ANON_KEY || "",
        appName: cfg.APP_NAME || "Donggri Ledger",
    };
}

function ensureSupabase() {
    if (supabaseClient) return supabaseClient;
    const config = getAppConfig();
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
        throw new Error("Supabase 라이브러리를 불러오지 못했습니다.");
    }
    if (
        !config.supabaseUrl ||
        !config.supabaseAnonKey ||
        config.supabaseUrl.includes("YOUR_SUPABASE_URL") ||
        config.supabaseAnonKey.includes("YOUR_SUPABASE_ANON_KEY")
    ) {
        throw new Error("Supabase 설정값이 비어 있습니다. app-config.js를 먼저 설정해주세요.");
    }

    supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });
    return supabaseClient;
}

function getCurrentUserId() {
    return currentSession?.user?.id || null;
}

function computeIsSettled(tx) {
    return (tx.paymentMethod || "asset") === "card" && Boolean(tx.settlementDate) && tx.settlementDate <= getTodayIso();
}

function normalizeSnapshotData(loaded) {
    const snapshot = cloneDefaultData();
    if (!loaded || typeof loaded !== "object") return snapshot;

    snapshot.assets = Array.isArray(loaded.assets)
        ? loaded.assets.map((asset) => ({
            ...asset,
            id: Number(asset.id),
            baseBalance: Number(asset.baseBalance ?? asset.balance ?? 0),
            balance: Number(asset.balance ?? asset.baseBalance ?? 0),
            cardSettlementDay: asset.cardSettlementDay ? Number(asset.cardSettlementDay) : null,
            cardSettlementAssetId: asset.cardSettlementAssetId ? Number(asset.cardSettlementAssetId) : null,
        }))
        : [];

    snapshot.transactions = Array.isArray(loaded.transactions)
        ? loaded.transactions.map((tx) => ({
            ...tx,
            id: Number(tx.id),
            assetId: Number(tx.assetId ?? tx.asset_id),
            paymentMethod: tx.paymentMethod || tx.payment_method || "asset",
            cardAssetId: tx.cardAssetId ?? tx.card_asset_id ?? null,
            settlementDate: tx.settlementDate || tx.settlement_date || "",
            isSettled: Boolean(tx.isSettled ?? tx.is_settled ?? computeIsSettled(tx)),
            amount: Number(tx.amount || 0),
            desc: tx.desc ?? tx.description ?? "",
        }))
        : [];

    snapshot.fixed = Array.isArray(loaded.fixed)
        ? loaded.fixed.map((item) => ({
            ...item,
            id: Number(item.id),
            assetId: item.assetId ? Number(item.assetId) : Number(item.asset_id || 0) || null,
            amount: Number(item.amount || 0),
            start: item.start || item.start_month || "",
            end: item.end || item.end_month || "",
            desc: item.desc ?? item.description ?? "",
        }))
        : [];

    snapshot.investments = Array.isArray(loaded.investments)
        ? loaded.investments.map((item) => ({
            ...item,
            id: Number(item.id),
            assetId: Number(item.assetId ?? item.asset_id),
            quantity: Number(item.quantity || 0),
            averageBuyPrice: Number(item.averageBuyPrice ?? item.average_buy_price ?? 0),
            currentPrice: Number(item.currentPrice ?? item.current_price ?? 0),
            roi: Number(item.roi || 0),
            createdAt: item.createdAt || item.created_at || null,
            lastUpdated: item.lastUpdated || item.last_updated || null,
        }))
        : [];

    snapshot.budgets = loaded.budgets && typeof loaded.budgets === "object"
        ? Object.fromEntries(
            Object.entries(loaded.budgets).map(([key, value]) => [key, Number(value || 0)])
        )
        : {};

    if (Array.isArray(loaded.categoryItems)) {
        snapshot.categoryItems = loaded.categoryItems.map((item) => ({
            id: Number(item.id),
            type: item.type,
            name: item.name,
            sort_order: Number(item.sort_order || 0),
            is_active: item.is_active ?? true,
        }));
        snapshot.categories = { expense: [], income: [], investment: [], fixed: [] };
        snapshot.categoryItems.forEach((item) => {
            if (!snapshot.categories[item.type]) snapshot.categories[item.type] = [];
            snapshot.categories[item.type].push(item.name);
        });
    } else if (loaded.categories && typeof loaded.categories === "object") {
        snapshot.categories = { expense: [], income: [], investment: [], fixed: [] };
        Object.entries(loaded.categories).forEach(([type, values]) => {
            if (!Array.isArray(values)) return;
            snapshot.categories[type] = values.map((name) => String(name));
        });
        snapshot.categoryItems = Object.entries(snapshot.categories).flatMap(([type, values], index) =>
            values.map((name, valueIndex) => ({
                id: index * 1000 + valueIndex + 1,
                type,
                name,
                sort_order: valueIndex,
                is_active: true,
            }))
        );
    }

    return snapshot;
}

let db = cloneDefaultData();
let supabaseClient = null;
let currentSession = null;
let currentProfile = null;
let registrationSlotsRemaining = null;
let authMode = "login";
let recoveryQuestions = [];
let recoveryUsername = "";
let editingTxId = null;
    let currDate = new Date();
    let charts = { pie: null, line: null };
    let investmentAutoRefreshTimer = null;

    const CASH_ASSET_TYPES = new Set(["cash", "bank"]);
    const LIVE_INVEST_TYPES = new Set(["stock", "crypto", "etf"]);
    const ASSET_TYPE_LABELS = {
        bank: "은행",
        cash: "현금",
        card: "카드",
        investment: "투자계좌",
    };

    function fmtCurrency(v) {
        return `${Math.round(Number(v || 0)).toLocaleString()}원`;
    }

    function fmtNumber(v, maxFraction = 2) {
        return Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: maxFraction });
    }

    function getMonthKey(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, "0");
        return `${y}-${m}`;
    }

    function normalizeCurrDateForLedger() {
        if (!(currDate instanceof Date) || Number.isNaN(currDate.getTime())) {
            currDate = new Date();
        }
        if (!Array.isArray(db.transactions) || db.transactions.length === 0) return;

        const monthKey = getMonthKey(currDate);
        const hasTxInMonth = db.transactions.some(t => (t.date || "").startsWith(monthKey));
        if (hasTxInMonth) return;

        // If current month has no rows, jump to latest transaction month.
        const latestDate = db.transactions
            .map(t => t.date)
            .filter(Boolean)
            .sort()
            .slice(-1)[0];

        if (!latestDate) return;
        const d = new Date(`${latestDate}T12:00:00`);
        if (!Number.isNaN(d.getTime())) {
            currDate = d;
        }
    }

    function assetTypeLabel(type) {
        return ASSET_TYPE_LABELS[type] || "기타";
    }

    function assetTypeClass(type) {
        if (["cash", "card", "investment"].includes(type)) return type;
        return "bank";
    }

    function isCashAsset(asset) {
        return CASH_ASSET_TYPES.has((asset.type || "bank").toLowerCase());
    }

    function monthInRange(monthStr, startMonth, endMonth) {
        if (!startMonth) return false;
        if (monthStr < startMonth) return false;
        if (endMonth && monthStr > endMonth) return false;
        return true;
    }

    function calcPendingFixedExpense(monthStr) {
        return db.fixed.reduce((acc, f) => {
            if (!monthInRange(monthStr, f.start, f.end)) return acc;

            const paid = db.transactions.some((t) => {
                return (
                    t.type === "expense" &&
                    t.date.startsWith(monthStr) &&
                    (t.category || "") === (f.category || "") &&
                    (t.desc || "").trim() === (f.desc || "").trim() &&
                    Number(t.amount || 0) === Number(f.amount || 0)
                );
            });

            return acc + (paid ? 0 : Number(f.amount || 0));
        }, 0);
    }

    function calcCashBalance() {
        return db.assets.reduce((sum, asset) => {
            if (!isCashAsset(asset)) return sum;
            return sum + Number(asset.balance || 0);
        }, 0);
    }

    function calcCardDueByMonth(monthStr) {
        return db.transactions.reduce((sum, t) => {
            if ((t.paymentMethod || "asset") !== "card") return sum;
            if (t.isSettled) return sum;
            if (!(t.settlementDate || "").startsWith(monthStr)) return sum;
            return sum + Number(t.amount || 0);
        }, 0);
    }

    function calcCardDueByCard(monthStr) {
        const bucket = {};
        db.transactions.forEach((t) => {
            if ((t.paymentMethod || "asset") !== "card") return;
            if (t.isSettled) return;
            if (!(t.settlementDate || "").startsWith(monthStr)) return;
            const cardKey = String(t.cardAssetId || 0);
            bucket[cardKey] = (bucket[cardKey] || 0) + Number(t.amount || 0);
        });
        return bucket;
    }

    function calcCardSettlementDate(txDate, settlementDay) {
        const base = new Date(`${txDate}T12:00:00`);
        if (Number.isNaN(base.getTime())) return "";

        let year = base.getFullYear();
        let month = base.getMonth() + 1; // next month
        if (month > 11) {
            year += 1;
            month = 0;
        }
        const lastDay = new Date(year, month + 1, 0).getDate();
        const day = Math.max(1, Math.min(Number(settlementDay || 1), lastDay));
        const d = new Date(year, month, day);
        return d.toISOString().slice(0, 10);
    }

    function updateAssetFormControls() {
        const type = document.getElementById("a-type")?.value || "bank";
        const dayWrap = document.getElementById("a-card-day-wrap");
        const settleWrap = document.getElementById("a-card-settle-wrap");
        const settleSel = document.getElementById("a-card-settle-asset");
        if (!dayWrap || !settleWrap || !settleSel) return;

        const isCard = type === "card";
        dayWrap.style.display = isCard ? "flex" : "none";
        settleWrap.style.display = isCard ? "flex" : "none";

        const oldVal = settleSel.value;
        settleSel.innerHTML = "";
        db.assets
            .filter(a => ["cash", "bank"].includes((a.type || "").toLowerCase()))
            .forEach((a) => {
                const opt = document.createElement("option");
                opt.value = a.id;
                opt.innerText = `${a.name} (${assetTypeLabel(a.type)})`;
                settleSel.appendChild(opt);
            });
        if (oldVal && Array.from(settleSel.options).some(o => o.value === oldVal)) {
            settleSel.value = oldVal;
        }
    }

    function formatDateTime(ts) {
        if (!ts) return "-";
        const d = new Date(ts);
        if (Number.isNaN(d.getTime())) return "-";
        const yy = String(d.getFullYear()).slice(2);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");
        return `${yy}.${mm}.${dd} ${hh}:${mi}`;
    }

    function setTxEditMode(on) {
        const submitBtn = document.getElementById("t-submit-btn");
        const cancelBtn = document.getElementById("t-cancel-btn");
        if (!submitBtn || !cancelBtn) return;

        if (on) {
            submitBtn.innerText = "수정 저장";
            cancelBtn.style.display = "inline-block";
        } else {
            submitBtn.innerText = "입력";
            cancelBtn.style.display = "none";
        }
    }

    function clearTxForm() {
        const baseDate = (!(currDate instanceof Date) || Number.isNaN(currDate.getTime())) ? new Date() : currDate;
        document.getElementById('t-date').valueAsDate = baseDate;
        document.getElementById('t-type').value = "expense";
        document.getElementById('t-asset-label').innerText = "자산";
        updateCatSelect();
        document.getElementById('t-desc').value = "";
        document.getElementById('t-amt').value = "";
    }

    function cancelEditTransaction() {
        editingTxId = null;
        setTxEditMode(false);
        clearTxForm();
        showToast("수정 취소");
    }

    function updateInvestmentPriceField() {
        const type = document.getElementById("i-type")?.value || "stock";
        const wrap = document.getElementById("i-current-wrap");
        const help = document.getElementById("i-help");
        if (!wrap || !help) return;

        if (type === "fund") {
            wrap.style.display = "flex";
            help.innerText = "펀드는 현재가를 수동 입력해서 관리합니다.";
        } else {
            wrap.style.display = "none";
            help.innerText = "주식/코인/ETF는 실시간 가격을 연동합니다. 펀드는 수동 업데이트 방식입니다.";
        }
    }

    function startInvestmentAutoRefresh() {
        stopInvestmentAutoRefresh();
        investmentAutoRefreshTimer = setInterval(() => {
            if (getActiveTabId() === "investment") refreshInvestmentPrices(false);
        }, 60000);
    }

    function stopInvestmentAutoRefresh() {
        if (investmentAutoRefreshTimer) {
            clearInterval(investmentAutoRefreshTimer);
            investmentAutoRefreshTimer = null;
        }
    }


function setAppShellVisible(visible) {
    const appShell = document.getElementById("app-shell");
    if (!appShell) return;
    appShell.hidden = !visible;
}

function setAuthShellVisible(visible) {
    const authShell = document.getElementById("auth-shell");
    if (!authShell) return;
    authShell.hidden = !visible;
}

function normalizeUsername(value) {
    return String(value || "").trim().toLowerCase();
}

function buildSyntheticEmail(username) {
    const normalized = normalizeUsername(username);
    return normalized ? `${normalized}@${AUTH_EMAIL_DOMAIN}` : "";
}

function normalizeSecurityAnswer(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function getQuestionLabel(questionKey) {
    return SECURITY_QUESTION_MAP[questionKey] || questionKey;
}

function getSessionUsername() {
    const metadataUsername = normalizeUsername(currentSession?.user?.user_metadata?.username);
    if (metadataUsername) return metadataUsername;
    const email = currentSession?.user?.email || "";
    return normalizeUsername(email.split("@")[0] || "");
}

function renderQuestionBank() {
    const list = document.getElementById("signup-question-bank");
    if (!list) return;
    list.innerHTML = SECURITY_QUESTION_OPTIONS
        .map((item, index) => `<li><strong>${index + 1}.</strong> ${item.label}</li>`)
        .join("");
}

function buildQuestionSelectOptions(placeholder = "질문 선택") {
    const options = [`<option value="">${placeholder}</option>`];
    SECURITY_QUESTION_OPTIONS.forEach((item) => {
        options.push(`<option value="${item.key}">${item.label}</option>`);
    });
    return options.join("");
}

function populateSignupQuestionSelectors() {
    document.querySelectorAll("[data-signup-question-select]").forEach((select) => {
        const currentValue = select.value || "";
        select.innerHTML = buildQuestionSelectOptions();
        if (currentValue && SECURITY_QUESTION_MAP[currentValue]) {
            select.value = currentValue;
        }
    });
}

function collectSignupQuestionAnswers() {
    const rows = [];
    document.querySelectorAll("[data-signup-question-row]").forEach((row, index) => {
        const select = row.querySelector("[data-signup-question-select]");
        const answerInput = row.querySelector("[data-signup-question-answer]");
        rows.push({
            key: select?.value || "",
            answer: answerInput?.value || "",
            order: index + 1,
        });
    });
    return rows;
}

function resetSignupForm() {
    document.getElementById("signup-form")?.reset();
    populateSignupQuestionSelectors();
}

function setRecoveryQuestions(questions) {
    recoveryQuestions = Array.isArray(questions) ? questions : [];
    const container = document.getElementById("recovery-question-list");
    const wrap = document.getElementById("recovery-question-wrap");
    if (!container || !wrap) return;

    if (!recoveryQuestions.length) {
        container.innerHTML = "";
        wrap.hidden = true;
        return;
    }

    container.innerHTML = recoveryQuestions
        .map(
            (question) => `
                <div class="auth-question-card">
                    <div class="auth-question-number">질문 ${question.order}</div>
                    <div class="auth-question-text">${getQuestionLabel(question.key)}</div>
                    <div class="auth-stack" style="margin-top:10px;">
                        <label for="recovery-answer-${question.order}">답변</label>
                        <input
                            type="text"
                            id="recovery-answer-${question.order}"
                            data-recovery-answer
                            data-question-key="${question.key}"
                            placeholder="가입할 때 입력한 답변"
                            autocomplete="off"
                        >
                    </div>
                </div>
            `
        )
        .join("");
    wrap.hidden = false;
}

function resetRecoveryForm(preserveUsername = false) {
    const usernameInput = document.getElementById("recovery-username");
    const passwordInput = document.getElementById("recovery-password");
    const confirmInput = document.getElementById("recovery-password-confirm");
    const hint = document.getElementById("recovery-hint");

    if (!preserveUsername && usernameInput) usernameInput.value = "";
    if (passwordInput) passwordInput.value = "";
    if (confirmInput) confirmInput.value = "";
    if (hint) hint.textContent = `질문 3개를 연속으로 ${RECOVERY_MAX_ATTEMPTS}번 틀리면 ${RECOVERY_LOCK_MINUTES}분 동안 다시 시도할 수 없습니다.`;

    recoveryUsername = preserveUsername ? normalizeUsername(usernameInput?.value) : "";
    setRecoveryQuestions([]);
}

function setAuthMode(mode) {
    authMode = mode;
    document.querySelectorAll("[data-auth-screen]").forEach((panel) => {
        panel.hidden = panel.getAttribute("data-auth-screen") !== mode;
    });
}

function setAuthMessage(message, tone = "default") {
    const box = document.getElementById("auth-message");
    if (!box) return;
    box.textContent = message || "";
    box.dataset.tone = tone;
    box.hidden = !message;
}

function setAuthLoading(loading, text = "처리 중...") {
    document.querySelectorAll("[data-auth-submit]").forEach((button) => {
        button.disabled = loading;
        if (loading) {
            button.dataset.originalText = button.textContent;
            button.textContent = text;
        } else if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
        }
    });
}

function syncUserBadge() {
    const username = currentProfile?.username || getSessionUsername() || "";
    const badge = document.getElementById("user-name-badge");
    const signoutBtn = document.getElementById("signout-btn");
    if (badge) badge.textContent = username ? `${username} 로그인중` : "로그인 필요";
    if (signoutBtn) signoutBtn.hidden = !currentSession;
}

function updateRegistrationNote() {
    const note = document.getElementById("auth-registration-note");
    if (!note) return;
    if (registrationSlotsRemaining == null) {
        note.textContent = "회원가입 가능 인원을 확인하는 중입니다.";
        return;
    }
    note.textContent = `최대 50명까지 가입 가능, 현재 남은 자리 ${registrationSlotsRemaining}명`;
}

async function fetchRegistrationSlots() {
    try {
        const client = ensureSupabase();
        const { data, error } = await client.rpc("registration_slots_remaining");
        if (error) throw error;
        registrationSlotsRemaining = Number(data ?? 0);
    } catch (error) {
        console.error(error);
        registrationSlotsRemaining = null;
    }
    updateRegistrationNote();
}

async function loadCurrentProfile() {
    const userId = getCurrentUserId();
    if (!userId) {
        currentProfile = null;
        return null;
    }
    const client = ensureSupabase();
    const { data, error } = await client
        .from("profiles")
        .select("id, username, created_at")
        .eq("id", userId)
        .maybeSingle();
    if (error) throw error;
    currentProfile = data || null;
    syncUserBadge();
    return currentProfile;
}

async function invokeEdgeFunction(functionName, body) {
    const client = ensureSupabase();
    const accessToken =
        currentSession?.access_token ||
        (await client.auth.getSession()).data.session?.access_token ||
        "";
    const { data, error } = await client.functions.invoke(functionName, {
        body,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    if (error) {
        let message = parseSupabaseError(error, `${functionName} 호출 실패`);
        if (error.context && typeof error.context.text === "function") {
            try {
                const rawBody = await error.context.text();
                if (rawBody) {
                    try {
                        const payload = JSON.parse(rawBody);
                        if (payload?.error || payload?.message) {
                            message = payload.error || payload.message;
                        } else {
                            message = rawBody;
                        }
                    } catch {
                        message = rawBody;
                    }
                }
            } catch {
                // Fall back to the standard error parser when the function body is unavailable.
            }
        } else if (error.context && typeof error.context.json === "function") {
            try {
                const payload = await error.context.json();
                if (payload?.error || payload?.message) {
                    message = payload.error || payload.message;
                }
            } catch {
                // Fall back to the standard error parser when the function body is unavailable.
            }
        }
        throw new Error(message);
    }
    if (!data?.ok) {
        throw new Error(data?.error || "요청 처리 실패");
    }
    return data;
}

function bindAuthUi() {
    document.querySelectorAll("[data-auth-mode]").forEach((button) => {
        button.addEventListener("click", () => {
            setAuthMessage("");
            const nextMode = button.getAttribute("data-auth-mode");
            setAuthMode(nextMode);
            if (nextMode === "signup") {
                resetSignupForm();
            }
            if (nextMode === "recovery") {
                resetRecoveryForm();
            }
        });
    });

    document.getElementById("login-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = normalizeUsername(document.getElementById("login-username")?.value);
        const password = document.getElementById("login-password")?.value || "";
        if (!USERNAME_PATTERN.test(username) || !password) {
            setAuthMessage("아이디와 비밀번호를 입력해주세요.", "error");
            return;
        }
        try {
            setAuthLoading(true, "로그인 중...");
            const client = ensureSupabase();
            const { error } = await client.auth.signInWithPassword({
                email: buildSyntheticEmail(username),
                password,
            });
            if (error) throw error;
            setAuthMessage("로그인되었습니다.", "success");
        } catch (error) {
            setAuthMessage(parseSupabaseError(error, "로그인 실패"), "error");
        } finally {
            setAuthLoading(false);
        }
    });

    document.getElementById("signup-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = normalizeUsername(document.getElementById("signup-username")?.value);
        const password = document.getElementById("signup-password")?.value || "";
        const confirmPassword = document.getElementById("signup-password-confirm")?.value || "";
        const questions = collectSignupQuestionAnswers();
        const questionKeys = questions.map((item) => item.key);
        const uniqueKeys = new Set(questionKeys);

        if (!USERNAME_PATTERN.test(username)) {
            setAuthMessage("아이디는 영문 소문자, 숫자, 밑줄만 사용해서 4~20자로 입력해주세요.", "error");
            return;
        }
        if (!password) {
            setAuthMessage("아이디와 비밀번호를 입력해주세요.", "error");
            return;
        }
        if (password.length < 8) {
            setAuthMessage("비밀번호는 8자 이상으로 입력해주세요.", "error");
            return;
        }
        if (password !== confirmPassword) {
            setAuthMessage("비밀번호 확인이 일치하지 않습니다.", "error");
            return;
        }
        if (registrationSlotsRemaining !== null && registrationSlotsRemaining <= 0) {
            setAuthMessage("가입 가능 인원이 가득 찼습니다.", "error");
            return;
        }
        if (questions.some((item) => !SECURITY_QUESTION_MAP[item.key])) {
            setAuthMessage("보안질문 3개를 모두 선택해주세요.", "error");
            return;
        }
        if (uniqueKeys.size !== 3) {
            setAuthMessage("보안질문은 서로 다른 3개를 골라주세요.", "error");
            return;
        }
        if (questions.some((item) => normalizeSecurityAnswer(item.answer).length < 2)) {
            setAuthMessage("각 보안질문 답변은 2자 이상으로 입력해주세요.", "error");
            return;
        }
        try {
            setAuthLoading(true, "가입 중...");
            await invokeEdgeFunction("register-account", {
                username,
                password,
                questions,
            });
            const client = ensureSupabase();
            const { error } = await client.auth.signInWithPassword({
                email: buildSyntheticEmail(username),
                password,
            });
            if (error) throw error;
            setAuthMessage("회원가입과 로그인이 완료되었습니다.", "success");
            await fetchRegistrationSlots();
        } catch (error) {
            setAuthMessage(parseSupabaseError(error, "회원가입 실패"), "error");
        } finally {
            setAuthLoading(false);
        }
    });

    document.getElementById("recovery-load-btn")?.addEventListener("click", async () => {
        const username = normalizeUsername(document.getElementById("recovery-username")?.value);
        if (!USERNAME_PATTERN.test(username)) {
            setAuthMessage("아이디를 먼저 입력해주세요.", "error");
            return;
        }
        try {
            setAuthLoading(true, "질문 불러오는 중...");
            const data = await invokeEdgeFunction("recover-account", {
                action: "questions",
                username,
            });
            recoveryUsername = username;
            setRecoveryQuestions(data.questions || []);
            setAuthMessage("가입할 때 고른 질문 3개에 답하고 새 비밀번호를 입력해주세요.", "default");
        } catch (error) {
            resetRecoveryForm(true);
            setAuthMessage(parseSupabaseError(error, "질문을 불러오지 못했습니다."), "error");
        } finally {
            setAuthLoading(false);
        }
    });

    document.getElementById("recovery-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = recoveryUsername || normalizeUsername(document.getElementById("recovery-username")?.value);
        const password = document.getElementById("recovery-password")?.value || "";
        const confirmPassword = document.getElementById("recovery-password-confirm")?.value || "";
        const answers = Array.from(document.querySelectorAll("[data-recovery-answer]")).map((input) => ({
            key: input.dataset.questionKey || "",
            answer: input.value || "",
        }));

        if (!recoveryQuestions.length) {
            setAuthMessage("먼저 질문 불러오기를 눌러주세요.", "error");
            return;
        }
        if (!USERNAME_PATTERN.test(username)) {
            setAuthMessage("아이디를 다시 확인해주세요.", "error");
            return;
        }
        if (password.length < 8) {
            setAuthMessage("새 비밀번호는 8자 이상으로 입력해주세요.", "error");
            return;
        }
        if (password !== confirmPassword) {
            setAuthMessage("새 비밀번호 확인이 일치하지 않습니다.", "error");
            return;
        }
        if (answers.length !== 3 || answers.some((item) => normalizeSecurityAnswer(item.answer).length < 2)) {
            setAuthMessage("질문 3개 답변을 모두 입력해주세요.", "error");
            return;
        }
        try {
            setAuthLoading(true, "비밀번호 변경 중...");
            await invokeEdgeFunction("recover-account", {
                action: "reset_password",
                username,
                answers,
                newPassword: password,
            });
            document.getElementById("login-username").value = username;
            document.getElementById("login-password").value = "";
            resetRecoveryForm();
            setAuthMode("login");
            setAuthMessage("비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.", "success");
        } catch (error) {
            setAuthMessage(parseSupabaseError(error, "비밀번호 변경 실패"), "error");
        } finally {
            setAuthLoading(false);
        }
    });

    document.getElementById("signout-btn")?.addEventListener("click", async () => {
        try {
            const client = ensureSupabase();
            await client.auth.signOut();
        } catch (error) {
            console.error(error);
            showToast(parseSupabaseError(error, "로그아웃 실패"));
        }
    });
}

async function handleSignedIn(session) {
    currentSession = session;
    syncUserBadge();
    await loadCurrentProfile();
    await refreshFromApi();
    renderAll();
    setAuthMessage("");
    setAuthShellVisible(false);
    setAppShellVisible(true);
    switchTab(localStorage.getItem(APP_STORAGE_KEYS.activeTab) || "ledger");
}

function handleSignedOut() {
    currentSession = null;
    currentProfile = null;
    db = cloneDefaultData();
    stopInvestmentAutoRefresh();
    syncUserBadge();
    resetRecoveryForm();
    setAppShellVisible(false);
    setAuthShellVisible(true);
    setAuthMode("login");
    renderAll();
}

async function bootstrapApp() {
    document.getElementById("t-date").valueAsDate = new Date();
    updateInvestmentPriceField();
    updateAssetFormControls();
    bindAuthUi();
    renderQuestionBank();
    populateSignupQuestionSelectors();
    updateRegistrationNote();

    let client;
    try {
        client = ensureSupabase();
    } catch (error) {
        console.error(error);
        setAuthShellVisible(true);
        setAppShellVisible(false);
        setAuthMode("login");
        setAuthMessage(parseSupabaseError(error, "Supabase 설정이 필요합니다."), "error");
        return;
    }

    await fetchRegistrationSlots();

    client.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT") {
            handleSignedOut();
            return;
        }
        if (session) {
            try {
                await handleSignedIn(session);
            } catch (error) {
                console.error(error);
                setAuthShellVisible(true);
                setAppShellVisible(false);
                setAuthMessage(parseSupabaseError(error, "초기 데이터 로딩 실패"), "error");
            }
        }
    });

    const { data, error } = await client.auth.getSession();
    if (error) {
        console.error(error);
    }
    if (data?.session) {
        await handleSignedIn(data.session);
    } else {
        handleSignedOut();
    }
}

window.addEventListener("load", () => {
    bootstrapApp().catch((error) => {
        console.error(error);
        setAuthShellVisible(true);
        setAppShellVisible(false);
        setAuthMessage(parseSupabaseError(error, "앱 초기화 실패"), "error");
    });
});

    function getActiveTabId() {
        const active = document.querySelector(".view-section.active");
        return active ? active.id.replace("view-", "") : "ledger";
    }
    function save() {
        const tabId = localStorage.getItem(APP_STORAGE_KEYS.activeTab) || getActiveTabId();
        renderAll();
        // 탭/스크롤 복원
        switchTab(tabId);
    }

    function showToast(msg) {
        const t = document.getElementById('toast');
        t.innerText = msg; t.style.opacity = 1;
        setTimeout(() => t.style.opacity = 0, 1500);
    }

function requireAuth() {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("로그인이 필요합니다.");
    return userId;
}

function extractIdFromPath(path, prefix) {
    const cleanPath = String(path || "").split("?")[0];
    const id = cleanPath.replace(prefix, "").replace(/\//g, "");
    return Number(id);
}

async function apiPost(path, body) {
    const client = ensureSupabase();
    const userId = requireAuth();

    if (path === "/api/transactions") {
        const payload = {
            user_id: userId,
            date: body.date,
            type: body.type,
            asset_id: body.asset_id,
            payment_method: body.payment_method || "asset",
            card_asset_id: body.card_asset_id || null,
            settlement_date: body.settlement_date || null,
            category: body.category || null,
            description: body.description || null,
            amount: Number(body.amount || 0),
        };
        const { data, error } = await client.from("transactions").insert(payload).select().single();
        if (error) throw new Error(parseSupabaseError(error, "거래 저장 실패"));
        return data;
    }

    if (path === "/api/assets") {
        const payload = {
            user_id: userId,
            name: body.name,
            type: body.type || "bank",
            opening_balance: Number(body.balance || 0),
            card_settlement_day: body.card_settlement_day || null,
            card_settlement_asset_id: body.card_settlement_asset_id || null,
        };
        const { data, error } = await client.from("assets").insert(payload).select().single();
        if (error) throw new Error(parseSupabaseError(error, "자산 저장 실패"));
        return data;
    }

    if (path === "/api/fixed") {
        const payload = {
            user_id: userId,
            start_month: body.start_month,
            end_month: body.end_month,
            asset_id: body.asset_id || null,
            category: body.category,
            description: body.description,
            amount: Number(body.amount || 0),
            day_of_month: Number(body.day_of_month || 1),
            is_active: body.is_active ?? true,
        };
        const { data, error } = await client.from("fixed_expenses").insert(payload).select().single();
        if (error) throw new Error(parseSupabaseError(error, "고정지출 저장 실패"));
        return data;
    }

    if (path === "/api/budgets") {
        const payload = {
            user_id: userId,
            category: body.category,
            amount: Number(body.amount || 0),
        };
        const { data, error } = await client
            .from("budgets")
            .upsert(payload, { onConflict: "user_id,category" })
            .select()
            .single();
        if (error) throw new Error(parseSupabaseError(error, "예산 저장 실패"));
        return data;
    }

    if (path === "/api/categories") {
        const payload = {
            user_id: userId,
            type: body.type,
            name: body.name,
            sort_order: Number(body.sort_order || 0),
            is_active: body.is_active ?? true,
        };
        const { data, error } = await client.from("categories").insert(payload).select().single();
        if (error) throw new Error(parseSupabaseError(error, "카테고리 저장 실패"));
        return data;
    }

    if (path === "/api/investments") {
        const currentPrice = Number(body.current_price || body.average_buy_price || 0);
        const payload = {
            user_id: userId,
            asset_id: body.asset_id,
            symbol: normalizeInvestmentSymbol(body.symbol, body.type),
            name: body.name || null,
            type: body.type,
            quantity: Number(body.quantity || 0),
            average_buy_price: Number(body.average_buy_price || 0),
            current_price: currentPrice,
            roi: calculateInvestmentRoi(body.quantity, body.average_buy_price, currentPrice),
            last_updated: body.last_updated || (body.type === "fund" ? new Date().toISOString() : null),
        };
        const { data, error } = await client.from("investments").insert(payload).select().single();
        if (error) throw new Error(parseSupabaseError(error, "투자 항목 저장 실패"));
        return data;
    }

    if (path === "/api/investments/refresh-prices") {
        requireAuth();
        return invokeEdgeFunction("refresh-market-prices", {});
    }

    throw new Error(`지원하지 않는 API 경로입니다: ${path}`);
}

async function apiPatch(path, body) {
    const client = ensureSupabase();
    requireAuth();

    if (path.startsWith("/api/transactions/")) {
        const txId = extractIdFromPath(path, "/api/transactions/");
        const payload = {
            date: body.date,
            type: body.type,
            asset_id: body.asset_id,
            payment_method: body.payment_method || "asset",
            card_asset_id: body.card_asset_id || null,
            settlement_date: body.settlement_date || null,
            category: body.category || null,
            description: body.description || null,
            amount: Number(body.amount || 0),
        };
        const { data, error } = await client.from("transactions").update(payload).eq("id", txId).select().single();
        if (error) throw new Error(parseSupabaseError(error, "거래 수정 실패"));
        return data;
    }

    if (path.startsWith("/api/investments/")) {
        const investmentId = extractIdFromPath(path, "/api/investments/");
        const payload = {};
        if (body.current_price != null) {
            const currentPrice = Number(body.current_price || 0);
            payload.current_price = currentPrice;
            payload.last_updated = new Date().toISOString();
        }
        const existing = db.investments.find((item) => item.id === investmentId);
        if (existing && payload.current_price != null) {
            payload.roi = calculateInvestmentRoi(existing.quantity, existing.averageBuyPrice, payload.current_price);
        }
        const { data, error } = await client.from("investments").update(payload).eq("id", investmentId).select().single();
        if (error) throw new Error(parseSupabaseError(error, "투자 항목 수정 실패"));
        return data;
    }

    throw new Error(`지원하지 않는 API 경로입니다: ${path}`);
}

async function apiDelete(path) {
    const client = ensureSupabase();
    requireAuth();

    if (path.startsWith("/api/transactions/")) {
        const txId = extractIdFromPath(path, "/api/transactions/");
        const { data, error } = await client.from("transactions").delete().eq("id", txId).select("id");
        if (error) throw new Error(parseSupabaseError(error, "거래 삭제 실패"));
        if (!data || data.length === 0) throw new Error("Transaction not found");
        return { ok: true };
    }

    if (path.startsWith("/api/fixed/")) {
        const fixedId = extractIdFromPath(path, "/api/fixed/");
        const { data, error } = await client.from("fixed_expenses").delete().eq("id", fixedId).select("id");
        if (error) throw new Error(parseSupabaseError(error, "고정지출 삭제 실패"));
        if (!data || data.length === 0) throw new Error("Fixed expense not found");
        return { ok: true };
    }

    if (path.startsWith("/api/categories/")) {
        const categoryId = extractIdFromPath(path, "/api/categories/");
        const { error } = await client.from("categories").delete().eq("id", categoryId);
        if (error) throw new Error(parseSupabaseError(error, "카테고리 삭제 실패"));
        return { ok: true };
    }

    if (path.startsWith("/api/investments/")) {
        const investmentId = extractIdFromPath(path, "/api/investments/");
        const { error } = await client.from("investments").delete().eq("id", investmentId);
        if (error) throw new Error(parseSupabaseError(error, "투자 항목 삭제 실패"));
        return { ok: true };
    }

    if (path.startsWith("/api/assets/")) {
        const assetId = extractIdFromPath(path, "/api/assets/");
        const force = path.includes("force=true");
        const { data, error } = await client.rpc("delete_asset_cascade", {
            p_asset_id: assetId,
            p_force: force,
        });
        if (error) throw new Error(parseSupabaseError(error, "자산 삭제 실패"));
        return data || { ok: true };
    }

    throw new Error(`지원하지 않는 API 경로입니다: ${path}`);
}

function effectByType(txType, amount) {
    return txType === "income" ? amount : -amount;
}

function normalizeInvestmentSymbol(symbol, type) {
    const normalized = String(symbol || "").trim().toUpperCase();
    if (type === "crypto" && normalized && !normalized.includes("-")) {
        return `${normalized}-USD`;
    }
    return normalized;
}

function calculateInvestmentRoi(quantity, averageBuyPrice, currentPrice) {
    const cost = Number(quantity || 0) * Number(averageBuyPrice || 0);
    if (cost <= 0) return 0;
    const value = Number(quantity || 0) * Number(currentPrice || 0);
    return ((value - cost) / cost) * 100;
}

function mapAssetRow(row) {
    const baseBalance = Number(row.opening_balance || 0);
    return {
        id: Number(row.id),
        name: row.name,
        type: row.type || "bank",
        baseBalance,
        balance: baseBalance,
        cardSettlementDay: row.card_settlement_day ? Number(row.card_settlement_day) : null,
        cardSettlementAssetId: row.card_settlement_asset_id ? Number(row.card_settlement_asset_id) : null,
    };
}

function mapTransactionRow(row) {
    const tx = {
        id: Number(row.id),
        date: row.date,
        type: row.type,
        assetId: Number(row.asset_id),
        paymentMethod: row.payment_method || "asset",
        cardAssetId: row.card_asset_id ? Number(row.card_asset_id) : null,
        settlementDate: row.settlement_date || "",
        category: row.category || "",
        desc: row.description || "",
        amount: Number(row.amount || 0),
        createdAt: row.created_at || null,
    };
    tx.isSettled = computeIsSettled(tx);
    return tx;
}

function mapFixedExpenseRow(row) {
    return {
        id: Number(row.id),
        start: row.start_month,
        end: row.end_month,
        assetId: row.asset_id ? Number(row.asset_id) : null,
        category: row.category || "",
        desc: row.description || "",
        amount: Number(row.amount || 0),
    };
}

function mapInvestmentRow(row) {
    return {
        id: Number(row.id),
        assetId: Number(row.asset_id),
        symbol: row.symbol,
        name: row.name || "",
        type: row.type,
        quantity: Number(row.quantity || 0),
        averageBuyPrice: Number(row.average_buy_price || 0),
        currentPrice: Number(row.current_price || 0),
        roi: Number(row.roi || 0),
        lastUpdated: row.last_updated,
        createdAt: row.created_at,
    };
}

function applyDerivedAssetBalances() {
    const assetMap = new Map(
        db.assets.map((asset) => [
            Number(asset.id),
            {
                ...asset,
                balance: Number(asset.baseBalance || 0),
            },
        ])
    );

    db.transactions.forEach((tx) => {
        const asset = assetMap.get(Number(tx.assetId));
        if (!asset) return;
        if ((tx.paymentMethod || "asset") === "card") {
            if (computeIsSettled(tx)) {
                asset.balance -= Number(tx.amount || 0);
            }
            return;
        }
        asset.balance += effectByType(tx.type, Number(tx.amount || 0));
    });

    db.assets = db.assets.map((asset) => {
        const nextAsset = assetMap.get(Number(asset.id));
        return nextAsset ? nextAsset : asset;
    });
}

async function refreshFromApi() {
    const client = ensureSupabase();
    const [
        assetsRes,
        txRes,
        fixedRes,
        budgetRes,
        categoryRes,
        investmentRes,
    ] = await Promise.all([
        client.from("assets").select("*").order("id", { ascending: false }),
        client.from("transactions").select("*").order("date", { ascending: false }).order("id", { ascending: false }),
        client.from("fixed_expenses").select("*").order("id", { ascending: false }),
        client.from("budgets").select("*").order("category", { ascending: true }),
        client.from("categories").select("*").eq("is_active", true).order("type", { ascending: true }).order("sort_order", { ascending: true }).order("name", { ascending: true }),
        client.from("investments").select("*").order("created_at", { ascending: false }),
    ]);

    const errors = [assetsRes.error, txRes.error, fixedRes.error, budgetRes.error, categoryRes.error, investmentRes.error].filter(Boolean);
    if (errors.length) {
        throw new Error(parseSupabaseError(errors[0], "데이터 조회 실패"));
    }

    db = cloneDefaultData();
    db.assets = (assetsRes.data || []).map(mapAssetRow);
    db.transactions = (txRes.data || []).map(mapTransactionRow);
    db.fixed = (fixedRes.data || []).map(mapFixedExpenseRow);
    db.investments = (investmentRes.data || []).map(mapInvestmentRow);

    db.budgets = {};
    (budgetRes.data || []).forEach((budget) => {
        db.budgets[budget.category] = Number(budget.amount || 0);
    });

    db.categoryItems = (categoryRes.data || []).map((item) => ({
        id: Number(item.id),
        type: item.type,
        name: item.name,
        sort_order: Number(item.sort_order || 0),
        is_active: Boolean(item.is_active),
    }));
    db.categories = { expense: [], income: [], investment: [], fixed: [] };
    db.categoryItems.forEach((item) => {
        if (!db.categories[item.type]) db.categories[item.type] = [];
        db.categories[item.type].push(item.name);
    });

    applyDerivedAssetBalances();
}


    // --- Tab & Month Logic ---
    function switchTab(id) {
        // 탭 상태 저장(리로드돼도 복원용)
        localStorage.setItem(APP_STORAGE_KEYS.activeTab, id);
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('view-' + id).classList.add('active');
        // 어떤 버튼이 눌렸는지 event에 의존하지 않고 onclick 문자열로 매칭
        document.querySelectorAll('.nav-btn').forEach(b => {
            const oc = b.getAttribute("onclick") || "";
            if (oc.includes(`switchTab('${id}'`)) {
                b.classList.add('active');
                // 모바일에서 활성 탭이 보이도록 스크롤 이동
                if(window.innerWidth <= 768) {
                    b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }
        });
        const monthNav = document.getElementById('month-nav');
        if(['search', 'assets', 'settings', 'investment'].includes(id)) monthNav.style.display = 'none';
        else monthNav.style.display = 'flex';
        if(id === 'report') renderReport();
        if (id === "investment") {
            updateInvestmentPriceField();
            startInvestmentAutoRefresh();
            refreshInvestmentPrices(false);
        } else {
            stopInvestmentAutoRefresh();
        }
    }


    function changeMonth(delta) {
        currDate.setMonth(currDate.getMonth() + delta);
        renderAll();
    }

    // --- Core CRUD ---
    async function addTransaction() {
        try {
            const date = document.getElementById('t-date').value;
            const type = document.getElementById('t-type').value; // expense/income/investment
            const assetId = Number(document.getElementById('t-asset').value);
            const cat = document.getElementById('t-cat').value;
            const desc = document.getElementById('t-desc').value;
            const amt = parseInt(document.getElementById('t-amt').value);

            if(!desc || isNaN(amt)) {
                showToast("내용과 금액을 입력해주세요");
                return;
            }

            const selectedAsset = db.assets.find(a => a.id === assetId);
            if (!selectedAsset) {
                showToast("자산을 선택해주세요");
                return;
            }

            let paymentMethod = "asset";
            let cardAssetId = null;
            let settlementDate = "";
            let effectiveAssetId = assetId;

            if ((selectedAsset.type || "").toLowerCase() === "card" && type === "income") {
                showToast("수입은 카드 자산에 직접 기록할 수 없습니다. 통장/현금 자산을 선택해주세요");
                return;
            }

            const isCardExpense = (selectedAsset.type || "").toLowerCase() === "card" && type !== "income";
            if (isCardExpense) {
                const settleAssetId = Number(selectedAsset.cardSettlementAssetId || 0);
                const settleDay = Number(selectedAsset.cardSettlementDay || 0);
                if (!settleAssetId) {
                    showToast("카드 설정에서 결제 통장을 먼저 지정해주세요");
                    return;
                }
                if (!settleDay) {
                    showToast("카드 설정에서 결제일(매월 몇 일)을 먼저 입력해주세요");
                    return;
                }
                const settleAsset = db.assets.find(a => a.id === settleAssetId);
                if (!settleAsset) {
                    showToast("카드 결제 통장을 찾을 수 없습니다");
                    return;
                }
                if ((settleAsset.type || "").toLowerCase() === "card") {
                    showToast("카드 결제 통장은 카드가 아닌 자산으로 설정해주세요");
                    return;
                }
                paymentMethod = "card";
                cardAssetId = selectedAsset.id;
                effectiveAssetId = settleAssetId;
                settlementDate = calcCardSettlementDate(date, settleDay);
            }

            const payload = {
                date,
                type,
                asset_id: effectiveAssetId,
                payment_method: paymentMethod,
                category: cat,
                description: desc,
                amount: amt
            };
            if (paymentMethod === "card") {
                payload.card_asset_id = cardAssetId;
                payload.settlement_date = settlementDate;
            }

            if (editingTxId) {
                await apiPatch(`/api/transactions/${editingTxId}`, payload);
                editingTxId = null;
                setTxEditMode(false);   // <-- 추가
            } else {
                await apiPost("/api/transactions", payload);
            }


            document.getElementById('t-desc').value = "";
            document.getElementById('t-amt').value = "";

            // Save month focus to the saved transaction month so the new row is visible.
            if (date) {
                const focusDate = new Date(`${date}T12:00:00`);
                if (!Number.isNaN(focusDate.getTime())) {
                    currDate = focusDate;
                }
            }

            await refreshFromApi();
            save(); // renderAll 포함
            showToast("거래 저장 완료");
            clearTxForm();
        } catch (e) {
            console.error(e);
            showToast(e?.message || "거래 저장 실패");
        }
    }


    async function deleteTransaction(id) {
        if(!confirm("삭제하시겠습니까?")) return;
        try {
            await apiDelete(`/api/transactions/${id}`);
            await refreshFromApi();
            save();
            showToast("삭제 완료");
        } catch (e) {
            console.error(e);
            const message = e?.message || "삭제 실패";
            if (message.includes("Transaction not found")) {
                try {
                    await refreshFromApi();
                    save();
                } catch (syncErr) {
                    console.error(syncErr);
                }
                showToast("이미 삭제된 거래입니다. 목록 동기화 완료");
                return;
            }
            showToast(message);
        }
    }
    function startEditTransaction(id) {
        const t = db.transactions.find(x => x.id === id);
        if (!t) return;

        editingTxId = id;
        setTxEditMode(true);

        document.getElementById('t-date').value = t.date;
        document.getElementById('t-type').value = t.type;

        updateCatSelect(); // type에 맞춰 t-cat 옵션 재생성
        document.getElementById('t-asset-label').innerText = "자산";
        document.getElementById('t-asset').value = String(t.cardAssetId || t.assetId);

        // 카테고리가 옵션에 없으면(삭제된 경우 등) 일단 공백 처리
        const catSel = document.getElementById('t-cat');
        const hasCat = Array.from(catSel.options).some(o => o.value === (t.category ?? ""));
        if (hasCat) catSel.value = t.category ?? "";
        else catSel.selectedIndex = 0;

        document.getElementById('t-desc').value = t.desc ?? "";
        document.getElementById('t-amt').value = t.amount ?? 0;

        // 폼 있는 위치로 스크롤(선택)
        document.querySelector('.input-group').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('t-desc').focus();

        showToast("수정 모드로 전환되었습니다.");
    }


    async function addAsset() {
        try {
            const name = document.getElementById('a-name').value.trim();
            const type = document.getElementById('a-type').value;
            const bal = Number(document.getElementById('a-bal').value) || 0;
            const cardDay = Number(document.getElementById('a-card-day').value || 0);
            const cardSettleAssetId = Number(document.getElementById('a-card-settle-asset').value || 0);
            if(!name) return;

            const payload = { name, type, balance: bal };
            if (type === "card") {
                if (!cardDay || cardDay < 1 || cardDay > 31) {
                    showToast("카드 결제일(1~31)을 입력해주세요");
                    return;
                }
                if (!cardSettleAssetId) {
                    showToast("카드 결제 통장을 선택해주세요");
                    return;
                }
                payload.card_settlement_day = cardDay;
                payload.card_settlement_asset_id = cardSettleAssetId;
            }
            await apiPost("/api/assets", payload);

            document.getElementById('a-name').value = "";
            document.getElementById('a-type').value = "bank";
            document.getElementById('a-bal').value = 0;
            document.getElementById('a-card-day').value = "";
            document.getElementById('a-card-settle-asset').value = "";

            await refreshFromApi();
            updateAssetFormControls();
            save();
            showToast("자산 저장 완료");
        } catch (e) {
            console.error(e);
            showToast(e?.message || "자산 저장 실패");
        }
        }

    async function addFixed() {
    try {
        const start = document.getElementById('f-start').value; // YYYY-MM
        const end = document.getElementById('f-end').value;     // YYYY-MM
        const assetId = Number(document.getElementById('f-asset').value);
        const cat = document.getElementById('f-cat').value;
        const desc = document.getElementById('f-desc').value;
        const amt = parseInt(document.getElementById('f-amt').value);
        if(!start || !end || !desc || isNaN(amt)) return;
        await apiPost("/api/fixed", {
        start_month: start,
        end_month: end,
        asset_id: assetId,
        category: cat,
        description: desc,
        amount: amt
        });
        document.getElementById('f-desc').value = "";
        document.getElementById('f-amt').value = "";
        await refreshFromApi();
        save();
        showToast("고정지출 등록 완료");
    } catch (e) {
        console.error(e);
        showToast(e?.message || "고정지출 등록 실패");
    }
    }
    async function deleteFixed(id) {
    if(!confirm("고정 지출을 삭제할까요?")) return;
    try {
        await apiDelete(`/api/fixed/${id}`);
        await refreshFromApi();
        save();
        showToast("고정지출 삭제 완료");
    } catch (e) {
        console.error(e);
        showToast(e?.message || "고정지출 삭제 실패");
    }
    }

    async function deleteAsset(id) {
        if(!confirm("자산을 삭제하면 관련된 내역에 문제가 생길 수 있습니다.")) return;
        try {
            await apiDelete(`/api/assets/${id}`);
            await refreshFromApi();
            save();
            showToast("자산 삭제 완료");
        } catch (e) {
            console.error(e);
            const message = e?.message || "자산 삭제 실패";
            const hasLinkedData = message.includes("연결된 데이터");
            if (message.includes("Asset not found")) {
                try {
                    await refreshFromApi();
                    save();
                } catch (syncErr) {
                    console.error(syncErr);
                }
                showToast("이미 삭제된 자산입니다. 목록 동기화 완료");
                return;
            }
            if (!hasLinkedData) {
                showToast(message);
                return;
            }

            const dateMatch = message.match(/\d{4}-\d{2}-\d{2}/);
            if (dateMatch) {
                const focusDate = new Date(`${dateMatch[0]}T12:00:00`);
                if (!Number.isNaN(focusDate.getTime())) {
                    currDate = focusDate;
                }
            }
            switchTab("ledger");
            renderAll();

            const forceDelete = confirm(
                `${message}\n\n연결된 내역까지 모두 삭제하고 자산을 강제 삭제할까요?`
            );
            if (!forceDelete) {
                showToast("자산 삭제가 취소되었습니다");
                return;
            }

            try {
                await apiDelete(`/api/assets/${id}?force=true`);
                await refreshFromApi();
                save();
                showToast("자산/연결내역 강제 삭제 완료");
            } catch (forceError) {
                console.error(forceError);
                showToast(forceError?.message || "강제 삭제 실패");
            }
        }
    }

    async function setBudget() {
        try {
            const cat = document.getElementById('b-cat').value;
            const amt = parseInt(document.getElementById('b-amt').value);
            if(!cat || isNaN(amt)) return;

            await apiPost("/api/budgets", { category: cat, amount: amt });

            await refreshFromApi();
            save();
            showToast("예산 저장 완료");
        } catch (e) {
            console.error(e);
            showToast(e?.message || "예산 저장 실패");
        }
    }
        async function addCategory(type) {
        const inputId = type === "expense" ? "new-cat-exp" : (type === "income" ? "new-cat-inc" : null);
            if (!inputId) return;

            const name = document.getElementById(inputId).value.trim();
            if (!name) return;

            try {
                await apiPost("/api/categories", { type, name, sort_order: 0, is_active: true });
                document.getElementById(inputId).value = "";
                await refreshFromApi();
                save();
                showToast("카테고리 추가 완료");
            } catch (e) {
                console.error(e);
                showToast(e?.message || "카테고리 추가 실패");
            }
        }

        async function deleteCategory(id) {
            if (!confirm("카테고리를 삭제할까요?")) return;
            try {
                await apiDelete(`/api/categories/${id}`);
                await refreshFromApi();
                save();
                showToast("카테고리 삭제 완료");
            } catch (e) {
                console.error(e);
                showToast(e?.message || "카테고리 삭제 실패");
            }
        }

    async function addInvestment() {
        try {
            const type = document.getElementById("i-type").value;
            const symbol = document.getElementById("i-symbol").value.trim();
            const name = document.getElementById("i-name").value.trim();
            const assetId = Number(document.getElementById("i-asset").value);
            const quantity = Number(document.getElementById("i-qty").value);
            const averageBuyPrice = Number(document.getElementById("i-buy-price").value);
            const currentPrice = Number(document.getElementById("i-current-price").value);

            if (!symbol) {
                showToast("심볼/코드를 입력해주세요");
                return;
            }
            if (!assetId) {
                showToast("연결 자산을 선택해주세요");
                return;
            }
            if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(averageBuyPrice) || averageBuyPrice <= 0) {
                showToast("수량/평균매수가를 확인해주세요");
                return;
            }
            if (type === "fund" && (!Number.isFinite(currentPrice) || currentPrice <= 0)) {
                showToast("펀드는 현재가(수동)를 입력해주세요");
                return;
            }

            const payload = {
                asset_id: assetId,
                symbol,
                name: name || null,
                type,
                quantity,
                average_buy_price: averageBuyPrice,
            };
            if (type === "fund") payload.current_price = currentPrice;

            await apiPost("/api/investments", payload);

            document.getElementById("i-symbol").value = "";
            document.getElementById("i-name").value = "";
            document.getElementById("i-qty").value = "";
            document.getElementById("i-buy-price").value = "";
            document.getElementById("i-current-price").value = "";

            await refreshFromApi();
            save();
            showToast("투자 항목 추가 완료");
        } catch (e) {
            console.error(e);
            showToast(e?.message || "투자 항목 추가 실패");
        }
    }

    async function deleteInvestment(id) {
        if (!confirm("투자 항목을 삭제할까요?")) return;
        try {
            await apiDelete(`/api/investments/${id}`);
            await refreshFromApi();
            save();
            showToast("투자 항목 삭제 완료");
        } catch (e) {
            console.error(e);
            showToast(e?.message || "투자 항목 삭제 실패");
        }
    }

    async function updateFundPrice(id) {
        const input = document.getElementById(`fund-price-${id}`);
        if (!input) return;
        const price = Number(input.value);
        if (!Number.isFinite(price) || price <= 0) {
            showToast("현재가를 정확히 입력해주세요");
            return;
        }

        try {
            await apiPatch(`/api/investments/${id}`, { current_price: price });
            await refreshFromApi();
            renderInvest();
            showToast("펀드 현재가 업데이트 완료");
        } catch (e) {
            console.error(e);
            showToast(e?.message || "펀드 현재가 업데이트 실패");
        }
    }

    async function refreshInvestmentPrices(showToastMessage = false) {
        const liveCount = db.investments.filter(i => LIVE_INVEST_TYPES.has(i.type)).length;
        if (liveCount === 0) {
            if (showToastMessage) showToast("실시간 가격 연동 가능한 항목이 없습니다");
            return;
        }

        const refreshBtn = document.getElementById("invest-refresh-btn");
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerText = "갱신 중...";
        }

        try {
            const result = await apiPost("/api/investments/refresh-prices", {});
            await refreshFromApi();
            renderInvest();
            if (showToastMessage) {
                showToast(`${result.updated}/${result.total}개 가격 갱신`);
            }
        } catch (e) {
            console.error(e);
            if (showToastMessage) showToast(e?.message || "실시간 가격 갱신 실패");
        } finally {
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerText = "실시간 가격 새로고침";
            }
        }
    }



    // --- Rendering Engines ---
    function updateCatSelect() {
        const type = document.getElementById('t-type').value;
        const catSel = document.getElementById('t-cat');
        catSel.innerHTML = "";
        if(db.categories[type]) {
            db.categories[type].forEach(c => {
                const opt = document.createElement('option');
                opt.value = c; opt.innerText = c;
                catSel.appendChild(opt);
            });
        }
    }

    function renderAll() {
        normalizeCurrDateForLedger();
        const monthStr = getMonthKey(currDate);
        document.getElementById('display-month').innerText = `${currDate.getFullYear()}년 ${currDate.getMonth() + 1}월`;

        // Asset Dropdowns
        ['t-asset', 'f-asset', 'i-asset'].forEach(id => {
            const sel = document.getElementById(id);
            if (!sel) return;
            const oldVal = sel.value; // 값 유지 시도
            sel.innerHTML = "";
            db.assets.forEach(a => {
                const opt = document.createElement('option');
                opt.value = a.id;
                opt.innerText = `${a.name} (${assetTypeLabel(a.type)})`;
                sel.appendChild(opt);
            });
            if (oldVal && Array.from(sel.options).some(o => o.value === oldVal)) sel.value = oldVal;
        });

        // Fixed Cat Dropdown
        const fCat = document.getElementById('f-cat');
        fCat.innerHTML = ""; 
        if(db.categories.expense) {
            db.categories.expense.forEach(c => {
                const opt = document.createElement('option'); opt.value = c; opt.innerText = c; fCat.appendChild(opt);
            });
        }

        // Budget Cat Dropdown
        const bCat = document.getElementById('b-cat');
        bCat.innerHTML = ""; 
        if(db.categories.expense) {
            db.categories.expense.forEach(c => {
                const opt = document.createElement('option'); opt.value = c; opt.innerText = c; bCat.appendChild(opt);
            });
        }

        // 현재 폼 상태가 비어있다면 업데이트 (편집중 아닐때만)
        if(!editingTxId) updateCatSelect();
        updateAssetFormControls();
        updateInvestmentPriceField();

        // 1. Asset Tray
        const tray = document.getElementById('asset-tray-display');
        const cashTotal = calcCashBalance();
        const pendingFixed = calcPendingFixedExpense(monthStr);
        const cardDue = calcCardDueByMonth(monthStr);
        const safeBalance = cashTotal - pendingFixed - cardDue;

        tray.innerHTML = `
            <div class="asset-item total-cash">
                <div class="asset-top">
                <div class="asset-name">가용 현금 잔액</div>
                    <span class="asset-type-badge cash">현금 기준</span>
                </div>
                <div class="asset-balance">${fmtCurrency(safeBalance)}</div>
                <div class="asset-meta">현금합계 ${fmtCurrency(cashTotal)} - 미지출 고정비 ${fmtCurrency(pendingFixed)} - 카드결제예정 ${fmtCurrency(cardDue)}</div>
            </div>
        `;

        const dueByCard = calcCardDueByCard(monthStr);
        Object.keys(dueByCard).forEach((cardKey) => {
            const cardAsset = db.assets.find(a => String(a.id) === String(cardKey));
            if (!cardAsset) return;
            tray.innerHTML += `
                <div class="asset-item">
                    <div class="asset-top">
                        <div class="asset-name">${cardAsset.name}</div>
                        <span class="asset-type-badge card">카드 결제예정</span>
                    </div>
                    <div class="asset-balance">${fmtCurrency(dueByCard[cardKey])}</div>
                    <div class="asset-meta">${monthStr} 결제 예정</div>
                </div>
            `;
        });

        db.assets
            .slice()
            .sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0))
            .forEach(a => {
                tray.innerHTML += `
                    <div class="asset-item">
                        <div class="asset-top">
                            <div class="asset-name">${a.name}</div>
                            <span class="asset-type-badge ${assetTypeClass(a.type)}">${assetTypeLabel(a.type)}</span>
                        </div>
                        <div class="asset-balance">${fmtCurrency(a.balance)}</div>
                        <div class="asset-meta">잔액 입력값 + 거래 내역 반영</div>
                    </div>
                `;
            });

        // 2. Summary & Ledger
        let mInc = 0, mExp = 0;
        const list = document.getElementById('ledger-list');
        list.innerHTML = "";
        
        // 이월금 계산 (간소화)
        let carry = 0;
        db.transactions.forEach(t => {
            if(t.date < monthStr + "-01") {
                if(t.type === 'income') carry += t.amount; else carry -= t.amount;
            }
        });

        const monthTx = db.transactions
            .filter(t => t.date.startsWith(monthStr))
            .sort((a,b)=>new Date(b.date)-new Date(a.date));

        if (monthTx.length === 0) {
            list.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-sub); padding:28px 12px;">해당 월 거래 내역이 없습니다. 저장한 날짜의 월을 확인해 주세요.</td></tr>`;
        }

        monthTx.forEach(t => {
            if(t.type === 'income') mInc += t.amount;
            else if (t.type === 'expense') mExp += t.amount;

            const settleAssetName = db.assets.find(a => a.id == t.assetId)?.name || "-";
            const cardName = t.cardAssetId ? (db.assets.find(a => a.id == t.cardAssetId)?.name || "카드") : "";
            const payLabel = (t.paymentMethod || "asset") === "card"
                ? `${cardName} -> ${settleAssetName}${t.settlementDate ? ` (${t.settlementDate})` : ""}${t.isSettled ? " [결제완료]" : " [결제전]"}`
                : settleAssetName;
            const typeLabel = t.type === "income" ? "수입" : t.type === "investment" ? "투자" : "지출";
            const typeColor = t.type === "income" ? "var(--income)" : t.type === "investment" ? "var(--invest)" : "var(--expense)";

            list.innerHTML += `
                <tr>
                    <td>${t.date.slice(5)}</td>
                    <td style="color:${typeColor}; font-weight:800;">${typeLabel}</td>
                    <td>${payLabel}</td>
                    <td>${t.category || "-"}</td>
                    <td>${t.desc || ""}</td>
                    <td style="text-align:right; font-weight:700;">${fmtCurrency(t.amount)}</td>
                    <td style="text-align:center;">
                        <button type="button" onclick="startEditTransaction(${t.id})" style="border:1px solid #cbd5e1; background:white; border-radius:4px; cursor:pointer;">??</button>
                        <button type="button" onclick="deleteTransaction(${t.id})" style="border:1px solid #ef4444; color:#ef4444; background:white; border-radius:4px; cursor:pointer; margin-left:4px;">???</button>
                    </td>
                </tr>
            `;
        });
        document.getElementById('val-carry').innerText = fmtCurrency(carry);
        document.getElementById('val-inc').innerText = fmtCurrency(mInc);
        document.getElementById('val-exp').innerText = fmtCurrency(mExp);
        document.getElementById('val-pending').innerText = fmtCurrency(pendingFixed);
        document.getElementById('val-card-due').innerText = fmtCurrency(cardDue);
        document.getElementById('val-bal').innerText = fmtCurrency(safeBalance);
        document.getElementById('val-bal-sub').innerText = `현금 ${fmtCurrency(cashTotal)} / 고정비 남음 ${fmtCurrency(pendingFixed)} / 카드결제예정 ${fmtCurrency(cardDue)}`;

        // 3. Calendar
        renderCalendar(monthStr);

        // 4. Fixed (Grouped)
        renderFixedGrouped();

        // 5. Budget
        renderBudgets(monthStr);

        // 6. Investment
        renderInvest();

        // 7. Assets Table
        const aBody = document.getElementById('asset-body');
        aBody.innerHTML = "";
        db.assets.forEach(a => {
            let cardConfigText = "-";
            if ((a.type || "").toLowerCase() === "card") {
                const settleAsset = db.assets.find(x => x.id === Number(a.cardSettlementAssetId));
                const settleName = settleAsset ? settleAsset.name : "미설정";
                const dayText = a.cardSettlementDay ? `매월 ${a.cardSettlementDay}일` : "결제일 미설정";
                cardConfigText = `${dayText} / ${settleName}`;
            }
            aBody.innerHTML += `
                <tr>
                    <td>${a.name}</td>
                    <td><span class="asset-pill ${assetTypeClass(a.type)}">${assetTypeLabel(a.type)}</span></td>
                    <td>${cardConfigText}</td>
                    <td style="text-align:right;">${fmtCurrency(a.balance)}</td>
                    <td style="text-align:center;">
                        <button type="button" onclick="deleteAsset(${a.id})" style="border:1px solid #ef4444; color:#ef4444; background:white; border-radius:4px;">???</button>
                    </td>
                </tr>
            `;
        });

        // 8. Settings
        renderSettings();

    }

    function renderCalendar(monthStr) {
        const body = document.getElementById('calendar-body');
        body.innerHTML = "";
        const year = currDate.getFullYear(), month = currDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        for(let i=0; i<firstDay; i++) body.innerHTML += `<div class="day-cell" style="background:#f8fafc"></div>`;
        for(let i=1; i<=lastDate; i++) {
            const dayStr = `${monthStr}-${String(i).padStart(2,'0')}`;
            let dInc = 0, dExp = 0;
            db.transactions.filter(t => t.date === dayStr).forEach(t => {
                if(t.type === 'income') dInc += t.amount;
                else if (t.type === 'expense') dExp += t.amount;
            });
            body.innerHTML += `
                <div class="day-cell">
                    <div class="day-num">${i}</div>
                    <div class="day-stat" style="color:var(--income)">${dInc?'+'+(dInc/10000).toFixed(0)+'만':''}</div>
                    <div class="day-stat" style="color:var(--expense)">${dExp?'-'+(dExp/10000).toFixed(0)+'만':''}</div>
                </div>
            `;
        }
    }

    function renderFixedGrouped() {
        const grid = document.getElementById('fixed-display-grid');
        grid.innerHTML = "";
        const groups = db.fixed.reduce((acc, f) => {
            if(!acc[f.category]) acc[f.category] = [];
            acc[f.category].push(f);
            return acc;
        }, {});

        Object.keys(groups).forEach(cat => {
            let entries = groups[cat].map(f => `
            <div class="fixed-entry">
                <div>
                <strong>${f.desc}</strong><br>
                <small>${f.start} ~ ${f.end}</small>
                </div>
                <div style="text-align:right">
                <strong>${f.amount.toLocaleString()}원</strong><br>
                <button type="button" onclick="deleteFixed(${f.id})" style="font-size:0.7rem; border:none; cursor:pointer; background:#fee2e2; color:#ef4444; padding:2px 6px; border-radius:4px; margin-top:2px;">삭제</button>
                </div>
            </div>
            `).join("");

            grid.innerHTML += `<div class="fixed-cat-card"><h4>${cat}</h4>${entries}</div>`;
        });
    }

    function renderBudgets(monthStr) {
        const list = document.getElementById('budget-list');
        list.innerHTML = "";
        const spends = db.transactions.filter(t => t.date.startsWith(monthStr) && t.type === 'expense').reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
        }, {});

        Object.keys(db.budgets).forEach(cat => {
            const goal = Number(db.budgets[cat] || 0);
            if (goal <= 0) return;
            const used = spends[cat] || 0;
            const per = Math.min((used / goal) * 100, 100);
            const color = per > 90 ? 'var(--expense)' : (per > 70 ? 'var(--invest)' : 'var(--income)');
            list.innerHTML += `
                <div class="card">
                    <div style="display:flex; justify-content:space-between;"><strong>${cat}</strong><span>${Math.round(per)}%</span></div>
                    <div class="budget-bar-bg"><div class="budget-bar-fill" style="width:${per}%; background:${color};"></div></div>
                    <div style="font-size:0.8rem; margin-top:5px; color:var(--text-sub);">${fmtCurrency(used)} / ${fmtCurrency(goal)}</div>
                </div>
            `;
        });
    }

    function renderInvest() {
        const body = document.getElementById("invest-list");
        body.innerHTML = "";

        let totalCost = 0;
        let totalValue = 0;

        db.investments
            .slice()
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .forEach(i => {
                const currentPrice = Number(i.currentPrice || i.averageBuyPrice || 0);
                const cost = Number(i.quantity || 0) * Number(i.averageBuyPrice || 0);
                const value = Number(i.quantity || 0) * currentPrice;
                const profit = value - cost;
                const roi = cost > 0 ? (profit / cost) * 100 : 0;
                const assetName = db.assets.find(a => a.id === i.assetId)?.name || "-";

                totalCost += cost;
                totalValue += value;

                const roiClass = roi >= 0 ? "roi-positive" : "roi-negative";
                const typeLabel = i.type === "fund" ? "펀드" : i.type === "crypto" ? "코인" : i.type === "etf" ? "ETF" : "주식";
                const priceCell = i.type === "fund"
                    ? `
                        <div class="inline-price-editor">
                            <input type="number" id="fund-price-${i.id}" value="${Number(currentPrice || 0)}" step="0.01">
                            <button type="button" class="btn-main secondary" style="height:34px; padding:0 10px;" onclick="updateFundPrice(${i.id})">반영</button>
                        </div>
                    `
                    : fmtCurrency(currentPrice);

                body.innerHTML += `
                    <tr>
                        <td><strong>${i.symbol}</strong><br><small>${i.name || ""}</small></td>
                        <td>${typeLabel}</td>
                        <td>${assetName}</td>
                        <td style="text-align:right;">${fmtNumber(i.quantity, 6)}</td>
                        <td style="text-align:right;">${fmtCurrency(i.averageBuyPrice)}</td>
                        <td style="text-align:right;">${priceCell}</td>
                        <td style="text-align:right;">${fmtCurrency(cost)}</td>
                        <td style="text-align:right;">${fmtCurrency(value)}</td>
                        <td style="text-align:right;"><span class="${roiClass}">${roi.toFixed(2)}%</span></td>
                        <td>${formatDateTime(i.lastUpdated)}</td>
                        <td style="text-align:center;">
                            <button type="button" onclick="deleteInvestment(${i.id})" style="border:1px solid #ef4444; color:#ef4444; background:white; border-radius:6px; cursor:pointer;">???</button>
                        </td>
                    </tr>
                `;
            });

        const totalProfit = totalValue - totalCost;
        const totalRoi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

        document.getElementById("invest-total-cost").innerText = fmtCurrency(totalCost);
        document.getElementById("invest-total-value").innerText = fmtCurrency(totalValue);

        const profitEl = document.getElementById("invest-total-profit");
        profitEl.innerText = fmtCurrency(totalProfit);
        profitEl.className = `value ${totalProfit >= 0 ? "roi-positive" : "roi-negative"}`;

        const roiEl = document.getElementById("invest-total-roi");
        roiEl.innerText = `${totalRoi.toFixed(2)}%`;
        roiEl.className = `value ${totalRoi >= 0 ? "roi-positive" : "roi-negative"}`;
    }

    function searchData() {
        const q = document.getElementById('s-query').value.toLowerCase();
        const body = document.getElementById('search-list'); body.innerHTML = "";
        db.transactions.filter(t => (t.desc || "").toLowerCase().includes(q) || (t.category || "").toLowerCase().includes(q)).forEach(t => {
            body.innerHTML += `<tr><td>${t.date}</td><td>${t.category || "-"}</td><td>${t.desc || ""}</td><td style="text-align:right">${fmtCurrency(t.amount)}</td></tr>`;
        });
    }

    function renderSettings() {
        const expBox = document.getElementById('set-cat-exp');
        const incBox = document.getElementById('set-cat-inc');
        expBox.innerHTML = "";
        incBox.innerHTML = "";

        const items = db.categoryItems || [];

        items.filter(c => c.type === "expense").forEach(c => {
            expBox.innerHTML += `
            <span style="background:#f1f5f9; padding:8px 12px; border-radius:15px; font-size:0.85rem; display:inline-flex; align-items:center;">
                ${c.name}
                <button type="button" onclick="deleteCategory(${c.id})" style="margin-left:6px; border:none; cursor:pointer; background:#cbd5e1; border-radius:50%; width:18px; height:18px; line-height:18px; font-size:10px; padding:0;">?</button>
            </span>`;
        });

        items.filter(c => c.type === "income").forEach(c => {
            incBox.innerHTML += `
            <span style="background:#f1f5f9; padding:8px 12px; border-radius:15px; font-size:0.85rem; display:inline-flex; align-items:center;">
                ${c.name}
                <button type="button" onclick="deleteCategory(${c.id})" style="margin-left:6px; border:none; cursor:pointer; background:#cbd5e1; border-radius:50%; width:18px; height:18px; line-height:18px; font-size:10px; padding:0;">?</button>
            </span>`;
        });
    }

    function renderReport() {
        const monthStr = getMonthKey(currDate);
        const catData = db.transactions.filter(t => t.date.startsWith(monthStr) && t.type === 'expense').reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
        }, {});

        if(charts.pie) charts.pie.destroy();
        charts.pie = new Chart(document.getElementById('chart-pie'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(catData),
                datasets: [{ data: Object.values(catData), backgroundColor: ['#1774d1', '#16a34a', '#f59e0b', '#ef4444', '#0ea5e9', '#f97316'] }]
            },
            options: { plugins: { title: { display: true, text: '이번 달 지출 비중' } }, maintainAspectRatio: false }
        });

        // 6개월 추이
        const labels = []; const incs = []; const exps = [];
        for(let i=5; i>=0; i--) {
            let d = new Date(); d.setMonth(d.getMonth() - i);
            let s = getMonthKey(d);
            labels.push(s);
            let ti = 0, te = 0;
            db.transactions.filter(t => t.date.startsWith(s)).forEach(t => {
                if(t.type === 'income') ti += t.amount; else if(t.type === 'expense') te += t.amount;
            });
            incs.push(ti); exps.push(te);
        }

        if(charts.line) charts.line.destroy();
        charts.line = new Chart(document.getElementById('chart-line'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: '수입', data: incs, borderColor: '#10b981', fill: false },
                    { label: '지출', data: exps, borderColor: '#ef4444', fill: false }
                ]
            },
            options: { plugins: { title: { display: true, text: '최근 6개월 추이' } }, maintainAspectRatio: false }
        });
    }

function buildExportSnapshot() {
    return {
        assets: db.assets.map((asset) => ({
            id: asset.id,
            name: asset.name,
            type: asset.type,
            balance: Number(asset.baseBalance ?? asset.balance ?? 0),
            baseBalance: Number(asset.baseBalance ?? asset.balance ?? 0),
            cardSettlementDay: asset.cardSettlementDay || null,
            cardSettlementAssetId: asset.cardSettlementAssetId || null,
        })),
        categories: db.categories,
        categoryItems: db.categoryItems,
        transactions: db.transactions.map((tx) => ({
            id: tx.id,
            date: tx.date,
            type: tx.type,
            assetId: tx.assetId,
            paymentMethod: tx.paymentMethod,
            cardAssetId: tx.cardAssetId || null,
            settlementDate: tx.settlementDate || "",
            isSettled: Boolean(tx.isSettled),
            category: tx.category || "",
            desc: tx.desc || "",
            amount: Number(tx.amount || 0),
        })),
        fixed: db.fixed.map((item) => ({
            id: item.id,
            start: item.start,
            end: item.end,
            assetId: item.assetId,
            category: item.category || "",
            desc: item.desc || "",
            amount: Number(item.amount || 0),
        })),
        budgets: db.budgets,
        investments: db.investments.map((item) => ({
            id: item.id,
            assetId: item.assetId,
            symbol: item.symbol,
            name: item.name || "",
            type: item.type,
            quantity: Number(item.quantity || 0),
            averageBuyPrice: Number(item.averageBuyPrice || 0),
            currentPrice: Number(item.currentPrice || 0),
            roi: Number(item.roi || 0),
            lastUpdated: item.lastUpdated || null,
            createdAt: item.createdAt || null,
        })),
    };
}

function exportData() {
    const snapshot = buildExportSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `donggri-ledger-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
}

function buildCategoryRowsForImport(snapshot) {
    const rawRows = [];
    if (Array.isArray(snapshot.categoryItems) && snapshot.categoryItems.length) {
        snapshot.categoryItems.forEach((item) => {
            rawRows.push({
                type: item.type,
                name: item.name,
                sort_order: Number(item.sort_order || 0),
                is_active: item.is_active ?? true,
            });
        });
    } else {
        Object.entries(snapshot.categories || DEFAULT_CATEGORIES).forEach(([type, values]) => {
            if (!Array.isArray(values)) return;
            values.forEach((name, index) => {
                rawRows.push({
                    type,
                    name,
                    sort_order: index,
                    is_active: true,
                });
            });
        });
    }

    const deduped = new Map();
    rawRows.forEach((row) => {
        const key = `${row.type}::${row.name}`;
        if (!row.name || deduped.has(key)) return;
        deduped.set(key, row);
    });
    return Array.from(deduped.values());
}

async function importSnapshotToSupabase(loaded) {
    const snapshot = normalizeSnapshotData(loaded);
    const client = ensureSupabase();
    const userId = requireAuth();

    const { error: clearError } = await client.rpc("clear_user_data");
    if (clearError) {
        throw new Error(parseSupabaseError(clearError, "기존 데이터 초기화 실패"));
    }

    const categoryRows = buildCategoryRowsForImport(snapshot).map((row) => ({
        user_id: userId,
        ...row,
    }));
    if (categoryRows.length) {
        const { error } = await client.from("categories").insert(categoryRows);
        if (error) throw new Error(parseSupabaseError(error, "카테고리 복원 실패"));
    }

    const assetIdMap = new Map();
    const pendingCardConfigs = [];
    for (const asset of snapshot.assets) {
        const payload = {
            user_id: userId,
            name: asset.name,
            type: asset.type || "bank",
            opening_balance: Number(asset.baseBalance ?? asset.balance ?? 0),
            card_settlement_day: asset.type === "card" ? Number(asset.cardSettlementDay || 0) || null : null,
            card_settlement_asset_id: null,
        };
        const { data, error } = await client.from("assets").insert(payload).select().single();
        if (error) throw new Error(parseSupabaseError(error, "자산 복원 실패"));
        assetIdMap.set(Number(asset.id), Number(data.id));
        if (asset.type === "card" && asset.cardSettlementAssetId) {
            pendingCardConfigs.push({
                newId: Number(data.id),
                oldSettleId: Number(asset.cardSettlementAssetId),
                settlementDay: Number(asset.cardSettlementDay || 0) || null,
            });
        }
    }

    for (const config of pendingCardConfigs) {
        const mappedSettleId = assetIdMap.get(config.oldSettleId);
        if (!mappedSettleId) continue;
        const { error } = await client
            .from("assets")
            .update({
                card_settlement_day: config.settlementDay,
                card_settlement_asset_id: mappedSettleId,
            })
            .eq("id", config.newId);
        if (error) throw new Error(parseSupabaseError(error, "카드 설정 복원 실패"));
    }

    const fixedRows = snapshot.fixed
        .map((item) => ({
            user_id: userId,
            start_month: item.start,
            end_month: item.end,
            asset_id: item.assetId ? assetIdMap.get(Number(item.assetId)) || null : null,
            category: item.category || "",
            description: item.desc || "",
            amount: Number(item.amount || 0),
            day_of_month: Number(item.day_of_month || 1),
            is_active: true,
        }))
        .filter((row) => row.start_month && row.end_month && row.description);
    if (fixedRows.length) {
        const { error } = await client.from("fixed_expenses").insert(fixedRows);
        if (error) throw new Error(parseSupabaseError(error, "고정지출 복원 실패"));
    }

    const transactionRows = snapshot.transactions
        .map((tx) => ({
            user_id: userId,
            date: tx.date,
            type: tx.type,
            asset_id: assetIdMap.get(Number(tx.assetId)) || null,
            payment_method: tx.paymentMethod || "asset",
            card_asset_id: tx.cardAssetId ? assetIdMap.get(Number(tx.cardAssetId)) || null : null,
            settlement_date: tx.settlementDate || null,
            category: tx.category || null,
            description: tx.desc || null,
            amount: Number(tx.amount || 0),
        }))
        .filter((row) => row.asset_id && row.date && row.type && row.amount > 0);
    if (transactionRows.length) {
        const { error } = await client.from("transactions").insert(transactionRows);
        if (error) throw new Error(parseSupabaseError(error, "거래 복원 실패"));
    }

    const investmentRows = snapshot.investments
        .map((item) => ({
            user_id: userId,
            asset_id: assetIdMap.get(Number(item.assetId)) || null,
            symbol: normalizeInvestmentSymbol(item.symbol, item.type),
            name: item.name || null,
            type: item.type,
            quantity: Number(item.quantity || 0),
            average_buy_price: Number(item.averageBuyPrice || 0),
            current_price: Number(item.currentPrice || item.averageBuyPrice || 0),
            roi: Number(item.roi || calculateInvestmentRoi(item.quantity, item.averageBuyPrice, item.currentPrice || item.averageBuyPrice || 0)),
            last_updated: item.lastUpdated || null,
        }))
        .filter((row) => row.asset_id && row.symbol && row.quantity > 0 && row.average_buy_price > 0);
    if (investmentRows.length) {
        const { error } = await client.from("investments").insert(investmentRows);
        if (error) throw new Error(parseSupabaseError(error, "투자 항목 복원 실패"));
    }

    const budgetRows = Object.entries(snapshot.budgets || {})
        .map(([category, amount]) => ({
            user_id: userId,
            category,
            amount: Number(amount || 0),
        }))
        .filter((row) => row.category && row.amount > 0);
    if (budgetRows.length) {
        const { error } = await client.from("budgets").upsert(budgetRows, { onConflict: "user_id,category" });
        if (error) throw new Error(parseSupabaseError(error, "예산 복원 실패"));
    }
}

function importData(input) {
    const file = input?.files?.[0];
    if (!file) return;
    if (!confirm("현재 계정의 데이터를 지우고 백업 파일 내용으로 복원할까요?")) {
        input.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const loaded = JSON.parse(event.target.result);
            await importSnapshotToSupabase(loaded);
            await refreshFromApi();
            save();
            showToast("복원 완료");
        } catch (error) {
            console.error(error);
            showToast(parseSupabaseError(error, "복원 실패"));
        } finally {
            input.value = "";
        }
    };
    reader.readAsText(file);
}


