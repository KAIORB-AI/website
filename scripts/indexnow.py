"""Tell IndexNow about the URLs in sitemap.xml.

IndexNow is a push protocol: instead of waiting to be crawled, the site
notifies participating engines that pages changed. Bing, Yandex, Seznam and
Naver consume it. Google does not.

It needs no account. Ownership is proved by hosting a file at

    https://kaiorb.com/<key>.txt

whose only content is the key. That file MUST be live before submitting, or
the whole batch is rejected with 403 — so deploy before running this.

Run:  python scripts/indexnow.py            # submit every sitemap URL
      python scripts/indexnow.py --dry-run  # show what would be sent
      python scripts/indexnow.py /blog/ /utility/pdf-size-reducer/
"""
import io, json, os, re, ssl, sys, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://kaiorb.com'
HOST = 'kaiorb.com'
KEY = '8ff9c57d8bf96d4341988328a4d43394'
ENDPOINT = 'https://api.indexnow.org/indexnow'
UA = 'kaiorb-indexnow/1.0 (+https://kaiorb.com/)'

# IndexNow caps a batch at 10,000 URLs. Nowhere near that here, but a silent
# truncation would look like a successful submission of everything.
MAX_BATCH = 10000


def sitemap_urls():
    p = os.path.join(ROOT, 'sitemap.xml')
    if not os.path.exists(p):
        sys.exit('sitemap.xml is missing - run scripts/build-sitemap.py first')
    return re.findall(r'<loc>(.*?)</loc>', io.open(p, encoding='utf-8').read())


def key_is_live(ctx):
    """Refuse to submit if the key file is not reachable.

    Submitting against a missing key returns 403 for the whole batch and is
    easy to misread as 'IndexNow rejected the site'.
    """
    url = '%s/%s.txt' % (SITE, KEY)
    # Cloudflare 403s urllib's default User-Agent, so an unset one reports the
    # key as missing when it is served perfectly well to anything else.
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        body = urllib.request.urlopen(req, timeout=20, context=ctx).read().decode().strip()
    except Exception as e:
        return False, '%s is not reachable (%s)' % (url, e)
    if body != KEY:
        return False, '%s served %r, expected the key' % (url, body[:40])
    return True, url


def main():
    args = [a for a in sys.argv[1:] if a != '--dry-run']
    dry = '--dry-run' in sys.argv

    urls = ['%s%s' % (SITE, a) if a.startswith('/') else a for a in args] or sitemap_urls()
    if len(urls) > MAX_BATCH:
        sys.exit('%d URLs exceeds the %d-per-batch limit' % (len(urls), MAX_BATCH))

    # Refuse off-domain URLs here rather than letting IndexNow reject the batch
    # with "not related to your verified domain", which reads like a
    # verification problem. It usually is not: Git Bash rewrites a leading-slash
    # argument into a Windows path, so `/utilities/` arrives as
    # C:/Program Files/Git/utilities/ and the whole batch fails.
    stray = [u for u in urls if not u.startswith(SITE + '/')]
    if stray:
        sys.exit('these are not %s URLs:\n  %s\n'
                 'If you passed paths from Git Bash, its path translation rewrote them '
                 '— run this from PowerShell, or pass full https:// URLs.'
                 % (SITE, '\n  '.join(stray[:5])))

    ctx = ssl.create_default_context()
    live, detail = key_is_live(ctx)
    if not live:
        sys.exit('key file check failed: %s' % detail)
    print('key file verified at %s' % detail)

    payload = {
        'host': HOST,
        'key': KEY,
        'keyLocation': '%s/%s.txt' % (SITE, KEY),
        'urlList': urls,
    }
    print('submitting %d URL(s) to %s' % (len(urls), ENDPOINT))
    if dry:
        print(json.dumps(payload, indent=1))
        return 0

    req = urllib.request.Request(
        ENDPOINT, data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json; charset=utf-8', 'User-Agent': UA},
        method='POST')
    try:
        r = urllib.request.urlopen(req, timeout=30, context=ctx)
        code, body = r.getcode(), r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        code, body = e.code, e.read().decode('utf-8', 'replace')

    # 200 accepted, 202 accepted but key still being validated. Everything
    # else is a real rejection and worth a non-zero exit.
    print('HTTP %s %s' % (code, body.strip()[:300] or '(empty body - normal for IndexNow)'))
    if code in (200, 202):
        print('accepted')
        return 0
    print('NOT accepted')
    return 1


if __name__ == '__main__':
    sys.exit(main())
