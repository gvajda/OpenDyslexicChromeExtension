/**
 * OpenDyslexic Chrome Extension - Content Script
 * Manages font application
 */

(async function() {
  'use strict';

  const { storage } = chrome;
  let isEnabled = false;
  let settings = {
    defaultState: 'off',
    applyToLi: false,
    applyToBlockquote: false,
    siteRules: {},
    currentSites: {}
  };

  /**
   * Get the current site hostname
   */
  function getCurrentSite() {
    return window.location.hostname;
  }

  /**
   * Load settings from chrome.storage.sync
   */
  async function loadSettings() {
    try {
      const result = await storage.sync.get({
        defaultState: 'off',
        applyToLi: false,
        applyToBlockquote: false,
        siteRules: {},
        currentSites: {}
      });
      settings = result;
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * Determine if extension should be active on current site
   */
  function shouldBeEnabled() {
    const site = getCurrentSite();
    const siteRule = settings.siteRules[site];

    // Check if site is disabled
    if (siteRule?.enabled === false) {
      return false;
    }

    // Check if site has forced state
    if (siteRule?.forceState) {
      return siteRule.forceState === 'on';
    }

    // Check per-site runtime state
    if (settings.currentSites[site] !== undefined) {
      return settings.currentSites[site];
    }

    // Use default state
    return settings.defaultState === 'on';
  }

  /**
   * Apply or remove the dyslexic font based on settings
   */
  function applyFontSettings() {
    const body = document.body;

    if (isEnabled) {
      body.classList.add('dyslexic-font-enabled');

      // Apply optional element classes
      if (settings.applyToLi) {
        body.classList.add('apply-to-li');
      } else {
        body.classList.remove('apply-to-li');
      }

      if (settings.applyToBlockquote) {
        body.classList.add('apply-to-blockquote');
      } else {
        body.classList.remove('apply-to-blockquote');
      }
    } else {
      body.classList.remove('dyslexic-font-enabled', 'apply-to-li', 'apply-to-blockquote');
    }
  }

  /**
   * Save current site state to storage
   */
  async function saveCurrentSiteState() {
    try {
      const site = getCurrentSite();
      settings.currentSites[site] = isEnabled;
      await storage.sync.set({ currentSites: settings.currentSites });
    } catch (error) {
      console.error('Error saving site state:', error);
    }
  }

  /**
   * Toggle the font on/off
   */
  async function toggleFont() {
    isEnabled = !isEnabled;
    applyFontSettings();
    await saveCurrentSiteState();
  }

  /**
   * Check if extension is disabled on current site
   */
  function isSiteDisabled() {
    const site = getCurrentSite();
    const siteRule = settings.siteRules[site];
    return siteRule?.enabled === false;
  }

  /**
   * Initialize the extension
   */
  async function init() {
    await loadSettings();

    // Don't apply if site is disabled
    if (isSiteDisabled()) {
      return;
    }

    // Determine initial state
    isEnabled = shouldBeEnabled();

    // Apply initial settings
    applyFontSettings();
  }

  /**
   * Listen for storage changes
   */
  storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      // Reload settings and reapply
      loadSettings().then(() => {
        // Check if site is now disabled
        if (isSiteDisabled()) {
          // Remove font
          document.body.classList.remove('dyslexic-font-enabled', 'apply-to-li', 'apply-to-blockquote');
          return;
        }

        // Update enabled state if needed
        isEnabled = shouldBeEnabled();
        applyFontSettings();
      });
    }
  });

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
