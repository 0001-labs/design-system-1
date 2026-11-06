/** Only the published marketing pages belong in search; account routes never do. */
const origin = 'https://consistency.site';
const pages = ['/', '/examples/'];

export function consistencySearch(request: Request): Response | null {
  const path = new URL(request.url).pathname;
  if (path !== '/robots.txt' && path !== '/sitemap.xml') return null;
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  const robots = path === '/robots.txt';
  const body = robots
    ? `User-agent: *\nDisallow: /auth/\nDisallow: /api/\nDisallow: /app/\nDisallow: /editor/\nDisallow: /private-consistency/\nDisallow: /team\nDisallow: /edit\nDisallow: /admin\nDisallow: /flags\nDisallow: /kit/\n\nSitemap: ${origin}/sitemap.xml\n`
    : `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(page => `<url><loc>${origin}${page}</loc></url>`).join('')}</urlset>\n`;
  return new Response(request.method === 'HEAD' ? null : body, { headers: { 'Content-Type': robots ? 'text/plain; charset=utf-8' : 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' } });
}
