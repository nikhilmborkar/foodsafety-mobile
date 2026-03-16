import React from 'react'
import Svg, { Path, G, ClipPath, Rect, Defs } from 'react-native-svg'

interface Props {
  size?: number
  color?: string
  strokeWidth?: number
}

function ScannerIcon({ size = 24, color = '#0F172A', strokeWidth = 1.5 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip_scanner)">
        <Path d="M20 12H4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M16 3.99976H18C19.1046 3.99976 20 4.89519 20 5.99976V7.99976" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8 19.9998L6 19.9998C4.89543 19.9998 4 19.1043 4 17.9998L4 15.9998" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M20 15.9998V17.9998C20 19.1043 19.1046 19.9998 18 19.9998H16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M4 7.99976L4 5.99976C4 4.89519 4.89543 3.99976 6 3.99976L8 3.99976" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </G>
      <Defs>
        <ClipPath id="clip_scanner">
          <Rect width="24" height="24" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default React.memo(ScannerIcon)
