# OpenDyslexic Chrome Extension - Developer Guide

## Project Overview

A Chrome extension that applies the OpenDyslexic font to paragraph text elements on websites while preserving original styling for headings and UI elements. The extension provides a toggle button and comprehensive configuration options.

## Core Requirements

### Extension Behavior

- Adds a fixed-position toggle button to every webpage (top-right corner)
- Button text: "Toggle OpenDyslexic"
- Applies OpenDyslexic font ONLY to specified elements when enabled
- Preserves original fonts for headings (h1-h6), navigation, buttons, and other UI elements
- Remembers user preferences using `chrome.storage.sync` (syncs across devices)

### Target Elements (Configurable)

Default elements that receive OpenDyslexic font:

- `<p>` tags (required, always included)
- `<li>` tags (optional, configurable)
- `<blockquote>` tags (optional, configurable)

User should be able to configure which additional elements receive the font via extension options page.

### Configuration Options (Options Page Required)

Create a dedicated options page (`options.html`) with the following settings:

1. **Default State**: Radio buttons or toggle
   - "Off by default" (default)
   - "On by default"

2. **Additional Elements**: Checkboxes
   - ☐ Apply to list items (`<li>`)
   - ☐ Apply to blockquotes (`<blockquote>`)

3. **Site-Specific Settings**:
   - Display list of custom site rules
   - "Add current site" button in popup to quickly add site-specific rules
   - For each site, allow:
     - Disable extension completely on this site
     - Override default state (force on/off)
   - Allow removing sites from the list

4. **Save/Reset**:
   - Save button to persist settings
   - Reset to defaults button

### Extension Structure

```
opendyslexic-extension/
├── manifest.json          # Manifest V3 configuration
├── content.js             # Content script (injected into pages)
├── content.css            # Styles for toggle button and font changes
├── popup.html             # Optional: Quick access popup (with "Add site" button)
├── popup.js               # Popup logic
├── options.html           # Settings page
├── options.js             # Options page logic
├── background.js          # Service worker (if needed for storage management)
├── icons/                 # Extension icons folder
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── CLAUDE.md              # This file
```

## Technical Specifications

### Manifest V3 Requirements

- Use Manifest V3 (NOT V2)
- Required permissions: `storage`, `activeTab`
- Optional permissions: `tabs` (for site URL detection)
- Content scripts should inject into all URLs except Chrome internal pages
- Include OpenDyslexic font from CDN: `https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic-regular.css`

### Font Loading Strategy

IMPORTANT: The OpenDyslexic font must be loaded via CSS `@import` in the content.css file:

```css
@import url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic-regular.css');
```

### CSS Implementation

- Use a body class approach: `body.dyslexic-font-enabled`
- When enabled, apply CSS rules like:

  ```css
  body.dyslexic-font-enabled p {
    font-family: 'OpenDyslexic', -apple-system, BlinkMacSystemFont, sans-serif !important;
  }
  ```

- Use `!important` to override site-specific styles
- Button styling should match the reference HTML (blue background, fixed position, hover effects)

### Storage Schema

Use `chrome.storage.sync` with the following structure:

```javascript
{
  defaultState: 'off' | 'on',  // Default: 'off'
  applyToLi: boolean,           // Default: false
  applyToBlockquote: boolean,   // Default: false
  siteRules: {
    'example.com': {
      enabled: false,           // Disable extension on this site
    },
    'another-site.com': {
      forceState: 'on'          // Override default state for this site
    }
  },
  currentSites: {}               // Per-site enabled state (runtime)
}
```

### Content Script Logic

1. On page load:
   - Check current site against `siteRules` in storage
   - If site is disabled, don't inject button or apply fonts
   - If site has `forceState`, use that; otherwise use `defaultState`
   - Load user's element preferences (`applyToLi`, `applyToBlockquote`)

2. Toggle button functionality:
   - Toggles `dyslexic-font-enabled` class on `<body>`
   - Updates storage for current site state
   - Button appearance should reflect current state (consider styling change when active)

3. Listen for storage changes to update UI in real-time when settings change

### Popup Features

- Quick toggle button (mirrors on-page button)
- "Add current site to custom rules" button
- Link to full options page
- Display current site and its status

## Code Style Guidelines

- Use ES modules syntax (`import`/`export`) where possible
- Use `async`/`await` for Chrome API calls (storage, tabs)
- Destructure imports: `const { storage } = chrome;`
- Use modern JavaScript (const/let, arrow functions, template literals)
- Add JSDoc comments for complex functions
- Handle errors gracefully with try/catch blocks

## Testing Checklist

Before considering implementation complete, manually test:

- [ ] Toggle button appears on multiple websites
- [ ] Font changes apply ONLY to configured elements (default: `<p>` only)
- [ ] Settings persist across browser restarts
- [ ] Site-specific rules work correctly
- [ ] "Add current site" button in popup works
- [ ] Options page saves and loads settings correctly
- [ ] Extension syncs across devices (if signed into Chrome)
- [ ] Extension doesn't break on sites with unusual CSS
- [ ] Button positioning works on sites with different layouts

## Known Considerations

- Some sites may have aggressive CSS that requires `!important` overrides
- Chrome Web Store and internal Chrome pages (`chrome://`) cannot have content scripts injected
- Font loading may take a moment on first page load
- Consider MutationObserver if dynamic content needs font application

## Development Commands

```bash
# Load unpacked extension in Chrome
1. Navigate to chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the extension directory

# Reload extension after changes
Click the reload icon on chrome://extensions/ page
```

## Future Enhancements (Not Required Now)

- Keyboard shortcut to toggle font
- Additional dyslexia-friendly settings (letter spacing, line height)
- Import/export settings
- Statistics on usage across sites

---

IMPORTANT: This extension must use Manifest V3, not V2. Always use `chrome.storage.sync` for persistence, never `localStorage` in content scripts. The toggle button and font changes should work seamlessly across all regular websites.
