'use client'

import { useEffect, useRef, useState } from 'react'
import { Briefcase, Send, Sparkles, Loader2, Trash2, FileText } from 'lucide-react'
import { Panel } from './shared'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface Msg {
  id: string
  role: 'user' | 'assistant'
  content: string
  ts: string
}

const SUGGESTIONS = [
  'What is today\'s cyber risk? Give me the board bottom line.',
  'Which critical asset is most exposed right now and why?',
  'Explain the active credential-access campaign in business terms.',
  'What autonomous response should we approve immediately?',
  'How does our current posture compare to last week?',
]

export default function ExecutiveCopilot() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/chat')
      .then((r) => r.json())
      .then((d) => {
        if (d.messages?.length) {
          setMessages(
            d.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              ts: new Date(m.createdAt).toISOString(),
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || loading) return
    const userMsg: Msg = { id: `u-${Date.now()}`, role: 'user', content, ts: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, sessionId: 'default' }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', content: data.reply, ts: data.timestamp },
        ])
      } else {
        toast({ title: 'No reply', description: data.error ?? 'Unknown error', variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Request failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    setReportLoading(true)
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', content: 'Generate today\'s executive cyber risk briefing.', ts: new Date().toISOString() },
    ])
    try {
      const res = await fetch('/api/report')
      const data = await res.json()
      if (data.report) {
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', content: data.report, ts: data.generatedAt },
        ])
      } else {
        toast({ title: 'Report failed', description: data.error, variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Report failed', variant: 'destructive' })
    } finally {
      setReportLoading(false)
    }
  }

  const clearChat = () => setMessages([])

  return (
    <div className="grid gap-4 lg:grid-cols-12 h-[calc(100vh-13rem)]">
      {/* Chat */}
      <Panel
        title="Executive Copilot"
        subtitle="Business-language cyber risk assistant · powered by CyberMind AI"
        icon={<Briefcase className="h-4 w-4" />}
        className="lg:col-span-8 flex flex-col"
        bodyClassName="flex-1 flex flex-col p-0 min-h-0"
        action={
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={generateReport} disabled={reportLoading}>
            {reportLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            Executive Briefing
          </Button>
        }
      >
        <div ref={scrollRef} className="flex-1 overflow-y-auto cyber-scroll p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-400">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">Ask CyberMind AI</h3>
              <p className="mt-1 max-w-sm text-xs">
                I translate the live SOC into board-ready risk language. Try a suggestion below.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
              <div
                className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold',
                  m.role === 'user'
                    ? 'bg-cyan-500/15 text-cyan-400'
                    : 'bg-emerald-500/15 text-emerald-400'
                )}
              >
                {m.role === 'user' ? 'CISO' : 'AI'}
              </div>
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                  m.role === 'user'
                    ? 'bg-cyan-500/10 text-foreground'
                    : 'bg-card border border-border'
                )}
              >
                {m.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_li]:my-0.5 [&_strong]:text-emerald-300 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-xs [&_table]:text-xs [&_th]:text-emerald-300 [&_td]:px-2 [&_th]:px-2">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
                <div className="mt-1 text-[9px] text-muted-foreground">
                  {new Date(m.ts).toLocaleTimeString('en-US', { hour12: false })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                CyberMind AI is correlating across 10 agents…
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="border-t border-border p-3">
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-accent/40 px-3 py-1 text-[11px] text-foreground/80 transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(input)
                }
              }}
              placeholder="Ask about risk, incidents, predictions, or request an action…"
              className="min-h-11 max-h-32 resize-none text-sm"
              disabled={loading}
            />
            <Button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="bg-emerald-500/90 text-sidebar hover:bg-emerald-500"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Enter to send · Shift+Enter for newline</span>
            <button onClick={clearChat} className="flex items-center gap-1 hover:text-red-400">
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
        </div>
      </Panel>

      {/* Side: capabilities */}
      <div className="lg:col-span-4 space-y-4">
        <Panel title="Copilot Capabilities" icon={<Sparkles className="h-4 w-4" />} bodyClassName="p-3 space-y-2">
          {[
            { t: 'Risk Briefing', d: 'Board-ready narrative of today\'s posture' },
            { t: 'Impact Translation', d: 'Technical → financial & operational terms' },
            { t: 'Prediction Q&A', d: '“What will the attacker do next?”' },
            { t: 'Response Advice', d: 'Which playbook to approve & why' },
            { t: 'Memory Recall', d: 'Apply past incident lessons to now' },
          ].map((c) => (
            <div key={c.t} className="rounded-md border border-border bg-background/40 p-2.5">
              <div className="text-xs font-semibold text-emerald-400">{c.t}</div>
              <div className="text-[11px] text-muted-foreground">{c.d}</div>
            </div>
          ))}
        </Panel>

        <Panel title="Live Context Fed to AI" icon={<Briefcase className="h-4 w-4" />} bodyClassName="p-3 text-[11px] space-y-1.5">
          <ContextRow label="Overall risk" value="72 / 100 ELEVATED" color="text-amber-400" />
          <ContextRow label="Active threats" value="18" color="text-red-400" />
          <ContextRow label="Open incidents" value="7 (2 critical)" color="text-orange-400" />
          <ContextRow label="Agents online" value="10 / 10" color="text-emerald-400" />
          <ContextRow label="Exposure (24h)" value="$4.0M" color="text-red-400" />
          <ContextRow label="MTTR" value="14 min" color="text-cyan-400" />
          <p className="pt-1 text-[10px] text-muted-foreground">
            The copilot sees a live snapshot of incidents, business impact, agent outputs, and cyber memory lessons.
          </p>
        </Panel>
      </div>
    </div>
  )
}

function ContextRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-mono font-semibold', color)}>{value}</span>
    </div>
  )
}
