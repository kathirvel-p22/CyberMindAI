#!/bin/bash
# CyberMind AI — end-to-end verification (all in one process session so the
# dev server & threat-stream stay alive for the browser test).
cd /home/z/my-project

echo "===== 0. kill stale procs ====="
pkill -f "next dev" 2>/dev/null
pkill -f next-server 2>/dev/null
pkill -f "threat-stream" 2>/dev/null
pkill -f "agent-browser" 2>/dev/null
sleep 2

echo "===== 1. start threat-stream (port 3003) ====="
cd /home/z/my-project/mini-services/threat-stream
bun --hot index.ts > /home/z/my-project/threat-stream.log 2>&1 &
TS_PID=$!
cd /home/z/my-project

echo "===== 2. start next dev (port 3000) ====="
NODE_OPTIONS="--max-old-space-size=2560" node /home/z/my-project/node_modules/.bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1 &
NX_PID=$!

echo "waiting for ready..."
for i in $(seq 1 25); do
  if curl -s -m 2 http://127.0.0.1:3000/api/dashboard -o /dev/null 2>/dev/null; then
    echo "  server ready after ${i}s"
    break
  fi
  sleep 1
done

echo "===== 3. pre-warm: compile shell + command-center ====="
curl -s -m 120 -w "  GET / [HTTP %{http_code}]\n" http://127.0.0.1:3000/ -o /tmp/page.html
echo "  server mem: $(ps -o rss= -p $NX_PID 2>/dev/null | awk '{print int($1/1024)"MB"}')"

echo "===== 4. pre-warm all client chunks sequentially ====="
grep -oE '"/_next/static/chunks/[^"]*\.js"' /tmp/page.html | tr -d '"' | sort -u | while read url; do
  curl -s -m 60 "http://127.0.0.1:3000$url" -o /dev/null
done
echo "  chunks pre-warmed. server mem: $(ps -o rss= -p $NX_PID 2>/dev/null | awk '{print int($1/1024)"MB"}')"

echo "===== 5. pre-warm dashboard api ====="
curl -s -m 30 -w "  /api/dashboard [HTTP %{http_code}]\n" http://127.0.0.1:3000/api/dashboard -o /dev/null

echo "===== 6. open in browser ====="
agent-browser open http://127.0.0.1:3000/ 2>&1 | tail -2
agent-browser wait 9000 2>&1 | tail -1
agent-browser set viewport 1440 900 2>&1 | tail -1

echo "===== 7. page title + errors ====="
agent-browser get title 2>&1 | tail -1
echo "--- console errors ---"
agent-browser errors 2>&1 | tail -20

echo "===== 8. screenshot: command center ====="
agent-browser screenshot /home/z/my-project/shot-command-center.png 2>&1 | tail -1

echo "===== 9. snapshot interactive elements (compact) ====="
agent-browser snapshot -i -c 2>&1 | head -45

echo "===== 10. navigate to AI Agents ====="
agent-browser find text "AI Agents" click 2>&1 | tail -1
agent-browser wait 8000 2>&1 | tail -1
agent-browser screenshot /home/z/my-project/shot-ai-agents.png 2>&1 | tail -1

echo "===== 11. navigate to Incidents ====="
agent-browser find text "Incidents" click 2>&1 | tail -1
agent-browser wait 8000 2>&1 | tail -1
agent-browser screenshot /home/z/my-project/shot-incidents.png 2>&1 | tail -1

echo "===== 12. navigate to Executive Copilot ====="
agent-browser find text "Executive Copilot" click 2>&1 | tail -1
agent-browser wait 7000 2>&1 | tail -1
agent-browser screenshot /home/z/my-project/shot-copilot.png 2>&1 | tail -1

echo "===== 13. final server status ====="
echo "  next-server alive: $(ps -p $NX_PID >/dev/null 2>&1 && echo YES || echo NO) mem $(ps -o rss= -p $NX_PID 2>/dev/null | awk '{print int($1/1024)"MB"}')"
echo "  threat-stream alive: $(ps -p $TS_PID >/dev/null 2>&1 && echo YES || echo NO)"
echo "  free mem: $(free -m | awk '/Mem/{print $7"MB available"}')"

echo "===== 14. dev log tail ====="
tail -10 /home/z/my-project/dev.log

echo "===== DONE ====="
