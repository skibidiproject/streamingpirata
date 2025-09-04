import json
import re
import aiohttp
import asyncio
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup, SoupStrainer
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

NGINX_PROXY_BASE = "http://localhost:8080/proxy/?url="

async def make_request(url, headers=None):
    """Simple HTTP request."""
    if headers is None:
        headers = {}
    
    if 'User-Agent' not in headers:
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as response:
            return await response.text()

def resolve_url(url, base_url):
    """Convert relative URL to absolute."""
    if url.startswith('http'):
        return url
    elif url.startswith('/'):
        parsed = urlparse(base_url)
        return f"{parsed.scheme}://{parsed.netloc}{url}"
    else:
        return urljoin(base_url, url)

def rewrite_manifest(manifest_content, base_url):
    """Rewrite manifest URLs to use nginx proxy."""
    lines = manifest_content.split('\n')
    modified_lines = []
    
    for line in lines:
        line = line.strip()
        
        if line.startswith('#EXT-X-KEY:'):
            # Rewrite encryption key URLs
            uri_match = re.search(r'URI=(["\']?)([^",\s]+)\1', line)
            if uri_match:
                original_uri = uri_match.group(2)
                full_uri = resolve_url(original_uri, base_url)
                proxied_uri = f"{NGINX_PROXY_BASE}{full_uri}"
                new_attr = f'URI="{proxied_uri}"'
                line = line.replace(uri_match.group(0), new_attr)
            modified_lines.append(line)
            
        elif line.startswith('#EXT-X-MEDIA'):
            # Rewrite media URLs (audio/subtitles)
            uri_match = re.search(r'URI=(["\']?)([^",\s]+)\1', line)
            if uri_match:
                original_uri = uri_match.group(2)
                full_uri = resolve_url(original_uri, base_url)
                proxied_uri = f"{NGINX_PROXY_BASE}{full_uri}"
                new_attr = f'URI="{proxied_uri}"'
                line = line.replace(uri_match.group(0), new_attr)
            modified_lines.append(line)
            
        elif line and not line.startswith('#'):
            # Rewrite segment/playlist URLs
            full_url = resolve_url(line, base_url)
            proxied_url = f"{NGINX_PROXY_BASE}{full_url}"
            modified_lines.append(proxied_url)
            
        else:
            # Keep comments and empty lines as-is
            modified_lines.append(line)
    
    return '\n'.join(modified_lines)

async def extract_vixcloud_manifest(url):
    """Extract manifest URL from VixCloud page."""
    
    # Handle iframe URLs
    if "iframe" in url:
        site_url = url.split("/iframe")[0]
        
        # Get version
        response = await make_request(f"{site_url}/request-a-title", {
            "Referer": f"{site_url}/",
            "Origin": f"{site_url}",
        })
        
        soup = BeautifulSoup(response, "lxml", parse_only=SoupStrainer("div", {"id": "app"}))
        data = json.loads(soup.find("div", {"id": "app"}).get("data-page"))
        version = data["version"]
        
        # Get iframe content
        response = await make_request(url, {"x-inertia": "true", "x-inertia-version": version})
        soup = BeautifulSoup(response, "lxml", parse_only=SoupStrainer("iframe"))
        iframe = soup.find("iframe").get("src")
        response = await make_request(iframe, {"x-inertia": "true", "x-inertia-version": version})
    
    elif "movie" in url or "tv" in url:
        response = await make_request(url)
    
    # Extract manifest URL from script
    soup = BeautifulSoup(response, "lxml", parse_only=SoupStrainer("body"))
    script = soup.find("body").find("script").text
    
    token = re.search(r"'token':\s*'(\w+)'", script).group(1)
    expires = re.search(r"'expires':\s*'(\d+)'", script).group(1)
    server_url = re.search(r"url:\s*'([^']+)'", script).group(1)
    
    # Build manifest URL
    if "?b=1" in server_url:
        manifest_url = f'{server_url}&token={token}&expires={expires}'
    else:
        manifest_url = f"{server_url}?token={token}&expires={expires}"
    
    # Add quality parameter if available
    if "window.canPlayFHD = true" in script:
        manifest_url += "&h=1"
    
    return manifest_url

@app.route('/api/v1/vixcloud/manifest', methods=['GET'])
def get_manifest():
    """Extract VixCloud manifest and rewrite URLs."""
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "Missing URL parameter"}), 400
    
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Get manifest URL
        manifest_url = loop.run_until_complete(extract_vixcloud_manifest(url))
        
        # Download manifest content
        manifest_content = loop.run_until_complete(make_request(manifest_url, {"referer": url}))
        
        # Rewrite URLs for nginx proxy
        rewritten_manifest = rewrite_manifest(manifest_content, manifest_url)
        
        loop.close()
        
        return rewritten_manifest, 200, {'Content-Type': 'application/vnd.apple.mpegurl'}
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)