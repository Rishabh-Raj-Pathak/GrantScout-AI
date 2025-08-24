#!/usr/bin/env python3
"""
Custom Portia-compatible web scraping tools for grant discovery
Now routes requests through ScraperAPI when SCRAPER_API_KEY is set.
Falls back to direct requests if the key is missing.
"""
import os
import json
import time
import re
from typing import Dict, List, Any
from urllib.parse import urljoin, urlparse, quote_plus

import requests
from bs4 import BeautifulSoup


class CustomBrowserTool:
    """Custom browser tool compatible with Portia framework"""

    name = "custom_browser_tool"
    description = "Navigate to web pages and extract content using requests + BeautifulSoup (ScraperAPI-aware)"

    def __init__(self):
        self.session = requests.Session()
        # Realistic browser headers (helpful even when tunneling via ScraperAPI with keep_headers=true)
        self.session.headers.update({
            'User-Agent': (
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/124.0 Safari/537.36'
            ),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
        })

        # ScraperAPI integration (optional)
        self.scraper_api_key = os.getenv("SCRAPER_API_KEY")
        # ScraperAPI recommends http scheme for simplicity; they handle TLS to the destination.
        self.scraper_endpoint = "http://api.scraperapi.com"
        # Default ScraperAPI params. You can tweak per-domain later if needed.
        self.scraper_default_params = {
            "render": "true",        # JS rendering for modern/JS-heavy portals
            "keep_headers": "true",  # forward our headers downstream
            # Optional geo-targeting example: "country_code": "us",
            # Optional device type example: "device_type": "desktop",
        }

    def _fetch_with_retries(self, url: str, max_retries: int = 3, backoff_sec: float = 1.0):
        """
        Centralized fetch:
          - If SCRAPER_API_KEY is set, route via ScraperAPI
          - Otherwise, use plain requests
          - Retry on typical transient/anti-bot statuses (403/429/5xx)
        """
        last_exc = None
        for attempt in range(1, max_retries + 1):
            try:
                if self.scraper_api_key:
                    params = {
                        "api_key": self.scraper_api_key,
                        "url": url,
                        **self.scraper_default_params,
                    }
                    query = "&".join([f"{k}={quote_plus(str(v))}" for k, v in params.items()])
                    scraper_url = f"{self.scraper_endpoint}?{query}"
                    resp = self.session.get(scraper_url, timeout=30)
                else:
                    resp = self.session.get(url, timeout=20)

                status = resp.status_code
                if status == 200:
                    return resp
                if status in (403, 429, 500, 502, 503, 504):
                    # Retryable; exponential-ish backoff
                    time.sleep(backoff_sec * attempt)
                    continue
                # Non-retryable (404, 410, etc.)
                return resp

            except Exception as e:
                last_exc = e
                time.sleep(backoff_sec * attempt)

        if last_exc:
            raise last_exc
        return None

    def navigate_to_url(self, url: str) -> Dict[str, Any]:
        """Navigate to a URL and return page content"""
        try:
            via = "via ScraperAPI" if self.scraper_api_key else "(direct)"
            print(f"🌐 Navigating to {url} {via}")
            response = self._fetch_with_retries(url)

            if response is None:
                raise RuntimeError("No response received after retries")

            if response.status_code != 200:
                # Surface non-200 to the caller so they can decide fallbacks
                return {
                    'url': url,
                    'title': '',
                    'status_code': response.status_code,
                    'content': '',
                    'links': [],
                    'forms': [],
                    'success': False,
                    'error': f"HTTP {response.status_code}",
                }

            soup = BeautifulSoup(response.text, 'html.parser')

            return {
                'url': url,
                'title': (soup.title.string if soup.title else 'No title'),
                'status_code': response.status_code,
                # allow more content since pages may be fully rendered now
                'content': response.text[:500000],
                'links': self._extract_links(soup, url),
                'forms': self._extract_forms(soup),
                'success': True
            }

        except Exception as e:
            print(f"❌ Navigation failed: {e}")
            return {
                'url': url,
                'error': str(e),
                'success': False
            }

    def _extract_links(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, str]]:
        """Extract links from the page"""
        links = []
        for link in soup.find_all('a', href=True)[:50]:  # a little more generous to help crawl
            href = link['href'] # type: ignore
            full_url = urljoin(base_url, href) # type: ignore
            links.append({
                'text': link.get_text(strip=True)[:100],
                'url': full_url
            })
        return links

    def _extract_forms(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract forms from the page"""
        forms = []
        for form in soup.find_all('form')[:5]:
            form_data = {
                'action': form.get('action', ''), # type: ignore
                'method': form.get('method', 'GET'),
                'inputs': []
            }
            for input_tag in form.find_all(['input', 'select', 'textarea']): # type: ignore
                form_data['inputs'].append({
                    'name': input_tag.get('name', ''), # type: ignore
                    'type': input_tag.get('type', ''),
                    'value': input_tag.get('value', '')
                })
            forms.append(form_data)
        return forms


class CustomCrawlTool:
    """Custom crawl tool for discovering grant-related pages"""

    name = "custom_crawl_tool"
    description = "Crawl websites to discover grant and funding pages"

    def __init__(self):
        self.browser = CustomBrowserTool()
        self.visited_urls = set()

    def crawl_for_grants(self, base_url: str, keywords: List[str], max_pages: int = 5) -> List[Dict[str, Any]]:
        """Crawl a website looking for grant-related pages"""
        found_pages = []
        to_visit = [base_url]

        print(f"🕷️ Crawling {base_url} for grant pages...")

        while to_visit and len(found_pages) < max_pages:
            url = to_visit.pop(0)

            if url in self.visited_urls:
                continue
            self.visited_urls.add(url)

            # Navigate to page
            page_data = self.browser.navigate_to_url(url)
            if not page_data.get('success'):
                # on hard block/non-200, just skip
                time.sleep(0.5)
                continue

            # Check if page is grant-related
            if self._is_grant_related(page_data, keywords):
                found_pages.append(page_data)
                print(f"   ✅ Found grant page: {page_data.get('title', 'No title')}")

            # Add new URLs to visit (same domain & relevant)
            for link in page_data.get('links', [])[:20]:
                link_url = link['url']
                if self._should_visit_link(link_url, link['text'], keywords, base_url):
                    to_visit.append(link_url)

            time.sleep(0.8)  # be polite; reduce risk of blocks

        return found_pages

    def _is_grant_related(self, page_data: Dict[str, Any], keywords: List[str]) -> bool:
        """Check if a page is related to grants/funding"""
        content = page_data.get('content', '').lower()
        title = page_data.get('title', '').lower()

        grant_indicators = [
            'grant', 'funding', 'financial support', 'startup funding',
            'innovation fund', 'research funding', 'sbir', 'sttr',
            'seed funding', 'application deadline', 'eligibility', 'apply now',
            'funding opportunities', 'call for proposals', 'tender', 'scholarship',
        ]

        if any(ind in content or ind in title for ind in grant_indicators):
            return True

        for keyword in keywords:
            kw = keyword.lower()
            if kw in content or kw in title:
                return True

        return False

    def _should_visit_link(self, url: str, link_text: str, keywords: List[str], base_url: str) -> bool:
        """Determine if a link should be visited"""
        base_domain = urlparse(base_url).netloc
        link_domain = urlparse(url).netloc

        if not link_domain or base_domain not in link_domain:
            return False

        grant_terms = ['grant', 'funding', 'finance', 'startup', 'innovation', 'research', 'sbir', 'call', 'opportunit']
        text_lower = (link_text or '').lower()
        url_lower = (url or '').lower()

        if any(term in text_lower or term in url_lower for term in grant_terms):
            return True

        # also allow a few neutral in-site pages to expand crawl lightly
        neutral_terms = ['program', 'apply', 'eligibility', 'how-to', 'fund']
        return any(term in text_lower for term in neutral_terms)


class CustomExtractTool:
    """Custom extraction tool for structured grant data"""

    name = "custom_extract_tool"
    description = "Extract structured grant information from web pages"

    def extract_grant_data(self, page_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract structured grant data from a page"""
        grants = []
        try:
            content = page_data.get('content', '')
            soup = BeautifulSoup(content, 'html.parser')

            # Look for grant listings or individual grant pages
            grants.extend(self._extract_from_listings(soup, page_data['url']))
            grants.extend(self._extract_from_single_grant(soup, page_data['url']))

        except Exception as e:
            print(f"❌ Extraction failed: {e}")

        return grants

    def _extract_from_listings(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Extract grants from listing pages"""
        grants = []
        selectors = [
            '.grant-item', '.funding-opportunity', '.opportunity',
            '.grant-listing', '.fund-item', '[class*="grant"]',
            '.search-result', '.opportunity-item', '.result-item',
            'article', 'li.result'
        ]
        for selector in selectors:
            items = soup.select(selector)
            for item in items[:15]:
                grant = self._extract_grant_from_element(item, url)
                if grant:
                    grants.append(grant)
        return grants

    def _extract_from_single_grant(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Extract grant data from a single grant page"""
        if not self._is_single_grant_page(soup):
            return []

        grant = {
            'title': self._extract_title(soup),
            'amount': self._extract_amount(soup),
            'deadline': self._extract_deadline(soup),
            'eligibility': self._extract_eligibility(soup),
            'description': self._extract_description(soup),
            'apply_link': url,
            'source': urlparse(url).netloc,
            'country': self._extract_country(soup, url),
            'sector': self._extract_sector(soup)
        }
        return [grant] if grant['title'] else []

    def _extract_grant_from_element(self, element, base_url: str) -> Dict[str, Any]:
        """Extract grant data from a single HTML element"""
        try:
            title_elem = element.find(['h1', 'h2', 'h3', 'h4'])
            if not title_elem:
                title_elem = element.select_one('.title, .name, .result-title, .opportunity-title')
            title = title_elem.get_text(strip=True) if title_elem else ''

            link_elem = element.find('a')
            link = urljoin(base_url, link_elem['href']) if link_elem and link_elem.get('href') else base_url

            text = element.get_text(separator=' ', strip=True)

            grant = {
                'title': title,
                'amount': self._extract_amount_from_text(text),
                'deadline': self._extract_deadline_from_text(text),
                'eligibility': self._extract_eligibility_from_text(text),
                'description': (text[:200] + '...') if len(text) > 200 else text,
                'apply_link': link,
                'source': urlparse(base_url).netloc,
                'country': self._extract_country_from_text(text, base_url),
                'sector': self._extract_sector_from_text(text)
            }
            return grant if title else None

        except Exception:
            return None

    def _is_single_grant_page(self, soup: BeautifulSoup) -> bool:
        text = soup.get_text().lower()
        indicators = ['deadline', 'eligibility', 'application', 'funding amount', 'apply now', 'who can apply']
        return sum(1 for indicator in indicators if indicator in text) >= 2

    def _extract_title(self, soup: BeautifulSoup) -> str:
        for selector in ['h1', 'h2', '.title', '.grant-title', '.opportunity-title', '.page-title']:
            elem = soup.select_one(selector)
            if elem:
                return elem.get_text(strip=True)
        return ''

    def _extract_amount(self, soup: BeautifulSoup) -> str:
        return self._extract_amount_from_text(soup.get_text())

    def _extract_amount_from_text(self, text: str) -> str:
        patterns = [
            r'\$[\d,]+(?:\.\d{2})?(?:\s*(?:million|M|thousand|K))?',
            r'€[\d,]+(?:\.\d{2})?(?:\s*(?:million|M|thousand|K))?',
            r'£[\d,]+(?:\.\d{2})?(?:\s*(?:million|M|thousand|K))?',
            r'(?:USD|EUR|GBP|NOK)\s*[\d,]+(?:\.\d{2})?',
            r'[\d,]+\s*(?:USD|EUR|GBP|NOK|dollars?|euros?)',
        ]
        for pattern in patterns:
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                return m.group(0)
        return ''

    def _extract_deadline(self, soup: BeautifulSoup) -> str:
        return self._extract_deadline_from_text(soup.get_text())

    def _extract_deadline_from_text(self, text: str) -> str:
        patterns = [
            r'\b(?:deadline|due|closes?|expires?)[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:deadline|due)',
            r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}',
            r'\d{4}-\d{2}-\d{2}'
        ]
        for pattern in patterns:
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                return m.group(1) if m.groups() else m.group(0)
        return ''

    def _extract_eligibility(self, soup: BeautifulSoup) -> str:
        return self._extract_eligibility_from_text(soup.get_text())

    def _extract_eligibility_from_text(self, text: str) -> str:
        lines = text.split('\n')
        for i, line in enumerate(lines):
            if 'eligib' in line.lower():
                chunk = ' '.join(lines[i:i+3])
                return (chunk[:200] + '...') if len(chunk) > 200 else chunk
        return ''

    def _extract_description(self, soup: BeautifulSoup) -> str:
        for selector in ['.description', '.summary', '.overview', '.about', '.content', '.article-body']:
            elem = soup.select_one(selector)
            if elem:
                t = elem.get_text(strip=True)
                return (t[:300] + '...') if len(t) > 300 else t
        p = soup.find('p')
        if p:
            t = p.get_text(strip=True)
            return (t[:300] + '...') if len(t) > 300 else t
        return ''

    def _extract_country(self, soup: BeautifulSoup, url: str) -> str:
        return self._extract_country_from_text(soup.get_text(), url)

    def _extract_country_from_text(self, text: str, url: str) -> str:
        domain = urlparse(url).netloc.lower()
        country_domains = {
            '.no': 'Norway',
            '.uk': 'United Kingdom',
            '.ca': 'Canada',
            '.au': 'Australia',
            '.de': 'Germany',
            '.fr': 'France',
            'grants.gov': 'United States',
            'sbir.gov': 'United States',
            'innovasjonnorge': 'Norway',
            'ec.europa.eu': 'European Union'
        }
        for hint, country in country_domains.items():
            if hint in domain:
                return country

        candidates = ['United States', 'USA', 'Norway', 'European Union', 'EU', 'United Kingdom', 'UK', 'Canada', 'India']
        lower = text.lower()
        for c in candidates:
            if c.lower() in lower:
                return c
        return 'Global'

    def _extract_sector(self, soup: BeautifulSoup) -> str:
        return self._extract_sector_from_text(soup.get_text().lower())

    def _extract_sector_from_text(self, text: str) -> str:
        sectors = {
            'technology': ['tech', 'software', 'ai', 'digital', 'innovation', 'data'],
            'healthcare': ['health', 'medical', 'pharma', 'biotech', 'clinical'],
            'energy': ['energy', 'renewable', 'clean tech', 'sustainability', 'green'],
            'research': ['research', 'science', 'academic', 'lab'],
            'manufacturing': ['manufacturing', 'industrial', 'hardware'],
            'agriculture': ['agriculture', 'farming', 'food', 'agri'],
            'education': ['education', 'edtech', 'learning'],
            'fintech': ['fintech', 'financial', 'banking', 'payments'],
        }
        for sector, kws in sectors.items():
            if any(k in text for k in kws):
                return sector.title()
        return 'General'


# Create instances that can be used by Portia
custom_browser_tool = CustomBrowserTool()
custom_crawl_tool = CustomCrawlTool()
custom_extract_tool = CustomExtractTool()
