"""Render per-page SEO from scripts/seo-data.json into the utility pages.

Writes three things into each page, between markers so the script is
idempotent and re-runnable:

  * <title> and <meta name="description">, replaced in place
  * a visible FAQ section before </main>
  * FAQPage + BreadcrumbList JSON-LD

THE VISIBLE FAQ AND THE JSON-LD COME FROM THE SAME DATA. Structured data that
does not match what a visitor can read is what Google calls spam and what
everyone else calls lying; generating both from one source makes the two
unable to disagree.

Run:  python scripts/build-seo.py
"""
import io, json, os, re, html, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = json.load(io.open(os.path.join(ROOT, 'scripts', 'seo-data.json'), encoding='utf-8'))
SITE = 'https://kai247.com'

SEO_CSS_V = '2'  # bump whenever assets/css/seo.css changes

START, END = '<!-- seo:faq -->', '<!-- /seo:faq -->'
LD_START, LD_END = '<!-- seo:ld -->', '<!-- /seo:ld -->'


# The closing line of every FAQ block is also the page's strongest internal
# link. A utility page should push the other utilities; a network page should
# push the free tools, because that is the door most searches arrive through.
FOOT = {
    'utility': 'Part of <a href="/utility/">nine free KAI247 instruments</a> — '
               'all in-browser, none of them upload your files.',
    'network': 'Still deciding? The <a href="/utility/">nine free tools</a> need no account, '
               'and <a href="/join/">joining the network</a> is free during the founding period.',
}


def faq_html(page):
    rows = []
    for q, a in page['faqs']:
        rows.append(
            '      <details class="seo-faq-item">\n'
            '        <summary><span class="seo-faq-q">%s</span><span class="seo-faq-mark" aria-hidden="true">+</span></summary>\n'
            '        <p>%s</p>\n'
            '      </details>' % (html.escape(q), html.escape(a))
        )
    # A page and its long-form guide should point at each other. Search engines
    # read a tool plus the article explaining it as one topic; a visitor reads
    # it as the page answering the question they arrived with.
    guide = ''
    if page.get('guide'):
        slug, label = page['guide']
        guide = ('    <a class="seo-faq-guide" href="/blog/%s/">\n'
                 '      <span class="seo-faq-guide-ring" aria-hidden="true"></span>\n'
                 '      <span><span class="seo-faq-guide-kicker">Read the guide</span>%s</span>\n'
                 '    </a>\n' % (slug, html.escape(label)))

    return (
        '%s\n'
        '  <section class="seo-faq" id="faq" aria-labelledby="faq-h">\n'
        '    <div class="seo-faq-head">\n'
        '      <span class="seo-faq-ring" aria-hidden="true"></span>\n'
        '      <div>\n'
        '        <h2 id="faq-h">Questions people actually ask</h2>\n'
        '        <p>%s</p>\n'
        '      </div>\n'
        '    </div>\n'
        '    <div class="seo-faq-list">\n%s\n    </div>\n'
        '%s'
        '    <p class="seo-faq-foot">%s</p>\n'
        '  </section>\n'
        '%s' % (START, html.escape(page['intro']), '\n'.join(rows), guide,
                FOOT[page.get('section', 'utility')], END)
    )


def ld_html(page):
    faq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in page['faqs']
        ],
    }
    hops = [("KAI247", "/")]
    if page.get('section', 'utility') == 'utility':
        hops.append(("Utilities", "/utility/"))
    if page.get('parent'):
        hops.append(tuple(page['parent']))
    if page['path'] != hops[-1][1]:
        hops.append((page['crumb'], page['path']))

    def block(obj):
        return ('<script type="application/ld+json">\n%s\n</script>'
                % json.dumps(obj, ensure_ascii=False, indent=1))

    out = [LD_START, block(faq)]
    # A one-item breadcrumb (the home page pointing at itself) is noise, not
    # structured data. Emit the trail only when there is a trail.
    if len(hops) > 1:
        out.append(block({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + u}
                for i, (n, u) in enumerate(hops)
            ],
        }))
    out.append(LD_END)
    return '\n'.join(out)


def splice(src, start, end, payload):
    if start in src and end in src:
        return re.sub(re.escape(start) + r'.*?' + re.escape(end), lambda _: payload, src, flags=re.S)
    return None


def main():
    changed = 0
    for page in DATA['pages']:
        path = os.path.join(ROOT, page['file'])
        if not os.path.exists(path):
            print('MISSING', page['file']); continue
        s = io.open(path, encoding='utf-8').read()
        original = s

        # title + description
        s = re.sub(r'<title>.*?</title>',
                   '<title>' + html.escape(page['title']) + '</title>', s, count=1, flags=re.S)
        s = re.sub(r'<meta name="description" content="[^"]*">',
                   '<meta name="description" content="' + html.escape(page['description'], quote=True) + '">',
                   s, count=1)

        # visible FAQ before </main>
        fh = faq_html(page)
        spliced = splice(s, START, END, fh)
        if spliced is None:
            s = s.replace('</main>', fh + '\n</main>', 1)
        else:
            s = spliced

        # JSON-LD before </head>
        lh = ld_html(page)
        spliced = splice(s, LD_START, LD_END, lh)
        if spliced is None:
            s = s.replace('</head>', lh + '\n</head>', 1)
        else:
            s = spliced

        # Make sure the FAQ stylesheet is linked AT THE CURRENT VERSION. The
        # edge caches assets for hours, so a stylesheet change that keeps its
        # old query string ships as a stylesheet change nobody sees.
        link = '<link rel="stylesheet" href="/assets/css/seo.css?v=%s">' % SEO_CSS_V
        if 'seo.css' in s:
            s = re.sub(r'<link rel="stylesheet" href="/assets/css/seo\.css(\?v=[^"]*)?">', link, s)
        else:
            s = s.replace('</head>', link + '\n</head>', 1)

        if s != original:
            io.open(path, 'w', encoding='utf-8', newline='\n').write(s)
            changed += 1
            print('updated', page['file'])
    print('%d page(s) updated' % changed)


if __name__ == '__main__':
    sys.exit(main())
