"""Render /blog/ and each article from scripts/blog-data.json.

Static HTML with BlogPosting JSON-LD, so an article is a real indexable page
rather than something assembled by JavaScript after the crawler has left.

Run:  python scripts/build-blog.py
"""
import io, json, os, html, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = json.load(io.open(os.path.join(ROOT, 'scripts', 'blog-data.json'), encoding='utf-8'))
SITE = 'https://kaiorb.com'

TOOL_NAMES = {
    'pdf-size-reducer': 'PDF Size Reducer',
    'photo-size-targeter': 'Photo Size Targeter',
    'video-to-audio': 'Video to Audio',
    'cidr-calculator': 'Subnet & CIDR Calculator',
    'business-finance-analyzer': 'Finance Analyzer',
    'quote-generator': 'Quote & Estimate Generator',
    'purchase-order-generator': 'Purchase Order Generator',
    'web-marketing-toolkit': 'Web & Marketing Toolkit',
    'web-essentials': 'Web Essentials',
    'invoice-generator': 'Invoice Generator',
    'margin-markup-calculator': 'Margin & Markup Calculator',
    'color-contrast-checker': 'Colour Contrast Checker',
}

HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="{ogtype}">
<meta property="og:url" content="{canonical}">
<meta property="og:title" content="{ogtitle}">
<meta property="og:description" content="{desc}">
<meta name="theme-color" content="#05060c" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f5f6fb" media="(prefers-color-scheme: light)">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/site.css?v=3">
<link rel="stylesheet" href="/assets/css/blog.css?v=2">
<link rel="stylesheet" href="/assets/css/orb-cards.css?v=1">
<script defer src="/assets/js/cosmos.js"></script>
<script defer src="/assets/js/nexus.js?v=2"></script>
{ld}
</head>
<body>
<div class="stars" aria-hidden="true"></div>
<a class="skip" href="#main">Skip to content</a>

<header class="head">
  <div class="container">
    <a class="brand" href="/" aria-label="KAI247 home">
      <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="32" rx="27" ry="13.5" fill="none" stroke="var(--blue)" stroke-width="4" transform="rotate(-24 32 32)"/><circle cx="32" cy="32" r="10" fill="var(--gold)"/><circle cx="51" cy="19" r="4" fill="var(--ink)"/></svg>
      KAI247
    </a>
    <nav class="nav" aria-label="Primary">
      <a href="/ecosystem/">Ecosystem</a>
      <a href="/capabilities/">Capabilities</a>
      <a href="/network/">Network</a>
      <a href="/utility/">Utilities</a>
      <a href="/blog/"{blogcur}>Blog</a>
      <a class="join" href="/join/">Join the Orbit</a>
    </nav>
  </div>
</header>
'''

FOOT = '''
<footer>
  <div class="container">
    <div class="cols">
      <span class="always">KAI247 — Small changes. Always. 24&times;7.</span>
      <nav class="fnav" aria-label="Footer">
        <a href="/about/">About</a>
        <a href="/blog/">Blog</a>
        <a href="/utility/">Free tools</a>
        <a href="/knowledge/">Ask KAI247</a>
        <a href="/contact/">Contact</a>
        <a href="/join/">Join</a>
      </nav>
    </div>
    <p class="foundry">Founded across three continents — Brahmexa (USA) &middot; Inducer Solutions Inc (Canada) &middot; JSI Software Solutions (India). &copy; 2026 KAI247.</p>
  </div>
</footer>
</body>
</html>
'''


TITLE_MAX = 62
BRAND = ' — KAI247'

# One glyph per article kind, so the orb grid is scannable by shape rather
# than only by reading every title.
TAG_GLYPH = {
    'Guide': '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>'
             '<path d="M12 7v5l3.2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    'Vision': '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.4" fill="currentColor"/>'
              '<ellipse cx="12" cy="12" rx="10" ry="4.6" stroke="currentColor" stroke-width="2" transform="rotate(-22 12 12)"/></svg>',
    'How we build': '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>'
                    '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>'
                    '<path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
}


def branded(title):
    """Append the brand only when it still fits.

    A search result truncates around 60 characters. Losing the last words of a
    headline to a suffix costs more than the suffix is worth, so on a long
    title the headline wins.
    """
    return title + BRAND if len(title) + len(BRAND) <= TITLE_MAX else title


def ld_block(obj):
    return '<script type="application/ld+json">\n%s\n</script>' % json.dumps(obj, ensure_ascii=False, indent=1)


def render_body(blocks):
    out = []
    for kind, value in blocks:
        if kind == 'h2':
            out.append('  <h2>%s</h2>' % html.escape(value))
        elif kind == 'p':
            out.append('  <p>%s</p>' % html.escape(value))
        elif kind == 'quote':
            out.append('  <blockquote class="bl-quote">%s</blockquote>' % html.escape(value))
        elif kind == 'ul':
            items = '\n'.join('    <li>%s</li>' % html.escape(i) for i in value)
            out.append('  <ul class="bl-list">\n%s\n  </ul>' % items)
        elif kind == 'tools':
            cards = '\n'.join(
                '    <a class="bl-tool" href="/utility/%s/"><span class="bl-tool-ring" aria-hidden="true"></span>'
                '<span>%s</span></a>' % (s, html.escape(TOOL_NAMES.get(s, s)))
                for s in value)
            out.append('  <div class="bl-tools">\n'
                       '    <p class="bl-tools-label">Tools mentioned — all free, none upload your files</p>\n'
                       '%s\n  </div>' % cards)
    return '\n'.join(out)


def plain_text(blocks):
    """Word count for timeRequired, from the prose only."""
    words = 0
    for kind, value in blocks:
        if kind in ('p', 'h2', 'quote'):
            words += len(value.split())
        elif kind == 'ul':
            words += sum(len(i.split()) for i in value)
    return words


def write_post(post):
    d = os.path.join(ROOT, 'blog', post['slug'])
    os.makedirs(d, exist_ok=True)
    canonical = '%s/blog/%s/' % (SITE, post['slug'])

    ld = ld_block({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post['title'],
        "description": post['description'],
        "datePublished": post['date'],
        "dateModified": post['date'],
        "url": canonical,
        "mainEntityOfPage": {"@type": "WebPage", "@id": canonical},
        "author": {"@type": "Organization", "name": "KAI247", "url": SITE + "/"},
        "publisher": {"@type": "Organization", "name": "KAI247", "url": SITE + "/"},
        "wordCount": plain_text(post['body']),
        "articleSection": post['tag'],
    })
    crumbs = ld_block({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "KAI247", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": SITE + "/blog/"},
            {"@type": "ListItem", "position": 3, "name": post['title'], "item": canonical},
        ],
    })

    nice_date = datetime.date.fromisoformat(post['date']).strftime('%d %B %Y').lstrip('0')

    html_out = HEAD.format(
        title=html.escape(branded(post['title'])),
        desc=html.escape(post['description'], quote=True),
        canonical=canonical, ogtype='article',
        ogtitle=html.escape(post['title']),
        ld=ld + '\n' + crumbs, blogcur='',
    )
    html_out += '''
<main id="main">
  <article class="bl-article container">
    <nav class="bl-crumb" aria-label="Breadcrumb"><a href="/">KAI247</a> › <a href="/blog/">Blog</a></nav>
    <p class="kicker">{tag} · {mins} min read</p>
    <h1>{title}</h1>
    <p class="lede">{desc}</p>
    <p class="bl-date"><time datetime="{date}">{nice}</time></p>
    <div class="bl-body">
{body}
    </div>
    <div class="bl-cta">
      <p>KAI247 is a network of companies building software for other businesses. The tools are free and always will be.</p>
      <div style="display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1rem">
        <a class="btn btn-core" href="/utility/">Try the free tools</a>
        <a class="btn btn-ghost" href="/join/">Join the network</a>
      </div>
    </div>
  </article>
</main>
'''.format(tag=html.escape(post['tag']), mins=post['readMins'],
           title=html.escape(post['title']), desc=html.escape(post['description']),
           date=post['date'], nice=nice_date, body=render_body(post['body']))
    html_out += FOOT

    io.open(os.path.join(d, 'index.html'), 'w', encoding='utf-8', newline='\n').write(html_out)
    print('  wrote /blog/%s/' % post['slug'])


def write_index(posts):
    d = os.path.join(ROOT, 'blog')
    os.makedirs(d, exist_ok=True)
    canonical = SITE + '/blog/'

    ld = ld_block({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "KAI247 Blog",
        "url": canonical,
        "description": "How KAI247 builds, why the tools are free, and what a network of companies can do for a small business.",
        "blogPost": [
            {"@type": "BlogPosting", "headline": p['title'],
             "url": '%s/blog/%s/' % (SITE, p['slug']), "datePublished": p['date'],
             "description": p['description']}
            for p in posts
        ],
    })

    cards = []
    for p in posts:
        nice = datetime.date.fromisoformat(p['date']).strftime('%d %B %Y').lstrip('0')
        cards.append(
            '        <a class="orb-card" href="/blog/{slug}/">\n'
            '          <span class="orb-disc" aria-hidden="true">{glyph}</span>\n'
            '          <span class="orb-kicker">{tag}</span>\n'
            '          <h2 class="orb-title">{title}</h2>\n'
            '          <p class="orb-desc">{desc}</p>\n'
            '          <p class="orb-meta"><time datetime="{date}">{nice}</time> · {mins} min read</p>\n'
            '        </a>'.format(slug=p['slug'], tag=html.escape(p['tag']), glyph=TAG_GLYPH.get(p['tag'], TAG_GLYPH['Guide']),
                                  title=html.escape(p['title']), desc=html.escape(p['description']),
                                  date=p['date'], nice=nice, mins=p['readMins']))

    html_out = HEAD.format(
        title='Blog — KAI247',
        desc=html.escape('How KAI247 builds, why every tool runs in your browser, and what a network of companies actually gives a small business.', quote=True),
        canonical=canonical, ogtype='website', ogtitle='KAI247 Blog',
        ld=ld, blogcur=' aria-current="page"',
    )
    html_out += '''
<main id="main">
  <section class="page-hero container">
    <p class="kicker">Writing</p>
    <h1>How we build, and why</h1>
    <p class="lede">Notes on the network, the free tools, and the trade-offs behind them.</p>
  </section>
  <section class="band">
    <div class="container">
      <div class="orb-grid">
%s
      </div>
    </div>
  </section>
</main>
''' % '\n'.join(cards)
    html_out += FOOT

    io.open(os.path.join(d, 'index.html'), 'w', encoding='utf-8', newline='\n').write(html_out)
    print('  wrote /blog/ (%d posts)' % len(posts))


def main():
    posts = sorted(DATA['posts'], key=lambda p: p['date'], reverse=True)
    for p in posts:
        write_post(p)
    write_index(posts)


if __name__ == '__main__':
    main()
