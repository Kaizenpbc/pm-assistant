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
declare class AccessibilityService {
    private currentLanguage;
    private supportedLanguages;
    private accessibilityConfig;
    constructor();
    private initializeAccessibility;
    private detectAccessibilityPreferences;
    private setupLanguageAttributes;
    private setupAccessibilityEventListeners;
    private detectScreenReader;
    private detectKeyboardNavigation;
    private handleKeyboardNavigation;
    getCurrentLanguage(): LanguageConfig;
    getSupportedLanguages(): LanguageConfig[];
    setLanguage(languageCode: string): void;
    private announceLanguageChange;
    getAccessibilityConfig(): AccessibilityConfig;
    isAccessibilityFeatureEnabled(feature: keyof AccessibilityConfig): boolean;
    addLanguageAttributes(element: HTMLElement, languageCode?: string): void;
    announce(message: string, priority?: 'polite' | 'assertive'): void;
    setupSkipLinks(): void;
    logAccessibilityInfo(): void;
    validateAccessibility(): {
        isValid: boolean;
        issues: string[];
        recommendations: string[];
    };
}
export declare const accessibilityService: AccessibilityService;
export default accessibilityService;
//# sourceMappingURL=accessibilityService.d.ts.map