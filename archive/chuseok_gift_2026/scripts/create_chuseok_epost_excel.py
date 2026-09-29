import os, sys, re, json, datetime, argparse, urllib.request

try:
    import xlrd, xlwt
    HAS_XLS = True
except ImportError:
    HAS_XLS = False

try:
    import openpyxl
    HAS_XLSX = True
except ImportError:
    HAS_XLSX = False

sys.stdout.reconfigure(encoding='utf-8')

SCRIPT_URL    = 'https://script.google.com/macros/s/AKfycbzlKnHOihU_r_trfYKQ35P2NKoZFU2loVtTk9C30aiBAvY9Odw4nkSfW3cYKnTZGS90NQ/exec'
TEMPLATE_PATH = r'C:\Users\master\Downloads\template_befrecev_parcel_new.xls'
OUT_DIR       = r'C:\Users\master\parvogel_landing\data\target_dispatch'
DOWNLOADS     = r'C:\Users\master\Downloads'
TODAY         = datetime.datetime.now().strftime('%Y%m%d')

# ------------------------------------------------------------------
# 내장 수동 데이터 -- 구글 시트에서 복사한 건을 아래에 직접 추가 가능
# 형식: {'name':'수령인명', 'contactName':'담당자', 'phone':'010-xxxx-xxxx',
#        'address':'전체주소', 'quantity':'1'}
# ------------------------------------------------------------------
MANUAL_ENTRIES = []


def normalize_phone(raw):
    d = re.sub(r'\D', '', str(raw))
    if len(d) == 10 and d.startswith('10'):
        d = '0' + d
    if len(d) == 11 and d.startswith('010'):
        return f'{d[:3]}-{d[3:7]}-{d[7:]}'
    return d or '010-5407-5708'


def split_address(addr):
    t = addr.strip().split()
    if len(t) <= 3:
        return addr.strip(), ' '
    si = min(4, len(t) - 1)
    return ' '.join(t[:si]), ' '.join(t[si:])


def fetch_from_sheet():
    url = SCRIPT_URL + '?action=export_chuseok'
    print(f'[FETCH] {url}')
    try:
        with urllib.request.urlopen(url, timeout=15) as res:
            payload = json.loads(res.read().decode('utf-8'))
        if payload.get('status') != 'ok':
            print(f'  Warning: {payload.get("message")}')
            return []
        rows = payload.get('rows', [])
        print(f'  OK: {len(rows)}건 조회 성공')
        return rows
    except Exception as e:
        print(f'  Error: {e}')
        return []


def load_local_cache():
    p = os.path.join(OUT_DIR, 'chuseok_gift_applications.json')
    if not os.path.exists(p):
        return []
    with open(p, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f'  OK: 로컬 캐시 {len(data)}건')
    return data


def save_cache(entries):
    p = os.path.join(OUT_DIR, 'chuseok_gift_applications.json')
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
    print(f'  캐시 저장: {p}')


def build_row(entry):
    name    = str(entry.get('name', entry.get('contactName', '수신인'))).strip()
    contact = str(entry.get('contactName', '')).strip()
    phone   = normalize_phone(entry.get('phone', ''))
    addr    = str(entry.get('address', '-')).strip()
    qty_raw = str(entry.get('quantity', '1')).strip()
    qty     = int(qty_raw) if qty_raw.isdigit() else 1

    label  = f'{name}({contact})' if contact and contact != name and len(contact) <= 20 else name
    base, detail = split_address(addr)

    if qty > 1:
        req_msg = f'[추석선물] 파보겔 나노 100ml {qty}병 동봉 (배송전 연락바랍니다)'
    else:
        req_msg = f'[추석선물] 파보겔 나노 100ml 1병 (배송전 연락바랍니다)'

    return [label, '', base, detail, '', phone, '1', '60', '', '파보겔 나노', '', req_msg, 'N']


def write_xls(entries, count):
    if not HAS_XLS:
        print('xlwt 없음, XLSX로 전환')
        return write_xlsx(entries, count)

    if os.path.exists(TEMPLATE_PATH):
        tpl        = xlrd.open_workbook(TEMPLATE_PATH)
        st         = tpl.sheet_by_index(0)
        sheet_name = st.name
        headers    = st.row_values(0)
    else:
        print(f'  Warning: 템플릿 없음 ({TEMPLATE_PATH}) — 자체 포맷 사용')
        sheet_name = '창구소포 파일접수양식'
        headers = ['받는 분', '우편번호', '주소(시도+시군구+도로명+건물번호)',
                   '상세주소(동 호수 아파트 건물명 등)', '일반전화', '휴대전화',
                   '중량(kg)', '부피(cm)', '내용품코드', '내용물', '배달방식',
                   '배송시요청사항', '분할접수여부(Y/N)']

    wb = xlwt.Workbook(encoding='utf-8')
    ws = wb.add_sheet(sheet_name)
    for ci, h in enumerate(headers):
        ws.write(0, ci, str(h))
    for ri, e in enumerate(entries, 1):
        for ci, v in enumerate(build_row(e)):
            ws.write(ri, ci, v)

    fn = f'우체국택배_파보겔_추석지인선물_{count}건_{TODAY}_신규양식.xls'
    p1 = os.path.join(DOWNLOADS, fn)
    p2 = os.path.join(OUT_DIR, fn)
    wb.save(p1)
    wb.save(p2)
    print(f'\n  OK XLS 저장:')
    print(f'     {p1}  ({os.path.getsize(p1):,} bytes)')
    print(f'     {p2}')
    return p1


def write_xlsx(entries, count):
    if not HAS_XLSX:
        print('openpyxl 없음')
        return ''
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = '창구소포 파일접수양식'
    ws.append(['받는 분', '우편번호', '주소(기본)', '상세주소', '일반전화', '휴대전화',
               '중량(kg)', '부피(cm)', '내용품코드', '내용물', '배달방식', '배송시요청사항', '분할접수여부'])
    for e in entries:
        ws.append(build_row(e))
    fn = f'우체국택배_파보겔_추석지인선물_{count}건_{TODAY}_신규양식.xlsx'
    p1 = os.path.join(DOWNLOADS, fn)
    p2 = os.path.join(OUT_DIR, fn)
    wb.save(p1)
    wb.save(p2)
    print(f'\n  OK XLSX 저장:')
    print(f'     {p1}  ({os.path.getsize(p1):,} bytes)')
    print(f'     {p2}')
    return p1


def print_summary(entries):
    print('\n' + '=' * 65)
    print(f'  추석 지인 선물 샘플 신청 접수 현황 -- 총 {len(entries)}건')
    print('=' * 65)
    for i, e in enumerate(entries, 1):
        name  = str(e.get('name', e.get('contactName', '?'))).strip()[:14]
        phone = normalize_phone(e.get('phone', ''))
        addr  = str(e.get('address', '')).strip()[:26]
        qty   = str(e.get('quantity', '1'))
        print(f'  {i:>3}. {name:<14} {phone}  {addr}  ({qty}병)')
    print('=' * 65 + '\n')


def main():
    pa = argparse.ArgumentParser(description='추석 지인 선물 신청 -> 우체국 택배 접수 엑셀 생성')
    pa.add_argument('--fetch',  action='store_true', help='Apps Script에서 실시간 데이터')
    pa.add_argument('--local',  action='store_true', help='로컬 캐시 JSON 읽기')
    pa.add_argument('--manual', action='store_true', help='MANUAL_ENTRIES 사용')
    pa.add_argument('--xlsx',   action='store_true', help='XLSX 포맷으로 생성')
    args = pa.parse_args()

    print('\n추석 지인 선물 샘플 신청 -> 우체국택배 신규양식 생성기')
    print('=' * 65)

    entries = []

    if args.fetch or (not args.local and not args.manual):
        entries = fetch_from_sheet()
        if entries:
            save_cache(entries)

    if not entries:
        entries = load_local_cache()

    if not entries and args.manual:
        entries = list(MANUAL_ENTRIES)

    if not entries:
        print('\nERROR: 데이터 없음.')
        print('  Apps Script 재배포 후: python scripts/create_chuseok_epost_excel.py --fetch')
        print('  또는 MANUAL_ENTRIES에 직접 데이터 입력 후: ... --manual')
        sys.exit(1)

    valid   = [e for e in entries if len(str(e.get('address', '')).strip()) > 5]
    skipped = len(entries) - len(valid)
    if skipped:
        print(f'  Warning: 주소 불완전 {skipped}건 제외 (발송 불가)')

    print_summary(valid)
    count = len(valid)

    if args.xlsx or not HAS_XLS:
        out = write_xlsx(valid, count)
    else:
        out = write_xls(valid, count)

    if out:
        print(f'\n우체국 EPost -> 창구소포 파일접수 메뉴에서 업로드하세요:')
        print(f'   {out}')
        print(f'   URL: https://epost.go.kr -> 택배 -> 발송 -> 파일접수')

    print('\nDone!')


if __name__ == '__main__':
    main()
