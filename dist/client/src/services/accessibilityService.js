"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessibilityService = void 0;
class AccessibilityService {
    currentLanguage = {
        code: 'en-US',
        name: 'English (United States)',
        nativeName: 'English',
        direction: 'ltr',
        region: 'US'
    };
    supportedLanguages = [
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
    accessibilityConfig = {
        reducedMotion: false,
        highContrast: false,
        screenReader: false,
        keyboardNavigation: false
    };
    constructor() {
        this.initializeAccessibility();
    }
    initializeAccessibility() {
        this.detectAccessibilityPreferences();
        this.setupLanguageAttributes();
        this.setupAccessibilityEventListeners();
        this.logAccessibilityInfo();
    }
    detectAccessibilityPreferences() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.accessibilityConfig.reducedMotion = true;
            document.documentElement.style.setProperty('--animation-duration', '0s');
        }
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.accessibilityConfig.highContrast = true;
            document.documentElement.classList.add('high-contrast');
        }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark-mode');
        }
        this.detectScreenReader();
        this.detectKeyboardNavigation();
    }
    setupLanguageAttributes() {
        const htmlElement = document.documentElement;
        htmlElement.setAttribute('lang', this.currentLanguage.code);
        htmlElement.setAttribute('dir', this.currentLanguage.direction);
        htmlElement.classList.add(`lang-${this.currentLanguage.code.split('-')[0]}`);
        htmlElement.classList.add(`region-${this.currentLanguage.region || 'US'}`);
        htmlElement.classList.add(`direction-${this.currentLanguage.direction}`);
    }
    setupAccessibilityEventListeners() {
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.accessibilityConfig.reducedMotion = e.matches;
            if (e.matches) {
                document.documentElement.style.setProperty('--animation-duration', '0s');
            }
            else {
                document.documentElement.style.removeProperty('--animation-duration');
            }
        });
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            this.accessibilityConfig.highContrast = e.matches;
            if (e.matches) {
                document.documentElement.classList.add('high-contrast');
            }
            else {
                document.documentElement.classList.remove('high-contrast');
            }
        });
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.classList.add('dark-mode');
            }
            else {
                document.documentElement.classList.remove('dark-mode');
            }
        });
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    }
    detectScreenReader() {
        const hasScreenReader = ('speechSynthesis' in window ||
            'webkitSpeechSynthesis' in window ||
            navigator.userAgent.includes('NVDA') ||
            navigator.userAgent.includes('JAWS') ||
            navigator.userAgent.includes('VoiceOver'));
        this.accessibilityConfig.screenReader = hasScreenReader;
        if (hasScreenReader) {
            document.documentElement.classList.add('screen-reader-active');
        }
    }
    detectKeyboardNavigation() {
        let keyboardUsed = false;
        const handleKeyDown = (e) => {
            if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') {
                keyboardUsed = true;
                this.accessibilityConfig.keyboardNavigation = true;
                document.documentElement.classList.add('keyboard-navigation');
            }
        };
        const handleMouseDown = () => {
            if (keyboardUsed)
                return;
            this.accessibilityConfig.keyboardNavigation = false;
            document.documentElement.classList.remove('keyboard-navigation');
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleMouseDown);
    }
    handleKeyboardNavigation(e) {
        if (e.key === 'Tab') {
            const focusableElements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            document.documentElement.classList.add('keyboard-focus');
        }
        if (e.key === 'Escape') {
            const openElements = document.querySelectorAll('[aria-expanded="true"]');
            openElements.forEach(element => {
                element.setAttribute('aria-expanded', 'false');
                element.blur();
            });
        }
    }
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
    setLanguage(languageCode) {
        const language = this.supportedLanguages.find(lang => lang.code === languageCode);
        if (language) {
            this.currentLanguage = language;
            this.setupLanguageAttributes();
            this.announceLanguageChange();
        }
    }
    announceLanguageChange() {
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
    getAccessibilityConfig() {
        return this.accessibilityConfig;
    }
    isAccessibilityFeatureEnabled(feature) {
        return this.accessibilityConfig[feature];
    }
    addLanguageAttributes(element, languageCode) {
        const lang = languageCode || this.currentLanguage.code;
        const direction = this.supportedLanguages.find(l => l.code === lang)?.direction || 'ltr';
        element.setAttribute('lang', lang);
        element.setAttribute('dir', direction);
    }
    announce(message, priority = 'polite') {
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
    setupSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link sr-only focus:not-sr-only';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    logAccessibilityInfo() {
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
    validateAccessibility() {
        const issues = [];
        const recommendations = [];
        const htmlLang = document.documentElement.getAttribute('lang');
        if (!htmlLang) {
            issues.push('Missing lang attribute on html element');
        }
        else if (!htmlLang.includes('-')) {
            recommendations.push('Consider using region-specific language code (e.g., en-US instead of en)');
        }
        const htmlDir = document.documentElement.getAttribute('dir');
        if (!htmlDir) {
            recommendations.push('Consider adding dir attribute for text direction');
        }
        const skipLinks = document.querySelectorAll('.skip-link, [href="#main-content"]');
        if (skipLinks.length === 0) {
            recommendations.push('Consider adding skip links for keyboard navigation');
        }
        const images = document.querySelectorAll('img');
        const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
        if (imagesWithoutAlt.length > 0) {
            issues.push(`${imagesWithoutAlt.length} images missing alt text`);
        }
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
exports.accessibilityService = new AccessibilityService();
exports.default = exports.accessibilityService;
//# sourceMappingURL=accessibilityService.js.map