import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { searchPlugin } from '@vuepress/plugin-search'
import { backToTopPlugin } from '@vuepress/plugin-back-to-top'
import { mediumZoomPlugin } from '@vuepress/plugin-medium-zoom'

export default defineUserConfig({
  lang: 'en-US',
  title: 'PIXELMINER Documentation',
  description: 'Complete guide to PIXELMINER - Play, Earn, Upgrade!',
  
  theme: defaultTheme({
    logo: '/assets/logo.png',
    navbar: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Community', link: '/community/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          children: [
            '/guide/README.md',
            '/guide/getting-started.md',
            '/guide/mining-basics.md',
            '/guide/facilities.md',
            '/guide/miners.md',
            '/guide/upgrades.md',
            '/guide/rewards.md',
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          children: [
            '/api/README.md',
            '/api/smart-contracts.md',
            '/api/network-setup.md',
            '/api/security.md',
          ],
        },
      ],
      '/community/': [
        {
          text: 'Community',
          children: [
            '/community/README.md',
            '/community/discord.md',
            '/community/twitter.md',
            '/community/contributing.md',
            '/community/faq.md',
          ],
        },
      ],
    },
    repo: 'posgame3/web3miner',
    docsDir: 'docs',
    editLink: true,
    lastUpdated: true,
  }),

  plugins: [
    searchPlugin({
      locales: {
        '/': {
          placeholder: 'Search Documentation',
        },
      },
    }),
    backToTopPlugin(),
    mediumZoomPlugin({
      selector: '.theme-default-content img',
    }),
  ],
}) 