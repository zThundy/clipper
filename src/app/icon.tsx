import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 64,
  height: 64,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(220deg, rgb(134, 82, 246) 0%, rgb(185, 163, 227) 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '.8rem',
          fontWeight: 'bold',
          fontSize: '2rem',
        }}
      >
        CL
      </div>
    ),
    {
      ...size,
    }
  )
}