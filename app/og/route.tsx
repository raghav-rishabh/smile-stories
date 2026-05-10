import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Grab your base URL so it works both locally and on production
  const baseUrl = new URL(request.url).origin

  // Fetch the image from your public folder
  const imageData = await fetch(`${baseUrl}/images/og.png`).then((res) =>
    res.arrayBuffer()
  )

  // Convert to base64
  const base64Image = Buffer.from(imageData).toString('base64')
  const imageSrc = `data:image/png;base64,${base64Image}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt="Smile Stories OG"
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