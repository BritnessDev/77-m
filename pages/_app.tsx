import '../styles/globals.scss'
import '../styles/animation.css'
import '../styles/coloranimationtext.scss'
import 'tailwindcss/tailwind.css'
import "slick-carousel/slick/slick.css" 
import "slick-carousel/slick/slick-theme.css"
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
