import os
import sys
import time
import datetime
import json
import requests
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

USER_ID = os.getenv('ALIGO_USER_ID', 'soonilhong')
API_KEY = os.getenv('ALIGO_API_KEY', 'y4xt0vtm22eamrq8u9bbvoqmxedk6bxi')
SENDER_PHONE = os.getenv('ALIGO_SENDER', '01054075708').replace('-', '').strip()
BASE_URL = 'https://apis.aligo.in'

TEMPLATE_PATH = os.path.join('marketing_factory', 'drafts', 'Chuseok_Friends_Gift_LMS_Template.txt')
TARGETS_PATH = os.path.join('data', 'target_dispatch', '알리고_지인주소록_010정제명단_20260924.csv')

def load_template():
    with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    lines = content.strip().split('\n')
    subject = lines[0].strip()
    body = '\n'.join(lines[1:]).strip()
    return subject, body

def prepare_upload_files():
    title, body = load_template()
    df_targets = pd.read_csv(TARGETS_PATH)
    
    # 010 휴대폰 번호 정리 (엑셀에서 0이 지워지지 않도록 하이픈 포맷 적용)
    def format_phone(p):
        digits = ''.join(c for c in str(p) if c.isdigit())
        if len(digits) == 10 and digits.startswith('10'):
            digits = '0' + digits
        if len(digits) == 11 and digits.startswith('010'):
            return f"{digits[:3]}-{digits[3:7]}-{digits[7:]}"
        return digits

    df_targets['수신번호'] = df_targets['전화번호'].apply(format_phone)
    df_targets['발신번호'] = '010-5407-5708'
    df_targets['제목'] = title
    df_targets['메시지'] = body
    
    upload_df = df_targets[['수신번호', '발신번호', '제목', '메시지', '이름']].copy()
    
    excel_path = os.path.join('data', 'target_dispatch', '알리고_추석지인선물_3724명_대량발송_업로드용.xlsx')
    csv_path = os.path.join('data', 'target_dispatch', '알리고_추석지인선물_3724명_대량발송_업로드용.csv')
    
    upload_df.to_excel(excel_path, index=False)
    upload_df.to_csv(csv_path, index=False, encoding='utf-8-sig')
    
    print(f"알리고 웹 업로드용 파일 준비 완료:")
    print(f" - Excel: {excel_path} (총 {len(upload_df):,}건)")
    print(f" - CSV: {csv_path}")
    return upload_df, excel_path, csv_path

def send_aligo_reservation(receiver_list, title, msg, rdate='20260924', rtime='1400'):
    url = f"{BASE_URL}/send/"
    payload = {
        'key': API_KEY,
        'user_id': USER_ID,
        'sender': SENDER_PHONE,
        'receiver': ','.join(str(r).replace('-', '').strip() for r in receiver_list),
        'msg': msg,
        'title': title[:40],
        'msg_type': 'LMS',
        'rdate': rdate,
        'rtime': rtime
    }
    try:
        res = requests.post(url, data=payload, timeout=30)
        if res.status_code == 200:
            return res.json()
        return {'result_code': -1, 'message': f'HTTP {res.status_code}', 'raw': res.text}
    except Exception as e:
        return {'result_code': -1, 'message': str(e)}

def run_reservation():
    title, body = load_template()
    upload_df, excel_path, csv_path = prepare_upload_files()
    all_phones = upload_df['수신번호'].tolist()
    
    rdate = '20260924'
    rtime = '1400'
    
    print("\n================================================================")
    print(f"  ★ 알리고 서버 오늘 오후 2시(14:00) 예약 발송 시도 ★")
    print(f"  - 발송 일시: {rdate[:4]}-{rdate[4:6]}-{rdate[6:]} {rtime[:2]}:{rtime[2:]}")
    print(f"  - 총 수신자 수: {len(all_phones):,}명")
    print("================================================================")
    
    # 잔여 건수 및 IP 인증 상태 사전 점검
    remain = requests.post(f"{BASE_URL}/remain/", data={'key': API_KEY, 'user_id': USER_ID}).json()
    print("연결 진단 결과:", remain)
    
    if str(remain.get('result_code')) != '1':
        print(f"\n[오류] 알리고 연결 실패: {remain.get('message')}")
        return False
    print(f"현재 발송 가능 잔여 LMS: {remain.get('LMS_CNT'):,}건")
        
    chunk_size = 500
    success_total = 0
    fail_total = 0
    batch_results = []
    
    for i in range(0, len(all_phones), chunk_size):
        chunk = all_phones[i:i+chunk_size]
        batch_no = i // chunk_size + 1
        print(f"\n[배치 {batch_no}] {len(chunk)}명 서버 예약 등록 중...")
        res = send_aligo_reservation(chunk, title, body, rdate=rdate, rtime=rtime)
        print(f"응답:", res)
        
        is_ok = str(res.get('result_code')) == '1'
        if is_ok:
            succ = int(res.get('success_cnt', len(chunk)))
            err = int(res.get('error_cnt', 0))
        else:
            succ = 0
            err = len(chunk)
            
        success_total += succ
        fail_total += err
        batch_results.append({
            'batch': batch_no,
            'count': len(chunk),
            'success': succ,
            'fail': err,
            'msg_id': res.get('msg_id'),
            'response': res
        })
        time.sleep(0.5)
        
    result_log_path = os.path.join('data', 'target_dispatch', f'알리고_추석지인예약등록결과_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
    with open(result_log_path, 'w', encoding='utf-8') as f:
        json.dump({
            'rdate': rdate,
            'rtime': rtime,
            'total': len(all_phones),
            'success': success_total,
            'fail': fail_total,
            'batches': batch_results
        }, f, indent=2, ensure_ascii=False)
        
    print(f"\n★ 서버 예약 등록 완료! 성공: {success_total:,}건 / 실패: {fail_total:,}건")
    print(f"결과 로그: {result_log_path}")
    return True

if __name__ == '__main__':
    run_reservation()
