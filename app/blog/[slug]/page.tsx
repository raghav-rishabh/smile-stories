import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const SANITY_PROJECT_ID = '3igm80nn'
const SANITY_DATASET = 'production'
const SANITY_API_VER = 'v2023-05-03'
const SANITY_CDN = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/${SANITY_API_VER}/data/query/${SANITY_DATASET}`

function escHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function portableTextToHtml(blocks: any[]) {
  if (!Array.isArray(blocks)) return ''

  const result: string[] = []
  let listBuffer: string[] = []
  let listType: string | null = null

  function flushList() {
    if (!listBuffer.length) return
    const tag = listType === 'number' ? 'ol' : 'ul'
    result.push(`<${tag}>${listBuffer.join('')}</${tag}>`)
    listBuffer = []
    listType = null
  }

  function applyMarks(text: string, marks: string[], markDefs: any[]) {
    if (!marks || !marks.length) return escHtml(text)
    let out = escHtml(text)
    marks.forEach(mark => {
      switch (mark) {
        case 'strong': out = `<strong>${out}</strong>`; break
        case 'em': out = `<em>${out}</em>`; break
        case 'underline': out = `<u>${out}</u>`; break
        case 'code': out = `<code>${out}</code>`; break
        default: {
          const def = (markDefs || []).find((d: any) => d._key === mark)
          if (def && def._type === 'link') {
            out = `<a href="${escHtml(def.href)}" target="_blank" rel="noopener">${out}</a>`
          }
        }
      }
    })
    return out
  }

  function renderSpans(children: any[], markDefs: any[]) {
    return (children || []).map(span => {
      if (span._type === 'span') return applyMarks(span.text, span.marks, markDefs)
      return ''
    }).join('')
  }

  blocks.forEach(block => {
    if (block._type === 'image') {
      flushList()
      const url = block.asset?.url || block.asset?._ref || ''
      if (url) {
        let finalUrl = url;
        if(url.startsWith('image-')) {
            const [, id, dims, ext] = url.split('-');
            finalUrl = `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dims}.${ext}`;
        }
        result.push(`<figure><img src="${escHtml(finalUrl)}?w=700&auto=format" alt="${escHtml(block.alt || '')}" style="max-width:100%;border-radius:8px;margin:1rem 0;" /></figure>`)
      }
      return
    }

    if (block._type !== 'block') { flushList(); return }

    const inner = renderSpans(block.children, block.markDefs)

    if (block.listItem) {
      if (listType && listType !== block.listItem) flushList()
      listType = block.listItem
      listBuffer.push(`<li>${inner}</li>`)
      return
    }

    flushList()

    switch (block.style) {
      case 'h1': result.push(`<h1>${inner}</h1>`); break
      case 'h2': result.push(`<h2>${inner}</h2>`); break
      case 'h3': result.push(`<h3>${inner}</h3>`); break
      case 'h4': result.push(`<h4>${inner}</h4>`); break
      case 'blockquote': result.push(`<blockquote>${inner}</blockquote>`); break
      default: result.push(`<p>${inner}</p>`)
    }
  })

  flushList()
  return result.join('\n')
}

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })
}

function sanityImgUrl(ref: string, width = 600) {
  if (!ref) return ''
  const [, id, dims, ext] = ref.split('-')
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dims}.${ext}?w=${width}&auto=format`
}

function resolveImage(post: any) {
  if (post.mainImage?.asset?.url) return post.mainImage.asset.url + '?w=600&auto=format'
  if (post.mainImage?.asset?._ref) return sanityImgUrl(post.mainImage.asset._ref)
  return ''
}

async function getPost(slug: string) {
  const query = encodeURIComponent(`
    *[_type == "post" && slug.current == "${slug}"][0] {
      _id,
      title,
      publishedAt,
      "excerpt": pt::text(body)[0..200],
      "mainImage": mainImage { alt, asset->{ _ref, url } },
      body[] {
        ...,
        _type == "image" => { ..., asset-> }
      }
    }
  `)
  const res = await fetch(`${SANITY_CDN}?query=${query}`, { next: { revalidate: 60 } })
  if (!res.ok) return null
  const { result } = await res.json()
  return result
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const imageUrl = resolveImage(post)
  
  return {
    title: `${post.title} | Smile Stories`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: imageUrl ? [imageUrl] : [],
    }
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  const contentHtml = portableTextToHtml(post.body)
  const dateFormatted = formatDate(post.publishedAt)
  const imageUrl = resolveImage(post)

  return (
    <>
      <link rel="stylesheet" href="/style.css" precedence="default" />
      <link rel="stylesheet" href="/blog2.css" precedence="default" />
      <div style={{ 
        position: 'relative',
        backgroundColor: '#f4fbf9', 
        minHeight: '100vh', 
        padding: '3rem 1rem 0',
        overflow: 'hidden',
        zIndex: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Animated Background Gradient Blobs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(122,181,171,0.12) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: -1, animation: 'float 8s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(122,181,171,0.08) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: -1, animation: 'float 10s ease-in-out infinite reverse' }}></div>
        <div style={{ position: 'absolute', top: '40%', right: '15%', width: '25vw', height: '25vw', background: 'radial-gradient(circle, rgba(200,230,225,0.2) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: -1, animation: 'float 6s ease-in-out infinite 2s' }}></div>
        
        {/* Dot Grid Overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px', zIndex: -1, pointerEvents: 'none' }}></div>

        {/* Floating Orbs (from blog2.css) */}
        <div className="blog-orb blog-orb--1" style={{ position: 'fixed', zIndex: -1 }}>🦷</div>
        <div className="blog-orb blog-orb--2" style={{ position: 'fixed', zIndex: -1 }}>✨</div>
        <div className="blog-orb blog-orb--3" style={{ position: 'fixed', zIndex: -1 }}>😁</div>
        <div className="blog-orb blog-orb--4" style={{ position: 'fixed', zIndex: -1 }}>🪥</div>
        <div className="blog-orb blog-orb--5" style={{ position: 'fixed', zIndex: -1 }}>💎</div>



        <div style={{ maxWidth: '840px', width: '100%', margin: '0 auto', position: 'relative', zIndex: 1, flexGrow: 1, paddingBottom: '5rem' }}>
          <a href="/blog.html" className="blog-card-link" style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem', 
            color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600,
            background: 'rgba(255,255,255,0.8)', padding: '0.6rem 1.25rem', borderRadius: '100px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.04)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.8)'
          }}>
            &larr; Back to Blogs
          </a>
          
          <article className="blog-modal-content" style={{ 
            position: 'relative', transform: 'none', opacity: 1, visibility: 'visible', margin: 0, width: '100%', maxWidth: '100%',
            boxShadow: '0 24px 64px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px', overflow: 'hidden'
          }}>
            {imageUrl && (
              <div className="blog-modal-image" style={{ display: 'block', height: 'auto', maxHeight: '450px', aspectRatio: '16/9', width: '100%', marginTop: 0 }}>
                <img src={imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
              </div>
            )}
            <div className="blog-modal-body" style={{ padding: 'clamp(1.5rem, 6vw, 4rem) clamp(1.5rem, 6vw, 4rem)' }}>
              <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                <div className="blog-post-date" style={{ marginBottom: '1.25rem' }}>{dateFormatted}</div>
                <h1 className="blog-post-title" style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', marginBottom: '2rem', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.02em', color: '#111' }}>{post.title}</h1>
                <div 
                  className="blog-post-content" 
                  style={{ fontSize: '1.125rem', lineHeight: 1.85, color: '#333' }}
                  dangerouslySetInnerHTML={{ __html: contentHtml }} 
                />
              </div>
            </div>
          </article>
        </div>

        {/* Bold Bottom Branding Watermark */}
        <div style={{
          width: '100%',
          textAlign: 'center',
          fontSize: '16.5vw',
          fontWeight: 600,
          fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
          color: '#000000',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          lineHeight: 0.8,
          letterSpacing: '-0.05em'
        }}>
          Smile Stories
        </div>
      </div>
    </>
  )
}
