// ===== Sanity Config =====
const SANITY_PROJECT_ID = '3igm80nn';
const SANITY_DATASET    = 'production';
const SANITY_API_VER    = 'v2023-05-03';
const SANITY_CDN        = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/${SANITY_API_VER}/data/query/${SANITY_DATASET}`;

// ===== Admin Mode =====
let isAdminMode = false; // 🔴 set to true to show edit/delete/add buttons

function updateAdminUI() {
  const adminButtons = [addBlogBtn, editBtn, saveBtn, deleteBtn];
  adminButtons.forEach(btn => {
    if (!btn) return;
    btn.style.display = isAdminMode ? 'flex' : 'none';
  });
}

// ===== Portable Text → HTML converter =====
// Handles paragraphs, headings, bullet/numbered lists, strong, em, underline, links.
function portableTextToHtml(blocks) {
  if (!Array.isArray(blocks)) return '';

  const result = [];
  let listBuffer = [];   // pending list items
  let listType   = null; // 'bullet' | 'number'

  function flushList() {
    if (!listBuffer.length) return;
    const tag = listType === 'number' ? 'ol' : 'ul';
    result.push(`<${tag}>${listBuffer.join('')}</${tag}>`);
    listBuffer = [];
    listType   = null;
  }

  function applyMarks(text, marks, markDefs) {
    if (!marks || !marks.length) return escHtml(text);
    // Apply marks inside-out
    let out = escHtml(text);
    marks.forEach(mark => {
      switch (mark) {
        case 'strong':    out = `<strong>${out}</strong>`; break;
        case 'em':        out = `<em>${out}</em>`;         break;
        case 'underline': out = `<u>${out}</u>`;           break;
        case 'code':      out = `<code>${out}</code>`;     break;
        default: {
          // Could be an annotation key (e.g. link)
          const def = (markDefs || []).find(d => d._key === mark);
          if (def && def._type === 'link') {
            out = `<a href="${escHtml(def.href)}" target="_blank" rel="noopener">${out}</a>`;
          }
        }
      }
    });
    return out;
  }

  function renderSpans(children, markDefs) {
    return (children || []).map(span => {
      if (span._type === 'span') return applyMarks(span.text, span.marks, markDefs);
      return ''; // skip unknown inline types
    }).join('');
  }

  blocks.forEach(block => {
    if (block._type === 'image') {
      flushList();
      const url = block.asset?.url || block.asset?._ref || '';
      if (url) {
        result.push(`<figure><img src="${escHtml(url)}?w=700&auto=format" alt="${escHtml(block.alt || '')}" style="max-width:100%;border-radius:8px;margin:1rem 0;" /></figure>`);
      }
      return;
    }

    if (block._type !== 'block') { flushList(); return; }

    const inner = renderSpans(block.children, block.markDefs);

    if (block.listItem) {
      // List item
      if (listType && listType !== block.listItem) flushList();
      listType = block.listItem;
      listBuffer.push(`<li>${inner}</li>`);
      return;
    }

    flushList(); // non-list block → flush any pending list

    switch (block.style) {
      case 'h1': result.push(`<h1>${inner}</h1>`); break;
      case 'h2': result.push(`<h2>${inner}</h2>`); break;
      case 'h3': result.push(`<h3>${inner}</h3>`); break;
      case 'h4': result.push(`<h4>${inner}</h4>`); break;
      case 'blockquote': result.push(`<blockquote>${inner}</blockquote>`); break;
      default:   result.push(`<p>${inner}</p>`);
    }
  });

  flushList(); // flush any trailing list
  return result.join('\n');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function plainText(blocks, maxLen) {
  if (!Array.isArray(blocks)) return '';
  const text = blocks
    .filter(b => b._type === 'block')
    .flatMap(b => (b.children || []).map(s => s.text || ''))
    .join(' ')
    .trim();
  return maxLen ? text.slice(0, maxLen) + (text.length > maxLen ? '…' : '') : text;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });
}

// ===== Sanity image URL builder =====
function sanityImgUrl(ref, width = 600) {
  // ref looks like: image-abc123-800x600-jpg
  if (!ref) return '';
  const [, id, dims, ext] = ref.split('-');
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dims}.${ext}?w=${width}&auto=format`;
}

function resolveImage(post) {
  // Try asset url first (if projected), then build from _ref
  if (post.mainImage?.asset?.url)  return post.mainImage.asset.url  + '?w=600&auto=format';
  if (post.mainImage?.asset?._ref) return sanityImgUrl(post.mainImage.asset._ref);
  return '';
}

// ===== Fetch from Sanity =====
async function fetchSanityPosts() {
  // GROQ: fetch posts ordered newest first
  // We resolve the image asset URL server-side so we don't need extra requests
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
  `);

  const res = await fetch(`${SANITY_CDN}?query=${query}`);
  if (!res.ok) throw new Error(`Sanity responded with ${res.status}`);
  const { result } = await res.json();
  return result || [];
}

// Map Sanity post shape → internal post shape used by the rest of the UI
function mapPost(s) {
  const imgUrl = resolveImage(s);
  return {
    id:      s._id,
    slug:    s.slug,
    title:   s.title || 'Untitled',
    excerpt: s.excerpt ? s.excerpt.trim() + '…' : '',
    content: portableTextToHtml(s.body),
    date:    formatDate(s.publishedAt),
    initial: (s.title || 'B').charAt(0).toUpperCase(),
    image:   imgUrl,
    // keep raw body so admin edits can still be saved locally
    _raw:    s
  };
}

// ===== State =====
let blogPosts      = [];
let currentPostId  = null;
let isEditing      = false;

// ===== Pagination =====
const POSTS_PER_PAGE = 6;
let visibleCount     = POSTS_PER_PAGE;

// ===== LocalStorage helpers (admin-created / edited posts) =====
const LS_KEY = 'blogPosts_local';

function loadLocalPosts()  { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
function saveLocalPosts(p) { localStorage.setItem(LS_KEY, JSON.stringify(p)); }

// ===== Initialise =====
async function init() {
  showLoadingState();

  try {
    const sanityPosts = await fetchSanityPosts();

    // Merge: Sanity posts first, then any locally-created posts (admin mode)
    const localPosts  = loadLocalPosts().filter(lp => lp._local); // only truly local ones
    blogPosts = [...sanityPosts.map(mapPost), ...localPosts];

  } catch (err) {
    console.warn('Sanity fetch failed, falling back to local storage.', err);
    blogPosts = loadLocalPosts();
    if (!blogPosts.length) blogPosts = [...defaultBlogPosts];
  }

  renderBlogGrid();
  updateAdminUI();
}

function showLoadingState() {
  blogGrid.innerHTML = `
    <div class="blog-empty" style="grid-column:1/-1;">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite;opacity:.4;">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <p style="margin-top:.75rem;">Loading posts…</p>
    </div>`;
  // quick keyframe injection if not present
  if (!document.getElementById('spin-kf')) {
    const s = document.createElement('style');
    s.id = 'spin-kf';
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
}

// ===== Fallback static posts (used only if Sanity is unreachable AND localStorage is empty) =====
const defaultBlogPosts = [
  {
    id: 1,
    title: "Clear Aligners vs Traditional Braces: Which is Right for You?",
    excerpt: "Discover the key differences between clear aligners and metal braces to make an informed decision about your orthodontic treatment.",
    content: `<p>When it comes to straightening your teeth, you have more options than ever before. Two of the most popular choices are clear aligners (like Invisalign) and traditional metal braces.</p>
<h3><strong>Clear Aligners</strong></h3>
<ul><li>Nearly invisible appearance</li><li>Removable for eating and cleaning</li><li>Fewer office visits required</li></ul>
<h3><strong>Traditional Metal Braces</strong></h3>
<ul><li>Effective for all types of orthodontic issues</li><li>No compliance issues – work 24/7</li><li>Often more affordable</li></ul>
<p>The best option depends on your specific needs, lifestyle, and budget. During your consultation, Dr. Sharma will recommend the most effective treatment plan for you.</p>`,
    date: "April 15, 2026",
    initial: "C",
    image: "https://images.unsplash.com/photo-1611685654428-fc2ea2e4e8f7?w=600&auto=format"
  },
  {
    id: 2,
    title: "5 Daily Habits for Maintaining Healthy Teeth and Gums",
    excerpt: "Simple yet effective daily routines that can help you maintain optimal oral health and prevent common dental problems.",
    content: `<p>A beautiful smile starts with healthy teeth and gums. Here are five habits that can make a significant difference.</p>
<h3><strong>1. Brush Properly, Twice a Day</strong></h3><p>Use a soft-bristled brush and fluoride toothpaste for at least two minutes.</p>
<h3><strong>2. Floss Daily</strong></h3><p>Brushing alone can't reach the spaces between your teeth.</p>
<h3><strong>3. Stay Hydrated</strong></h3><p>Water helps wash away food particles and supports saliva production.</p>
<h3><strong>4. Limit Sugary and Acidic Foods</strong></h3><p>Enjoy these in moderation and rinse your mouth with water afterward.</p>
<h3><strong>5. Don't Skip Dental Check-ups</strong></h3><p>Professional cleanings help catch problems early and remove tartar.</p>`,
    date: "April 8, 2026",
    initial: "5",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&auto=format"
  },
  {
    id: 3,
    title: "What to Expect During Your First Orthodontic Consultation",
    excerpt: "Feeling nervous about your first visit? Here's a complete guide to what happens during an orthodontic consultation.",
    content: `<p>Your first orthodontic consultation is an important step toward achieving the smile you've always wanted.</p>
<h3><strong>The Initial Examination</strong></h3>
<ul><li>Thorough examination of teeth, jaw, and facial structure</li><li>Digital X-rays and photographs</li><li>Bite alignment evaluation</li></ul>
<h3><strong>Creating Your Digital Treatment Plan</strong></h3>
<p>Using advanced 3D imaging technology, we'll show you a preview of your potential results.</p>
<h3><strong>Questions to Ask</strong></h3>
<ul><li>How long will my treatment take?</li><li>What are the costs and payment plans?</li><li>Are there any lifestyle changes I should expect?</li></ul>`,
    date: "April 1, 2026",
    initial: "W",
    image: "https://images.unsplash.com/photo-1588776814546-ec7e2b7a1f6a?w=600&auto=format"
  }
];

// ===== DOM Elements =====
const blogGrid   = document.getElementById('blogGrid');
const blogModal  = document.getElementById('blogModal');
const closeModal = document.getElementById('closeModal');
const addBlogBtn = document.getElementById('addBlogBtn');
const editBtn    = document.getElementById('editBtn');
const saveBtn    = document.getElementById('saveBtn');
const deleteBtn  = document.getElementById('deleteBtn');
const modalTitle   = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const modalDate    = document.getElementById('modalDate');

// ===== Render =====
function renderBlogGrid() {
  if (!blogPosts.length) {
    blogGrid.innerHTML = `
      <div class="blog-empty" style="grid-column:1/-1;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <line x1="10" y1="9" x2="8" y2="9"></line>
        </svg>
        <p>No blog posts yet. ${isAdminMode ? 'Click "Add New Post" to create your first article.' : ''}</p>
      </div>`;
    return;
  }

  const visiblePosts = blogPosts.slice(0, visibleCount);

  blogGrid.innerHTML = visiblePosts.map(post => `
    <article class="blog-card" data-slug="${escHtml(String(post.slug || post.id))}">
      <div class="blog-card-image">
        ${post.image
          ? `<img src="${escHtml(post.image)}" alt="${escHtml(post.title)}" loading="lazy" />`
          : post.initial}
      </div>
      <div class="blog-card-content">
        <div class="blog-card-meta">
          <div class="blog-card-date">${escHtml(post.date)}</div>
        </div>
        <h3 class="blog-card-title">${escHtml(post.title)}</h3>
        <p class="blog-card-excerpt">${escHtml(post.excerpt)}</p>
        <span class="blog-card-link">Read More →</span>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.blog-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = '/blog/' + card.dataset.slug;
    });
  });

  // Show / hide Load More button
  if (visibleCount < blogPosts.length) {
    loadMoreBtn.style.display = 'flex';
  } else {
    loadMoreBtn.style.display = 'none';
  }
}

// ===== Modal =====
function openPost(id) {
  const post = blogPosts.find(p => String(p.id) === String(id));
  if (!post) return;

  currentPostId = id;
  isEditing     = false;

  modalDate.textContent  = post.date;
  modalTitle.textContent = post.title;
  modalContent.innerHTML = post.content;

  const modalImage = document.getElementById('modalImage');
  if (post.image) {
    modalImage.innerHTML = `<img src="${post.image}" alt="${post.title}" />`;
    modalImage.style.display = 'block';
  } else {
    modalImage.innerHTML = '';
    modalImage.style.display = 'none';
  }

  setEditMode(false);
  blogModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModalHandler() {
  blogModal.classList.remove('active');
  document.body.style.overflow = '';
  currentPostId = null;
  isEditing     = false;
  setEditMode(false);
}

function setEditMode(editing) {
  isEditing = editing;
  modalTitle.contentEditable   = editing;
  modalContent.contentEditable = editing;

  if (!isAdminMode) return;

  if (editing) {
    editBtn.style.display   = 'none';
    saveBtn.style.display   = 'flex';
    deleteBtn.style.display = 'none';
  } else {
    editBtn.style.display   = 'flex';
    saveBtn.style.display   = 'none';
    deleteBtn.style.display = 'flex';
  }
}

function savePost() {
  if (!currentPostId) return;
  const idx = blogPosts.findIndex(p => String(p.id) === String(currentPostId));
  if (idx === -1) return;

  blogPosts[idx].title   = modalTitle.textContent;
  blogPosts[idx].content = modalContent.innerHTML;
  blogPosts[idx].excerpt = modalContent.textContent.slice(0, 150) + '…';
  blogPosts[idx].initial = (modalTitle.textContent || 'B').charAt(0).toUpperCase();

  // Persist admin edits locally
  saveLocalPosts(blogPosts);
  renderBlogGrid();
  setEditMode(false);
}

function deletePost() {
  if (!currentPostId) return;
  if (!confirm('Are you sure you want to delete this post?')) return;

  blogPosts = blogPosts.filter(p => String(p.id) !== String(currentPostId));
  saveLocalPosts(blogPosts);
  renderBlogGrid();
  closeModalHandler();
}

function addNewPost() {
  const newId  = 'local_' + Date.now();
  const today  = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const newPost = {
    id:      newId,
    title:   'New Blog Post',
    excerpt: 'Click to edit this post and add your content…',
    content: '<p>Start writing your blog post here. You can edit this content by clicking the Edit button below.</p>',
    date:    today,
    initial: 'N',
    image:   '',
    _local:  true
  };

  blogPosts.unshift(newPost);
  saveLocalPosts(blogPosts);
  renderBlogGrid();
  openPost(newId);
  setEditMode(true);
}

// ===== Navbar =====
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

// function updateNavbarStyle() {
//   if (window.scrollY > 50) {
//     navbar.classList.add('scrolled');
//     navbar.style.background  = 'rgba(255,255,255,0.95)';
//     navbar.style.boxShadow   = '0 8px 32px rgba(0,0,0,0.1)';
//     navbar.style.border      = '1px solid rgba(0,0,0,0.05)';
//   } else {
//     navbar.classList.remove('scrolled');
//     navbar.style.background  = 'rgba(255,255,255,0.15)';
//     navbar.style.boxShadow   = '0 8px 32px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.2)';
//     navbar.style.border      = '1px solid rgba(255,255,255,0.18)';
//   }
// }

function updateNavbarStyle() {
  // Blog page always has a light background — keep navbar solid always
  navbar.classList.add('scrolled');
  navbar.style.background = 'rgba(255,255,255,0.95)';
  navbar.style.boxShadow  = '0 8px 32px rgba(0,0,0,0.1)';
  navbar.style.border     = '1px solid rgba(0,0,0,0.05)';
}

window.addEventListener('scroll', updateNavbarStyle);

// function toggleMobileMenu() {
//   navToggle.classList.toggle('active');
//   mobileMenu.classList.toggle('active');
//   document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
// }
// navToggle.addEventListener('click', toggleMobileMenu);
// document.querySelectorAll('.mobile-link').forEach(link => {
//   link.addEventListener('click', () => {
//     if (mobileMenu.classList.contains('active')) toggleMobileMenu();
//   });
// });

function toggleMobileMenu() {
  navToggle.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  const isOpen = mobileMenu.classList.contains('active');
  document.body.style.overflow = isOpen ? 'hidden' : '';


 if (isOpen) {
    navbar.classList.add('scrolled');
    navbar.style.background = 'rgba(255,255,255,0.95)';
    navbar.style.boxShadow  = '0 8px 32px rgba(0,0,0,0.1)';
    navbar.style.border     = '1px solid rgba(0,0,0,0.05)';
  } else {
    updateNavbarStyle();
  }

}

// stopPropagation so the toggle click doesn't bubble and immediately re-close
navToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMobileMenu();
});

// Click anywhere on the overlay (outside the content panel) closes the menu
mobileMenu.addEventListener('click', (e) => {
  if (!e.target.closest('.mobile-menu-content')) {
    toggleMobileMenu();
  }
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    if (mobileMenu.classList.contains('active')) toggleMobileMenu();
  });
});



// ===== Event Listeners =====
const loadMoreBtn = document.getElementById('loadMoreBtn');

closeModal.addEventListener('click', closeModalHandler);
addBlogBtn.addEventListener('click', addNewPost);
editBtn.addEventListener('click', () => setEditMode(true));
saveBtn.addEventListener('click', savePost);
deleteBtn.addEventListener('click', deletePost);

loadMoreBtn.addEventListener('click', () => {
  visibleCount += POSTS_PER_PAGE;
  renderBlogGrid();
});

blogModal.addEventListener('click', e => { if (e.target === blogModal) closeModalHandler(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && blogModal.classList.contains('active')) closeModalHandler();
});

// ===== Boot =====
document.addEventListener('DOMContentLoaded', init);


