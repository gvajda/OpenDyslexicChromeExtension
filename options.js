/**
 * OpenDyslexic Chrome Extension - Options Page Script
 * Manages settings configuration and site-specific rules
 */

(function() {
  'use strict';

  const { storage } = chrome;

  // DOM elements
  const defaultStateRadios = document.querySelectorAll('input[name="defaultState"]');
  const applyToLiCheckbox = document.getElementById('applyToLi');
  const applyToBlockquoteCheckbox = document.getElementById('applyToBlockquote');
  const siteList = document.getElementById('siteList');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const statusMessage = document.getElementById('statusMessage');

  let currentSettings = {
    defaultState: 'off',
    applyToLi: false,
    applyToBlockquote: false,
    siteRules: {},
    currentSites: {}
  };

  /**
   * Load settings from storage and update UI
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

      currentSettings = result;

      // Update UI
      defaultStateRadios.forEach(radio => {
        radio.checked = radio.value === currentSettings.defaultState;
      });

      applyToLiCheckbox.checked = currentSettings.applyToLi;
      applyToBlockquoteCheckbox.checked = currentSettings.applyToBlockquote;

      renderSiteList();
    } catch (error) {
      showStatus('Error loading settings: ' + error.message, 'error');
    }
  }

  /**
   * Render the site-specific rules list
   */
  function renderSiteList() {
    const sites = Object.keys(currentSettings.siteRules);

    if (sites.length === 0) {
      siteList.innerHTML = '<div class="empty-state">No site-specific rules configured yet.</div>';
      return;
    }

    siteList.innerHTML = '';

    sites.forEach(site => {
      const rule = currentSettings.siteRules[site];
      const siteItem = document.createElement('div');
      siteItem.className = 'site-item';

      const siteInfo = document.createElement('div');
      siteInfo.className = 'site-info';

      const siteDomain = document.createElement('div');
      siteDomain.className = 'site-domain';
      siteDomain.textContent = site;

      const siteStatus = document.createElement('div');
      siteStatus.className = 'site-status';

      if (rule.enabled === false) {
        siteStatus.textContent = 'Extension disabled on this site';
      } else if (rule.forceState === 'on') {
        siteStatus.textContent = 'Always on';
      } else if (rule.forceState === 'off') {
        siteStatus.textContent = 'Always off';
      } else {
        siteStatus.textContent = 'Custom rule';
      }

      siteInfo.appendChild(siteDomain);
      siteInfo.appendChild(siteStatus);

      const siteActions = document.createElement('div');
      siteActions.className = 'site-actions';

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-danger';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => removeSite(site));

      siteActions.appendChild(removeBtn);

      siteItem.appendChild(siteInfo);
      siteItem.appendChild(siteActions);

      siteList.appendChild(siteItem);
    });
  }

  /**
   * Remove a site from the rules
   */
  async function removeSite(site) {
    if (confirm(`Remove custom rule for ${site}?`)) {
      delete currentSettings.siteRules[site];
      renderSiteList();
      await saveSettings();
    }
  }

  /**
   * Save settings to storage
   */
  async function saveSettings() {
    try {
      // Get current values from UI
      const selectedDefaultState = document.querySelector('input[name="defaultState"]:checked').value;

      const settingsToSave = {
        defaultState: selectedDefaultState,
        applyToLi: applyToLiCheckbox.checked,
        applyToBlockquote: applyToBlockquoteCheckbox.checked,
        siteRules: currentSettings.siteRules,
        currentSites: currentSettings.currentSites
      };

      await storage.sync.set(settingsToSave);
      currentSettings = settingsToSave;

      showStatus('Settings saved successfully!', 'success');
    } catch (error) {
      showStatus('Error saving settings: ' + error.message, 'error');
    }
  }

  /**
   * Reset settings to defaults
   */
  async function resetSettings() {
    if (!confirm('Reset all settings to defaults? This will remove all site-specific rules.')) {
      return;
    }

    try {
      const defaultSettings = {
        defaultState: 'off',
        applyToLi: false,
        applyToBlockquote: false,
        siteRules: {},
        currentSites: {}
      };

      await storage.sync.set(defaultSettings);
      currentSettings = defaultSettings;

      // Update UI
      defaultStateRadios.forEach(radio => {
        radio.checked = radio.value === 'off';
      });
      applyToLiCheckbox.checked = false;
      applyToBlockquoteCheckbox.checked = false;
      renderSiteList();

      showStatus('Settings reset to defaults', 'success');
    } catch (error) {
      showStatus('Error resetting settings: ' + error.message, 'error');
    }
  }

  /**
   * Show status message
   */
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';

    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 3000);
  }

  // Event listeners
  saveBtn.addEventListener('click', saveSettings);
  resetBtn.addEventListener('click', resetSettings);

  // Load settings on page load
  loadSettings();
})();
