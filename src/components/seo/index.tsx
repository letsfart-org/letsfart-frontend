import { NextSeo } from 'next-seo'
import { APP_NAME, APP_TITLE, APP_DESC } from "@/lib/constant";

export default function SeoInfo() {
  return (
    <>
        <NextSeo
        title={APP_NAME + ' | ' + APP_TITLE}
        description={APP_DESC}
        canonical="https://letsfart.org/"
        openGraph={{
          type: 'website',
          url: 'https://letsfart.org/',
          title: APP_NAME + ' | ' + APP_TITLE,
          description: APP_DESC,
          images: [
            {
              url: '/og.png',
              width: 800,
              height: 600,
              alt: 'letsfart',
            }
          ],
          site_name: 'letsfart',
        }}
        twitter={{
          handle: '@letsfart_org',
          site: '@letsfart_org',
          cardType: 'summary_large_image',
        }}
    />
    </>
  )
}
