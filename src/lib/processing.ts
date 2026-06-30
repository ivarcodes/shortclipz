import { v4 as uuid } from 'uuid'
import path from 'path'
import fs from 'fs/promises'
import { exec, execSync } from 'child_process'
import { promisify } from 'util'
import fss from 'fs'
import dbConnect from './db'
import Video from './models/Video'
import Scene, { IScene } from './models/Scene'
import Groq from 'groq-sdk'
import { cpus } from 'os'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
const AUDIO_DIR = path.join(process.cwd(), 'audio')
const CLIPS_DIR = path.join(process.cwd(), 'clips')
const THUMBS_DIR = path.join(process.cwd(), 'public', 'thumbs')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function ensureDirs() {
  for (const dir of [UPLOAD_DIR, AUDIO_DIR, CLIPS_DIR, THUMBS_DIR]) {
    await fs.mkdir(dir, { recursive: true })
  }
}

const execAsync = promisify(exec)
const execOptions = { maxBuffer: 10 * 1024 * 1024 } // 10MB stdout buffer for FFmpeg

function getFfmpegPath(): string {
  const isWin = process.platform === 'win32'
  const cmd = isWin ? 'where' : 'which'
  try { return execSync(`${cmd} ffmpeg`, { encoding: 'utf-8' }).trim().split('\n')[0] } catch {}
  const candidates = [
    path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe'),
    path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', 'linux-x64', 'ffmpeg'),
    path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', 'darwin-x64', 'ffmpeg'),
  ]
  for (const p of candidates) if (fss.existsSync(p)) return p
  throw new Error('FFmpeg not found')
}

const ffmpegPath = getFfmpegPath()

async function extractAudio(videoPath: string, audioPath: string) {
  await execAsync(`"${ffmpegPath}" -y -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}" -loglevel error`, execOptions)
}

async function transcribe(audioPath: string): Promise<string> {
  const scriptPath = path.join(process.cwd(), 'audio', '_whisper.py')
  const script = `import sys, warnings
warnings.filterwarnings("ignore")
from faster_whisper import WhisperModel
model = WhisperModel("tiny", device="cpu", compute_type="int8")
segments, _ = model.transcribe(r"${audioPath.replace(/\\/g, '\\\\')}")
for seg in segments:
    print(f"{seg.start:.2f}\\t{seg.end:.2f}\\t{seg.text}")
`
  await fs.writeFile(scriptPath, script, 'utf-8')
  const result = execSync(`python "${scriptPath}"`, { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 })
  await fs.unlink(scriptPath).catch(() => {})

  const lines = result.trim().split('\n')
  let srt = ''
  let idx = 1
  for (const line of lines) {
    const parts = line.split('\t')
    if (parts.length >= 3) {
      const s = parseFloat(parts[0]), e = parseFloat(parts[1]), t = parts.slice(2).join(' ').trim()
      if (t) { srt += `${idx}\n${fmt(s)} --> ${fmt(e)}\n${t}\n\n`; idx++ }
    }
  }
  return srt
}

function fmt(sec: number) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(Math.floor(s)).padStart(2, '0')},${String(Math.round((s - Math.floor(s)) * 1000)).padStart(3, '0')}`
}

function parseSrtRange(srt: string, startSec: number, endSec: number): string {
  const blocks = srt.trim().split('\n\n')
  const filtered = blocks.filter(b => {
    const l = b.split('\n'); if (l.length < 2) return false
    const m = l[1].match(/(\d{2}):(\d{2}):(\d{2}),\d{3}/)
    if (!m) return false
    const bs = parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseInt(m[3])
    return bs >= startSec - 0.5 && bs <= endSec
  })
  return filtered.map((b, i) => { const l = b.split('\n'); l[0] = String(i + 1); return l.join('\n') }).join('\n\n')
}

function srtToAss(srt: string, style: string): string {
  let styleLine: string
  switch (style) {
    case 'classic':
      styleLine = 'Style: Default,Arial Bold,24,&H00FFFF00,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1'
      break
    case 'karaoke':
      styleLine = 'Style: Default,Arial,26,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,2,1,2,10,10,10,1'
      break
    case 'animated':
      styleLine = 'Style: Default,Arial,24,&H00FFFFFF,&H000000FF,&H00FF8800,&H80000000,0,0,0,0,100,100,0,0,1,2,3,2,10,10,10,1'
      break
    default:
      styleLine = 'Style: Default,Arial,22,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1'
  }
  const header = `[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n${styleLine}\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`
  let events = ''
  for (const block of srt.trim().split('\n\n')) {
    const l = block.split('\n'); if (l.length < 3) continue
    const m = l[1].match(/([\d:,]+) --> ([\d:,]+)/); if (!m) continue
    events += `Dialogue: 0,${m[1].replace(',', '.')},${m[2].replace(',', '.')},Default,,0,0,0,,${l.slice(2).join('\\N').replace(/,/g, '，')}\n`
  }
  return header + events
}

async function analyzeScenes(transcript: string): Promise<{ start: number; end: number; title: string }[]> {
  // Truncate very long transcripts to avoid Groq token limits
  const MAX_CHARS = 15000
  let truncated = transcript
  if (transcript.length > MAX_CHARS) {
    // Take beginning + last portion to cover intro and outro
    const half = Math.floor(MAX_CHARS * 0.6)
    const tail = MAX_CHARS - half
    truncated = transcript.slice(0, half) + '\n...\n' + transcript.slice(-tail)
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: 'You analyze video transcripts and find the best moments for short-form clips (30-60s each). Return ONLY a valid JSON array of objects with "start" (seconds), "end" (seconds), and "title" (short catchy title). Find 3-5 best scenes.' },
        { role: 'user', content: `Here is a video transcript with timestamps:\n\n${truncated}\n\nFind 3-5 most interesting 30-60 second segments for short clips. Return JSON array.` },
      ],
      temperature: 0.3,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) return fallbackScenes(transcript)

    const jsonMatch = content.match(/\[[\s\S]*?\]/)
    if (!jsonMatch) return fallbackScenes(transcript)

    const scenes = JSON.parse(jsonMatch[0])
    if (!Array.isArray(scenes) || scenes.length === 0) return fallbackScenes(transcript)

    return scenes.slice(0, 5).map((s: Record<string, unknown>) => ({
      start: Number(s.start) || 0,
      end: Number(s.end) || 30,
      title: (s.title as string) || 'Scene',
    })).filter((s) => s.end > s.start)
  } catch {
    return fallbackScenes(transcript)
  }
}

function fallbackScenes(transcript: string): { start: number; end: number; title: string }[] {
  const lines = transcript.trim().split('\n\n')
  if (lines.length < 2) return [{ start: 0, end: 30, title: 'Clip' }]

  const timeBlocks: { start: number; end: number }[] = []
  for (const block of lines) {
    const l = block.split('\n')
    if (l.length < 2) continue
    const m = l[1].match(/(\d{2}):(\d{2}):(\d{2}),\d{3} --> (\d{2}):(\d{2}):(\d{2}),\d{3}/)
    if (!m) continue
    const s = parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseInt(m[3])
    const e = parseInt(m[4]) * 3600 + parseInt(m[5]) * 60 + parseInt(m[6])
    timeBlocks.push({ start: s, end: e })
  }

  if (timeBlocks.length === 0) return [{ start: 0, end: 30, title: 'Clip' }]

  const totalDur = timeBlocks[timeBlocks.length - 1].end
  if (totalDur <= 60) return [{ start: 0, end: totalDur, title: 'Full Clip' }]

  const scenes: { start: number; end: number; title: string }[] = []
  const chunkSize = Math.min(45, totalDur / 3)
  for (let i = 0; i < Math.min(5, Math.floor(totalDur / chunkSize)); i++) {
    const start = i * chunkSize
    const end = Math.min(start + Math.min(60, chunkSize * 1.3), totalDur)
    if (end - start >= 15) scenes.push({ start, end, title: `Scene ${i + 1}` })
  }
  return scenes.length > 0 ? scenes : [{ start: 0, end: Math.min(30, totalDur), title: 'Clip' }]
}

async function generateSceneClip(
  videoPath: string,
  start: number,
  end: number,
  captionStyle: string,
  srt: string
): Promise<{ clipPath: string; thumbPath: string; duration: number; fileSize: number }> {
  const clipId = uuid()
  const clipPath = path.join(CLIPS_DIR, `${clipId}.mp4`)
  const thumbPath = path.join(THUMBS_DIR, `${clipId}.jpg`)
  const duration = end - start

  const segSrt = parseSrtRange(srt, start, end)
  const ass = srtToAss(segSrt, captionStyle)
  const assName = `_subs_${clipId}.ass`
  const assFull = path.join(process.cwd(), assName)
  await fs.writeFile(assFull, ass, 'utf-8')

  await execAsync(
    `"${ffmpegPath}" -y -ss ${start} -i "${videoPath}" -t ${duration} -vf "ass=${assName}" -c:v libx264 -preset ultrafast -c:a aac -movflags +faststart "${clipPath}" -loglevel error`,
    execOptions
  )

  const mid = start + duration / 2
  await execAsync(
    `"${ffmpegPath}" -y -ss ${mid} -i "${videoPath}" -vframes 1 -s 480x270 "${thumbPath}" -loglevel error`,
    execOptions
  )

  await fs.unlink(assFull).catch(() => {})
  const stat = await fs.stat(clipPath)
  return { clipPath, thumbPath, duration, fileSize: stat.size }
}

export async function processVideo(videoId: string) {
  await ensureDirs()
  await dbConnect()

  const video = await Video.findById(videoId)
  if (!video) throw new Error('Video not found')

  video.status = 'processing'
  await video.save()

  try {
    const audioId = uuid()
    const audioPath = path.join(AUDIO_DIR, `${audioId}.wav`)
    await extractAudio(video.filePath, audioPath)

    const fullTranscript = await transcribe(audioPath)
    video.transcript = fullTranscript
    await video.save()

    const scenes = await analyzeScenes(fullTranscript)

    const now = Date.now()
    const expiry = new Date(now + 10 * 60 * 1000)

    const sceneDocs: IScene[] = []
    for (const sc of scenes) {
      const doc = await Scene.create({
        videoId: video._id,
        userId: video.userId,
        start: sc.start,
        end: sc.end,
        title: sc.title,
        status: 'processing',
        expiresAt: expiry,
      })
      sceneDocs.push(doc)
    }

    // Run clip generation with concurrency limit
    const concurrency = Math.max(1, Math.min(cpus().length - 1, 3))
    const tasks = sceneDocs.map((doc, i) => async () => {
      try {
        const { clipPath, thumbPath, duration, fileSize } = await generateSceneClip(
          video.filePath, scenes[i].start, scenes[i].end, video.captionStyle, fullTranscript
        )
        doc.clipFilePath = clipPath
        doc.thumbnailPath = thumbPath
        doc.duration = duration
        doc.fileSize = fileSize
        doc.status = 'done'
        await doc.save()
      } catch {
        doc.status = 'failed'
        await doc.save().catch(() => {})
      }
    })

    let pos = 0
    async function runner() {
      while (pos < tasks.length) {
        const task = tasks[pos++]
        await task()
      }
    }
    const pool = Array.from({ length: Math.min(concurrency, tasks.length) }, () => runner())
    await Promise.all(pool)

    video.status = 'done'
    await video.save()

    await fs.unlink(audioPath).catch(() => {})

    return sceneDocs
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    video.status = 'failed'
    video.error = message
    await video.save()
    throw err
  }
}
