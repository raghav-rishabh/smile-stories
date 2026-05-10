import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin

  const imageData = await fetch(`${baseUrl}/images/og.png`)
  const imageArrayBuffer = await imageData.arrayBuffer()
  const base64Image = arrayBufferToBase64(imageArrayBuffer)

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
        }}
      >
        <img
          src={`data:image/png;base64,${base64Image}`}
          style={{
            width: '1200px',
            height: '630px',
            objectFit: 'cover',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}