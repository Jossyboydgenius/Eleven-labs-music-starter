import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Instrument_Serif } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Eleven Music - AI Music Generation",
  description: "Create studio-grade music with natural language prompts using ElevenLabs AI",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${poppins.variable} ${instrumentSerif.variable} relative`}>
        <div
          className="fixed inset-0 w-screen h-screen z-0 bg-cover bg-no-repeat bg-center"
          style={{
            backgroundImage:
              "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop%20-%201.jpg-gn5pacowPpgY2gSyoMQRWuaHjNgMSn.jpeg')",
          }}
        />
        <div className="relative z-10">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
