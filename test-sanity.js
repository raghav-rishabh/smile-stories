const SANITY_PROJECT_ID = '3igm80nn';
const SANITY_DATASET = 'production';
const SANITY_API_VER = 'v2023-05-03';
const SANITY_CDN = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/${SANITY_API_VER}/data/query/${SANITY_DATASET}`;

async function test(slug) {
  const query = encodeURIComponent(`
    *[_type == "post" && slug.current == "${slug}"][0] {
      _id,
      title
    }
  `);
  const res = await fetch(`${SANITY_CDN}?query=${query}`);
  const data = await res.json();
  console.log(`Slug: '${slug}', Result:`, data.result);
}

test("Gap Correction ");
test("Aligners");
