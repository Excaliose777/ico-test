import '../styles/globals.css'
import type { AppProps } from 'next/app'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
const { chains, provider } = configureChains(
  [chain.goerli],
  [
    alchemyProvider({ apiKey: "UHaV8tYkNDv0foFOfWxkqhgl1PdE-TB-"}),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

export default function App({ Component, pageProps }: AppProps) {
  return (
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} initialChain={chain.goerli}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    )
}
