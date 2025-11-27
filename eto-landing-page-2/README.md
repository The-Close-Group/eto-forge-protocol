# ETO - Tokenize Everything Landing Page

An interactive landing page implementation based on the provided Figma wireframe design.

## Features

✨ **Interactive Elements:**
- Smooth hover animations on all buttons and cards
- 3D tilt effect on feature cards with mouse movement
- Ripple effect on button clicks
- Parallax scrolling background gradient
- Animated entrance effects for content
- Subtle gradient animation

🎨 **Design Elements:**
- Radial gradient background matching the Figma design
- Partner logos section with hover effects
- Hero section with large heading and CTA button
- Two feature cards with glowing accents
- Responsive design for all screen sizes

🚀 **Technologies Used:**
- Pure HTML5, CSS3, and vanilla JavaScript
- No external dependencies or frameworks
- Modern CSS animations and transitions
- Intersection Observer API for scroll animations

## How to Use

Simply open the `index.html` file in your web browser:

```bash
# Option 1: Direct open
open index.html

# Option 2: Using Python's built-in server
python3 -m http.server 8000
# Then visit http://localhost:8000

# Option 3: Using Node.js http-server
npx http-server -p 8000
```

## File Structure

```
test_monkey/
├── index.html    # Main HTML structure
├── style.css     # All styling and animations
├── script.js     # Interactive functionality
└── README.md     # This file
```

## Interactive Features

1. **Navigation**
   - "LAUNCH MARKETS" button with hover effect
   - Logo with shadow effect

2. **Hero Section**
   - "EXPLORE MARKETS" button with rotating arrow on hover
   - Click handlers show alerts (ready for implementation)

3. **Feature Cards**
   - 3D tilt effect following mouse movement
   - Glowing accent animations
   - Click handlers for future functionality

4. **Background**
   - Animated radial gradient
   - Parallax scrolling effect

## Customization

To customize the design:

- **Colors**: Edit the gradient stops in `.gradient-bg` and card colors in `.card-glow`
- **Fonts**: Change the font-family in the `body` selector
- **Animations**: Adjust timing and effects in the `@keyframes` sections
- **Layout**: Modify spacing with padding and margin values

## Browser Support

Works best in modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Future Enhancements

Ready to add:
- Connect to actual market data
- Implement routing for button clicks
- Add more feature cards
- Integrate with Web3 wallet
- Add real partner logo images

Enjoy! 🎉

