// Lightweight LLM helper that shells out to the `z-ai` CLI.
// We use the CLI (instead of importing z-ai-web-dev-sdk into the Next.js
// process) to keep the dev server's memory footprint low in this
// memory-constrained sandbox. Each call runs in a short-lived subprocess.

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile, readFile, unlink, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'

const execFileAsync = promisify(execFile)

const OUT_DIR = join(tmpdir(), 'cybermind-llm')

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Run a chat completion via the z-ai CLI.
 * @param messages  conversation messages (system + history + latest user)
 * @returns         the assistant reply text
 */
export async function llmChat(messages: LLMMessage[]): Promise<string> {
  await mkdir(OUT_DIR, { recursive: true })
  const outFile = join(OUT_DIR, `resp-${randomUUID()}.json`)

  // The CLI supports one system prompt + one user prompt. Fold the system
  // message and conversation history into the system+prompt fields.
  const sysMessages = messages.filter((m) => m.role === 'system' || m.role === 'assistant')
  const userMessages = messages.filter((m) => m.role === 'user')

  const systemPrompt = sysMessages.map((m) => m.content).join('\n\n')
  const userPrompt = userMessages.map((m) => `[${m.role.toUpperCase()}]\n${m.content}`).join('\n\n---\n\n')

  try {
    await execFileAsync(
      'z-ai',
      ['chat', '--prompt', userPrompt, '--system', systemPrompt, '-o', outFile],
      {
        timeout: 90_000,
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env },
      }
    )
    const raw = await readFile(outFile, 'utf8')
    const parsed = JSON.parse(raw)
    const content = parsed?.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty LLM response')
    return content as string
  } finally {
    unlink(outFile).catch(() => {})
  }
}
