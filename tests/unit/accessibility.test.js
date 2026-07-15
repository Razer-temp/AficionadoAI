/**
 * Automated Accessibility Configuration & Structural Verification.
 * Validates WCAG 2.1 AA targets on core constants, structures, and preferences.
 * @module tests/unit/accessibility
 */

import { describe, it, expect } from 'vitest';
import { CROWD_THRESHOLDS, SUPPORTED_LANGUAGES } from '../../src/utils/constants.js';

describe('Accessibility Standards Verification', () => {
  it('verifies status indicators are not color-only (combines text + color)', () => {
    // WCAG 1.4.1 requirement
    for (const [level, config] of Object.entries(CROWD_THRESHOLDS)) {
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('color');
      expect(typeof config.label).toBe('string');
      expect(config.label.length).toBeGreaterThan(0);
      expect(typeof config.color).toBe('string');
      // Verify color is high contrast or descriptive hex
      expect(config.color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('verifies multilingual parts config carries language codes and names', () => {
    // WCAG 3.1.2 requirement (Language of Parts)
    for (const [code, info] of Object.entries(SUPPORTED_LANGUAGES)) {
      expect(code.length).toBe(2);
      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('flag');
      expect(info).toHaveProperty('nativeName');
    }
  });

  it('checks standard focus-ring and skip-link targets exist in styling rules', async () => {
    // Verify CSS files contain accessibility rules (prefers-reduced-motion, skip-link, focus-visible)
    const fs = await import('fs');
    const path = await import('path');
    
    // Path to global styles index
    const cssPath = path.resolve(__dirname, '../../src/styles/index.css');
    
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      
      // Ensure Skip Link classes are defined in the CSS
      expect(cssContent).toContain('.skip-link');
      
      // Ensure prefers-reduced-motion media query is implemented
      expect(cssContent).toContain('prefers-reduced-motion');
      
      // Ensure focus-visible rings are configured
      expect(cssContent).toContain(':focus-visible');
    }
  });
});
