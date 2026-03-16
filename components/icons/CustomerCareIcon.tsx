import React from 'react'
import Svg, { Path, Rect } from 'react-native-svg'

interface Props {
  size?: number
  color?: string
  strokeWidth?: number
}

function CustomerCareIcon({ size = 24, color = '#0F172A', strokeWidth = 1.5 }: Props) {
  // Original viewBox is 0 0 64 64 — preserve exactly
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path
        d="M12.91,31.8V26.1a19.09,19.09,0,0,1,38.18,0v5.7"
        stroke={color}
        strokeWidth={strokeWidth * 2}
        strokeLinecap="round"
      />
      <Path
        d="M12.06,31.8h4.7a0,0,0,0,1,0,0V45.18a0,0,0,0,1,0,0h-4.7a3,3,0,0,1-3-3V34.8A3,3,0,0,1,12.06,31.8Z"
        stroke={color}
        strokeWidth={strokeWidth * 2}
        strokeLinecap="round"
      />
      <Path
        d="M50.24,31.8h4.7a0,0,0,0,1,0,0V45.18a0,0,0,0,1,0,0h-4.7a3,3,0,0,1-3-3V34.8A3,3,0,0,1,50.24,31.8Z"
        transform="translate(102.18 76.98) rotate(180)"
        stroke={color}
        strokeWidth={strokeWidth * 2}
        strokeLinecap="round"
      />
      <Path
        d="M51.7,45.56v5a4,4,0,0,1-4,4H36.56"
        stroke={color}
        strokeWidth={strokeWidth * 2}
        strokeLinecap="round"
      />
      <Rect
        x="28.45"
        y="51.92"
        width="8.1"
        height="5.07"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth * 2}
        strokeLinecap="round"
      />
    </Svg>
  )
}

export default React.memo(CustomerCareIcon)
