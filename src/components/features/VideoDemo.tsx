import { Box } from '@mui/material'

interface VideoDemoProps {
  src: string
}

export const VideoDemo = ({ src }: VideoDemoProps) => {
  return (
    <Box
      component="video"
      src={src}
      autoPlay
      loop
      muted
      controls
      sx={{
        width: '100%',
        borderRadius: 2,
        boxShadow: 3,
      }}
    />
  )
}