"""Validate the site's SEO surface. Run after build-seo / build-blog / build-sitemap.

Checks that actually catch damage:
  * every JSON-LD block parses and has @context and @type
  * every FAQ answer in JSON-LD also appears in the visible HTML — structured
    data that does not match the page is what search engines call spam
  * one canonical, one h1, non-empty unique title and description per page
  * every sitemap URL resolves to a file on disk, and every indexable page is
    in the sitemap
  * no leaked JSX comments rendering as visible text

Exit code is the number of problems, so CI can gate on it.
"""
import io, json, os, re, sys, html
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://kai247.com'
SKIP = {'.git', '.github', 'node_modules', 'src', 'scripts', 'docs', '.ssr', 'assets'}

# The site publishes a guide quoting these as the working limits. Holding our
# own pages to them is the cheapest way to keep that honest.
TITLE_MAX, DESC_MAX = 62, 158

problems = []
def bad(where, msg):
    problems.append('%-46s %s' % (where, msg))

def pages():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP and not d.startswith('.')]
        if 'index.html' in filenames:
            rel = os.path.relpath(dirpath, ROOT).replace('\\', '/')
            path = '/' if rel == '.' else '/' + rel + '/'
            yield path, os.path.join(dirpath, 'index.html')

def strip_tags(s):
    s = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', s, flags=re.S | re.I)
    return re.sub(r'<[^>]+>', ' ', s)

titles, descs = defaultdict(list), defaultdict(list)
seen_paths = []

for path, f in pages():
    src = io.open(f, encoding='utf-8').read()
    seen_paths.append(path)
    visible = html.unescape(strip_tags(src))
    visible_norm = re.sub(r'\s+', ' ', visible)

    # --- JSON-LD ---
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', src, re.S):
        raw = m.group(1)
        try:
            obj = json.loads(raw)
        except Exception as e:
            bad(path, 'JSON-LD does not parse: %s' % e)
            continue
        # @graph is a legitimate top-level shape: @context plus a list of
        # nodes that each carry their own @type. Requiring @type at the top
        # level flagged a perfectly valid home page.
        if '@context' not in obj or not ('@type' in obj or '@graph' in obj):
            bad(path, 'JSON-LD missing @context or @type/@graph')
        if obj.get('@type') == 'FAQPage':
            for q in obj.get('mainEntity', []):
                ans = q.get('acceptedAnswer', {}).get('text', '')
                name = q.get('name', '')
                probe = re.sub(r'\s+', ' ', html.unescape(ans))[:60]
                if probe and probe not in visible_norm:
                    bad(path, 'FAQ answer not visible on page: %r' % probe[:48])
                pname = re.sub(r'\s+', ' ', html.unescape(name))[:50]
                if pname and pname not in visible_norm:
                    bad(path, 'FAQ question not visible on page: %r' % pname[:48])

    # --- head basics ---
    t = re.search(r'<title>(.*?)</title>', src, re.S)
    d = re.search(r'<meta name="description" content="([^"]*)"', src)
    # Count canonicals in MARKUP only. The marketing toolkit builds a
    # canonical tag inside a JS string as output for the user, which is not a
    # canonical for this page.
    markup = re.sub(r'<script[^>]*>.*?</script>', ' ', src, flags=re.S | re.I)
    c = re.findall(r'<link rel="canonical"', markup)
    # Count h1 in MARKUP only, for the same reason as the canonical above: the
    # file-tools Markdown converter builds '<h1>$1</h1>' inside a regex
    # replacement string, which is not a heading on this page.
    h1 = re.findall(r'<h1[ >]', markup)
    # Length is measured on the UNESCAPED text: '&amp;' is one character to a
    # search engine and five in the markup, and counting the markup flagged a
    # title that was already inside the limit.
    if not t or not t.group(1).strip():
        bad(path, 'missing or empty <title>')
    else:
        title = t.group(1).strip()
        titles[title].append(path)
        n = len(html.unescape(title))
        if n > TITLE_MAX:
            bad(path, '<title> is %d chars, over the %d guideline' % (n, TITLE_MAX))
    if not d or not d.group(1).strip():
        bad(path, 'missing or empty meta description')
    else:
        desc = d.group(1).strip()
        descs[desc].append(path)
        n = len(html.unescape(desc))
        if n > DESC_MAX:
            bad(path, 'description is %d chars, over the %d guideline' % (n, DESC_MAX))
    if len(c) != 1:
        bad(path, 'expected exactly 1 canonical, found %d' % len(c))
    if len(h1) != 1:
        bad(path, 'expected exactly 1 <h1>, found %d' % len(h1))

    if '{/*' in src:
        bad(path, 'leaked JSX comment renders as visible text')

for t, ps in titles.items():
    if len(ps) > 1:
        bad(ps[0], 'duplicate <title> shared with %s' % ', '.join(ps[1:]))
for d, ps in descs.items():
    if len(ps) > 1:
        bad(ps[0], 'duplicate description shared with %s' % ', '.join(ps[1:]))

# --- sitemap ---
sm = os.path.join(ROOT, 'sitemap.xml')
if not os.path.exists(sm):
    bad('/sitemap.xml', 'missing')
else:
    smsrc = io.open(sm, encoding='utf-8').read()
    listed = re.findall(r'<loc>%s(.*?)</loc>' % re.escape(SITE), smsrc)
    for p in listed:
        target = os.path.join(ROOT, p.strip('/').replace('/', os.sep), 'index.html')
        if p == '/':
            target = os.path.join(ROOT, 'index.html')
        if not os.path.exists(target):
            bad('/sitemap.xml', 'lists a page that does not exist: %s' % p)
    for p in seen_paths:
        if p not in listed:
            bad('/sitemap.xml', 'indexable page missing from sitemap: %s' % p)

print('checked %d pages' % len(seen_paths))
if problems:
    print('\n%d problem(s):\n' % len(problems))
    for p in problems:
        print('  ' + p)
else:
    print('no problems found')
sys.exit(len(problems))
