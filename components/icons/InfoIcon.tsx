import React from 'react'
import Svg, { Path } from 'react-native-svg'

interface Props {
  size?: number
  color?: string
}

function InfoIcon({ size = 24, color = '#0F172A' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M20,2H4C2.9,2,2,2.9,2,4v16c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z M11,7h2v2h-2V7z M11,11h2v6h-2V11z"
        fill={color}
      />
    </Svg>
  )
}

export default React.memo(InfoIcon)
