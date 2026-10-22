/* global chrome */
// 100Bagger & Parvogel SmartEditor ONE DOM Injection Content Script
// 네이버 스마트에디터 ONE의 본문 및 제목을 직접 제어하여 안전하게 자동 발행

(async function () {
  console.log("[100Bagger Content Script] Initialized on Naver Blog page.");

  // 진행할 작업이 있는지 확인
  const storageData = await chrome.storage.local.get(["currentTask"]);
  const post = storageData.currentTask;

  if (!post || !post.title || !post.body) {
    console.log("[100Bagger Content Script] No current task to publish. Idle.");
    return;
  }

  console.log("[100Bagger Content Script] Starting auto-publish routine for:", post.title);

  // 1. 에디터 프레임 또는 페이지 로딩 대기
  await sleep(4000);

  // 팝업 제거
  dismissPopups();

  // 2. 제목 입력
  const titleInput = document.querySelector(".se-documentTitle, .se-section-documentTitle, span.se-placeholder");
  if (titleInput) {
    titleInput.click();
    await sleep(500);
    document.execCommand("insertText", false, post.title);
    console.log("[100Bagger Content Script] Title inserted.");
  }

  await sleep(1000);
  dismissPopups();

  // 3. 본문 영역 선택 및 HTML 주입
  const bodyArea = document.querySelector(".se-main-container, .se-content, .se-component-content");
  if (bodyArea) {
    bodyArea.click();
    await sleep(500);

    // 클립보드 이벤트 또는 execCommand를 통해 리치 HTML 주입
    const richHtml = convertToRichHtml(post.title, post.body, post.links || {});
    
    // HTML을 임시 엘리먼트에 담아 복사 붙여넣기 시뮬레이션
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = richHtml;
    tempDiv.contentEditable = "true";
    document.body.appendChild(tempDiv);
    
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand("copy");
    tempDiv.remove();

    // 본문에 붙여넣기
    bodyArea.focus();
    document.execCommand("paste");
    console.log("[100Bagger Content Script] Rich HTML content pasted into editor.");
  }

  await sleep(2500);
  dismissPopups();

  // 4. 헤더 발행 버튼 클릭 (발행 레이어 열기)
  const headerPublishBtn = document.querySelector('button[data-click-area="tpb.publish"], button[class*="publish_btn__"]');
  if (headerPublishBtn) {
    console.log("[100Bagger Content Script] Opening publish modal...");
    headerPublishBtn.click();
    await sleep(2500);

    // 5. 레이어 하단 최종 발행 버튼 클릭
    const confirmBtn = document.querySelector('button[data-click-area="tpb*i.publish"], button[class*="confirm_btn__"]');
    if (confirmBtn) {
      console.log("[100Bagger Content Script] Confirming final publication!");
      confirmBtn.click();

      // 리디렉션 대기 후 완료 알림
      waitForPublishComplete();
    }
  }

})();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function dismissPopups() {
  const popups = document.querySelectorAll('.se-popup-container, .se-popup, [class*="popup"]');
  popups.forEach((popup) => {
    const btns = Array.from(popup.querySelectorAll("button"));
    const cancel = btns.find((b) => {
      const t = (b.textContent || "").trim();
      return t === "취소" || t === "닫기";
    });
    if (cancel) cancel.click();
  });
  const helpClose = document.querySelector(".se-help-panel-close-button");
  if (helpClose) helpClose.click();
}

function waitForPublishComplete() {
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    const url = window.location.href;
    if (!url.includes("Redirect=Write") && !url.includes("PostWriteForm") && !url.includes("GoBlogWrite")) {
      clearInterval(interval);
      console.log("[100Bagger Content Script] Post successfully published:", url);
      chrome.runtime.sendMessage({
        action: "POST_PUBLISHED",
        postUrl: url
      });
    }
    if (attempts > 20) {
      clearInterval(interval);
    }
  }, 1000);
}

function convertToRichHtml(title, body, links) {
  // 몬모릴로나이트 오기 교정 보장
  body = body.replace(/몽모릴로나이트/g, "몬모릴로나이트");
  title = title.replace(/몽모릴로나이트/g, "몬모릴로나이트");

  const lines = body.split("\n\n");
  let html = '<div style="font-family: Pretendard, sans-serif; line-height: 1.8; color: #1e293b; font-size: 16px;">';
  
  lines.forEach((p) => {
    if (p.startsWith("## ")) {
      html += `<h3 style="color: #03C75A; font-size: 20px; font-weight: bold; margin-top: 30px; border-left: 4px solid #03C75A; padding-left: 10px;">${p.replace("## ", "")}</h3>`;
    } else if (p.startsWith("> ")) {
      html += `<div style="background-color: #f8fafc; border-left: 4px solid #03C75A; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">${p.replace("> ", "")}</div>`;
    } else if (p.startsWith("- ")) {
      html += `<ul style="margin: 14px 0 14px 20px;"><li>${p.replace(/- /g, "")}</li></ul>`;
    } else {
      html += `<p style="margin-bottom: 16px;">${p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`;
    }
  });

  html += "</div>";
  return html;
}
