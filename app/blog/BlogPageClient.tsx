'use client'

import { useEffect, useMemo, useState } from 'react'

const SANITY_PROJECT_ID = '3igm80nn'
const SANITY_DATASET = 'production'
const SANITY_API_VER = 'v2023-05-03'
const SANITY_CDN = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/${SANITY_API_VER}/data/query/${SANITY_DATASET}`
const POSTS_PER_PAGE = 6

type SanityBlock = {
  _type?: string
  style?: string
  listItem?: string
  children?: { _type?: string; text?: string; marks?: string[] }[]
  markDefs?: { _key?: string; _type?: string; href?: string }[]
  asset?: { _ref?: string; url?: string }
  alt?: string
}

type SanityPost = {
  _id: string
  title?: string
  publishedAt?: string
  slug?: string
  excerpt?: string
  mainImage?: { alt?: string; asset?: { _ref?: string; url?: string } }
  body?: SanityBlock[]
}

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  initial: string
  image: string
}

const fallbackPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'clear-aligners-vs-traditional-braces',
    title: 'Clear Aligners vs Traditional Braces: Which is Right for You?',
    excerpt:
      'Discover the key differences between clear aligners and metal braces to make an informed decision about your orthodontic treatment.',
    content:
      '<p>When it comes to straightening your teeth, you have more options than ever before. Two of the most popular choices are clear aligners and traditional metal braces.</p>',
    date: 'April 15, 2026',
    initial: 'C',
    image: 'https://images.unsplash.com/photo-1611685654428-fc2ea2e4e8f7?w=600&auto=format',
  },
  {
    id: '2',
    slug: 'daily-habits-for-healthy-teeth-and-gums',
    title: '5 Daily Habits for Maintaining Healthy Teeth and Gums',
    excerpt:
      'Simple yet effective daily routines that can help you maintain optimal oral health and prevent common dental problems.',
    content:
      '<p>A beautiful smile starts with healthy teeth and gums. Brush properly, floss daily, stay hydrated, and keep regular dental check-ups.</p>',
    date: 'April 8, 2026',
    initial: '5',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&auto=format',
  },
  {
    id: '3',
    slug: 'first-orthodontic-consultation',
    title: 'What to Expect During Your First Orthodontic Consultation',
    excerpt:
      "Feeling nervous about your first visit? Here's a complete guide to what happens during an orthodontic consultation.",
    content:
      '<p>Your first orthodontic consultation is an important step toward achieving the smile you have always wanted.</p>',
    date: 'April 1, 2026',
    initial: 'W',
    image: 'https://images.unsplash.com/photo-1588776814546-ec7e2b7a1f6a?w=600&auto=format',
  },
]

function escHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function applyMarks(text: string, marks: string[] = [], markDefs: SanityBlock['markDefs'] = []) {
  return marks.reduce((out, mark) => {
    if (mark === 'strong') return `<strong>${out}</strong>`
    if (mark === 'em') return `<em>${out}</em>`
    if (mark === 'underline') return `<u>${out}</u>`
    if (mark === 'code') return `<code>${out}</code>`

    const def = markDefs?.find((item) => item._key === mark)
    if (def?._type === 'link') {
      return `<a href="${escHtml(def.href)}" target="_blank" rel="noopener">${out}</a>`
    }

    return out
  }, escHtml(text))
}

function renderSpans(children: SanityBlock['children'] = [], markDefs: SanityBlock['markDefs'] = []) {
  return children
    .map((span) => (span._type === 'span' ? applyMarks(span.text || '', span.marks, markDefs) : ''))
    .join('')
}

function portableTextToHtml(blocks: SanityBlock[] = []) {
  const result: string[] = []
  let listBuffer: string[] = []
  let listType: string | null = null

  const flushList = () => {
    if (!listBuffer.length) return
    const tag = listType === 'number' ? 'ol' : 'ul'
    result.push(`<${tag}>${listBuffer.join('')}</${tag}>`)
    listBuffer = []
    listType = null
  }

  blocks.forEach((block) => {
    if (block._type === 'image') {
      flushList()
      const url = block.asset?.url || block.asset?._ref || ''
      if (url) {
        result.push(
          `<figure><img src="${escHtml(url)}?w=700&auto=format" alt="${escHtml(
            block.alt,
          )}" style="max-width:100%;border-radius:8px;margin:1rem 0;" /></figure>`,
        )
      }
      return
    }

    if (block._type !== 'block') {
      flushList()
      return
    }

    const inner = renderSpans(block.children, block.markDefs)

    if (block.listItem) {
      if (listType && listType !== block.listItem) flushList()
      listType = block.listItem
      listBuffer.push(`<li>${inner}</li>`)
      return
    }

    flushList()

    if (block.style === 'h1') result.push(`<h1>${inner}</h1>`)
    else if (block.style === 'h2') result.push(`<h2>${inner}</h2>`)
    else if (block.style === 'h3') result.push(`<h3>${inner}</h3>`)
    else if (block.style === 'h4') result.push(`<h4>${inner}</h4>`)
    else if (block.style === 'blockquote') result.push(`<blockquote>${inner}</blockquote>`)
    else result.push(`<p>${inner}</p>`)
  })

  flushList()
  return result.join('\n')
}

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function sanityImgUrl(ref?: string, width = 600) {
  if (!ref) return ''
  const [, id, dims, ext] = ref.split('-')
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dims}.${ext}?w=${width}&auto=format`
}

function resolveImage(post: SanityPost) {
  if (post.mainImage?.asset?.url) return `${post.mainImage.asset.url}?w=600&auto=format`
  if (post.mainImage?.asset?._ref) return sanityImgUrl(post.mainImage.asset._ref)
  return ''
}

function mapPost(post: SanityPost): BlogPost {
  return {
    id: post._id,
    slug: post.slug || post._id,
    title: post.title || 'Untitled',
    excerpt: post.excerpt ? `${post.excerpt.trim()}...` : '',
    content: portableTextToHtml(post.body),
    date: formatDate(post.publishedAt),
    initial: (post.title || 'B').charAt(0).toUpperCase(),
    image: resolveImage(post),
  }
}

async function fetchSanityPosts() {
  const query = encodeURIComponent(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      publishedAt,
      "slug": slug.current,
      "excerpt": pt::text(body)[0..200],
      "mainImage": mainImage { alt, asset->{ _ref, url } },
      body[] {
        ...,
        _type == "image" => { ..., asset-> }
      }
    }
  `)

  const response = await fetch(`${SANITY_CDN}?query=${query}`)
  if (!response.ok) throw new Error(`Sanity responded with ${response.status}`)
  const { result } = await response.json()
  return (result || []).map(mapPost)
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

export default function BlogPageClient() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const visiblePosts = useMemo(() => posts.slice(0, visibleCount), [posts, visibleCount])

  useEffect(() => {
    let active = true

    fetchSanityPosts()
      .then((nextPosts) => {
        if (active) setPosts(nextPosts.length ? nextPosts : fallbackPosts)
      })
      .catch(() => {
        if (active) setPosts(fallbackPosts)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <div className="blog-page">
      <nav className="navbar navbar-dark-text scrolled" id="navbar">
        <div className="nav-container">
          <a href="/" className="nav-brand">Smile Stories</a>

          <div className="nav-social">
            <a href="https://www.instagram.com/dr.pallavigarg?igsh=MWV0dXh4cTdhaTFreQ==" target="_blank" rel="noopener" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://wa.me/916284114338" target="_blank" rel="noopener" aria-label="WhatsApp">
              <WhatsAppIcon />
            </a>
          </div>

          <div className="nav-links" id="navLinks">
            <a href="/" className="nav-link">Home</a>
            <a href="/#about" className="nav-link">About</a>
            <a href="/#services" className="nav-link">Services</a>
            <a href="/#faq" className="nav-link">FAQ</a>
            <a href="/blog" className="nav-link active">Blogs</a>
            <a href="/#contact" className="nav-link">Contact</a>
          </div>

          <button
            className={`nav-toggle${mobileMenuOpen ? ' active' : ''}`}
            id="navToggle"
            aria-label="Toggle navigation"
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div
        className={`mobile-menu${mobileMenuOpen ? ' active' : ''}`}
        id="mobileMenu"
        onClick={(event) => {
          if (event.target === event.currentTarget) setMobileMenuOpen(false)
        }}
      >
        <div className="mobile-menu-content">
          {[
            ['Home', '/'],
            ['About', '/#about'],
            ['Services', '/#services'],
            ['FAQ', '/#faq'],
            ['Blogs', '/blog'],
            ['Contact', '/#contact'],
          ].map(([label, href]) => (
            <a key={label} href={href} className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              {label}
            </a>
          ))}
          <div className="mobile-social">
            <a href="https://www.instagram.com/dr.pallavigarg?igsh=MWV0dXh4cTdhaTFreQ==" target="_blank" rel="noopener" aria-label="Instagram">
              <InstagramIcon size={24} />
            </a>
            <a href="https://wa.me/916284114338" target="_blank" rel="noopener" aria-label="WhatsApp">
              <WhatsAppIcon size={24} />
            </a>
          </div>
        </div>
      </div>

      <section className="blog-header">
        <div className="blog-orb blog-orb--1">🦷</div>
        <div className="blog-orb blog-orb--2">✨</div>
        <div className="blog-orb blog-orb--3">😁</div>
        <div className="blog-orb blog-orb--4">🪥</div>
        <div className="blog-orb blog-orb--5">💎</div>

        <div className="container">
          <span className="section-label">Orthodontic Blog & Dental Tips</span>
          <h1 className="blog-title">
            Smile Stories Blog: Orthodontic Insights
            <br />
            <em>Expert articles on</em> <em>aligners,</em> <em>braces,</em> <em>and smile care</em>
          </h1>
          <p className="blog-subtitle">
            Expert orthodontic advice on clear aligners, metal braces, teeth whitening, and smile transformations from Dr. Pallavi Garg in Jalandhar, Punjab. Read dental health guides and treatment tips.
          </p>
        </div>
      </section>

      <section className="blog-section">
        <div className="container">
          <div className="blog-grid" id="blogGrid">
            {loading && (
              <div className="blog-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="blog-spinner">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <p>Loading posts...</p>
              </div>
            )}

            {!loading && !posts.length && (
              <div className="blog-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
                <p>No blog posts yet.</p>
              </div>
            )}

            {!loading && visiblePosts.map((post) => (
              <a className="blog-card" href={`/blog/${post.slug}`} key={post.id}>
                <div className="blog-card-image">
                  {post.image ? <img src={post.image} alt={post.title} loading="lazy" /> : post.initial}
                </div>
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    <div className="blog-card-date">{post.date}</div>
                  </div>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <span className="blog-card-link">Read More →</span>
                </div>
              </a>
            ))}
          </div>

          <div className="blog-actions">
            {visibleCount < posts.length && (
              <button className="btn btn-secondary" type="button" onClick={() => setVisibleCount((count) => count + POSTS_PER_PAGE)}>
                Load More Posts
              </button>
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="/" className="footer-logo">Smile Stories</a>
              <p className="footer-tagline">Creating beautiful smiles with care and precision.</p>
              <div className="footer-social">
                <a href="https://www.instagram.com/dr.pallavigarg?igsh=MWV0dXh4cTdhaTFreQ==" target="_blank" rel="noopener" aria-label="Instagram">
                  <InstagramIcon />
                </a>
                <a href="https://wa.me/916284114338" target="_blank" rel="noopener" aria-label="WhatsApp">
                  <WhatsAppIcon />
                </a>
              </div>
            </div>

            <div className="footer-links">
              <h4>Quick Links</h4>
              <a href="/">Home</a>
              <a href="/#about">About</a>
              <a href="/#services">Services</a>
              <a href="/#faq">FAQ</a>
            </div>

            <div className="footer-links">
              <h4>Services</h4>
              <a href="/#services">Clear Aligners</a>
              <a href="/#services">Metal Braces</a>
              <a href="/#services">Dental Cleaning</a>
              <a href="/#contact">Consultation</a>
            </div>

            <div className="footer-contact">
              <h4>Contact</h4>
              <p>21-B Deol Nagar, Jalandhar<br />Punjab, India</p>
              <p>+916284114338</p>
              <p>Smilestoriesjalandhar@gmail.com</p>
            </div>
          </div>

          <div className="footer-bottom">
  <p>&copy; 2026 Smile Stories. All rights reserved.</p>
  <p className="footer-dev">
    Designed & Developed by <a href="https://www.instagram.com/rishabh._digital/" target="_blank" rel="noopener">Rishabh Raghav.</a>
  </p>
</div>
          
        </div>
      </footer>
    </div>
  )
}
