import { useState } from 'react'

function makePlaceholder(label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#2e1065"/>
          <stop offset="55%" stop-color="#7C3AED"/>
          <stop offset="100%" stop-color="#0A0A0A"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <text x="50%" y="50%" fill="#FFFFFF" opacity="0.85" font-family="Inter, Arial, sans-serif" font-size="40" font-weight="700" text-anchor="middle">${label}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export default function SmartImage({ label = 'Brechó Inove', ...props }) {
  const [src, setSrc] = useState(props.src)

  return (
    <img
      {...props}
      src={src}
      onError={() => {
        if (src !== makePlaceholder(label)) {
          setSrc(makePlaceholder(label))
        }
      }}
    />
  )
}