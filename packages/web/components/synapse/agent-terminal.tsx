"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Terminal,
  Play,
  Pause,
  Trash2,
  Copy,
  Download,
  RefreshCw,
} from "lucide-react";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "system";
  content: string;
  timestamp: string;
}

interface AgentTerminalProps {
  agentId: string;
}

export function AgentTerminal({ agentId }: AgentTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [agentId]);

  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, isAutoScroll]);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(`ws://localhost:8080`);

      ws.onopen = () => {
        setIsConnected(true);
        ws.send(
          JSON.stringify({
            type: "logs:subscribe",
            namespace: "paseo",
            payload: { agentId },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "log") {
            addLine({
              id: message.id || Date.now().toString(),
              type: message.payload.level || "output",
              content: message.payload.message,
              timestamp: message.payload.timestamp || new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  };

  const addLine = (line: TerminalLine) => {
    setLines((prev) => [...prev, line]);
  };

  const sendInput = () => {
    if (!input.trim()) return;

    addLine({
      id: Date.now().toString(),
      type: "input",
      content: input,
      timestamp: new Date().toISOString(),
    });

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "agent:send",
          namespace: "paseo",
          payload: { agentId, message: input },
        })
      );
    }

    setInput("");
  };

  const clearTerminal = () => {
    setLines([]);
  };

  const copyTerminal = () => {
    const text = lines.map((line) => line.content).join("\n");
    navigator.clipboard.writeText(text);
  };

  const downloadTerminal = () => {
    const text = lines.map((line) => `[${line.timestamp}] ${line.content}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-${agentId}-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <h4 className="font-medium">Terminal Output</h4>
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span>Auto-scroll</span>
            <Switch
              checked={isAutoScroll}
              onCheckedChange={setIsAutoScroll}
            />
          </div>
          <Button variant="ghost" size="icon" onClick={clearTerminal}>
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={copyTerminal}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={downloadTerminal}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="flex-1 bg-black text-green-400 font-mono text-sm overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="p-4 space-y-1">
            {lines.length === 0 ? (
              <div className="text-gray-500 italic">
                Waiting for output...
              </div>
            ) : (
              lines.map((line) => (
                <div
                  key={line.id}
                  className={
                    line.type === "error"
                      ? "text-red-400"
                      : line.type === "input"
                      ? "text-blue-400"
                      : line.type === "system"
                      ? "text-yellow-400"
                      : "text-green-400"
                  }
                >
                  {line.type === "input" && <span className="text-blue-300">$ </span>}
                  {line.content}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      <div className="mt-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendInput()}
          placeholder="Send message to agent..."
          className="font-mono"
        />
        <Button onClick={sendInput}>
          <Play className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
