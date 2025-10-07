/**
 * OpenDyslexic Chrome Extension - Popup Script
 * Provides quick access to toggle and site-specific settings
 */

(async function() {
  'use strict';

  const { storage, tabs } = chrome;

  // DOM elements
  const currentSiteEl = document.getElementById('currentSite');
  const toggleSwitch = document.getElementById('toggleSwitch');
  const statusText = document.getElementById('statusText');
  const siteRuleInfo = document.getElementById('siteRuleInfo');
  const addSiteBtn = document.getElementById('addSiteBtn');
  const optionsBtn = document.getElementById('optionsBtn');
  const helpLink = document.getElementById('helpLink');

  let currentTab = null;
  let currentSite = '';
  let settings = {
    defaultState: 'off',
    applyToLi: false,
    applyToBlockquote: false,
    siteRules: {},
    currentSites: {}
  };

  /**
   * Get current tab and extract hostname
   */
  async function getCurrentTab() {
    try {
      const [tab] = await tabs.query({ active: true, currentWindow: true });
      currentTab = tab;

      if (tab?.url) {
        const url = new URL(tab.url);
        currentSite = url.hostname;
        currentSiteEl.textContent = currentSite;
      } else {
        currentSiteEl.textContent = 'Unable to detect site';
      }
    } catch (error) {
      console.error('Error getting current tab:', error);
      currentSiteEl.textContent = 'Error';
    }
  }

  /**
   * Load settings from storage
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
      updateUI();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * Update UI based on current settings
   */
  function updateUI() {
    const siteRule = settings.siteRules[currentSite];
    const isEnabled = isCurrentSiteEnabled();

    // Update toggle switch
    if (isEnabled) {
      toggleSwitch.classList.add('active');
      statusText.textContent = 'Font is currently on';
      statusText.classList.add('active');
    } else {
      toggleSwitch.classList.remove('active');
      statusText.textContent = 'Font is currently off';
      statusText.classList.remove('active');
    }

    // Show site rule info if exists
    if (siteRule) {
      siteRuleInfo.style.display = 'block';
      if (siteRule.enabled === false) {
        siteRuleInfo.textContent = '⚠️ Extension is disabled on this site';
        toggleSwitch.style.opacity = '0.5';
        toggleSwitch.style.pointerEvents = 'none';
      } else if (siteRule.forceState === 'on') {
        siteRuleInfo.textContent = '📌 Font is always on for this site';
      } else if (siteRule.forceState === 'off') {
        siteRuleInfo.textContent = '📌 Font is always off for this site';
      }
    } else {
      siteRuleInfo.style.display = 'none';
      toggleSwitch.style.opacity = '1';
      toggleSwitch.style.pointerEvents = 'auto';
    }
  }

  /**
   * Check if extension is enabled on current site
   */
  function isCurrentSiteEnabled() {
    const siteRule = settings.siteRules[currentSite];

    if (siteRule?.enabled === false) {
      return false;
    }

    if (siteRule?.forceState) {
      return siteRule.forceState === 'on';
    }

    if (settings.currentSites[currentSite] !== undefined) {
      return settings.currentSites[currentSite];
    }

    return settings.defaultState === 'on';
  }

  /**
   * Toggle font on current site
   */
  async function toggleFont() {
    const siteRule = settings.siteRules[currentSite];

    // Don't allow toggle if site is disabled
    if (siteRule?.enabled === false) {
      return;
    }

    const isCurrentlyEnabled = isCurrentSiteEnabled();
    const newState = !isCurrentlyEnabled;

    // Update current sites
    settings.currentSites[currentSite] = newState;

    try {
      await storage.sync.set({ currentSites: settings.currentSites });
      updateUI();

      // Send message to content script to toggle
      if (currentTab?.id) {
        chrome.tabs.sendMessage(currentTab.id, {
          action: 'toggleFont',
          enabled: newState
        }).catch(() => {
          // Content script might not be loaded, that's ok
        });
      }
    } catch (error) {
      console.error('Error toggling font:', error);
    }
  }

  /**
   * Show add site modal/options
   */
  async function addCurrentSite() {
    const action = await showAddSiteDialog();

    if (!action) return;

    try {
      if (action === 'disable') {
        settings.siteRules[currentSite] = { enabled: false };
      } else if (action === 'always-on') {
        settings.siteRules[currentSite] = { forceState: 'on' };
      } else if (action === 'always-off') {
        settings.siteRules[currentSite] = { forceState: 'off' };
      }

      await storage.sync.set({ siteRules: settings.siteRules });
      updateUI();

      // Show success message
      const originalText = addSiteBtn.textContent;
      addSiteBtn.textContent = '✓ Site rule added!';
      addSiteBtn.style.background = '#2ECC71';

      setTimeout(() => {
        addSiteBtn.textContent = originalText;
        addSiteBtn.style.background = '';
      }, 2000);
    } catch (error) {
      console.error('Error adding site rule:', error);
    }
  }

  /**
   * Show dialog to choose site rule type
   */
  async function showAddSiteDialog() {
    const choice = prompt(
      `Choose a rule for ${currentSite}:\n\n` +
      '1 - Disable extension on this site\n' +
      '2 - Always enable font on this site\n' +
      '3 - Always disable font on this site\n\n' +
      'Enter 1, 2, or 3:'
    );

    if (choice === '1') return 'disable';
    if (choice === '2') return 'always-on';
    if (choice === '3') return 'always-off';
    return null;
  }

  /**
   * Open options page
   */
  function openOptions() {
    chrome.runtime.openOptionsPage();
  }

  /**
   * Handle help link
   */
  function openHelp(e) {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://github.com/yourusername/opendyslexic-extension#readme'
    });
  }

  // Event listeners
  toggleSwitch.addEventListener('click', toggleFont);
  addSiteBtn.addEventListener('click', addCurrentSite);
  optionsBtn.addEventListener('click', openOptions);
  helpLink.addEventListener('click', openHelp);

  // Listen for storage changes
  storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      loadSettings();
    }
  });

  // Initialize
  await getCurrentTab();
  await loadSettings();
})();
