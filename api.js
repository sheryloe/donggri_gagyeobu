const API_BASE = location.origin; // 같은 서버로 API 호출
async function apiGet(path) { /* 동일 */ }
async function apiPost(path, body) { /* 동일 */ }
async function apiDelete(path) { /* 동일 */ }

function formatMoney(n) {
  return Number(n || 0).toLocaleString();
}
