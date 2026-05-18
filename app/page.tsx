import type { Metadata, Viewport } from 'next'
import HomePageClient from './HomePageClient'

const dentistSchema = "{\n    \"@context\": \"https://schema.org\",\n    \"@type\": \"Dentist\",\n    \"name\": \"Smile Stories\",\n    \"description\": \"Premium orthodontic and dental care clinic in Jalandhar. Specialising in clear aligners, metal braces, teeth whitening, and dental cleaning.\",\n    \"url\": \"https://smilestoriesind.com/\",\n    \"telephone\": \"+916284114338\",\n    \"email\": \"Smilestoriesjalandhar@gmail.com\",\n    \"image\": \"https://smilestoriesind.com/images/og-image.jpg\",\n    \"priceRange\": \"₹₹\",\n    \"address\": {\n      \"@type\": \"PostalAddress\",\n      \"streetAddress\": \"21-B Deol Nagar\",\n      \"addressLocality\": \"Jalandhar\",\n      \"addressRegion\": \"Punjab\",\n      \"postalCode\": \"144001\",\n      \"addressCountry\": \"IN\"\n    },\n    \"geo\": {\n      \"@type\": \"GeoCoordinates\",\n      \"latitude\": 31.3260,\n      \"longitude\": 75.5762\n    },\n    \"sameAs\": [\n      \"https://www.instagram.com/dr.pallavigarg\",\n      \"https://wa.me/916284114338\"\n    ],\n    \"openingHoursSpecification\": [\n      {\n        \"@type\": \"OpeningHoursSpecification\",\n        \"dayOfWeek\": [\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\",\"Friday\",\"Saturday\"],\n        \"opens\": \"10:00\",\n        \"closes\": \"19:00\"\n      }\n    ],\n    \"hasMap\": \"https://maps.google.com/?q=21-B+Deol+Nagar+Jalandhar+Punjab\",\n    \"medicalSpecialty\": \"Dentistry\",\n    \"availableService\": [\n      { \"@type\": \"MedicalProcedure\", \"name\": \"Clear Aligners\" },\n      { \"@type\": \"MedicalProcedure\", \"name\": \"Metal Braces\" },\n      { \"@type\": \"MedicalProcedure\", \"name\": \"Teeth Whitening\" },\n      { \"@type\": \"MedicalProcedure\", \"name\": \"Dental Cleaning\" },\n      { \"@type\": \"MedicalProcedure\", \"name\": \"Orthodontic Consultation\" }\n    ]\n  }"

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
  alternates: { canonical: 'https://smilestoriesind.com/' },
  openGraph: {
    type: 'website',
    siteName: 'Smile Stories',
    title: 'Smile Stories | Best Dentist in Jalandhar — Aligners, Braces & More.',
    description:
      'Trusted orthodontic care in Jalandhar. Clear aligners, braces, teeth whitening & more. Book your appointment on WhatsApp or Instagram.',
    url: 'https://smilestoriesind.com/',
    images: [
      {
        url: 'https://smilestoriesind.com/images/og.png',
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
    images: [{ url: 'https://smilestoriesind.com/images/og.png', alt: 'Smile Stories Dental Clinic Jalandhar' }],
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: dentistSchema }} />
      <HomePageClient />
    </>
  )
}
