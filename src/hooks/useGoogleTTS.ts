import { useState, useRef, useCallback } from 'react'

interface TTSSpeakOptions {
  text: string
  languageCode?: string
  voiceName?: string
  speakingRate?: number
  onStart?: () => void
  onEnd?: () => void
  onError?: (err: any) => void
}

export function useGoogleTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)
  const latestIdRef = useRef(0)

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    audioRef.current = null
  }, [])

  const speak = useCallback(async (options: TTSSpeakOptions) => {
    const {
      text,
      voiceName,
      speakingRate = 1.0,
      onStart,
      onEnd,
      onError,
    } = options

    const speakId = ++latestIdRef.current
    stop()
    if (latestIdRef.current !== speakId) return

    if (isServerAvailable === false) {
      fallbackToWebSpeech(text, speakingRate, voiceName, onStart, onEnd)
      return
    }

    // Male voices not available on server GCP TTS, go directly to Web Speech API
    const isMaleVoice = voiceName?.includes('Neural2-D') || voiceName?.includes('-D')
    if (isMaleVoice) {
      fallbackToWebSpeech(text, speakingRate, voiceName, onStart, onEnd)
      return
    }

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName, speakingRate }),
      })

      if (latestIdRef.current !== speakId) return

      if (!res.ok) {
        // 504 = male voice unavailable from GCP, fall back to Web Speech API with browser male voice
        if (res.status === 504) {
          if (latestIdRef.current !== speakId) return
          fallbackToWebSpeech(text, speakingRate, voiceName, onStart, onEnd)
          return
        }
        setIsServerAvailable(false)
        if (latestIdRef.current !== speakId) return
        fallbackToWebSpeech(text, speakingRate, voiceName, onStart, onEnd)
        return
      }

      if (latestIdRef.current !== speakId) return
      setIsServerAvailable(true)
      setIsSpeaking(true)
      onStart?.()

      const blob = await res.blob()
      if (latestIdRef.current !== speakId) return
      const audioUrl = URL.createObjectURL(blob)
      urlRef.current = audioUrl

      const audio = new Audio()
      audioRef.current = audio
      audio.src = audioUrl
      audio.playbackRate = speakingRate

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        urlRef.current = null
        setIsSpeaking(false)
        onEnd?.()
        audioRef.current = null
      }

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl)
        urlRef.current = null
        setIsSpeaking(false)
        onError?.(new Error('Audio playback error'))
        audioRef.current = null
      }

      audio.play().catch((err) => {
        console.warn('Audio playback failed, fallback to Web Speech:', err)
        URL.revokeObjectURL(audioUrl)
        urlRef.current = null
        if (latestIdRef.current !== speakId) return
        setIsServerAvailable(false)
        fallbackToWebSpeech(text, speakingRate, voiceName, onStart, onEnd)
      })
    } catch {
      if (latestIdRef.current !== speakId) return
      setIsServerAvailable(false)
      fallbackToWebSpeech(text, speakingRate, voiceName, onStart, onEnd)
    }
  }, [isServerAvailable, stop])

  return { speak, stop, isSpeaking }
}

const LOAD_VOICES_TIMEOUT = 3000

function getEnglishVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      resolve(voices.filter(v => v.lang.startsWith('en')))
      return
    }
    const onChanged = () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', onChanged)
      resolve(window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en')))
    }
    window.speechSynthesis.addEventListener?.('voiceschanged', onChanged)
    setTimeout(() => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', onChanged)
      resolve(window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en')))
    }, LOAD_VOICES_TIMEOUT)
  })
}

function fallbackToWebSpeech(
  text: string,
  rate: number,
  voiceName?: string,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const cleanText = text.replace(/\*\*/g, '').replace(/[🛡️🤖👾🤝✨⭐💬🔊]/g, '')
  const utterance = new SpeechSynthesisUtterance(cleanText)
  utterance.lang = 'en-US'

  const isMale = voiceName?.toLowerCase().includes('neural2-d') || voiceName?.toLowerCase().includes('male')

  if (isMale) {
    utterance.rate = Math.min(rate, 0.88)
    utterance.pitch = 0.85
  } else {
    utterance.rate = rate
    utterance.pitch = 1.0
  }

  getEnglishVoices().then(englishVoices => {
    const preferred = isMale
      ? ['microsoft david', 'google uk english male', 'daniel', 'alex', 'guy', 'google us english male', 'microsoft mark', 'microsoft james']
      : ['google us english', 'google uk english', 'google us', 'natural', 'samantha', 'susan', 'zira', 'microsoft', 'neural', 'premium', 'enhanced']

    let foundVoice: SpeechSynthesisVoice | null = null
    for (const pref of preferred) {
      const match = englishVoices.find(v => v.name.toLowerCase().includes(pref))
      if (match) { foundVoice = match; break }
    }

    if (!foundVoice && englishVoices.length > 0) {
      foundVoice = englishVoices[0]
    }

    if (foundVoice) {
      utterance.voice = foundVoice
      console.warn(`[TTS] Fallback Web Speech using voice: ${foundVoice.name}`)
    } else {
      console.warn('[TTS] No English voices available in browser')
    }

    utterance.onstart = () => onStart?.()
    utterance.onend = () => onEnd?.()
    window.speechSynthesis.speak(utterance)
  }).catch(() => {
    utterance.onstart = () => onStart?.()
    utterance.onend = () => onEnd?.()
    window.speechSynthesis.speak(utterance)
  })
}