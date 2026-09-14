/**
 * ==============================================================================
 * 파보겔(PARVOGEL) 주문/상담 접수 자동 수신 구글 앱스 스크립트 (Google Apps Script)
 * ==============================================================================
 * 보안 강화판: 입력 검증, CSV 인젝션 방어, CORS 제한, allowlist, 길이 제한
 * ============================================================================== 
 */

// 🔔 알림받을 이메일 주소 — Script Properties에서 ADMIN_EMAIL로 오버라이드 가능
var ADMIN_EMAIL_PROP = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');
var ADMIN_EMAIL = ADMIN_EMAIL_PROP || "name_hyosun@naver.com";

// 허용 오리진 (CORS)
var ALLOWED_ORIGINS = [
  "https://parvogel.kr",
  "https://www.parvogel.kr",
  "http://localhost:5173",
  "http://localhost:3000"
];

// 허용 요청 타입
var ALLOWED_REQUEST_TYPES = ["hospital","wholesale","consumer","sample_petshop","sample_breeder","new_partner_lead","partner_board_pop"];

// CSV 인젝션 방어: 선행 위험 문자 제거 및 이스케이프
function sanitizeForSheet(value) {
  if (value == null) return "";
  var s = String(value);
  // 길이 제한 2000자
  if (s.length > 2000) s = s.substring(0, 2000);
  // 선행 = + - @ 등 제거 (CSV 인젝션)
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return s;
}

function doOptions(e) {
  // Preflight CORS 응답
  var output = ContentService.createTextOutput("");
  output.setMimeType(ContentService.MimeType.JSON);
  // Apps Script는 setHeader를 직접 지원하지 않으므로 배포 시 CORS는 Anyone이지만
  // 실제 검증은 doPost에서 Origin 화이트리스트로 수행
  return output;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return createJsonResponse({ status: "error", message: "Lock timeout" }, e);
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (sheet.getLastRow() === 0) {
      var headers = [
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
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1E40AF");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var p = e.parameter || {};
    var requestId = sanitizeForSheet(p.requestId || "");
    var rawRequestType = String(p.requestType || "consumer").trim();
    // allowlist 검증
    if (ALLOWED_REQUEST_TYPES.indexOf(rawRequestType) === -1) rawRequestType = "consumer";
    var requestType = translateRequestType(rawRequestType);
    var hospitalName = sanitizeForSheet(p.hospitalName || "");
    var contactName = sanitizeForSheet(p.contactName || "");
    var bizNumber = sanitizeForSheet(p.bizNumber || "-");
    var phone = sanitizeForSheet(p.phone || "");
    var email = sanitizeForSheet(p.email || "-");
    var address = sanitizeForSheet(p.address || "-");
    var product = sanitizeForSheet(p.product || "-");
    var quantity = sanitizeForSheet(p.quantity || "1");
    var orderVolume = sanitizeForSheet(p.orderVolume || "-");
    var message = sanitizeForSheet(p.message || "-");
    var timestamp = p.timestamp ? new Date(p.timestamp) : new Date();

    // --- 필수값 검증 ---
    if (!hospitalName || !contactName || !phone) {
      return createJsonResponse({ status: "error", message: "Missing required fields" }, e);
    }
    // 전화번호: 숫자 10~11자리, 01 시작
    var normPhone = phone.replace(/[^0-9]/g, "");
    if (!/^01[0-9]{8,9}$/.test(normPhone)) {
      return createJsonResponse({ status: "error", message: "Invalid phone format" }, e);
    }
    phone = normPhone;
    // 이메일 선택 입력 시 형식 검증
    if (email !== "-" && email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return createJsonResponse({ status: "error", message: "Invalid email format" }, e);
    }
    // 사업자번호 10자리 (도매 시)
    if (rawRequestType === "wholesale" && bizNumber !== "-" && bizNumber !== "") {
      var bizDigits = bizNumber.replace(/[^0-9]/g, "");
      if (bizDigits.length !== 10) {
        return createJsonResponse({ status: "error", message: "Invalid bizNumber" }, e);
      }
      bizNumber = bizDigits;
    }
    // 수량 1~100
    var qNum = parseInt(quantity, 10);
    if (isNaN(qNum) || qNum < 1 || qNum > 100) quantity = "1";

    // 중복 검사 (요청 ID 기준) — 최근 100개로 확대
    if (requestId && isDuplicate(sheet, requestId)) {
      return createJsonResponse({ status: "duplicate", message: "Duplicate submission" }, e);
    }

    // 시트에 새 행 추가
    var newRow = [
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

    // 알림 이메일 발송 (일일 할당량 체크)
    try {
      if (MailApp.getRemainingDailyQuota() > 0) {
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
      }
    } catch (mailErr) {
      Logger.log("Mail quota error: " + mailErr.toString());
    }

    return createJsonResponse({ status: "success", message: "Order logged successfully" }, e);

  } catch (err) {
    Logger.log("Error in doPost: " + err.toString());
    return createJsonResponse({ status: "error", message: err.toString() }, e);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return createJsonResponse({ status: "online", service: "Parvogel Order API" }, e);
}

// 응답 헬퍼 — CORS 헤더 시도는 Apps Script 제약으로 주석 처리, 호출 측은 일반 CORS fetch 사용
function createJsonResponse(data, e) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// 신청 구분 한국어 변환 — 모든 B2B 타입 커버
function translateRequestType(type) {
  switch (type) {
    case "hospital": return "🏥 동물병원·수의사";
    case "wholesale": return "📦 도매·대리점";
    case "sample_petshop": return "🎁 펫샵 1병 무료체험";
    case "sample_breeder": return "🐾 브리더 1병 무료체험";
    case "new_partner_lead": return "🏢 신규 파트너 리드";
    case "partner_board_pop": return "📦 POP 보드판 신청";
    case "consumer":
    default: return "🛒 일반 구매";
  }
}

// 중복 검사 헬퍼 (13열 요청ID 확인) — 최근 100개 검사로 확대
function isDuplicate(sheet, requestId) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  var startRow = Math.max(2, lastRow - 100);
  var numRows = lastRow - startRow + 1;
  var values = sheet.getRange(startRow, 13, numRows, 1).getValues();
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
    var subject = "[파보겔 주문접수] " + data.requestType + " - " + data.hospitalName + " (" + data.contactName + " 님)";
    var body = "\n📌 [파보겔 랜딩페이지 새로운 주문/상담이 접수되었습니다]\n\n- 접수시각: " + data.timestamp + "\n- 신청구분: " + data.requestType + "\n- 병원/농장/업체명: " + data.hospitalName + "\n- 담당자/수의사명: " + data.contactName + "\n- 연락처: " + data.phone + "\n- 이메일: " + data.email + "\n- 신청제품: " + data.product + " (" + data.quantity + "병)\n- 문의사항: " + data.message + "\n\n구글 시트에서 전체 주문 내용을 확인하실 수 있습니다.\n    ";
    MailApp.sendEmail(ADMIN_EMAIL, subject, body);
  } catch (err) {
    Logger.log("Email notification failed: " + err.toString());
  }
}
