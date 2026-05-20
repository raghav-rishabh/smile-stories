import type { Metadata, Viewport } from 'next'
import HomePageClient from './HomePageClient'

const dentistSchema = {
  "@context": "https://schema.org",
  "@type": ["Dentist","Orthodontist"],
  "@id": "https://www.smilestoriesind.com/#dentist",
  "name": "Smile Stories",
  "description": "Premium orthodontic and dental care clinic in Jalandhar. Specialising in clear aligners, metal braces, teeth whitening, and dental cleaning.",
  "url": "https://www.smilestoriesind.com/",
  "telephone": "+916284114338",
  "email": "Smilestoriesjalandhar@gmail.com",
  "image": "https://www.smilestoriesind.com/images/og.png",
  "priceRange": "₹₹",
  "areaServed": {
  "@type": "City",
  "name": "Jalandhar"
},
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "21-B Deol Nagar",
    "addressLocality": "Jalandhar",
    "addressRegion": "Punjab",
    "postalCode": "144001",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 31.3260,
    "longitude": 75.5762
  },
  "sameAs": [
    "https://www.instagram.com/dr.pallavigarg",
    "https://wa.me/916284114338"
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      "opens": "10:00",
      "closes": "20:00"
    }
  ],
  "hasMap": "https://maps.google.com/?q=21-B+Deol+Nagar+Jalandhar+Punjab",
  "medicalSpecialty": "Dentistry",
  "availableService": [
    { "@type": "MedicalProcedure", "name": "Clear Aligners" },
    { "@type": "MedicalProcedure", "name": "Metal Braces" },
    { "@type": "MedicalProcedure", "name": "Teeth Whitening" },
    { "@type": "MedicalProcedure", "name": "Dental Cleaning" },
    { "@type": "MedicalProcedure", "name": "Orthodontic Consultation" }
  ]
}

export const metadata: Metadata = {
  title: 'Smile Stories | Best Dentist & Orthodontist in Jalandhar, Punjab',
  description:
    "Jalandhar's trusted dental clinic — clear aligners, braces, teeth whitening & more. Book instantly on WhatsApp or Instagram.",
  keywords: [
    'dentist Jalandhar',
    'orthodontist Jalandhar',
    'clear aligners Jalandhar',
    'braces Jalandhar',
    'teeth whitening Jalandhar',
    'dental clinic Jalandhar',
    'best dentist Punjab',
    'dental implants Jalandhar',
    'Smile Stories Jalandhar',
    'Dr Pallavi Garg',
    'dental cleaning Jalandhar',
    'book dentist appointment Jalandhar',
  ],
  authors: [{ name: 'Smile Stories — Dr. Pallavi Garg' }],
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
  alternates: { canonical: 'https://www.smilestoriesind.com/' },
  openGraph: {
    type: 'website',
    siteName: 'Smile Stories',
    title: 'Smile Stories | Best Dentist in Jalandhar — Aligners, Braces & More.',
    description:
      'Trusted orthodontic care in Jalandhar. Clear aligners, braces, teeth whitening & more. Book your appointment on WhatsApp or Instagram.',
    url: 'https://www.smilestoriesind.com/',
    images: [
      {
        url: 'https://www.smilestoriesind.com/images/og.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'Smile Stories Dental Clinic — Jalandhar, Punjab',
      },
    ],
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smile Stories | Best Dentist in Jalandhar, Punjab',
    description:
      'Book a dental appointment via WhatsApp or Instagram. Expert orthodontic care — aligners, braces, whitening. Smile Stories, Jalandhar.',
    images: [{ url: 'https://www.smilestoriesind.com/images/og.png', alt: 'Smile Stories Dental Clinic Jalandhar' }],
  },
  other: {
    'geo.region': 'IN-PB',
    'geo.placename': 'Jalandhar, Punjab, India',
    'geo.position': '31.3260;75.5762',
    ICBM: '31.3260, 75.5762',
    'og:see_also': 'https://www.instagram.com/dr.pallavigarg',
  },
}

export const viewport: Viewport = {
  themeColor: '#4a9e8e',
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dentistSchema) }} />
      <HomePageClient />
    </>
  )
}
