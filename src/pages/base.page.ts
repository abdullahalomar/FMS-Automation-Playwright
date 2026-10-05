import { Page, expect } from '@playwright/test';

/**
 * BasePage class providing common reusable page actions and utility methods.
 * All Page Object Model classes inherit from BasePage.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    // Automatically close any popup tabs or new windows opened by HubSpot or third-party links
    this.page.context().on('page', (popup) => {
      console.log('Automatically closing popup page/tab:', popup.url());
      popup.close().catch(() => {});
    });
  }

  /**
   * Navigate to a specific relative or absolute path
   */
  async navigateTo(path: string = ''): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  async getUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for URL to match a specific string or pattern
   */
  async waitForUrl(urlOrRegExp: string | RegExp, timeout: number = 15000): Promise<void> {
    await this.page.waitForURL(urlOrRegExp, { timeout });
  }

  /**
   * Wait for page DOM network idle
   */
  async waitForLoadState(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Hide floating chat bar ("Ask me anything...", HubSpot chat iframe #hubspot-conversations-iframe) by setting display: none !important
   */
  async hideChatWidget(): Promise<void> {
    // 1. Inject CSS style tag to hide HubSpot chat iframe and containers unconditionally
    await this.page.addStyleTag({
      content: `
        #hubspot-conversations-iframe,
        #hubspot-messages-iframe-container,
        iframe[id*="hubspot"],
        iframe[src*="hubspot"],
        iframe[title*="Chat"],
        [region="Chat Widget"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          width: 0px !important;
          height: 0px !important;
        }
      `
    }).catch(() => {});

    // 2. Direct DOM manipulation fallback for #hubspot-conversations-iframe and related elements
    await this.page.evaluate(() => {
      // Override window.open for hubspot / external site popups
      try {
        const origOpen = window.open;
        window.open = function(url, target, features) {
          if (typeof url === 'string' && (url.includes('hubspot') || url.includes('hs-sites'))) {
            console.log('Blocked HubSpot popup window:', url);
            return null;
          }
          return origOpen.call(window, url, target, features);
        };
      } catch (e) {}

      const targetIds = [
        'hubspot-conversations-iframe',
        'hubspot-messages-iframe-container',
        'hubspot-conversations-container'
      ];

      targetIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
        }
      });

      // Hide all chat region & iframe matches
      const chatRegions = document.querySelectorAll('#hubspot-conversations-iframe, [region="Chat Widget"], iframe[title*="Chat"], iframe[src*="chat"], iframe[src*="hubspot"]');
      chatRegions.forEach((el) => {
        (el as HTMLElement).style.setProperty('display', 'none', 'important');
        (el as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
      });

      // Hide floating input / bar containing "Ask me anything"
      const allElements = document.querySelectorAll('input, textarea, button, p, span, div');
      allElements.forEach((el) => {
        const placeholder = el.getAttribute('placeholder') || '';
        const text = el.textContent || '';
        if (placeholder.toLowerCase().includes('ask me anything') || (text.toLowerCase().includes('ask me anything') && el.children.length === 0)) {
          let target: HTMLElement | null = el as HTMLElement;
          while (target && target.parentElement && target.parentElement !== document.body && target.parentElement !== document.documentElement) {
            const style = window.getComputedStyle(target);
            if (style.position === 'fixed' || style.position === 'sticky') {
              target.style.setProperty('display', 'none', 'important');
              return;
            }
            target = target.parentElement;
          }
          if (el.parentElement) {
            el.parentElement.style.setProperty('display', 'none', 'important');
          }
        }
      });
    }).catch(() => {});
  }
}
