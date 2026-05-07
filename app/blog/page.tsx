import { Metadata } from 'next'

const SANITY_PROJECT_ID = '3igm80nn'
const SANITY_DATASET = 'production'
const SANITY_API_VER = 'v2023-05-03'
const SANITY_CDN = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/${SANITY_API_VER}/data/query/${SANITY_DATASET}`

// Fetch all blog posts from Sanity
async function getAllPosts() {
  const query = encodeURIComponent(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      "excerpt": pt::text(body)[0..150],
      "mainImage": mainImage { alt, asset->{ _ref, url } },
      author-> { name }
    }
  `)
  
  try {
    const res = await fetch(`${SANITY_CDN}?query=${query}`, { 
      next: { revalidate: 60 } // Revalidate every 60 seconds
    })
    
    if (!res.ok) {
      console.error('Sanity fetch error:', res.status)
      return []
    }
    
    const { result } = await res.json()
    return result || []
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

// Format date helper
function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

// Get image URL
function getImageUrl(post: any) {
  if (post.mainImage?.asset?.url) {
    return post.mainImage.asset.url + '?w=400&auto=format'
  }
  if (post.mainImage?.asset?._ref) {
    const ref = post.mainImage.asset._ref
    const [, id, dims, ext] = ref.split('-')
    return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dims}.${ext}?w=400&auto=format`
  }
  return ''
}

export const metadata: Metadata = {
  title: 'Blog | Smile Stories - Orthodontic Insights & Dental Tips',
  description: 'Read expert articles on clear aligners, braces, teeth whitening, and smile transformation. Get dental care tips from Dr. Pallavi Garg in Jalandhar.',
  keywords: 'dental blog, orthodontic tips, teeth whitening, clear aligners, braces care, smile transformation, dental health',
  openGraph: {
    title: 'Smile Stories Blog - Orthodontic Insights',
    description: 'Expert dental advice and smile transformation stories from Dr. Pallavi Garg',
    type: 'website',
  },
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <>
      <link rel="stylesheet" href="/style.css" precedence="default" />
      <link rel="stylesheet" href="/blog2.css" precedence="default" />
      
      <style>{`
        .blog-card-hover {
          transition: all 0.3s ease;
        }

        .blog-card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important;
        }
      `}</style>
      
      <div style={{ 
        position: 'relative',
        backgroundColor: '#f4fbf9', 
        minHeight: '100vh', 
        padding: '3rem 1rem 0',
        overflow: 'hidden',
      }}>
        {/* Animated Background Gradient Blobs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(122,181,171,0.12) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: -1, animation: 'float 8s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(122,181,171,0.08) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: -1, animation: 'float 10s ease-in-out infinite reverse' }}></div>
        <div style={{ position: 'absolute', top: '40%', right: '15%', width: '25vw', height: '25vw', background: 'radial-gradient(circle, rgba(200,230,225,0.2) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: -1, animation: 'float 6s ease-in-out infinite 2s' }}></div>
        
        {/* Dot Grid Overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px', zIndex: -1, pointerEvents: 'none' }}></div>

        {/* Floating Orbs */}
        <div className="blog-orb blog-orb--1" style={{ position: 'fixed', zIndex: -1 }}>🦷</div>
        <div className="blog-orb blog-orb--2" style={{ position: 'fixed', zIndex: -1 }}>✨</div>
        <div className="blog-orb blog-orb--3" style={{ position: 'fixed', zIndex: -1 }}>😁</div>
        <div className="blog-orb blog-orb--4" style={{ position: 'fixed', zIndex: -1 }}>🪥</div>
        <div className="blog-orb blog-orb--5" style={{ position: 'fixed', zIndex: -1 }}>💎</div>

        {/* Main Content */}
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', position: 'relative', zIndex: 1, paddingBottom: '5rem' }}>
          
          {/* Back to Home Button */}
          <a href="/" className="blog-card-link" style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', 
            color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600,
            background: 'rgba(255,255,255,0.8)', padding: '0.6rem 1.25rem', borderRadius: '100px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.04)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.8)'
          }}>
            ← Back to Home
          </a>

          {/* Header Section */}
          <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 700,
              marginBottom: '1rem',
              color: '#111',
              letterSpacing: '-0.02em'
            }}>
              Our Dental Insights
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.7
            }}>
              Expert advice on orthodontic care, dental health tips, and smile transformation stories from Dr. Pallavi Garg
            </p>
          </div>

          {/* Blog Posts Grid */}
          {posts.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '2rem',
              marginBottom: '4rem'
            }}>
              {posts.map((post: any) => {
                const imageUrl = getImageUrl(post)
                const date = formatDate(post.publishedAt)
                
                return (
                  <article 
                    key={post._id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(255,255,255,0.6)',
                      backdropFilter: 'blur(10px)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                    className="blog-card-hover"
                  >
                    {/* Post Image */}
                    {imageUrl && (
                      <div style={{
                        width: '100%',
                        height: '220px',
                        overflow: 'hidden',
                        background: '#f0f0f0'
                      }}>
                        <img 
                          src={imageUrl} 
                          alt={post.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center'
                          }}
                        />
                      </div>
                    )}

                    {/* Post Content */}
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {/* Date */}
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#999',
                        marginBottom: '0.75rem',
                        fontWeight: 500
                      }}>
                        {date}
                      </div>

                      {/* Title */}
                      <a 
                        href={`/blog/${post.slug.current}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        <h2 style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: '#111',
                          marginBottom: '0.75rem',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {post.title}
                        </h2>
                      </a>

                      {/* Excerpt */}
                      <p style={{
                        fontSize: '0.95rem',
                        color: '#666',
                        marginBottom: '1rem',
                        lineHeight: 1.6,
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {post.excerpt}
                      </p>

                      {/* Author */}
                      {post.author?.name && (
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#999',
                          marginBottom: '1.25rem'
                        }}>
                          By {post.author.name}
                        </div>
                      )}

                      {/* Read More Link */}
                      <a 
                        href={`/blog/${post.slug.current}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: 'var(--color-primary)',
                          textDecoration: 'none',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          marginTop: 'auto'
                        }}
                      >
                        Read More →
                      </a>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.6)',
              marginBottom: '4rem'
            }}>
              <p style={{
                fontSize: '1.125rem',
                color: '#666',
                marginBottom: '1rem'
              }}>
                No blog posts yet
              </p>
              <p style={{
                fontSize: '0.95rem',
                color: '#999'
              }}>
                Check back soon for dental tips and smile transformation stories!
              </p>
            </div>
          )}
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
          letterSpacing: '-0.05em',
          position: 'relative',
          zIndex: 0
        }}>
          Smile Stories
        </div>
      </div>
    </>
  )
}