"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Music, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { InteractiveAudioPlayer } from "@/components/interactive-audio-player"
import { MusicLibrarySidebar } from "@/components/music-library-sidebar"

interface MusicTrack {
  id: number
  title: string
  prompt: string
  duration_seconds: number
  file_url: string
  created_at: string
}

export default function MusicGenerationApp() {
  const [prompt, setPrompt] = useState("")
  const [duration, setDuration] = useState(30)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [promptSuggestion, setPromptSuggestion] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
  const [isPlayingFromLibrary, setIsPlayingFromLibrary] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { toast } = useToast()

  const handleTrackSelect = (track: MusicTrack) => {
    setCurrentTrack(track)
    setAudioUrl(track.file_url)
    setAudioBlob(null)
    setPrompt(track.prompt)
    setDuration(track.duration_seconds)
    setIsPlayingFromLibrary(true)
    setError(null)
    setPromptSuggestion(null)

    toast({
      title: "Track loaded",
      description: `Now playing: ${track.title}`,
    })
  }

  const handleSave = () => {
    window.dispatchEvent(new CustomEvent("refreshLibrary"))

    if (audioUrl && !isPlayingFromLibrary) {
      setCurrentTrack({
        id: Date.now(),
        title: prompt,
        prompt: prompt,
        duration_seconds: duration,
        file_url: audioUrl,
        created_at: new Date().toISOString(),
      })
    }
  }

  const generateMusic = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please describe your song",
        description: "Enter a description to generate music",
        variant: "destructive",
      })
      return
    }

    setIsPlayingFromLibrary(false)
    setCurrentTrack(null)
    setIsGenerating(true)
    setAudioUrl(null)
    setAudioBlob(null)
    setError(null)
    setPromptSuggestion(null)

    try {
      const response = await fetch(
        `/api/generate-music?text=${encodeURIComponent(prompt)}&duration_seconds=${duration}&prompt_influence=0.3&id=${Date.now()}`,
      )

      if (!response.ok) {
        const errorData = await response.text()
        let errorMessage = "Generation failed"
        let suggestion = null

        try {
          const parsedError = JSON.parse(errorData)
          if (parsedError.detail) {
            errorMessage = parsedError.detail.message || errorMessage
            suggestion = parsedError.detail.data?.prompt_suggestion
          }
        } catch (e) {
          errorMessage = errorData || errorMessage
        }

        setError(errorMessage)
        if (suggestion) {
          setPromptSuggestion(suggestion)
        }

        throw new Error(errorMessage)
      }

      const audioBlob = await response.blob()
      const blobUrl = URL.createObjectURL(audioBlob)

      setAudioUrl(blobUrl)
      setAudioBlob(audioBlob)

      toast({
        title: "Music generation started!",
        description: "Your track is being generated...",
      })
    } catch (error) {
      console.error("Error generating music:", error)
      setIsGenerating(false)
      setAudioUrl(null)
      setAudioBlob(null)
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please check your API key and try again",
        variant: "destructive",
      })
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }

  const examplePrompts = [
    "A dreamy lo-fi hip hop beat with soft piano and vinyl crackle",
    "Energetic electronic dance music with heavy bass drops",
    "Peaceful acoustic guitar melody with nature sounds",
    "Epic orchestral soundtrack with dramatic crescendos",
  ]

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="flex flex-1 overflow-hidden relative z-10">
        <div className="flex-1 min-w-0 overflow-auto">
          <div className="p-3 md:p-4 lg:p-10 max-w-4xl mx- relative flex flex-col min-h-full justify-center pb-24 mx-0.524 mx-[100px]">
            <div className="mb-4 md:mb-6">
              <h2 className="font-serif text-foreground mb-3 font-thin italic text-4xl">
                Create studio-grade music with Elevenlabs
              </h2>
              <p className="text-muted-foreground leading-relaxed font-sans leading-4 text-sm flex-row">
                {
                  "Generate complete, context-aware music in any style with natural language prompts. \nProfessional quality, multilingual support, vocals or instrumental."
                }
              </p>
              {isPlayingFromLibrary && currentTrack && (
                <div className="mt-3 p-2 bg-[#077AFE]/10 border border-[#077AFE]/20 rounded-lg">
                  <p className="text-sm text-[#077AFE]">
                    Playing from library: <span className="font-medium">{currentTrack.title}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Card UI */}
            <div className="relative group">
              {/* Glow / gradient border */}
              <div className="absolute -inset-[1px] rounded-md opacity-60 blur-sm group-hover:opacity-90 transition-opacity duration-500" />
              <Card className="relative h-[auto] rounded-md border border-white/20 bg-black/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] overflow-hidden ">
                <CardContent className="p-3 md:p-5 space-y-2 relative z-10 md:py-5 md:pt-[0] md:pb-[0]">
                  {/* Error / suggestion panel */}
                  {error && (
                    <div className="p-3 md:p-4 rounded-xl border bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-500/30">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0">
                          <AlertCircle className="h-5 w-5 text-red-300" />
                        </div>
                        <div className="space-y-2 w-full">
                          <p className="text-red-200 text-sm font-semibold tracking-wide">{error}</p>
                          {promptSuggestion && (
                            <div className="space-y-2">
                              <p className="text-white/70 text-xs">Suggested prompt</p>
                              <div className="flex items-center gap-2">
                                <p className="text-white/90 text-sm bg-black/40 border border-white/10 p-2 rounded-lg flex-1">
                                  {promptSuggestion}
                                </p>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setPrompt(promptSuggestion!)
                                    setError(null)
                                    setPromptSuggestion(null)
                                  }}
                                  className="bg-[#077AFE] hover:bg-[#0668d4] text-white rounded-lg"
                                >
                                  Use
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Prompt field */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent_90%)]">
                      <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <Textarea
                      placeholder="Describe the music you want to create..."
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value)
                        if (isPlayingFromLibrary) {
                          setIsPlayingFromLibrary(false)
                          setCurrentTrack(null)
                        }
                        if (error) {
                          setError(null)
                          setPromptSuggestion(null)
                        }
                      }}
                      className="min-h-[70px] resize-none rounded-md border bg-black/30 backdrop-blur-lg text-white placeholder:text-white/60 shadow-[inset_0_0_12px_rgba(255,255,255,0.1)] focus:ring-2 focus:ring-[#077AFE]/40 focus:border-white/30 mx-0 mb-0 pb-[] border-transparent"
                    />
                  </div>

                  {/* Quick examples */}
                  <div className="flex flex-wrap gap-2 py-2.5">
                    {examplePrompts.map((p, i) => (
                      <Button
                        key={i}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPrompt(p)
                          setIsPlayingFromLibrary(false)
                          setCurrentTrack(null)
                          setError(null)
                          setPromptSuggestion(null)
                        }}
                        className="border border-white/20 bg-black/50 hover:bg-black/70 text-white hover:text-white px-3 py-1 h-8 backdrop-blur-sm rounded-md"
                      >
                        <Music className="h-3 w-3 mr-1.5" /> {p.split(" ").slice(0, 3).join(" ") + "…"}
                      </Button>
                    ))}
                  </div>

                  {/* Generate button */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-white/80 hidden md:block">
                      Tip: Specific references (tempo, instruments, mood) improve results.
                    </div>
                    <button
                      onClick={generateMusic}
                      disabled={isGenerating || !prompt.trim()}
                      className={`relative overflow-hidden group bg-gradient-to-r from-[#077AFE] via-[#0668d4] to-[#077AFE] hover:from-[#0668d4] hover:via-[#0557c2] hover:to-[#0668d4] disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-600 text-white font-semibold px-6 py-3 shadow-lg shadow-[#077AFE]/25 hover:shadow-xl hover:shadow-[#077AFE]/40 disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed transition-all duration-200 ease-out border border-[#077AFE]/20 hover:border-[#077AFE]/40 disabled:border-gray-600/20 backdrop-blur-sm min-w-fit flex items-center gap-2.5 text-sm md:text-base before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 before:ease-out disabled:before:hidden md:px-5 md:py-2 rounded-md `}
                    >
                      <div className="relative z-10 flex items-center gap-2.5">
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Music className="h-4 w-4" />
                            <span>Generate Music</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />

                  {/* Duration slider */}
                  <div className="pt-1 space-y-5">
                    <label className="text-sm font-medium text-white flex items-center gap-2 font-sans">
                      Duration: <span className="text-white/90">{formatDuration(duration)}</span>
                    </label>
                    <div className="space-y-2 my-5">
                      <Slider
                        value={[duration]}
                        onValueChange={(value) => {
                          setDuration(value[0])
                          if (isPlayingFromLibrary) {
                            setIsPlayingFromLibrary(false)
                            setCurrentTrack(null)
                          }
                        }}
                        min={10}
                        max={300}
                        step={5}
                        disabled={isGenerating}
                        className="w-full [--track:rgba(255,255,255,0.15)] [--thumb:rgba(255,255,255,0.95)]"
                      />
                      <div className="flex justify-between text-xs text-white/70">
                        <span>10s</span>
                        <span>5m</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 h-full z-20">
          <MusicLibrarySidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onTrackSelect={handleTrackSelect}
            className="h-full"
          />
        </div>
      </div>

      {audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50 shadow-lg">
          <div className="p-2">
            <InteractiveAudioPlayer
              audioUrl={audioUrl}
              title={currentTrack?.title || prompt || "Generated Track"}
              duration={duration}
              isGenerating={isGenerating}
              audioBlob={audioBlob}
              onAudioReady={() => {
                setIsGenerating(false)
                toast({
                  title: "Music ready!",
                  description: "Your track has been generated successfully",
                })
              }}
              onAudioError={() => {
                setIsGenerating(false)
                setAudioUrl(null)
                setAudioBlob(null)
                toast({
                  title: "Generation failed",
                  description: "Please try again with a different prompt",
                  variant: "destructive",
                })
              }}
              onSave={handleSave}
            />
          </div>
        </div>
      )}

      {!audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-border z-50">
          <div className="p-2 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Music className="h-4 w-4" />
              <span className="text-sm">{isGenerating ? "Generating music..." : "No track playing"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
