// 100Bagger & Parvogel Auto Publisher - Background Service Worker
// 백엔드 API Queue를 일정 주기로 폴링하여 대기 중인 글을 네이버 블로그에 순차 발행

const DEFAULT_CONFIG = {
  apiUrl: "http://localhost:8000/api/marketing/queue",
  pollIntervalMinutes: 5,
  isActive: true
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["config"], (res) => {
    if (!res.config) {
      chrome.storage.local.set({ config: DEFAULT_CONFIG });
    }
  });
  chrome.alarms.create("poll_marketing_queue", { periodInMinutes: 5 });
  console.log("[100Bagger Worker] Extension Worker Installed & Alarm Scheduled.");
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "poll_marketing_queue") {
    checkQueueAndTriggerPublish();
  }
});

// 큐 확인 및 발행 트리거
async function checkQueueAndTriggerPublish() {
  chrome.storage.local.get(["config"], async (res) => {
    const config = res.config || DEFAULT_CONFIG;
    if (!config.isActive) return;

    try {
      console.log("[100Bagger Worker] Fetching pending marketing post from:", config.apiUrl);
      const response = await fetch(`${config.apiUrl}/pending`);
      if (!response.ok) return;

      const data = await response.json();
      if (!data || !data.post) {
        console.log("[100Bagger Worker] No pending post in queue.");
        return;
      }

      const pendingPost = data.post;
      // 몬모릴로나이트 오기 강제 교정
      pendingPost.title = (pendingPost.title || "").replace(/몽모릴로나이트/g, "몬모릴로나이트");
      pendingPost.body = (pendingPost.body || "").replace(/몽모릴로나이트/g, "몬모릴로나이트");

      // 발행할 포스트를 임시 저장 후 네이버 글쓰기 탭 오픈
      await chrome.storage.local.set({ currentTask: pendingPost });

      console.log("[100Bagger Worker] Opening Naver Blog write tab for:", pendingPost.title);
      chrome.tabs.create({ url: "https://blog.naver.com/GoBlogWrite.naver" });

    } catch (err) {
      console.error("[100Bagger Worker] Queue poll error:", err);
    }
  });
}

// Content script로부터 완료 메시지 수신 시 백엔드 콜백
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "POST_PUBLISHED") {
    console.log("[100Bagger Worker] Post published successfully:", request.postUrl);
    chrome.storage.local.get(["config", "currentTask"], async (res) => {
      const config = res.config || DEFAULT_CONFIG;
      const task = res.currentTask;
      if (task && task.id) {
        try {
          await fetch(`${config.apiUrl}/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: task.id,
              postUrl: request.postUrl,
              status: "PUBLISHED",
              publishedAt: new Date().toISOString()
            })
          });
          console.log("[100Bagger Worker] Reported completion to backend.");
        } catch (e) {
          console.error("[100Bagger Worker] Failed to report completion:", e);
        }
      }
      chrome.storage.local.remove(["currentTask"]);
    });
    sendResponse({ status: "acknowledged" });
  }
});
