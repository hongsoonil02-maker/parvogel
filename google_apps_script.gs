/**
 * ==============================================================================
 * 파보겔(PARVOGEL) 주문/상담 접수 자동 수신 구글 앱스 스크립트 (Google Apps Script)
 * ==============================================================================
 * 
 * [설치 및 설정 방법]
 * 1. Google Sheets(구글 시트)를 하나 새로 생성합니다. (예: "파보겔_주문접수_DB")
 * 2. 상단 메뉴 [확장 프로그램] -> [Apps Script] 클릭.
 * 3. 기존 코드를 모두 지우고 이 파일(google_apps_script.gs)의 전체 코드를 복사하여 붙여넣습니다.
 * 4. 우측 상단 [배포] 버튼 -> [새 배포] 클릭.
 * 5. 톱니바퀴 아이콘 [유형 선택] -> [웹 앱] 선택.
 * 6. 설정 항목:
 *    - 설명: 파보겔 주문 수신 API v1
 *    - 다음 사용자 권한으로 실행: 나 (웹 앱 소유자)
 *    - 액세스 권한 있는 사용자: 누구나 (Anyone) ⚠️ 필수!
 * 7. [배포] 버튼 클릭 후 접근 권한 승인 (Google 계정 선택 -> 고급 -> 프로젝트로 이동(안전하지 않음) -> 허용).
 * 8. 생성된 "웹 앱 URL" (https://script.google.com/macros/s/XXXXX/exec)을 복사합니다.
 * 9. 환경 변수 파일 (.env)의 VITE_GOOGLE_APPS_SCRIPT_URL 에 해당 URL을 지정합니다.
 * ==============================================================================
 */

// 🔔 알림받을 이메일 주소 (필요시 변경 가능)
const ADMIN_EMAIL = "name_hyosun@naver.com";

function doPost(e) {
  const lock = LockService.getScriptLock();
  // 동시 요청 10초 대기 처리
  try {
    lock.waitLock(10000);
  } catch (err) {
    return createJsonResponse({ status: "error", message: "Lock timeout" });
  }

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 시트가 비어있으면 헤더(열 제목) 자동 작성
    if (sheet.getLastRow() === 0) {
      const headers = [
        "접수시각",
        "신청구분",
        "병원/농장/업체명",
        "담당자/수의사명",
        "사업자등록번호",
        "연락처",
        "이메일",
        "배송주소",
        "희망제품",
        "수량(병)",
        "예상월구매량",
        "문의사항/특이사항",
        "요청ID"
      ];
      sheet.appendRow(headers);
      
      // 헤더 서식 지정 (배경색, 굵게)
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1E40AF");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // 파라미터 추출
    const p = e.parameter || {};
    const requestId = p.requestId || "";
    const requestType = translateRequestType(p.requestType);
    const hospitalName = p.hospitalName || "";
    const contactName = p.contactName || "";
    const bizNumber = p.bizNumber || "-";
    const phone = p.phone || "";
    const email = p.email || "-";
    const address = p.address || "-";
    const product = p.product || "-";
    const quantity = p.quantity || "1";
    const orderVolume = p.orderVolume || "-";
    const message = p.message || "-";
    const timestamp = p.timestamp ? new Date(p.timestamp) : new Date();

    // 중복 검사 (요청 ID 기준)
    if (requestId && isDuplicate(sheet, requestId)) {
      return createJsonResponse({ status: "duplicate", message: "Duplicate submission" });
    }

    // 시트에 새 행 추가
    const newRow = [
      formatDate(timestamp),
      requestType,
      hospitalName,
      contactName,
      bizNumber,
      phone,
      email,
      address,
      product,
      quantity,
      orderVolume,
      message,
      requestId
    ];
    
    sheet.appendRow(newRow);

    // 알림 이메일 발송 (관리자)
    sendAdminNotification({
      requestType: requestType,
      hospitalName: hospitalName,
      contactName: contactName,
      phone: phone,
      email: email,
      product: product,
      quantity: quantity,
      message: message,
      timestamp: formatDate(timestamp)
    });

    return createJsonResponse({ status: "success", message: "Order logged successfully" });

  } catch (err) {
    Logger.log("Error in doPost: " + err.toString());
    return createJsonResponse({ status: "error", message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return createJsonResponse({ status: "online", service: "Parvogel Order API" });
}

// 응답 헬퍼
function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// 신청 구분 한국어 변환
function translateRequestType(type) {
  switch (type) {
    case "hospital": return "🏥 동물병원·수의사";
    case "wholesale": return "📦 도매·대리점";
    case "consumer":
    default: return "🛒 일반 구매";
  }
}

// 중복 검사 헬퍼 (13열 요청ID 확인)
function isDuplicate(sheet, requestId) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  
  // 최근 50개 행 검사
  const startRow = Math.max(2, lastRow - 50);
  const numRows = lastRow - startRow + 1;
  const values = sheet.getRange(startRow, 13, numRows, 1).getValues();
  
  for (var i = 0; i < values.length; i++) {
    if (values[i][0] === requestId) {
      return true;
    }
  }
  return false;
}

// 날짜 포맷 (YYYY-MM-DD HH:mm:ss)
function formatDate(date) {
  return Utilities.formatDate(date, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
}

// 관리자 알림 메일 전송
function sendAdminNotification(data) {
  if (!ADMIN_EMAIL) return;
  try {
    const subject = `[파보겔 주문접수] ${data.requestType} - ${data.hospitalName} (${data.contactName} 님)`;
    const body = `
📌 [파보겔 랜딩페이지 새로운 주문/상담이 접수되었습니다]

- 접수시각: ${data.timestamp}
- 신청구분: ${data.requestType}
- 병원/농장/업체명: ${data.hospitalName}
- 담당자/수의사명: ${data.contactName}
- 연락처: ${data.phone}
- 이메일: ${data.email}
- 신청제품: ${data.product} (${data.quantity}병)
- 문의사항: ${data.message}

구글 시트에서 전체 주문 내용을 확인하실 수 있습니다.
    `;
    MailApp.sendEmail(ADMIN_EMAIL, subject, body);
  } catch (err) {
    Logger.log("Email notification failed: " + err.toString());
  }
}
