import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '3N1 HVAC Follow-Up Manager'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#111111',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            left: '-100px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242,106,27,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Left: Logo badge */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '220px',
            height: '220px',
            background: '#f26a1b',
            borderRadius: '36px',
            marginRight: '72px',
            flexShrink: 0,
            boxShadow: '0 0 80px rgba(242,106,27,0.4)',
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: '62px',
              fontWeight: 900,
              letterSpacing: '3px',
              lineHeight: 1,
            }}
          >
            3N1
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '8px',
              marginTop: '6px',
            }}
          >
            HVAC
          </div>
        </div>

        {/* Right: Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              color: '#ffffff',
              fontSize: '80px',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-2px',
            }}
          >
            3N1 HVAC
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '36px',
              fontWeight: 400,
              letterSpacing: '1px',
            }}
          >
            Follow-Up Manager
          </div>
          <div
            style={{
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#f26a1b',
              }}
            />
            <div
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '22px',
                fontWeight: 400,
                letterSpacing: '0.5px',
              }}
            >
              Track · Follow-Up · Close
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
