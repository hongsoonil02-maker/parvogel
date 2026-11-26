import json
import os
import sys
from typing import Any, Dict

# 프로젝트 루트를 sys.path에 추가해 단독 stdio 실행 시에도 marketing_factory 패키지 임포트 보장
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from marketing_factory.core.higgsfield_broll_client import HiggsfieldBrollClient
from marketing_factory.core.review_shorts_generator import ReviewShortsGenerator


TOOLS_SCHEMA = [
    {
        "name": "check_higgsfield_auth",
        "description": "Check Higgsfield API key/secret status, 720p lock policy, supported low-cost models, and disk cache directory.",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "additionalProperties": False,
        },
    },
    {
        "name": "estimate_broll_cost",
        "description": "Calculate monthly credits and estimated USD/KRW operating cost for 720p B-roll vs 1080p full AI generation.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "episodes_per_month": {"type": "integer", "default": 30},
                "broll_cuts_per_episode": {"type": "integer", "default": 2},
                "cut_duration_sec": {"type": "integer", "default": 5},
                "model": {
                    "type": "string",
                    "enum": ["kling-3.0-720p", "seedance-2.5-720p"],
                    "default": "kling-3.0-720p",
                },
                "cache_hit_ratio": {"type": "number", "default": 0.0},
            },
        },
    },
    {
        "name": "generate_720p_broll",
        "description": (
            "Generate or retrieve cached/fallback 720p situation B-roll clip. "
            "Strictly enforces 720p resolution and blocks product bottle/label generation."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "prompt": {"type": "string"},
                "scene_role": {"type": "string", "default": "dog_situation_cut"},
                "duration_sec": {"type": "integer", "default": 5},
                "model": {
                    "type": "string",
                    "enum": ["kling-3.0-720p", "seedance-2.5-720p"],
                    "default": "kling-3.0-720p",
                },
                "fallback_file": {"type": "string"},
            },
            "required": ["prompt"],
        },
    },
    {
        "name": "generate_review_shorts_master",
        "description": "Analyze customer reviews (text/CSV/JSON) and generate a compliance-filtered review_hook Master JSON.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "product_name": {"type": "string", "default": "ParvoGel"},
                "reviews_source": {"type": "string"},
                "hook_pattern": {
                    "type": "string",
                    "enum": ["auto", "empathy_question", "review_metric", "contrast_crisis"],
                    "default": "auto",
                },
                "model": {
                    "type": "string",
                    "enum": ["kling-3.0-720p", "seedance-2.5-720p"],
                    "default": "kling-3.0-720p",
                },
            },
            "required": ["product_name", "reviews_source"],
        },
    },
]


def _execute_tool(name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    client = HiggsfieldBrollClient()
    if name == "check_higgsfield_auth":
        return client.check_auth_status()
    if name == "estimate_broll_cost":
        return client.estimate_monthly_cost(
            episodes_per_month=int(arguments.get("episodes_per_month", 30)),
            broll_cuts_per_episode=int(arguments.get("broll_cuts_per_episode", 2)),
            cut_duration_sec=int(arguments.get("cut_duration_sec", 5)),
            model=str(arguments.get("model", "kling-3.0-720p")),
            cache_hit_ratio=float(arguments.get("cache_hit_ratio", 0.0)),
        )
    if name == "generate_720p_broll":
        return client.get_or_generate_broll(
            prompt=str(arguments.get("prompt", "")),
            scene_role=str(arguments.get("scene_role", "dog_situation_cut")),
            duration_sec=int(arguments.get("duration_sec", 5)),
            resolution="720p",
            model=str(arguments.get("model", "kling-3.0-720p")),
            fallback_file=arguments.get("fallback_file"),
        )
    if name == "generate_review_shorts_master":
        gen = ReviewShortsGenerator()
        return gen.generate_master_json(
            product_name=str(arguments.get("product_name", "ParvoGel")),
            reviews_source=str(arguments.get("reviews_source", "")),
            hook_pattern=str(arguments.get("hook_pattern", "auto")),
            preferred_broll_model=str(arguments.get("model", "kling-3.0-720p")),
        )
    raise ValueError(f"Unknown tool: {name}")


def handle_jsonrpc_message(msg: Dict[str, Any]) -> Dict[str, Any] | None:
    method = msg.get("method", "")
    req_id = msg.get("id")
    params = msg.get("params") or {}

    if method == "notifications/initialized":
        return None

    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {
                    "name": "parvogel-higgsfield-broll-mcp",
                    "version": "1.0.0",
                },
            },
        }

    if method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {"tools": TOOLS_SCHEMA},
        }

    if method == "tools/call":
        tool_name = params.get("name", "")
        arguments = params.get("arguments") or {}
        try:
            output = _execute_tool(tool_name, arguments)
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{"type": "text", "text": json.dumps(output, ensure_ascii=False, indent=2)}],
                    "isError": False,
                },
            }
        except Exception as exc:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{"type": "text", "text": f"ERROR: {exc}"}],
                    "isError": True,
                },
            }

    if req_id is not None:
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "error": {"code": -32601, "message": f"Method not found: {method}"},
        }
    return None


def main() -> None:
    if hasattr(sys.stdin, "reconfigure"):
        sys.stdin.reconfigure(encoding="utf-8")
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    for raw_line in sys.stdin:
        line = raw_line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            continue
        response = handle_jsonrpc_message(msg)
        if response is not None:
            sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
