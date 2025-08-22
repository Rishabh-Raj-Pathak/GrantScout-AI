#!/usr/bin/env python3
"""
Custom Portia-compatible web scraping tools for grant discovery
Uses requests + BeautifulSoup for reliable web scraping
"""
import json
import requests
from bs4 import BeautifulSoup
import time
from typing import Dict, List, Any
from urllib.parse import urljoin, urlparse
import re


class CustomBrowserTool:
    """Custom browser tool compatible with Portia framework"""
    
    name = "custom_browser_tool"
    description = "Navigate to web pages and extract content using requests + BeautifulSoup"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
    
    def navigate_to_url(self, url: str) -> Dict[str, Any]:
        """Navigate to a URL and return page content"""
        try:
            print(f"🌐 Navigating to {url}")
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract key page information
            return {
                'url': url,
                'title': soup.title.string if soup.title else 'No title',
                'status_code': response.status_code,
                'content': response.text[:5000],  # First 5000 chars
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
        for link in soup.find_all('a', href=True)[:20]:  # Limit to 20 links
            href = link['href']
            full_url = urljoin(base_url, href)
            links.append({
                'text': link.get_text(strip=True)[:100],
                'url': full_url
            })
        return links
    
    def _extract_forms(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract forms from the page"""
        forms = []
        for form in soup.find_all('form')[:5]:  # Limit to 5 forms
            form_data = {
                'action': form.get('action', ''),
                'method': form.get('method', 'GET'),
                'inputs': []
            }
            
            for input_tag in form.find_all(['input', 'select', 'textarea']):
                form_data['inputs'].append({
                    'name': input_tag.get('name', ''),
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
                continue
            
            # Check if page is grant-related
            if self._is_grant_related(page_data, keywords):
                found_pages.append(page_data)
                print(f"   ✅ Found grant page: {page_data.get('title', 'No title')}")
            
            # Add new URLs to visit
            for link in page_data.get('links', [])[:10]:  # Limit links to explore
                link_url = link['url']
                if self._should_visit_link(link_url, link['text'], keywords, base_url):
                    to_visit.append(link_url)
            
            time.sleep(0.5)  # Be respectful
        
        return found_pages
    
    def _is_grant_related(self, page_data: Dict[str, Any], keywords: List[str]) -> bool:
        """Check if a page is related to grants/funding"""
        content = page_data.get('content', '').lower()
        title = page_data.get('title', '').lower()
        
        grant_indicators = [
            'grant', 'funding', 'financial support', 'startup funding',
            'innovation fund', 'research funding', 'sbir', 'sttr',
            'seed funding', 'venture capital', 'investment',
            'application deadline', 'eligibility', 'apply now'
        ]
        
        # Check if any grant indicators appear in content or title
        for indicator in grant_indicators:
            if indicator in content or indicator in title:
                return True
        
        # Check for user-provided keywords
        for keyword in keywords:
            if keyword.lower() in content or keyword.lower() in title:
                return True
        
        return False
    
    def _should_visit_link(self, url: str, link_text: str, keywords: List[str], base_url: str) -> bool:
        """Determine if a link should be visited"""
        # Only visit links from the same domain
        base_domain = urlparse(base_url).netloc
        link_domain = urlparse(url).netloc
        
        if base_domain not in link_domain:
            return False
        
        # Check for grant-related terms in link text or URL
        grant_terms = ['grant', 'funding', 'finance', 'startup', 'innovation', 'research', 'sbir']
        text_lower = link_text.lower()
        url_lower = url.lower()
        
        for term in grant_terms:
            if term in text_lower or term in url_lower:
                return True
        
        return False


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
        
        # Common selectors for grant listings
        selectors = [
            '.grant-item', '.funding-opportunity', '.opportunity',
            '.grant-listing', '.fund-item', '[class*="grant"]',
            '.search-result', '.opportunity-item'
        ]
        
        for selector in selectors:
            items = soup.select(selector)
            for item in items[:10]:  # Limit to 10 items
                grant = self._extract_grant_from_element(item, url)
                if grant:
                    grants.append(grant)
        
        return grants
    
    def _extract_from_single_grant(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Extract grant data from a single grant page"""
        # Check if this looks like a single grant page
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
        
        # Only return if we have at least a title
        if grant['title']:
            return [grant]
        
        return []
    
    def _extract_grant_from_element(self, element, base_url: str) -> Dict[str, Any]:
        """Extract grant data from a single HTML element"""
        try:
            # Extract title
            title_elem = element.find(['h1', 'h2', 'h3', 'h4', '.title', '.name'])
            title = title_elem.get_text(strip=True) if title_elem else ''
            
            # Extract link
            link_elem = element.find('a')
            link = urljoin(base_url, link_elem['href']) if link_elem and link_elem.get('href') else base_url
            
            # Extract other information
            text = element.get_text()
            
            grant = {
                'title': title,
                'amount': self._extract_amount_from_text(text),
                'deadline': self._extract_deadline_from_text(text),
                'eligibility': self._extract_eligibility_from_text(text),
                'description': text[:200] + '...' if len(text) > 200 else text,
                'apply_link': link,
                'source': urlparse(base_url).netloc,
                'country': self._extract_country_from_text(text, base_url),
                'sector': self._extract_sector_from_text(text)
            }
            
            return grant if title else None
            
        except Exception:
            return None
    
    def _is_single_grant_page(self, soup: BeautifulSoup) -> bool:
        """Check if this appears to be a single grant page"""
        text = soup.get_text().lower()
        indicators = ['deadline', 'eligibility', 'application', 'funding amount', 'apply now']
        return sum(1 for indicator in indicators if indicator in text) >= 2
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract grant title"""
        selectors = ['h1', 'h2', '.title', '.grant-title', '.opportunity-title']
        for selector in selectors:
            elem = soup.select_one(selector)
            if elem:
                return elem.get_text(strip=True)
        return ''
    
    def _extract_amount(self, soup: BeautifulSoup) -> str:
        """Extract funding amount"""
        text = soup.get_text()
        return self._extract_amount_from_text(text)
    
    def _extract_amount_from_text(self, text: str) -> str:
        """Extract amount from text using regex"""
        patterns = [
            r'\$[\d,]+(?:\.\d{2})?(?:\s*(?:million|M|thousand|K))?',
            r'€[\d,]+(?:\.\d{2})?(?:\s*(?:million|M|thousand|K))?',
            r'£[\d,]+(?:\.\d{2})?(?:\s*(?:million|M|thousand|K))?',
            r'NOK\s*[\d,]+(?:\.\d{2})?(?:\s*(?:million|M|thousand|K))?',
            r'[\d,]+\s*(?:USD|EUR|GBP|NOK|dollars?|euros?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        
        return ''
    
    def _extract_deadline(self, soup: BeautifulSoup) -> str:
        """Extract application deadline"""
        text = soup.get_text()
        return self._extract_deadline_from_text(text)
    
    def _extract_deadline_from_text(self, text: str) -> str:
        """Extract deadline from text"""
        patterns = [
            r'\b(?:deadline|due|closes?|expires?)[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:deadline|due)',
            r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}',
            r'\d{4}-\d{2}-\d{2}'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1) if len(match.groups()) > 0 else match.group(0)
        
        return ''
    
    def _extract_eligibility(self, soup: BeautifulSoup) -> str:
        """Extract eligibility information"""
        text = soup.get_text()
        return self._extract_eligibility_from_text(text)
    
    def _extract_eligibility_from_text(self, text: str) -> str:
        """Extract eligibility from text"""
        eligibility_section = ''
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            if 'eligib' in line.lower():
                # Take this line and next few lines
                eligibility_section = ' '.join(lines[i:i+3])
                break
        
        return eligibility_section[:200] + '...' if len(eligibility_section) > 200 else eligibility_section
    
    def _extract_description(self, soup: BeautifulSoup) -> str:
        """Extract grant description"""
        # Look for description sections
        desc_selectors = ['.description', '.summary', '.overview', '.about']
        
        for selector in desc_selectors:
            elem = soup.select_one(selector)
            if elem:
                text = elem.get_text(strip=True)
                return text[:300] + '...' if len(text) > 300 else text
        
        # Fallback to first paragraph
        p_elem = soup.find('p')
        if p_elem:
            text = p_elem.get_text(strip=True)
            return text[:300] + '...' if len(text) > 300 else text
        
        return ''
    
    def _extract_country(self, soup: BeautifulSoup, url: str) -> str:
        """Extract country information"""
        text = soup.get_text()
        return self._extract_country_from_text(text, url)
    
    def _extract_country_from_text(self, text: str, url: str) -> str:
        """Extract country from text or URL"""
        # Check URL domain for country hints
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
        
        for domain_hint, country in country_domains.items():
            if domain_hint in domain:
                return country
        
        # Check text for country mentions
        countries = ['United States', 'USA', 'Norway', 'European Union', 'EU', 'United Kingdom', 'UK', 'Canada']
        text_lower = text.lower()
        
        for country in countries:
            if country.lower() in text_lower:
                return country
        
        return 'Global'
    
    def _extract_sector(self, soup: BeautifulSoup) -> str:
        """Extract sector/industry information"""
        text = soup.get_text().lower()
        return self._extract_sector_from_text(text)
    
    def _extract_sector_from_text(self, text: str) -> str:
        """Extract sector from text"""
        sectors = {
            'technology': ['tech', 'software', 'ai', 'digital', 'innovation'],
            'healthcare': ['health', 'medical', 'pharma', 'biotech'],
            'energy': ['energy', 'renewable', 'clean tech', 'sustainability'],
            'research': ['research', 'science', 'academic'],
            'manufacturing': ['manufacturing', 'industrial'],
            'agriculture': ['agriculture', 'farming', 'food']
        }
        
        text_lower = text.lower()
        
        for sector, keywords in sectors.items():
            if any(keyword in text_lower for keyword in keywords):
                return sector.title()
        
        return 'General'


# Create instances that can be used by Portia
custom_browser_tool = CustomBrowserTool()
custom_crawl_tool = CustomCrawlTool()
custom_extract_tool = CustomExtractTool()
