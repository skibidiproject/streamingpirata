import requests
from bs4 import BeautifulSoup
import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import logging

# Configurazione logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IframeExtractor:
    """Estrae URL src da iframe presenti in pagine web."""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
    
    def extract_with_requests(self, url: str, domain_filter: str = None) -> list:
        """
        Estrae iframe src usando requests + BeautifulSoup (più veloce).
        
        Args:
            url: URL della pagina da analizzare
            domain_filter: Filtra solo iframe con domini specifici (es. 'vixcloud.co')
            
        Returns:
            Lista di dizionari con informazioni sugli iframe
        """
        try:
            logger.info(f"Estrazione iframe da: {url}")
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            iframes = soup.find_all('iframe')
            
            results = []
            for i, iframe in enumerate(iframes):
                src = iframe.get('src') or iframe.get('data-src')
                if src:
                    # Decodifica HTML entities se presenti
                    src = src.replace('&amp;', '&')
                    
                    # Filtra per dominio se specificato
                    if domain_filter and domain_filter not in src:
                        continue
                    
                    iframe_info = {
                        'index': i,
                        'src': src,
                        'id': iframe.get('id'),
                        'class': iframe.get('class'),
                        'width': iframe.get('width'),
                        'height': iframe.get('height'),
                        'allow': iframe.get('allow'),
                        'other_attributes': {k: v for k, v in iframe.attrs.items() 
                                           if k not in ['src', 'id', 'class', 'width', 'height', 'allow']}
                    }
                    results.append(iframe_info)
            
            logger.info(f"Trovati {len(results)} iframe")
            return results
            
        except Exception as e:
            logger.error(f"Errore durante estrazione: {e}")
            return []
    
    def extract_with_selenium(self, url: str, domain_filter: str = None, wait_time: int = 5) -> list:
        """
        Estrae iframe src usando Selenium (per pagine dinamiche).
        
        Args:
            url: URL della pagina da analizzare
            domain_filter: Filtra solo iframe con domini specifici
            wait_time: Tempo di attesa per il caricamento della pagina
            
        Returns:
            Lista di dizionari con informazioni sugli iframe
        """
        driver = None
        try:
            logger.info(f"Estrazione iframe con Selenium da: {url}")
            
            # Configurazione Chrome
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--disable-extensions")
            
            driver = webdriver.Chrome(options=chrome_options)
            driver.set_page_load_timeout(30)
            
            # Carica la pagina
            driver.get(url)
            
            # Attende che la pagina si carichi
            time.sleep(wait_time)
            
            # Attende che almeno un iframe sia presente
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "iframe"))
                )
            except:
                logger.warning("Nessun iframe trovato nella pagina")
            
            # Trova tutti gli iframe
            iframes = driver.find_elements(By.TAG_NAME, "iframe")
            
            results = []
            for i, iframe in enumerate(iframes):
                try:
                    src = iframe.get_attribute('src') or iframe.get_attribute('data-src')
                    if src:
                        # Decodifica HTML entities se presenti
                        src = src.replace('&amp;', '&')
                        
                        # Filtra per dominio se specificato
                        if domain_filter and domain_filter not in src:
                            continue
                        
                        iframe_info = {
                            'index': i,
                            'src': src,
                            'id': iframe.get_attribute('id'),
                            'class': iframe.get_attribute('class'),
                            'width': iframe.get_attribute('width'),
                            'height': iframe.get_attribute('height'),
                            'allow': iframe.get_attribute('allow'),
                            'is_displayed': iframe.is_displayed(),
                            'location': iframe.location,
                            'size': iframe.size
                        }
                        results.append(iframe_info)
                        
                except Exception as e:
                    logger.warning(f"Errore elaborando iframe {i}: {e}")
                    continue
            
            logger.info(f"Trovati {len(results)} iframe con Selenium")
            return results
            
        except Exception as e:
            logger.error(f"Errore durante estrazione con Selenium: {e}")
            return []
        finally:
            if driver:
                driver.quit()
    
    def extract_with_regex(self, url: str, domain_filter: str = None) -> list:
        """
        Estrae iframe src usando regex (alternativa veloce).
        
        Args:
            url: URL della pagina da analizzare
            domain_filter: Filtra solo iframe con domini specifici
            
        Returns:
            Lista di URL src trovati
        """
        try:
            logger.info(f"Estrazione iframe con regex da: {url}")
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            html = response.text
            
            # Pattern regex per iframe
            iframe_pattern = r'<iframe[^>]*?src=["\']([^"\']+)["\'][^>]*?>'
            matches = re.findall(iframe_pattern, html, re.IGNORECASE | re.DOTALL)
            
            results = []
            for src in matches:
                # Decodifica HTML entities
                src = src.replace('&amp;', '&')
                
                # Filtra per dominio se specificato
                if domain_filter and domain_filter not in src:
                    continue
                
                results.append(src)
            
            logger.info(f"Trovati {len(results)} iframe con regex")
            return results
            
        except Exception as e:
            logger.error(f"Errore durante estrazione con regex: {e}")
            return []
    
    def extract_vixcloud_urls(self, url: str) -> list:
        """
        Estrae specificamente URL di vixcloud.co da una pagina.
        
        Args:
            url: URL della pagina da analizzare
            
        Returns:
            Lista di URL vixcloud trovati
        """
        # Prova prima con requests (più veloce)
        results = self.extract_with_requests(url, domain_filter='vixcloud.co')
        
        # Se non trova nulla, prova con Selenium
        if not results:
            logger.info("Nessun iframe trovato con requests, provo con Selenium...")
            results = self.extract_with_selenium(url, domain_filter='vixcloud.co')
        
        # Estrae solo gli URL src
        vixcloud_urls = []
        for result in results:
            if isinstance(result, dict) and 'src' in result:
                vixcloud_urls.append(result['src'])
            elif isinstance(result, str):
                vixcloud_urls.append(result)
        
        return vixcloud_urls

# Esempio di utilizzo
if __name__ == "__main__":
    extractor = IframeExtractor()
    
    # URL di esempio (sostituisci con il tuo)
    test_url = "https://www.animeunity.so/anime/2791-jujutsu-kaisen"
    
    print("=== Estrazione con requests + BeautifulSoup ===")
    iframes_bs = extractor.extract_with_requests(test_url)
    for iframe in iframes_bs:
        print(f"ID: {iframe['id']}")
        print(f"SRC: {iframe['src']}")
        print(f"Dimensioni: {iframe['width']}x{iframe['height']}")
        print("-" * 50)
    
    print("\n=== Estrazione con Selenium ===")
    iframes_selenium = extractor.extract_with_selenium(test_url)
    for iframe in iframes_selenium:
        print(f"ID: {iframe['id']}")
        print(f"SRC: {iframe['src']}")
        print(f"Visibile: {iframe['is_displayed']}")
        print("-" * 50)
    
    print("\n=== Estrazione solo vixcloud ===")
    vixcloud_urls = extractor.extract_vixcloud_urls(test_url)
    for url in vixcloud_urls:
        print(f"Vixcloud URL: {url}")