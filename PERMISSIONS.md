# Extension Permissions Explained

This extension has been designed to minimize permissions and respect user privacy.

## Required Permissions

### `storage`
- **Why needed**: To save your settings and preferences
- **What it does**: Stores your default font state, element preferences, and site-specific rules
- **Syncs across devices**: Your settings sync across Chrome browsers when signed in

### `activeTab`
- **Why needed**: To apply the OpenDyslexic font to the current tab
- **What it does**: Only grants access to the current active tab, and only when you click the extension icon
- **Privacy-friendly**: The extension cannot access any tabs you're not actively using it on

### `scripting`
- **Why needed**: To inject the font styles and toggle logic into webpages
- **What it does**: Dynamically adds CSS and JavaScript to apply the font
- **Used with activeTab**: Only works on tabs where you've clicked the extension icon

## What This Extension Does NOT Have Access To

❌ **No broad host permissions**: Unlike many extensions, this does NOT request access to "all websites"
❌ **No browsing history**: Cannot see what sites you visit
❌ **No automatic injection**: Scripts are only injected when you explicitly click the extension icon
❌ **No network requests**: Doesn't make API calls or send data anywhere (font loaded from CDN via CSS)
❌ **No sensitive data**: Cannot access passwords, credit cards, or other form data

## How It Works

1. **You click the extension icon** on a webpage
2. **activeTab permission activates** for that specific tab only
3. **Scripts are injected** to apply the font settings
4. **Settings are loaded** from chrome.storage.sync
5. **Font is applied** based on your preferences

The extension only "wakes up" when you interact with it, making it privacy-respecting and efficient.

## Comparison to Alternatives

Many extensions request "Read and change all your data on all websites" which gives them broad access to everything you do online.

This extension uses **activeTab + scripting** instead, which means:
- ✅ Only works when you click the icon
- ✅ Only affects the current tab
- ✅ Cannot track your browsing
- ✅ More secure and privacy-friendly

## Open Source

This extension is open source, meaning you can review the code yourself to verify it does exactly what it claims and nothing more.
