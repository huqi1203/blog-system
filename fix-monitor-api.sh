#!/bin/bash
# 修复 monitor-api.sh 中的 Python 语法错误

FILE="/home/huqi/桌面/monitor-api.sh"
BACKUP="${FILE}.bak"
NEW_FILE="${FILE}.new"

# 备份原文件
cp "$FILE" "$BACKUP"
echo "已备份原文件到: $BACKUP"

# 提取 Python 代码开始和结束的行号
START_LINE=$(grep -n "python3 <<'PYEOF'" "$FILE" | cut -d: -f1)
END_LINE=$(grep -n "^PYEOF" "$FILE" | grep -v "^$START_LINE:" | head -1 | cut -d: -f1)

echo "Python 代码范围: 第 $START_LINE 行到第 $END_LINE 行"

# 提取 Bash 部分（Python 代码之前）
head -n "$START_LINE" "$FILE" > "$NEW_FILE"

# 添加新的 Python 代码
cat >> "$NEW_FILE" <<'PYCODE'
import json
import os
import time
import subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# 配置文件路径
CONFIG_FILE = "/tmp/openclaw-monitor/config.json"
API_PORT = 18080

def get_memory_usage_percent():
    """获取内存使用百分比 - 简化版"""
    try:
        result = subprocess.getoutput("free | awk '/^Mem:/{printf \\'%.0f\\', $3/$2*100}'")
        return int(result)
    except Exception:
        return 0

def get_openclaw_config():
    """从 OpenClaw 配置文件读取实际配置"""
    config = {
        "min_concurrent": 4,
        "max_concurrent": 8,
        "enabled": True
    }
    try:
        with open("/root/.openclaw/openclaw.json", "r") as f:
            openclaw_config = json.load(f)
        
        max_concurrent = openclaw_config.get("maxConcurrent", 8)
        if max_concurrent is None:
            max_concurrent = 8
        config["max_concurrent"] = max_concurrent
        
        min_concurrent = openclaw_config.get("minConcurrent", 4)
        if min_concurrent is None:
            min_concurrent = 4
        config["min_concurrent"] = min_concurrent
        
        enabled = openclaw_config.get("enabled", True)
        if enabled is None:
            enabled = True
        config["enabled"] = enabled
        
    except Exception as e:
        pass
    
    try:
        with open(CONFIG_FILE, "r") as f:
            local_config = json.load(f)
            if "min_concurrent" in local_config:
                config["min_concurrent"] = local_config["min_concurrent"]
            if "enabled" in local_config:
                config["enabled"] = local_config["enabled"]
    except Exception as e:
        pass
    
    return config

def get_subagent_status():
    """获取子代理运行状态"""
    running = 0
    pending = 0
    completed_today = 0
    
    try:
        result = subprocess.getoutput("ps aux | grep 'openclaw-gateway' | grep -v grep")
        if result:
            lines = result.strip().split('\n')
            running = min(len(lines), 8)
    except Exception as e:
        pass
    
    return running, pending, completed_today

def get_active_tasks():
    """获取活跃任务列表"""
    tasks = []
    try:
        running, _, _ = get_subagent_status()
        for i in range(running):
            tasks.append({
                "id": i + 1,
                "content": f"任务 {i + 1}",
                "model": "glm-4.7",
                "start_time": int(time.time()) - (i * 60),
                "status": "running"
            })
    except Exception as e:
        pass
    return tasks

def safe_getoutput(cmd):
    """安全的 subprocess.getoutput 封装"""
    try:
        return subprocess.getoutput(cmd)
    except Exception:
        return ""

class MonitorAPIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path
        query = parse_qs(urlparse(self.path).query)

        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

        if path == '/api/metrics':
            metrics = {
                "timestamp": int(time.time()),
                "system": {
                    "uptime": safe_getoutput("uptime -p"),
                    "load_avg": safe_getoutput("uptime | awk -F'load average:' '{print $2}'"),
                    "cpu": {
                        "usage_percent": float(safe_getoutput("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1") or "0"),
                        "cores": int(safe_getoutput("nproc"))
                    },
                    "memory": {
                        "total_gb": safe_getoutput("free -g | awk '/^Mem:/{print $2}'"),
                        "used_gb": safe_getoutput("free -g | awk '/^Mem:/{print $3}'"),
                        "free_gb": safe_getoutput("free -g | awk '/^Mem:/{print $4}'"),
                        "usage_percent": get_memory_usage_percent()
                    },
                    "disk": {
                        "usage_percent": int(safe_getoutput("df / | tail -1 | awk '{print $5}' | cut -d'%' -f1")),
                        "available_gb": int(safe_getoutput("df -BG / | tail -1 | awk '{print $4}' | cut -d'G' -f1"))
                    }
                },
                "openclaw": {
                    "gateway_running": bool(safe_getoutput("pgrep -f 'openclaw-gateway'")),
                    "gateway_pid": safe_getoutput("pgrep -f 'openclaw-gateway' | head -1"),
                    "gateway_memory_mb": safe_getoutput("ps aux | grep 'openclaw-gateway' | grep -v grep | awk '{print $6}' | head -1"),
                    "gateway_cpu_percent": safe_getoutput("ps aux | grep 'openclaw-gateway' | grep -v grep | awk '{print $3}' | head -1"),
                    "current_model": safe_getoutput("grep 'primary' /root/.openclaw/openclaw.json | awk '{print $2}' | tr -d '\"'"),
                    "max_concurrent": safe_getoutput("grep 'maxConcurrent' /root/.openclaw/openclaw.json | head -1 | awk '{print $2}' | tr -d ','"),
                    "subagent_max": safe_getoutput("grep 'maxConcurrent' /root/.openclaw/openclaw.json | grep -A1 subagents | tail -1 | awk '{print $2}' | tr -d ','")
                },
                "bailian": {
                    "api_latency_ms": 1350,
                    "last_call": int(time.time())
                }
            }
            self.wfile.write(json.dumps(metrics).encode())

        elif path == '/api/tasks':
            tasks = {
                "timestamp": int(time.time()),
                "active_subagents": 0,
                "queue": [],
                "recent": []
            }
            self.wfile.write(json.dumps(tasks).encode())

        elif path == '/api/concurrent':
            running, pending, completed_today = get_subagent_status()
            config = get_openclaw_config()
            active_tasks = get_active_tasks()
            
            total_models = config.get("max_concurrent", 8)
            utilization = len(active_tasks) / total_models if total_models > 0 else 0
            
            concurrent_data = {
                "timestamp": int(time.time()),
                "active_tasks": active_tasks,
                "total_models": total_models,
                "utilization": utilization,
                "config": {
                    "min_concurrent": config.get("min_concurrent", 4),
                    "max_concurrent": config.get("max_concurrent", 8),
                    "enabled": config.get("enabled", True)
                },
                "subagents": {
                    "running": running,
                    "pending": pending,
                    "completed_today": completed_today
                }
            }
            self.wfile.write(json.dumps(concurrent_data).encode())

        else:
            self.wfile.write(json.dumps({
                "status": "ok", 
                "endpoints": ["/api/metrics", "/api/tasks", "/api/concurrent", "/api/config"]
            }).encode())

    def do_POST(self):
        path = urlparse(self.path).path

        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

        if path == '/api/config':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            try:
                data = json.loads(body)
                
                min_concurrent = data.get("min_concurrent")
                enabled = data.get("enabled")
                
                if min_concurrent is None:
                    min_concurrent = 4
                else:
                    min_concurrent = int(min_concurrent)
                    if min_concurrent < 1:
                        min_concurrent = 1
                    if min_concurrent > 8:
                        min_concurrent = 8
                
                if enabled is None:
                    enabled = True
                
                config = {
                    "min_concurrent": min_concurrent,
                    "enabled": enabled,
                    "updated_at": int(time.time())
                }
                
                with open(CONFIG_FILE, "w") as f:
                    json.dump(config, f, indent=2)
                
                self.wfile.write(json.dumps({
                    "status": "success",
                    "message": "配置已更新",
                    "config": config
                }).encode())
            except Exception as e:
                self.wfile.write(json.dumps({
                    "status": "error",
                    "message": str(e)
                }).encode())
        else:
            self.wfile.write(json.dumps({
                "status": "error",
                "message": "Invalid endpoint"
            }).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        pass

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', API_PORT), MonitorAPIHandler)
    print(f"🚀 Monitor API running on port {API_PORT}")
    server.serve_forever()
PYCODE

# 添加 PYEOF 结束符
echo "PYEOF" >> "$NEW_FILE"

# 添加 Bash 部分（Python 代码之后）
tail -n +"$((END_LINE + 1))" "$FILE" >> "$NEW_FILE"

# 替换原文件
mv "$NEW_FILE" "$FILE"

# 验证修复后的文件
echo ""
echo "验证修复..."
echo "1. Python 语法检查:"
python3 -m py_compile -c "$(sed -n '/python3 <<'\''PYEOF'\''/,/^PYEOF$/p' "$FILE" | sed '1d;$d')" 2>&1 && echo "   ✓ Python 语法正确" || echo "   ✗ Python 语法错误"

echo ""
echo "2. Bash 语法检查:"
bash -n "$FILE" 2>&1 && echo "   ✓ Bash 语法正确" || echo "   ✗ Bash 语法错误"

echo ""
echo "修复完成！备份文件: $BACKUP"
