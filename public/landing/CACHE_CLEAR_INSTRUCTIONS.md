# Browser Cache Clear Instructions

The typography changes have been applied with `!important` flags to override any conflicting styles. If you still don't see the changes, follow these steps:

## Method 1: Hard Refresh (Recommended)
- **Chrome/Edge (Mac)**: `Cmd + Shift + R`
- **Chrome/Edge (Windows/Linux)**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Firefox (Mac)**: `Cmd + Shift + R`
- **Firefox (Windows/Linux)**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Safari (Mac)**: `Cmd + Option + E` (to empty cache), then `Cmd + R` (to reload)

## Method 2: Clear Browser Cache Completely
1. Open DevTools (`F12` or `Cmd+Option+I` on Mac)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

## Method 3: Incognito/Private Window
Open the page in an incognito/private browsing window to bypass all caching.

## Method 4: DevTools Network Tab
1. Open DevTools (`F12`)
2. Go to the Network tab
3. Check "Disable cache" checkbox
4. Keep DevTools open while reloading

## What Was Changed:
- Added cache-busting query parameter: `style.css?v=2025010301`
- Added `!important` to all critical typography properties
- Font sizes now in absolute pixels (not rem/em)
- Letter spacing in pixels (not percentages)

## Verify Typography Settings:
Use DevTools to inspect elements and verify:
- **Hero Title**: 71px, Inter Semi Bold, -2.13px letter-spacing
- **Hero Subtitle**: 24px, Inter Regular, -0.48px letter-spacing  
- **Brand Name**: 32px, Inter Regular, -2.88px letter-spacing
- **Start Trading Button**: 15px, JetBrains Mono Medium, -0.3px letter-spacing

If styles still don't apply, inspect the element in DevTools and look for any overriding styles or check the Console for font loading errors.

