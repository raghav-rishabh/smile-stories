import type { Metadata } from 'next'
import BlogPageClient from './BlogPageClient'
import './blog-page.css'

export const metadata: Metadata = {
  title: 'Our Dental Blog - Smile Stories | Jalandhar',
  description:
    'Expert orthodontic blog by Dr. Pallavi Garg in Jalandhar. Learn about clear aligners, braces care, teeth whitening tips, and smile transformations.',
  keywords: [
    'dental blogs',
    'blogs',
    'braces',
    'aligners',
    'orthodontist blog Jalandhar',
    'clear aligners',
    'braces care',
    'teeth whitening',
    'dental health tips',
    'smile transformation',
    'Dr. Pallavi Garg',
    'orthodontic treatment',
  ],
  alternates: {
    canonical: 'https://www.smilestoriesind.com/blog',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.smilestoriesind.com/blog',
    title: 'Smile Stories Blog - Dental Insights & Orthodontic Tips',
    description:
      'Expert articles on clear aligners, braces, teeth whitening, and smile transformations from Dr. Pallavi Garg in Jalandhar',
    images: [
      {
        url: 'https://www.smilestoriesind.com/images/PHOTO-2026-04-23-16-11-38.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    siteName: 'Smile Stories',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smile Stories Blog - Dental Insights',
    description:
      'Expert orthodontic articles and dental health tips from Dr. Pallavi Garg in Jalandhar',
    images: ['https://smilestoriesind.com/images/PHOTO-2026-04-23-16-11-38.jpg'],
    creator: '@dr.pallavigarg',
  },
  authors: [{ name: 'Dr. Pallavi Garg' }],
  creator: 'Smile Stories',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Smile Stories',
  url: 'https://www.smilestoriesind.com',
  logo: 'https://www.smilestoriesind.com/images/PHOTO-2026-04-23-16-11-38.jpg',
  description:
    'Premium orthodontic clinic in Jalandhar offering clear aligners, metal braces, and comprehensive dental care',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '21-B Deol Nagar, near ekta gas agency',
    addressLocality: 'Jalandhar',
    addressRegion: 'Punjab',
    postalCode: '144003',
    addressCountry: 'IN',
  },
  telephone: '+916284114338',
  email: 'Smilestoriesjalandhar@gmail.com',
  sameAs: ['https://www.instagram.com/dr.pallavigarg'],
  founder: {
    '@type': 'Person',
    name: 'Dr. Pallavi Garg',
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.smilestoriesind.com/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: 'https://www.smilestoriesind.com/blog',
    },
  ],
}

const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Smile Stories Blog',
  url: 'https://www.smilestoriesind.com/blog',
  description: 'Expert orthodontic and dental health articles from Dr. Pallavi Garg in Jalandhar, Punjab',
  mainEntity: {
    '@type': 'Blog',
    name: 'Smile Stories Blog',
    description: 'Dental insights on clear aligners, braces, teeth whitening, and smile transformations',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Smile Stories',
    logo: {
      '@type': 'ImageObject',
      url: 'https://smilestoriesind.com/images/PHOTO-2026-04-23-16-11-38.jpg',
      width: 300,
      height: 300,
    },
    contact: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+916284114338',
    },
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://www.smilestoriesind.com',
  name: 'Smile Stories - Dr. Pallavi Garg',
  image: 'https://smilestoriesind.com/images/PHOTO-2026-04-23-16-11-38.jpg',
  description:
    'Premium orthodontic clinic in Jalandhar. Expert clear aligners, metal braces, and dental care from Dr. Pallavi Garg',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '21-B Deol Nagar, near ekta gas agency',
    addressLocality: 'Jalandhar',
    addressRegion: 'Punjab',
    postalCode: '144003',
    addressCountry: 'IN',
  },
  telephone: '+916284114338',
  email: 'Smilestoriesjalandhar@gmail.com',
  url: 'https://www.smilestoriesind.com',
  priceRange: '₹',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '20:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '10:00',
      closes: '19:00',
    },
  ],
  sameAs: ['https://www.instagram.com/dr.pallavigarg'],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '100',
  },
}

export default function BlogPage() {
  return (
    <>
      {[organizationSchema, breadcrumbSchema, blogSchema, localBusinessSchema].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <BlogPageClient />
    </>
  )
}
