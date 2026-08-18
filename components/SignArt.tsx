import { SIGN_IMAGES } from '@/lib/sign-images'
import { getSign } from '@/lib/signs'

/**
 * Draws a sign. If an image was dropped into public/signs/ named after the sign id,
 * that wins; otherwise it falls back to the SVG in lib/signs.ts.
 */
export default function SignArt({ id, className = 'h-40 w-40' }: { id: string; className?: string }) {
  const sign = getSign(id)
  if (!sign) return null

  const image = SIGN_IMAGES[id]
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-supplied files
    return <img src={image} alt={sign.description} className={`${className} object-contain`} />
  }

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={sign.description}
      className={className}
      dangerouslySetInnerHTML={{ __html: sign.svg }}
    />
  )
}

export function hasCustomImage(id: string): boolean {
  return Boolean(SIGN_IMAGES[id])
}
