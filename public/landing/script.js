/* ========================================
   ETO - Main JavaScript
   ======================================== */

// Shared land data cache
let sharedLandFeatures = null;
let sharedDots = [];

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    initScrollIndicator();
    initButtonEffects();
    loadSharedWorldData().then(() => {
        initHeroGlobe();
    });
});

/* ========================================
   SCROLL INDICATOR
   ======================================== */
function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const featuresSection = document.getElementById('features');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        scrollIndicator.style.cursor = 'pointer';
    }
}

/* ========================================
   BUTTON EFFECTS
   ======================================== */
function initButtonEffects() {
    const buttons = document.querySelectorAll('.launch-btn, .explore-btn, .grid-card-arrow');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                left: ${x}px;
                top: ${y}px;
                width: 100px;
                height: 100px;
                margin-left: -50px;
                margin-top: -50px;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

/* ========================================
   SHARED WORLD DATA LOADER (with localStorage cache)
   ======================================== */
const GLOBE_CACHE_KEY = 'eto_globe_data_v1';
const GLOBE_DOTS_CACHE_KEY = 'eto_globe_dots_v1';

async function loadSharedWorldData() {
    if (typeof d3 === 'undefined') return;
    
    try {
        // Try to load from cache first (instant load for returning visitors)
        const cachedData = localStorage.getItem(GLOBE_CACHE_KEY);
        const cachedDots = localStorage.getItem(GLOBE_DOTS_CACHE_KEY);
        
        if (cachedData && cachedDots) {
            sharedLandFeatures = JSON.parse(cachedData);
            sharedDots = JSON.parse(cachedDots);
            return;
        }
        
        // Fetch from network
        const response = await fetch(
            'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json'
        );
        
        if (!response.ok) throw new Error('Failed to load land data');
        
        sharedLandFeatures = await response.json();
        
        // Generate dots for all land features
        sharedLandFeatures.features.forEach((feature) => {
            const dots = generateDotsInPolygon(feature, 16);
            dots.forEach(([lng, lat]) => {
                sharedDots.push({ lng, lat });
            });
        });
        
        // Cache for next visit (async, non-blocking)
        try {
            localStorage.setItem(GLOBE_CACHE_KEY, JSON.stringify(sharedLandFeatures));
            localStorage.setItem(GLOBE_DOTS_CACHE_KEY, JSON.stringify(sharedDots));
        } catch (e) {
            // localStorage might be full or disabled, ignore
        }
    } catch (err) {
        console.error('Failed to load Earth data:', err);
    }
}

// Helper functions for dot generation
function pointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    
    return inside;
}

function pointInFeature(point, feature) {
    const geometry = feature.geometry;
    
    if (geometry.type === 'Polygon') {
        const coordinates = geometry.coordinates;
        if (!pointInPolygon(point, coordinates[0])) {
            return false;
        }
        for (let i = 1; i < coordinates.length; i++) {
            if (pointInPolygon(point, coordinates[i])) {
                return false;
            }
        }
        return true;
    } else if (geometry.type === 'MultiPolygon') {
        for (const polygon of geometry.coordinates) {
            if (pointInPolygon(point, polygon[0])) {
                let inHole = false;
                for (let i = 1; i < polygon.length; i++) {
                    if (pointInPolygon(point, polygon[i])) {
                        inHole = true;
                        break;
                    }
                }
                if (!inHole) {
                    return true;
                }
            }
        }
        return false;
    }
    
    return false;
}

function generateDotsInPolygon(feature, dotSpacing = 16) {
    const dots = [];
    const bounds = d3.geoBounds(feature);
    const [[minLng, minLat], [maxLng, maxLat]] = bounds;
    
    const stepSize = dotSpacing * 0.08;
    
    for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
            const point = [lng, lat];
            if (pointInFeature(point, feature)) {
                dots.push(point);
            }
        }
    }
    
    return dots;
}

/* ========================================
   HERO GLOBE - Large Horizon Effect
   ======================================== */
function initHeroGlobe() {
    const canvas = document.getElementById('hero-earth-canvas');
    if (!canvas || typeof d3 === 'undefined') return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Large globe dimensions for horizon effect
    const size = 1400;
    const radius = size / 2;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    context.scale(dpr, dpr);
    
    // Create projection centered in canvas
    const projection = d3.geoOrthographic()
        .scale(radius - 20)
        .translate([size / 2, size / 2])
        .clipAngle(90);
    
    const path = d3.geoPath().projection(projection).context(context);
    
    // Cache graticule to avoid recreating every frame
    const graticule = d3.geoGraticule()();
    
    function render() {
        context.clearRect(0, 0, size, size);
        
        const currentScale = projection.scale();
        const scaleFactor = currentScale / radius;
        
        // Draw ocean (globe background) - dark with white border
        context.beginPath();
        context.arc(size / 2, size / 2, currentScale, 0, 2 * Math.PI);
        context.fillStyle = '#0a0a0a';
        context.fill();
        context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        context.lineWidth = 3 * scaleFactor;
        context.stroke();
        
        if (sharedLandFeatures) {
            // Draw graticule (cached)
            context.beginPath();
            path(graticule);
            context.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            context.lineWidth = 1 * scaleFactor;
            context.stroke();
            
            // Draw land outlines
            context.beginPath();
            sharedLandFeatures.features.forEach((feature) => {
                path(feature);
            });
            context.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            context.lineWidth = 1.5 * scaleFactor;
            context.stroke();
            
            // Draw halftone dots
            sharedDots.forEach((dot) => {
                const projected = projection([dot.lng, dot.lat]);
                if (
                    projected &&
                    projected[0] >= 0 &&
                    projected[0] <= size &&
                    projected[1] >= 0 &&
                    projected[1] <= size
                ) {
                    context.beginPath();
                    context.arc(projected[0], projected[1], 2 * scaleFactor, 0, 2 * Math.PI);
                    context.fillStyle = 'rgba(150, 150, 150, 0.6)';
                    context.fill();
                }
            });
        }
    }
    
    // Rotation
    const rotation = [0, -20]; // Start tilted slightly
    let autoRotate = true;
    const rotationSpeed = 0.012; // Degrees per millisecond (smooth rotation)
    
    // Animation loop with delta time for smooth 60fps animation
    let lastTime = performance.now();
    
    function animationLoop(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        if (autoRotate) {
            // Smooth rotation based on elapsed time
            rotation[0] += rotationSpeed * deltaTime;
            projection.rotate(rotation);
            render();
        }
        
        requestAnimationFrame(animationLoop);
    }
    
    // Initial render
    if (sharedLandFeatures) {
        render();
    }
    requestAnimationFrame(animationLoop);
    
    // Drag interaction
    function handleMouseDown(event) {
        event.preventDefault();
        autoRotate = false;
        const startX = event.clientX || event.touches?.[0]?.clientX;
        const startY = event.clientY || event.touches?.[0]?.clientY;
        const startRotation = [...rotation];
        
        function handleMouseMove(moveEvent) {
            const currentX = moveEvent.clientX || moveEvent.touches?.[0]?.clientX;
            const currentY = moveEvent.clientY || moveEvent.touches?.[0]?.clientY;
            
            const sensitivity = 0.3;
            const dx = currentX - startX;
            const dy = currentY - startY;
            
            rotation[0] = startRotation[0] + dx * sensitivity;
            rotation[1] = startRotation[1] - dy * sensitivity;
            rotation[1] = Math.max(-90, Math.min(90, rotation[1]));
            
            projection.rotate(rotation);
            render();
        }
        
        function handleMouseUp() {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
            
            setTimeout(() => {
                autoRotate = true;
            }, 100);
        }
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleMouseMove, { passive: true });
        document.addEventListener('touchend', handleMouseUp);
    }
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('touchstart', handleMouseDown, { passive: false });
}

/* ========================================
   RIPPLE ANIMATION KEYFRAMES
   ======================================== */
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/* ========================================
   FADE-IN ANIMATIONS - INTERSECTION OBSERVER
   ======================================== */
function initFadeInAnimations() {
    // Elements to observe for fade-in
    const fadeElements = document.querySelectorAll(`
        .highlights-header,
        .features-header,
        .maang-header,
        .engine-header,
        .feature-card,
        .grid-card,
        .display-card,
        .orbital-timeline,
        .orbital-node,
        .site-footer,
        .main-content,
        .fade-in,
        .fade-in-up,
        .fade-in-scale,
        .fade-in-left,
        .fade-in-right
    `);

    // Create intersection observer
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered delay for grouped elements
                const delay = entry.target.dataset.fadeDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay * 100);
                
                // Unobserve after animation
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all fade elements
    fadeElements.forEach((el, index) => {
        // Add stagger delay to cards
        if (el.classList.contains('feature-card') || 
            el.classList.contains('grid-card') || 
            el.classList.contains('display-card') ||
            el.classList.contains('orbital-node')) {
            el.dataset.fadeDelay = (index % 6) + 1;
        }
        fadeObserver.observe(el);
    });

    // Special handling for orbital nodes - staggered appearance
    const orbitalNodes = document.querySelectorAll('.orbital-node');
    orbitalNodes.forEach((node, index) => {
        node.dataset.fadeDelay = index + 1;
    });
}

// Initialize fade animations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFadeInAnimations);
} else {
    initFadeInAnimations();
}

/* ========================================
   RADIAL ORBITAL TIMELINE
   ======================================== */
function initOrbitalTimeline() {
    const container = document.getElementById('orbital-timeline');
    const nodesContainer = document.getElementById('orbital-nodes');
    
    if (!container || !nodesContainer) return;
    
    const nodes = nodesContainer.querySelectorAll('.orbital-node');
    const totalNodes = nodes.length;
    
    let rotationAngle = 0;
    let autoRotate = true;
    let activeNodeId = null;
    let animationId = null;
    let lastTime = 0;
    
    const rotationSpeed = 0.25;
    
    function getRadius() {
        const width = window.innerWidth;
        if (width <= 480) return 130;
        if (width <= 768) return 160;
        return 210;
    }
    
    function calculateNodePosition(index, total, currentAngle) {
        const angle = ((index / total) * 360 + currentAngle) % 360;
        const radius = getRadius();
        const radian = (angle * Math.PI) / 180;
        
        const x = radius * Math.cos(radian);
        const y = radius * Math.sin(radian);
        const zIndex = Math.round(100 + 50 * Math.cos(radian));
        const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
        
        return { x, y, angle, zIndex, opacity };
    }
    
    function updateNodePositions() {
        nodes.forEach((node, index) => {
            const isActive = node.classList.contains('active');
            const position = calculateNodePosition(index, totalNodes, rotationAngle);
            const offset = window.innerWidth <= 480 ? 16 : (window.innerWidth <= 768 ? 18 : 22);
            
            node.style.transform = `translate(${position.x - offset}px, ${position.y - offset}px)`;
            node.style.zIndex = isActive ? 200 : position.zIndex;
            if (!node.classList.contains('visible')) {
                node.style.opacity = 0;
            } else {
                node.style.opacity = isActive ? 1 : position.opacity;
            }
        });
    }
    
    function animate(currentTime) {
        if (!lastTime) lastTime = currentTime;
        const deltaTime = Math.min((currentTime - lastTime) / 16.67, 3);
        lastTime = currentTime;
        
        if (autoRotate) {
            rotationAngle = (rotationAngle + rotationSpeed * deltaTime) % 360;
            updateNodePositions();
        }
        
        animationId = requestAnimationFrame(animate);
    }
    
    function centerOnNode(nodeIndex) {
        const targetAngle = (nodeIndex / totalNodes) * 360;
        rotationAngle = 270 - targetAngle;
        updateNodePositions();
    }
    
    function toggleNode(node, index) {
        const wasActive = node.classList.contains('active');
        nodes.forEach(n => n.classList.remove('active'));
        
        if (!wasActive) {
            node.classList.add('active');
            activeNodeId = node.dataset.id;
            autoRotate = false;
            centerOnNode(index);
        } else {
            activeNodeId = null;
            autoRotate = true;
        }
    }
    
    function handleContainerClick(e) {
        if (e.target === container || e.target.classList.contains('orbital-ring') || 
            e.target.classList.contains('orbital-nodes')) {
            nodes.forEach(n => n.classList.remove('active'));
            activeNodeId = null;
            autoRotate = true;
        }
    }
    
    nodes.forEach((node, index) => {
        node.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNode(node, index);
        });
    });
    
    container.addEventListener('click', handleContainerClick);
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        } else {
            lastTime = 0;
            if (!animationId) {
                animationId = requestAnimationFrame(animate);
            }
        }
    });
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateNodePositions, 100);
    });
    
    updateNodePositions();
    animationId = requestAnimationFrame(animate);
}

// Initialize orbital timeline when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrbitalTimeline);
} else {
    initOrbitalTimeline();
}
