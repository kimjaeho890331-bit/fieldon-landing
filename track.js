/**
 * FIELDON Landing — 페이지 방문 트래킹
 *
 * supabase landing_page_views 테이블에 페이지 로드를 기록한다.
 * ops 통계 페이지(/ops/analytics)에서 일별/누적 KPI로 표시됨.
 *
 * ⚠ 최초 설정 시 anon public key 한 번 붙여넣기 필요:
 *   Supabase Dashboard → Settings → API Keys → "anon public" 복사 → 아래 SUPABASE_ANON_KEY 에 붙여넣기
 *   anon 키는 RLS(insert 만 허용)로 보호되므로 클라이언트 노출 OK.
 */
(function() {
  var SUPABASE_URL = "https://lmklxicrewgkgbhsikbw.supabase.co";
  var SUPABASE_ANON_KEY = "PASTE_SUPABASE_ANON_PUBLIC_KEY_HERE";

  // 키 미설정 시 동작 안 함 (배포 후 1회 채우면 됨)
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.indexOf("PASTE") === 0) {
    if (window.console && console.info) console.info("[landing-track] anon key 미설정 — 트래킹 비활성");
    return;
  }

  // 봇/프리렌더 제외 (대충)
  var ua = navigator.userAgent || "";
  if (/bot|spider|crawl|preview|HeadlessChrome/i.test(ua)) return;

  try {
    fetch(SUPABASE_URL + "/rest/v1/landing_page_views", {
      method: "POST",
      mode: "cors",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + SUPABASE_ANON_KEY,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        path: location.pathname || "/",
        referer: (document.referrer || "").slice(0, 500) || null,
        ua: ua.slice(0, 500)
      })
    }).catch(function() {});
  } catch (e) {}
})();
