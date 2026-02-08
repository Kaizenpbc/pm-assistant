/**
 * Accessibility Service
 * Handles language attributes, accessibility features, and internationalization
 */

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  region?: string;
}

export interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

class AccessibilityService {
  private currentLanguage: LanguageConfig = {
    code: 'en-US',
    name: 'English (United States)',
    nativeName: 'English',
    direction: 'ltr',
    region: 'US'
  };

  private supportedLanguages: LanguageConfig[] = [
    {
      code: 'en-US',
      name: 'English (United States)',
      nativeName: 'English',
      direction: 'ltr',
      region: 'US'
    },
    {
      code: 'en-GB',
      name: 'English (United Kingdom)',
      nativeName: 'English',
      direction: 'ltr',
      region: 'GB'
    },
    {
      code: 'es-ES',
      name: 'Spanish (Spain)',
      nativeName: 'Español',
      direction: 'ltr',
      region: 'ES'
    },
    {
      code: 'fr-FR',
      name: 'French (France)',
      nativeName: 'Français',
      direction: 'ltr',
      region: 'FR'
    },
    {
      code: 'de-DE',
      name: 'German (Germany)',
      nativeName: 'Deutsch',
      direction: 'ltr',
      region: 'DE'
    },
    {
      code: 'ar-SA',
      name: 'Arabic (Saudi Arabia)',
      nativeName: 'العربية',
      direction: 'rtl',
      region: 'SA'
    },
    {
      code: 'zh-CN',
      name: 'Chinese (Simplified)',
      nativeName: '中文',
      direction: 'ltr',
      region: 'CN'
    },
    {
      code: 'ja-JP',
      name: 'Japanese (Japan)',
      nativeName: '日本語',
      direction: 'ltr',
      region: 'JP'
    }
  ];

  private accessibilityConfig: AccessibilityConfig = {
    reducedMotion: false,
    highContrast: false,
    screenReader: false,
    keyboardNavigation: false
  };

  constructor() {
    this.initializeAccessibility();
  }

  /**
   * Initialize accessibility features
   */
  private initializeAccessibility(): void {
    this.detectAccessibilityPreferences();
    this.setupLanguageAttributes();
    this.setupAccessibilityEventListeners();
    this.logAccessibilityInfo();
  }

  /**
   * Detect user's accessibility preferences
   */
  private detectAccessibilityPreferences(): void {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.accessibilityConfig.reducedMotion = true;
      document.documentElement.style.setProperty('--animation-duration', '0s');
    }

    // Check for high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.accessibilityConfig.highContrast = true;
      document.documentElement.classList.add('high-contrast');
    }

    // Check for dark mode preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark-mode');
    }

    // Detect screen reader usage
    this.detectScreenReader();

    // Detect keyboard navigation
    this.detectKeyboardNavigation();
  }

  /**
   * Setup language attributes on document
   */
  private setupLanguageAttributes(): void {
    const htmlElement = document.documentElement;
    
    // Set comprehensive language attributes
    htmlElement.setAttribute('lang', this.currentLanguage.code);
    htmlElement.setAttribute('dir', this.currentLanguage.direction);
    
    // Add language-specific classes
    htmlElement.classList.add(`lang-${this.currentLanguage.code.split('-')[0]}`);
    htmlElement.classList.add(`region-${this.currentLanguage.region || 'US'}`);
    htmlElement.classList.add(`direction-${this.currentLanguage.direction}`);
  }

  /**
   * Setup accessibility event listeners
   */
  private setupAccessibilityEventListeners(): void {
    // Listen for reduced motion changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.accessibilityConfig.reducedMotion = e.matches;
      if (e.matches) {
        document.documentElement.style.setProperty('--animation-duration', '0s');
      } else {
        document.documentElement.style.removeProperty('--animation-duration');
      }
    });

    // Listen for high contrast changes
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      this.accessibilityConfig.highContrast = e.matches;
      if (e.matches) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    });

    // Listen for dark mode changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    });

    // Listen for keyboard navigation
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
  }

  /**
   * Detect screen reader usage
   */
  private detectScreenReader(): void {
    // Check for screen reader indicators
    const hasScreenReader = (
      'speechSynthesis' in window ||
      'webkitSpeechSynthesis' in window ||
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver')
    );

    this.accessibilityConfig.screenReader = hasScreenReader;
    
    if (hasScreenReader) {
      document.documentElement.classList.add('screen-reader-active');
    }
  }

  /**
   * Detect keyboard navigation
   */
  private detectKeyboardNavigation(): void {
    let keyboardUsed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') {
        keyboardUsed = true;
        this.accessibilityConfig.keyboardNavigation = true;
        document.documentElement.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      if (keyboardUsed) return;
      this.accessibilityConfig.keyboardNavigation = false;
      document.documentElement.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
  }

  /**
   * Handle keyboard navigation events
   */
  private handleKeyboardNavigation(e: KeyboardEvent): void {
    // Skip links for keyboard navigation
    if (e.key === 'Tab') {
      // Add visual focus indicators
      document.documentElement.classList.add('keyboard-focus');
    }

    // Escape key handling
    if (e.key === 'Escape') {
      // Close any open modals or dropdowns
      const openElements = document.querySelectorAll('[aria-expanded="true"]');
      openElements.forEach(element => {
        element.setAttribute('aria-expanded', 'false');
        (element as HTMLElement).blur();
      });
    }
  }

  /**
   * Get current language configuration
   */
  public getCurrentLanguage(): LanguageConfig {
    return this.currentLanguage;
  }

  /**
   * Get supported languages
   */
  public getSupportedLanguages(): LanguageConfig[] {
    return this.supportedLanguages;
  }

  /**
   * Set language
   */
  public setLanguage(languageCode: string): void {
    const language = this.supportedLanguages.find(lang => lang.code === languageCode);
    if (language) {
      this.currentLanguage = language;
      this.setupLanguageAttributes();
      this.announceLanguageChange();
    }
  }

  /**
   * Announce language change to screen readers
   */
  private announceLanguageChange(): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Language changed to ${this.currentLanguage.name}`;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Get accessibility configuration
   */
  public getAccessibilityConfig(): AccessibilityConfig {
    return this.accessibilityConfig;
  }

  /**
   * Check if accessibility feature is enabled
   */
  public isAccessibilityFeatureEnabled(feature: keyof AccessibilityConfig): boolean {
    return this.accessibilityConfig[feature];
  }

  /**
   * Add language attributes to specific elements
   */
  public addLanguageAttributes(element: HTMLElement, languageCode?: string): void {
    const lang = languageCode || this.currentLanguage.code;
    const direction = this.supportedLanguages.find(l => l.code === lang)?.direction || 'ltr';
    
    element.setAttribute('lang', lang);
    element.setAttribute('dir', direction);
  }

  /**
   * Create accessible announcements
   */
  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Setup skip links for keyboard navigation
   */
  public setupSkipLinks(): void {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link sr-only focus:not-sr-only';
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /**
   * Log accessibility information for debugging
   */
  public logAccessibilityInfo(): void {
    console.group('🔍 Accessibility Information');
    console.log('Current Language:', this.currentLanguage);
    console.log('Accessibility Config:', this.accessibilityConfig);
    console.log('Supported Languages:', this.supportedLanguages.length);
    console.log('Reduced Motion:', this.accessibilityConfig.reducedMotion);
    console.log('High Contrast:', this.accessibilityConfig.highContrast);
    console.log('Screen Reader:', this.accessibilityConfig.screenReader);
    console.log('Keyboard Navigation:', this.accessibilityConfig.keyboardNavigation);
    console.groupEnd();
  }

  /**
   * Validate accessibility compliance
   */
  public validateAccessibility(): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for lang attribute
    const htmlLang = document.documentElement.getAttribute('lang');
    if (!htmlLang) {
      issues.push('Missing lang attribute on html element');
    } else if (!htmlLang.includes('-')) {
      recommendations.push('Consider using region-specific language code (e.g., en-US instead of en)');
    }

    // Check for dir attribute
    const htmlDir = document.documentElement.getAttribute('dir');
    if (!htmlDir) {
      recommendations.push('Consider adding dir attribute for text direction');
    }

    // Check for skip links
    const skipLinks = document.querySelectorAll('.skip-link, [href="#main-content"]');
    if (skipLinks.length === 0) {
      recommendations.push('Consider adding skip links for keyboard navigation');
    }

    // Check for alt text on images
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} images missing alt text`);
    }

    // Check for form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    const inputsWithoutLabels = Array.from(inputs).filter(input => {
      const id = input.id;
      const label = document.querySelector(`label[for="${id}"]`);
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      return !label && !ariaLabel && !ariaLabelledBy;
    });
    
    if (inputsWithoutLabels.length > 0) {
      issues.push(`${inputsWithoutLabels.length} form inputs missing labels`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }
}

// Create singleton instance
export const accessibilityService = new AccessibilityService();

// Export for global access
export default accessibilityService;
