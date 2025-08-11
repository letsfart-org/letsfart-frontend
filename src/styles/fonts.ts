import { Roboto, Anton, Teko, Press_Start_2P, Source_Sans_3 } from 'next/font/google'

const roboto = Roboto({
  weight: '300',
  subsets: ['latin'],
})

const pressStart2p = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
})

export { roboto, pressStart2p }