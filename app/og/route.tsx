import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin

  const imageData = await fetch(`${baseUrl}/images/og.png`)
  const imageArrayBuffer = await imageData.arrayBuffer()

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
          src={`data:image/png;base64,${btoa(
            String.fromCharCode(...new Uint8Array(imageArrayBuffer))
          )}`}
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