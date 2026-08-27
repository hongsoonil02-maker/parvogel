import os
import sys
import json
import asyncio
import subprocess
import shutil
from PIL import Image, ImageDraw, ImageFont

# Set UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8')

WORKDIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(WORKDIR, "public", "assets")
TEMP_DIR = os.path.join(WORKDIR, "temp_parvogel_docu")
OUTPUT_VIDEO_V2 = os.path.join(ASSETS_DIR, "parvogel_clinical_documentary_v2.mp4")
OUTPUT_VIDEO_LEGACY = os.path.join(ASSETS_DIR, "parvogel_clinical_documentary.mp4")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)

FONT_PATH_BD = "C:/Windows/Fonts/malgunbd.ttf"
FONT_PATH_REG = "C:/Windows/Fonts/malgun.ttf"

def get_font(size, bold=True):
    path = FONT_PATH_BD if bold else FONT_PATH_REG
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

# 1. 10개 씬 구성 정의 (균형 잡힌 2줄 분할 자막, 세이프존 1420~1640)
SCENES = [
    {
        "id": "scene_01",
        "type": "title_card",
        "badge": "[임상 다큐] 파보겔(Parvo Gel) 리얼 치료 일지",
        "title": "55일령 발작 환축의\n7일간의 기적",
        "subtitle": "하남 사랑동물병원 김동준 원장의 실제 임상 치료 기록",
        "script": "하남 사랑동물병원 김동준 원장의 실제 임상 치료 일지. 생후 55일 된 환축의 7일간의 기적 같은 파보겔 회복 다큐멘터리입니다.",
        "duration": 11.5
    },
    {
        "id": "scene_02",
        "type": "video",
        "video_file": os.path.join(ASSETS_DIR, "kimdongjun_case_01.mp4"),
        "step": "STEP 1 : 내원 당시 급성 전신 발작(Seizure)",
        "patient_info": "환축: 푸들 믹스견 (55일령) | 안락사 위기",
        "sub_text": "2026년 7월 28일 새벽, 어린 푸들 믹스견이\n스스로 서지 못하고 온몸을 떨며 응급 내원했습니다.",
        "script": "2026년 7월 28일 새벽, 어린 푸들 믹스견이 스스로 서지 못하고 온몸을 떨며 응급 내원했습니다. 안락사까지 거론되던 위급한 순간이었습니다.",
        "min_duration": 13.5
    },
    {
        "id": "scene_03",
        "type": "video",
        "video_file": os.path.join(ASSETS_DIR, "kimdongjun_case_02.mp4"),
        "step": "STEP 1 : 처치대 위 활력 및 5종 키트 검사",
        "patient_info": "파보·코로나 5종 음성 | 급성 장독소증 의심",
        "sub_text": "파보·코로나 키트 검사는 음성(Neg).\n원인불명의 급성 장독소증 및 소화기 탈태로 긴급 진단",
        "script": "파보와 코로나 키트 검사는 음성. 김동준 원장은 원인불명의 급성 장독소증으로 인한 소화기 탈태와 신경 발작으로 진단했습니다.",
        "min_duration": 24.5
    },
    {
        "id": "scene_04",
        "type": "video",
        "video_file": os.path.join(ASSETS_DIR, "kimdongjun_case_03.mp4"),
        "step": "STEP 1 : 파보겔 원터치 펌프 긴급 1차 투약",
        "patient_info": "파보겔 1pump + 베타글루칸 0.5g 직투여",
        "sub_text": "내원 즉시 파보겔 1차 펌프를 긴급 투약했습니다.\n1-데옥시노지리마이신과 특허균주가 장내 독소를 즉시 흡착·배출",
        "script": "내원 즉시 파보겔 1차 펌프를 긴급 투약했습니다. 1-데옥시노지리마이신과 특허균주 복합체가 장 점막을 코팅하고 장내 독소를 즉시 흡착 배출하며 치료가 시작됩니다.",
        "min_duration": 15.6
    },
    {
        "id": "scene_05",
        "type": "chart_card",
        "chart_file": os.path.join(ASSETS_DIR, "clinical", "chart_day1_day2.jpg"),
        "badge": "[김동준 원장 자필 차트] Day 1 ~ Day 2",
        "step": "투약 몇 시간 만에 경련 진정 · 익일 종합백신 접종",
        "sub_text": "투약 몇 시간 만에 심한 경련이 진정되었고,\n익일 저녁 종합백신 접종이 가능할 정도로 급호전되었습니다.",
        "script": "투약 몇 시간 만에 심한 경련이 진정되었고, 다음 날 저녁에는 종합백신 접종이 가능할 정도로 활력이 급호전되었습니다.",
        "duration": 10.0
    },
    {
        "id": "scene_06",
        "type": "video",
        "video_file": os.path.join(ASSETS_DIR, "kimdongjun_case_04.mp4"),
        "step": "STEP 2 : 보행 및 자세 반사 정상화 정밀 점검",
        "patient_info": "Day 3 (7/30) | 자발 기립 및 신경계 회복",
        "sub_text": "입원 3일 차. 환축은 네 발로 꼿꼿이 일어서며,\n비틀거리던 자세 반사와 보행 능력을 완전히 회복했습니다.",
        "script": "입원 3일 차. 환축은 네 발로 꼿꼿이 일어서며, 비틀거리던 자세 반사와 보행 능력을 완전히 회복했습니다.",
        "min_duration": 24.2
    },
    {
        "id": "scene_07",
        "type": "video",
        "video_file": os.path.join(ASSETS_DIR, "kimdongjun_case_06.mp4"),
        "step": "STEP 2 : 경련 완전 소실 및 똘망한 의식 회복",
        "patient_info": "Day 4 (7/31) | 파보겔 2pump 지속 투여",
        "sub_text": "입원실 안에서 안정을 취하며 장 점막을 회복 중인 환축.\n흐려졌던 눈빛은 생기를 되찾고 고개를 꼿꼿이 듭니다.",
        "script": "입원실 안에서 안정을 취하며 장 점막을 회복 중인 환축. 흐려졌던 눈빛은 생기를 되찾고 고개를 꼿꼿이 들어 정면을 응시합니다.",
        "min_duration": 16.0
    },
    {
        "id": "scene_08",
        "type": "video",
        "video_file": os.path.join(ASSETS_DIR, "kimdongjun_case_07.mp4"),
        "step": "STEP 2 : 식욕 전폐 환축의 캔사료 폭풍 완식 먹방!",
        "patient_info": "기적의 식욕 폭발 | 밥그릇 바닥 완식",
        "sub_text": "식욕 전폐 환축의 기적 같은 캔사료 폭풍 완식 먹방!\n간 기능과 소화 흡수력이 완벽히 정상 궤도에 올랐습니다.",
        "script": "식욕을 완전히 잃었던 환축이 밥그릇에 머리를 묻고 캔사료를 폭풍 흡입합니다! 간 기능과 소화기가 완벽히 정상 궤도에 올랐음을 보여줍니다.",
        "min_duration": 12.5
    },
    {
        "id": "scene_09",
        "type": "video",
        "video_file": os.path.join(ASSETS_DIR, "kimdongjun_case_08.mp4"),
        "step": "STEP 3 : 파보겔 집중 케어 완료 및 완치 퇴원",
        "patient_info": "Day 7 (8/04) | 안락사 위기 100% 극복 완치 퇴원",
        "sub_text": "입원 7일 차. 파보겔 복합 솔루션으로 장 점막 완벽 복구.\n환축은 기적처럼 건강을 되찾고 최종 [완치 퇴원]했습니다.",
        "script": "입원 7일 차. 파보겔 복합 솔루션으로 장 점막을 완벽히 복구하고, 환축은 기적처럼 건강을 회복하고 최종 완치 퇴원했습니다.",
        "min_duration": 23.2
    },
    {
        "id": "scene_10",
        "type": "outro_card",
        "badge": "[치료 프로토콜] 급성 장염·설사 3단계 솔루션",
        "step": "1단계 파보겔 장독소 즉각 흡착 코팅 · 2단계 특허균주 장내 환경 정상화 · 3단계 활력 부스팅",
        "title": "급성 설사·장염 긴급 처방 PARVOGEL",
        "sub_text": "원인불명 급성 소화기 탈태의 1초 해답.\n수의사 및 보호자가 신뢰하는 긴급 처방 솔루션",
        "script": "원인불명의 급성 장염과 소화기 탈태의 1초 해답. 수의사와 보호자 모두가 신뢰하는 긴급 처방 솔루션, 파보겔입니다.",
        "duration": 12.0
    }
]

def create_text_image(draw, text, pos, font, fill, stroke_fill=None, stroke_width=0, align="left"):
    x, y = pos
    lines = text.split("\n")
    cur_y = y
    for line in lines:
        if align == "center":
            bbox = draw.textbbox((0, 0), line, font=font)
            w = bbox[2] - bbox[0]
            line_x = x - w / 2
        else:
            line_x = x
        draw.text((line_x, cur_y), line, font=font, fill=fill, stroke_fill=stroke_fill, stroke_width=stroke_width)
        cur_y += font.size * 1.35

# 1000px 너비 박스 + 1420~1640 영역 (하단 컨트롤러 세이프존 280px 확보)
def draw_subtitle_box(draw, text, font, box_y1=1420, box_y2=1640, max_w=900):
    box_x1, box_x2 = 40, 1040
    # 파보겔 딥 네이비 + 시안 테두리 (가독성 최상)
    draw.rounded_rectangle([(box_x1, box_y1), (box_x2, box_y2)], radius=28, fill=(5, 12, 28, 235), outline=(56, 189, 248, 220), width=3)
    
    raw_lines = text.split("\n")
    lines = []
    for r in raw_lines:
        words = r.split(" ")
        cur = ""
        for w in words:
            test = f"{cur} {w}".strip() if cur else w
            bbox = draw.textbbox((0, 0), test, font=font)
            if bbox[2] - bbox[0] <= max_w:
                cur = test
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
            
    line_h = int(font.size * 1.5)
    total_h = len(lines) * line_h
    start_y = box_y1 + (box_y2 - box_y1 - total_h) / 2
    
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        x = 540 - w / 2
        y = start_y + i * line_h
        draw.text((x, y), line, font=font, fill=(255, 255, 255, 255), stroke_fill=(0, 0, 0, 230), stroke_width=2)

def create_title_card_image(scene, out_png):
    # 파보겔 딥 블루 그라데이션 배경
    img = Image.new("RGBA", (1080, 1920), (5, 16, 38, 255))
    draw = ImageDraw.Draw(img)

    for i in range(1920):
        alpha = int(25 + (i / 1920) * 50)
        draw.line([(0, i), (1080, i)], fill=(15, 35, 75, alpha))

    draw.ellipse([(-200, 200), (1280, 800)], fill=(37, 99, 235, 35))

    font_tag = get_font(34, True)
    draw.rounded_rectangle([(140, 340), (940, 420)], radius=40, fill=(15, 35, 75, 230), outline=(56, 189, 248, 200), width=3)
    create_text_image(draw, scene["badge"], (540, 360), font_tag, (224, 242, 254, 255), align="center")

    font_main = get_font(68, True)
    create_text_image(draw, "55일령 발작 환축의\n7일간의 기적", (540, 490), font_main, (255, 255, 255, 255), (0, 0, 0, 200), 4, align="center")

    draw.line([(340, 710), (740, 710)], fill=(250, 204, 21, 255), width=6)

    font_sub = get_font(38, True)
    create_text_image(draw, scene["subtitle"], (540, 750), font_sub, (186, 230, 253, 255), align="center")

    draw.rounded_rectangle([(120, 910), (960, 1310)], radius=30, fill=(8, 24, 52, 240), outline=(37, 99, 235, 180), width=3)
    font_card_head = get_font(36, True)
    create_text_image(draw, "[ 초진 응급 프로파일 ]", (540, 950), font_card_head, (250, 204, 21, 255), align="center")

    font_spec = get_font(34, False)
    specs = [
        "• 환축 정보: 토이푸들 (♂, 55일령 초소형 자견)",
        "• 내원 일시: 2026. 07. 28 (18:50 응급 내원)",
        "• 주요 증상: 급성 전신 발작(Seizure) · 식욕 전폐",
        "• 키트 검사: 파보/코로나 장염 5종 음성(Neg)",
        "• 임상 진단: 원인불명 급성 대사성 장독소증"
    ]
    cur_y = 1020
    for s in specs:
        draw.text((160, cur_y), s, font=font_spec, fill=(241, 245, 249, 255))
        cur_y += 52

    draw.rounded_rectangle([(140, 1440), (940, 1540)], radius=50, fill=(234, 179, 8, 230))
    font_btn = get_font(42, True)
    create_text_image(draw, "안락사 위기에서 100% 완치까지", (540, 1465), font_btn, (5, 20, 48, 255), align="center")

    img.save(out_png, "PNG")

def create_chart_scene_image(scene, out_png):
    img = Image.new("RGBA", (1080, 1920), (6, 18, 42, 255))
    draw = ImageDraw.Draw(img)

    font_badge = get_font(36, True)
    draw.rounded_rectangle([(80, 80), (1000, 160)], radius=40, fill=(15, 40, 85, 240), outline=(56, 189, 248, 220), width=3)
    create_text_image(draw, scene["badge"], (540, 100), font_badge, (224, 242, 254, 255), align="center")

    if os.path.exists(scene["chart_file"]):
        chart_img = Image.open(scene["chart_file"]).convert("RGBA")
        cw, ch = chart_img.size
        target_w = 960
        target_h = int(ch * (target_w / cw))
        chart_resized = chart_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        img.paste(chart_resized, (60, 190))
        draw.rectangle([(58, 188), (60 + target_w + 2, 190 + target_h + 2)], outline=(56, 189, 248, 200), width=3)

    draw.rounded_rectangle([(60, 1140), (1020, 1390)], radius=24, fill=(10, 26, 58, 240), outline=(250, 204, 21, 200), width=3)
    font_hl_title = get_font(34, True)
    create_text_image(draw, "김동준 원장 자필 차트 핵심 기록", (540, 1165), font_hl_title, (250, 204, 21, 255), align="center")

    font_hl = get_font(30, False)
    hls = [
        "• 7/28 18:50 내원 즉시 파보겔 1차 투약 후 경련 진정",
        "• 7/28 20:00 2차 파보겔 투약 후 안락사 위기 극복",
        "• 7/29 05:50 상태 급호전으로 DHPPL 1차 종합백신 접종"
    ]
    hy = 1225
    for h in hls:
        draw.text((100, hy), h, font=font_hl, fill=(241, 245, 249, 255))
        hy += 50

    font_sub = get_font(31, True)
    draw_subtitle_box(draw, scene["sub_text"], font_sub, box_y1=1420, box_y2=1640)

    img.save(out_png, "PNG")

def create_outro_card_image(scene, out_png):
    img = Image.new("RGBA", (1080, 1920), (5, 15, 36, 255))
    draw = ImageDraw.Draw(img)

    font_top = get_font(34, True)
    draw.rounded_rectangle([(100, 100), (980, 180)], radius=40, fill=(15, 40, 85, 240), outline=(56, 189, 248, 200), width=3)
    create_text_image(draw, scene["badge"], (540, 120), font_top, (224, 242, 254, 255), align="center")

    font_title = get_font(48, True)
    create_text_image(draw, "소아 자견 급성 장독소증·설사\n3단계 치료 솔루션", (540, 220), font_title, (255, 255, 255, 255), align="center")

    steps = [
        ("1단계 : 즉각적 장벽 코팅 보호 & 장독소 흡착", "파보겔 (Parvo Gel)", "내원 즉시 1~2 pump 경구 직투여. 1-데옥시노지리마이신과\n특허균주가 장 점막을 즉시 코팅하고 병원성 독소 배출.", (56, 189, 248)),
        ("2단계 : 장관 면역 및 전해질 밸런스 부스팅", "베타글루칸 & 전해질 분말", "1회 0.5g 병용. 탈수와 전해질 불균형을 신속히 교정하여\n투약 24시간 만에 백신 접종이 가능할 정도로 전신 회복.", (234, 179, 8)),
        ("3단계 : 장내 세균총 정상화 & 재발 방지", "파보겔 지속 유지 관리", "파보겔 1pump 1일 2회 유지 급여. 파보·코로나 장염 및\n급성 설사 재발 방지와 3일 만의 식욕 완식 완벽 달성.", (99, 102, 241))
    ]

    sy = 390
    font_st_title = get_font(32, True)
    font_st_prod = get_font(34, True)
    font_st_desc = get_font(26, False)
    for title, prod, desc, color in steps:
        draw.rounded_rectangle([(80, sy), (1000, sy + 265)], radius=20, fill=(10, 24, 52, 240), outline=color, width=3)
        draw.text((110, sy + 18), title, font=font_st_title, fill=color)
        draw.text((110, sy + 64), f"처방: {prod}", font=font_st_prod, fill=(255, 255, 255, 255))
        create_text_image(draw, desc, (110, sy + 125), font_st_desc, (203, 213, 225, 255))
        sy += 290

    draw.rounded_rectangle([(80, 1290), (1000, 1395)], radius=24, fill=(15, 45, 95, 255), outline=(56, 189, 248, 255), width=3)
    font_brand = get_font(42, True)
    create_text_image(draw, "PARVOGEL (파보겔)", (540, 1305), font_brand, (250, 204, 21, 255), align="center")
    font_sub_brand = get_font(26, True)
    create_text_image(draw, "동물병원·가축 및 반려동물 장 건강 처방 보조제 · 한국아그로", (540, 1355), font_sub_brand, (224, 242, 254, 255), align="center")

    font_sub = get_font(31, True)
    draw_subtitle_box(draw, scene["sub_text"], font_sub, box_y1=1420, box_y2=1640)

    img.save(out_png, "PNG")

def create_video_overlay_image(scene, out_png):
    img = Image.new("RGBA", (1080, 1920), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 파보겔 딥 네이비 상단 배너
    draw.rounded_rectangle([(60, 80), (1020, 180)], radius=24, fill=(8, 24, 52, 235), outline=(56, 189, 248, 220), width=3)
    font_step = get_font(34, True)
    create_text_image(draw, scene["step"], (540, 100), font_step, (250, 204, 21, 255), align="center")

    font_pat = get_font(28, True)
    create_text_image(draw, scene["patient_info"], (540, 142), font_pat, (224, 242, 254, 255), align="center")

    font_sub = get_font(31, True)
    draw_subtitle_box(draw, scene["sub_text"], font_sub, box_y1=1420, box_y2=1640)

    img.save(out_png, "PNG")

async def main():
    print("=== 파보겔 김동준 원장 임상 다큐멘터리 제작 시작 (파보겔 에디션) ===")
    
    import edge_tts
    scene_clips = []
    
    for i, sc in enumerate(SCENES, 1):
        print(f"[{i}/{len(SCENES)}] 내레이션 및 그래픽 생성: {sc['id']}")
        audio_path = os.path.join(TEMP_DIR, f"{sc['id']}_voice.mp3")
        if not os.path.exists(audio_path):
            comm = edge_tts.Communicate(sc["script"], "ko-KR-InJoonNeural", rate="-2%")
            await comm.save(audio_path)
            
        res = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', audio_path], capture_output=True, text=True)
        voice_dur = float(res.stdout.strip())
        sc["voice_duration"] = voice_dur

        overlay_png = os.path.join(TEMP_DIR, f"{sc['id']}_overlay.png")
        if sc["type"] == "title_card":
            create_title_card_image(sc, overlay_png)
        elif sc["type"] == "chart_card":
            create_chart_scene_image(sc, overlay_png)
        elif sc["type"] == "outro_card":
            create_outro_card_image(sc, overlay_png)
        elif sc["type"] == "video":
            create_video_overlay_image(sc, overlay_png)
        sc["overlay_png"] = overlay_png

    print("\n=== 각 씬별 비디오 클립 렌더링 (48000Hz 2ch 표준화) ===")
    for i, sc in enumerate(SCENES, 1):
        out_clip = os.path.join(TEMP_DIR, f"{sc['id']}_final.mp4")
        voice_dur = sc["voice_duration"]
        voice_path = os.path.join(TEMP_DIR, f"{sc['id']}_voice.mp3")
        overlay_png = sc["overlay_png"]

        if sc["type"] in ["title_card", "chart_card", "outro_card"]:
            dur = max(sc["duration"], voice_dur + 1.0)
            print(f"[{i}] 카드 씬 렌더링: {sc['id']} (길이: {dur:.2f}초)")
            cmd = [
                "ffmpeg", "-y",
                "-loop", "1", "-t", str(dur), "-i", overlay_png,
                "-i", voice_path,
                "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
                "-r", "30", "-s", "1080x1920",
                "-shortest",
                out_clip
            ]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
        elif sc["type"] == "video":
            src_vid = sc["video_file"]
            res = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', src_vid], capture_output=True, text=True)
            vid_dur = float(res.stdout.strip())
            
            target_dur = max(vid_dur, voice_dur + 0.8)
            pad_dur = max(0, target_dur - vid_dur)
            print(f"[{i}] 비디오 씬 렌더링: {sc['id']} (원래 영상: {vid_dur:.2f}초, 최종: {target_dur:.2f}초)")

            vf = f"tpad=stop_mode=clone:stop_duration={pad_dur:.2f},scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black[vbase];[vbase][1:v]overlay=0:0[vout]"
            af = "[0:a]volume=0.2[aorig];[2:a]volume=1.0[avoice];[aorig][avoice]amix=inputs=2:duration=longest:dropout_transition=2[aout]"
            
            cmd = [
                "ffmpeg", "-y",
                "-i", src_vid,
                "-i", overlay_png,
                "-i", voice_path,
                "-filter_complex", f"{vf};{af}",
                "-map", "[vout]", "-map", "[aout]",
                "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
                "-r", "30",
                "-t", str(target_dur),
                out_clip
            ]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        scene_clips.append(out_clip)

    print("\n=== 최종 10개 씬 합본 인코딩 ===")
    concat_list = os.path.join(TEMP_DIR, "concat_list.txt")
    with open(concat_list, "w", encoding="utf-8") as f:
        for clip in scene_clips:
            clip_fixed = clip.replace("\\", "/")
            f.write(f"file '{clip_fixed}'\n")

    raw_output = os.path.join(TEMP_DIR, "raw_documentary.mp4")
    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_list,
        "-c:v", "copy",
        "-c:a", "copy",
        raw_output
    ]
    subprocess.run(concat_cmd, check=True)

    print("\n=== 모바일 고속 스트리밍 및 깃허브 50MB 제한 준수 최적화 ===")
    opt_cmd = [
        "ffmpeg", "-y",
        "-i", raw_output,
        "-c:v", "libx264", "-crf", "25", "-preset", "medium", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "128k", "-ar", "48000",
        OUTPUT_VIDEO_V2
    ]
    subprocess.run(opt_cmd, check=True)

    # Legacy copy for compatibility
    shutil.copy2(OUTPUT_VIDEO_V2, OUTPUT_VIDEO_LEGACY)

    print(f"\n🎉 최종 파보겔 다큐멘터리 비디오 생성 완료: {OUTPUT_VIDEO_V2}")

    res = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration,size', '-of', 'json', OUTPUT_VIDEO_V2], capture_output=True, text=True)
    info = json.loads(res.stdout)
    tot_dur = float(info['format']['duration'])
    tot_size_mb = int(info['format']['size']) / (1024 * 1024)
    print(f"📊 최종 영상 길이: {int(tot_dur // 60)}분 {int(tot_dur % 60)}초 ({tot_dur:.2f}초)")
    print(f"📦 파일 용량: {tot_size_mb:.2f} MB")

if __name__ == "__main__":
    asyncio.run(main())
