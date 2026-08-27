"""Generate sitemap.xml from what is actually on disk.

The previous sitemap was hand-maintained and had fallen six pages behind: every
utility built after it was written was invisible to search engines, which is
the least visible way for a page to fail. Walking the directory means a new
page cannot be forgotten.

Run:  python scripts/build-sitemap.py
"""
import io, os, re, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://kaiorb.com'

# Directories that hold source or documentation rather than pages.
SKIP_DIRS = {'.git', '.github', 'node_modules', 'src', 'scripts', 'docs', '.ssr', 'assets'}

# Priority by section. Anything unlisted gets 0.6.
PRIORITY = [
    (r'^/$', '1.0'),
    (r'^/utility/$', '0.9'),
    (r'^/utility/[^/]+/$', '0.8'),
    (r'^/blog/$', '0.8'),
    (r'^/blog/[^/]+/$', '0.7'),
    (r'^/(ecosystem|capabilities|network|impact|join|knowledge)/$', '0.9'),
    (r'^/join/[^/]+/$', '0.7'),
]


def priority(path):
    for pattern, p in PRIORITY:
        if re.match(pattern, path):
            return p
    return '0.6'


def main():
    urls = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith('.')]
        if 'index.html' not in filenames:
            continue
        rel = os.path.relpath(dirpath, ROOT).replace('\\', '/')
        path = '/' if rel == '.' else '/' + rel + '/'

        src = io.open(os.path.join(dirpath, 'index.html'), encoding='utf-8', errors='ignore').read()
        # A page that tells robots not to index it does not belong in a sitemap.
        if re.search(r'<meta[^>]+name=["\']robots["\'][^>]+noindex', src, re.I):
            continue

        mtime = datetime.date.fromtimestamp(os.path.getmtime(os.path.join(dirpath, 'index.html')))
        urls.append((path, mtime.isoformat()))

    urls.sort(key=lambda u: (u[0].count('/'), u[0]))

    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path, lastmod in urls:
        out.append('  <url><loc>%s%s</loc><lastmod>%s</lastmod><priority>%s</priority></url>'
                   % (SITE, path, lastmod, priority(path)))
    out.append('</urlset>')
    out.append('')

    io.open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8', newline='\n').write('\n'.join(out))
    print('sitemap.xml: %d URLs' % len(urls))
    for path, _ in urls:
        print('  ' + path)


if __name__ == '__main__':
    main()
