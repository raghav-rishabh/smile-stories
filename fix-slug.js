const fs = require('fs');
const file = 'app/blog/[slug]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the params to decode slug explicitly
content = content.replace(
  /const \{ slug \} = await params/g,
  'let { slug } = await params; slug = decodeURIComponent(slug); console.log("SLUG IS", "'"'"'"' + slug + "'"'"'");'
);

fs.writeFileSync(file, content);
