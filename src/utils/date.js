// 날짜 유틸. toISOString()은 UTC 기준이라 한국 시간 자정이 전날로 바뀌므로 쓰지 않는다.

const WEEKDAYS = "일월화수목금토";

/** Date → "YYYY-MM-DD" (로컬 시간 기준) */
export function toYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" → 로컬 자정 Date */
export function parseYmd(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const todayYmd = () => toYmd(new Date());

/** "2026-11-20" → "11월 20일 (금)" */
export function formatDate(ymd) {
  const d = parseYmd(ymd);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

/** ISO 날짜시간 → "11/17 14:59" */
export function formatDateTime(iso) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

/** 마감일까지 남은 날: D-3, D-Day, 마감 */
export function dday(ymd) {
  const diff = Math.round((parseYmd(ymd) - parseYmd(todayYmd())) / 86400000);
  if (diff === 0) return { label: "D-Day", over: false };
  if (diff > 0) return { label: `D-${diff}`, over: false };
  return { label: "마감", over: true };
}
