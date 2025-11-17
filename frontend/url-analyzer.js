// HTML URL Analyzer - Comprehensive URL Extraction Tool
// Extracts all types of URLs including Shadow DOM elements

class URLAnalyzer {
    constructor() {
        this.urls = {
            hyperlinks: [],
            images: [],
            scripts: [],
            stylesheets: [],
            iframes: [],
            videos: [],
            audios: [],
            dataAttributes: [],
            shadowDOM: []
        };
        this.totalCount = 0;
    }

    /**
     * Main analysis function
     * @param {string} htmlContent - HTML content to analyze
     */
    analyze(htmlContent) {
        this.reset();
        
        try {
            // Parse HTML content
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            // Check for parsing errors
            const parserError = doc.querySelector('parsererror');
            if (parserError) {
                throw new Error('Invalid HTML content');
            }
            
            // Extract URLs from regular DOM
            this.extractFromDOM(doc);
            
            // Extract URLs from Shadow DOM
            this.extractFromShadowDOM(doc);
            
            // Calculate total count
            this.calculateTotal();
            
            return this.urls;
        } catch (error) {
            console.error('Analysis error:', error);
            throw error;
        }
    }

    /**
     * Reset all URL collections
     */
    reset() {
        Object.keys(this.urls).forEach(key => {
            this.urls[key] = [];
        });
        this.totalCount = 0;
    }

    /**
     * Extract URLs from regular DOM
     * @param {Document} doc - Parsed document
     */
    extractFromDOM(doc) {
        // Extract hyperlinks from <a> and <area> tags
        this.extractHyperlinks(doc);
        
        // Extract images from <img> tags
        this.extractImages(doc);
        
        // Extract scripts from <script> tags
        this.extractScripts(doc);
        
        // Extract stylesheets from <link> tags
        this.extractStylesheets(doc);
        
        // Extract iframes
        this.extractIframes(doc);
        
        // Extract video sources
        this.extractVideos(doc);
        
        // Extract audio sources
        this.extractAudios(doc);
        
        // Extract data attributes
        this.extractDataAttributes(doc);
    }

    /**
     * Extract hyperlinks from <a> and <area> tags
     * @param {Document} doc - Parsed document
     */
    extractHyperlinks(doc) {
        // Extract from <a> tags
        const links = doc.querySelectorAll('a[href]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && this.isValidURL(href)) {
                this.urls.hyperlinks.push({
                    url: href,
                    text: link.textContent.trim() || '(no text)',
                    type: 'anchor',
                    isShadowDOM: false
                });
            }
        });

        // Extract from <area> tags (image maps)
        const areas = doc.querySelectorAll('area[href]');
        areas.forEach(area => {
            const href = area.getAttribute('href');
            if (href && this.isValidURL(href)) {
                this.urls.hyperlinks.push({
                    url: href,
                    text: area.getAttribute('alt') || '(no alt text)',
                    type: 'area',
                    isShadowDOM: false
                });
            }
        });
    }

    /**
     * Extract images from <img> tags
     * @param {Document} doc - Parsed document
     */
    extractImages(doc) {
        const images = doc.querySelectorAll('img');
        images.forEach(img => {
            // Extract from src attribute
            const src = img.getAttribute('src');
            if (src && this.isValidURL(src)) {
                this.urls.images.push({
                    url: src,
                    alt: img.getAttribute('alt') || '(no alt)',
                    type: 'src',
                    isShadowDOM: false
                });
            }

            // Extract from srcset attribute
            const srcset = img.getAttribute('srcset');
            if (srcset) {
                const srcsetUrls = this.parseSrcset(srcset);
                srcsetUrls.forEach(url => {
                    if (this.isValidURL(url)) {
                        this.urls.images.push({
                            url: url,
                            alt: img.getAttribute('alt') || '(no alt)',
                            type: 'srcset',
                            isShadowDOM: false
                        });
                    }
                });
            }
        });

        // Also check for picture sources
        const sources = doc.querySelectorAll('picture source[srcset]');
        sources.forEach(source => {
            const srcset = source.getAttribute('srcset');
            if (srcset) {
                const srcsetUrls = this.parseSrcset(srcset);
                srcsetUrls.forEach(url => {
                    if (this.isValidURL(url)) {
                        this.urls.images.push({
                            url: url,
                            alt: '(picture source)',
                            type: 'picture-srcset',
                            isShadowDOM: false
                        });
                    }
                });
            }
        });
    }

    /**
     * Extract JavaScript files from <script> tags
     * @param {Document} doc - Parsed document
     */
    extractScripts(doc) {
        const scripts = doc.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const src = script.getAttribute('src');
            if (src && this.isValidURL(src)) {
                this.urls.scripts.push({
                    url: src,
                    type: script.getAttribute('type') || 'text/javascript',
                    async: script.hasAttribute('async'),
                    defer: script.hasAttribute('defer'),
                    isShadowDOM: false
                });
            }
        });
    }

    /**
     * Extract stylesheets from <link> tags
     * @param {Document} doc - Parsed document
     */
    extractStylesheets(doc) {
        const links = doc.querySelectorAll('link[rel="stylesheet"], link[rel="preload"][as="style"]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && this.isValidURL(href)) {
                this.urls.stylesheets.push({
                    url: href,
                    rel: link.getAttribute('rel'),
                    media: link.getAttribute('media') || 'all',
                    isShadowDOM: false
                });
            }
        });

        // Also check for @import in style tags
        const styleTags = doc.querySelectorAll('style');
        styleTags.forEach(style => {
            const content = style.textContent;
            const importRegex = /@import\s+(?:url\()?['"]?([^'"\)]+)['"]?\)?/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                if (this.isValidURL(match[1])) {
                    this.urls.stylesheets.push({
                        url: match[1],
                        rel: 'import',
                        media: 'all',
                        isShadowDOM: false
                    });
                }
            }
        });
    }

    /**
     * Extract iframes
     * @param {Document} doc - Parsed document
     */
    extractIframes(doc) {
        const iframes = doc.querySelectorAll('iframe[src]');
        iframes.forEach(iframe => {
            const src = iframe.getAttribute('src');
            if (src && this.isValidURL(src)) {
                this.urls.iframes.push({
                    url: src,
                    title: iframe.getAttribute('title') || '(no title)',
                    isShadowDOM: false
                });
            }
        });
    }

    /**
     * Extract video sources
     * @param {Document} doc - Parsed document
     */
    extractVideos(doc) {
        // Extract from <video> tags
        const videos = doc.querySelectorAll('video[src]');
        videos.forEach(video => {
            const src = video.getAttribute('src');
            if (src && this.isValidURL(src)) {
                this.urls.videos.push({
                    url: src,
                    type: 'video',
                    poster: video.getAttribute('poster') || null,
                    isShadowDOM: false
                });
            }
        });

        // Extract from <source> tags inside <video>
        const videoSources = doc.querySelectorAll('video source[src]');
        videoSources.forEach(source => {
            const src = source.getAttribute('src');
            if (src && this.isValidURL(src)) {
                this.urls.videos.push({
                    url: src,
                    type: source.getAttribute('type') || 'video',
                    poster: null,
                    isShadowDOM: false
                });
            }
        });
    }

    /**
     * Extract audio sources
     * @param {Document} doc - Parsed document
     */
    extractAudios(doc) {
        // Extract from <audio> tags
        const audios = doc.querySelectorAll('audio[src]');
        audios.forEach(audio => {
            const src = audio.getAttribute('src');
            if (src && this.isValidURL(src)) {
                this.urls.audios.push({
                    url: src,
                    type: 'audio',
                    isShadowDOM: false
                });
            }
        });

        // Extract from <source> tags inside <audio>
        const audioSources = doc.querySelectorAll('audio source[src]');
        audioSources.forEach(source => {
            const src = source.getAttribute('src');
            if (src && this.isValidURL(src)) {
                this.urls.audios.push({
                    url: src,
                    type: source.getAttribute('type') || 'audio',
                    isShadowDOM: false
                });
            }
        });
    }

    /**
     * Extract data attributes (data-src, data-url, data-href)
     * @param {Document} doc - Parsed document
     */
    extractDataAttributes(doc) {
        const dataAttributes = ['data-src', 'data-url', 'data-href', 'data-background', 'data-image'];
        
        dataAttributes.forEach(attr => {
            const elements = doc.querySelectorAll(`[${attr}]`);
            elements.forEach(element => {
                const value = element.getAttribute(attr);
                if (value && this.isValidURL(value)) {
                    this.urls.dataAttributes.push({
                        url: value,
                        attribute: attr,
                        tagName: element.tagName.toLowerCase(),
                        isShadowDOM: false
                    });
                }
            });
        });
    }

    /**
     * Extract URLs from Shadow DOM
     * @param {Document} doc - Parsed document
     */
    extractFromShadowDOM(doc) {
        // Find all elements that might have shadow roots
        const allElements = doc.querySelectorAll('*');
        
        allElements.forEach(element => {
            if (element.shadowRoot) {
                this.traverseShadowDOM(element.shadowRoot);
            }
        });
    }

    /**
     * Traverse Shadow DOM and extract URLs
     * @param {ShadowRoot} shadowRoot - Shadow root to traverse
     */
    traverseShadowDOM(shadowRoot) {
        // Extract hyperlinks
        const links = shadowRoot.querySelectorAll('a[href], area[href]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && this.isValidURL(href)) {
                this.urls.shadowDOM.push({
                    url: href,
                    type: 'hyperlink',
                    tagName: link.tagName.toLowerCase(),
                    text: link.textContent.trim() || '(no text)'
                });
            }
        });

        // Extract images
        const images = shadowRoot.querySelectorAll('img[src]');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src && this.isValidURL(src)) {
                this.urls.shadowDOM.push({
                    url: src,
                    type: 'image',
                    tagName: 'img',
                    text: img.getAttribute('alt') || '(no alt)'
                });
            }
        });

        // Extract scripts
        const scripts = shadowRoot.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const src = script.getAttribute('src');
            if (src && this.isValidURL(src)) {
                this.urls.shadowDOM.push({
                    url: src,
                    type: 'script',
                    tagName: 'script',
                    text: ''
                });
            }
        });

        // Extract stylesheets
        const stylesheets = shadowRoot.querySelectorAll('link[rel="stylesheet"]');
        stylesheets.forEach(link => {
            const href = link.getAttribute('href');
            if (href && this.isValidURL(href)) {
                this.urls.shadowDOM.push({
                    url: href,
                    type: 'stylesheet',
                    tagName: 'link',
                    text: ''
                });
            }
        });

        // Extract videos
        const videos = shadowRoot.querySelectorAll('video[src], video source[src]');
        videos.forEach(video => {
            const src = video.getAttribute('src');
            if (src && this.isValidURL(src)) {
                this.urls.shadowDOM.push({
                    url: src,
                    type: 'video',
                    tagName: video.tagName.toLowerCase(),
                    text: ''
                });
            }
        });

        // Extract audios
        const audios = shadowRoot.querySelectorAll('audio[src], audio source[src]');
        audios.forEach(audio => {
            const src = audio.getAttribute('src');
            if (src && this.isValidURL(src)) {
                this.urls.shadowDOM.push({
                    url: src,
                    type: 'audio',
                    tagName: audio.tagName.toLowerCase(),
                    text: ''
                });
            }
        });

        // Recursively traverse nested shadow DOMs
        const nestedElements = shadowRoot.querySelectorAll('*');
        nestedElements.forEach(element => {
            if (element.shadowRoot) {
                this.traverseShadowDOM(element.shadowRoot);
            }
        });
    }

    /**
     * Parse srcset attribute to extract URLs
     * @param {string} srcset - srcset attribute value
     * @returns {Array} Array of URLs
     */
    parseSrcset(srcset) {
        const urls = [];
        const parts = srcset.split(',');
        
        parts.forEach(part => {
            const trimmed = part.trim();
            const spaceIndex = trimmed.indexOf(' ');
            const url = spaceIndex > -1 ? trimmed.substring(0, spaceIndex) : trimmed;
            if (url) {
                urls.push(url);
            }
        });
        
        return urls;
    }

    /**
     * Validate if a string is a valid URL
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid URL
     */
    isValidURL(url) {
        if (!url || typeof url !== 'string') return false;
        
        // Trim whitespace
        url = url.trim();
        
        // Ignore empty strings, javascript:, data:, mailto:, tel:
        if (url === '' || 
            url.startsWith('javascript:') || 
            url.startsWith('mailto:') || 
            url.startsWith('tel:') ||
            url === '#' ||
            url.startsWith('#')) {
            return false;
        }
        
        // Accept data: URLs for images
        if (url.startsWith('data:')) {
            return true;
        }
        
        // Accept relative URLs, absolute URLs, protocol-relative URLs
        return true;
    }

    /**
     * Calculate total URL count
     */
    calculateTotal() {
        this.totalCount = 0;
        Object.keys(this.urls).forEach(key => {
            this.totalCount += this.urls[key].length;
        });
    }

    /**
     * Get results summary
     * @returns {Object} Summary object
     */
    getSummary() {
        return {
            total: this.totalCount,
            hyperlinks: this.urls.hyperlinks.length,
            images: this.urls.images.length,
            scripts: this.urls.scripts.length,
            stylesheets: this.urls.stylesheets.length,
            iframes: this.urls.iframes.length,
            videos: this.urls.videos.length,
            audios: this.urls.audios.length,
            dataAttributes: this.urls.dataAttributes.length,
            shadowDOM: this.urls.shadowDOM.length
        };
    }

    /**
     * Generate downloadable text report
     * @returns {string} Formatted text report
     */
    generateReport() {
        let report = '═══════════════════════════════════════════════════════\n';
        report += '           HTML URL ANALYZER REPORT\n';
        report += '═══════════════════════════════════════════════════════\n\n';
        report += `Generated: ${new Date().toLocaleString()}\n`;
        report += `Total URLs Found: ${this.totalCount}\n\n`;

        const summary = this.getSummary();
        report += '───────────────────────────────────────────────────────\n';
        report += 'SUMMARY BY CATEGORY\n';
        report += '───────────────────────────────────────────────────────\n';
        report += `Hyperlinks:       ${summary.hyperlinks}\n`;
        report += `Images:           ${summary.images}\n`;
        report += `Scripts:          ${summary.scripts}\n`;
        report += `Stylesheets:      ${summary.stylesheets}\n`;
        report += `iFrames:          ${summary.iframes}\n`;
        report += `Videos:           ${summary.videos}\n`;
        report += `Audios:           ${summary.audios}\n`;
        report += `Data Attributes:  ${summary.dataAttributes}\n`;
        report += `Shadow DOM:       ${summary.shadowDOM}\n\n`;

        // Add detailed listings
        if (this.urls.hyperlinks.length > 0) {
            report += this.formatCategory('HYPERLINKS', this.urls.hyperlinks, (item) => {
                return `  • ${item.url}\n    Type: ${item.type} | Text: "${item.text}"`;
            });
        }

        if (this.urls.images.length > 0) {
            report += this.formatCategory('IMAGES', this.urls.images, (item) => {
                return `  • ${item.url}\n    Type: ${item.type} | Alt: "${item.alt}"`;
            });
        }

        if (this.urls.scripts.length > 0) {
            report += this.formatCategory('JAVASCRIPT FILES', this.urls.scripts, (item) => {
                return `  • ${item.url}\n    Type: ${item.type} | Async: ${item.async} | Defer: ${item.defer}`;
            });
        }

        if (this.urls.stylesheets.length > 0) {
            report += this.formatCategory('STYLESHEETS', this.urls.stylesheets, (item) => {
                return `  • ${item.url}\n    Rel: ${item.rel} | Media: ${item.media}`;
            });
        }

        if (this.urls.iframes.length > 0) {
            report += this.formatCategory('IFRAMES', this.urls.iframes, (item) => {
                return `  • ${item.url}\n    Title: "${item.title}"`;
            });
        }

        if (this.urls.videos.length > 0) {
            report += this.formatCategory('VIDEOS', this.urls.videos, (item) => {
                return `  • ${item.url}\n    Type: ${item.type}${item.poster ? ` | Poster: ${item.poster}` : ''}`;
            });
        }

        if (this.urls.audios.length > 0) {
            report += this.formatCategory('AUDIOS', this.urls.audios, (item) => {
                return `  • ${item.url}\n    Type: ${item.type}`;
            });
        }

        if (this.urls.dataAttributes.length > 0) {
            report += this.formatCategory('DATA ATTRIBUTES', this.urls.dataAttributes, (item) => {
                return `  • ${item.url}\n    Attribute: ${item.attribute} | Tag: <${item.tagName}>`;
            });
        }

        if (this.urls.shadowDOM.length > 0) {
            report += this.formatCategory('SHADOW DOM URLS', this.urls.shadowDOM, (item) => {
                return `  • ${item.url}\n    Type: ${item.type} | Tag: <${item.tagName}>${item.text ? ` | Text: "${item.text}"` : ''}`;
            });
        }

        report += '═══════════════════════════════════════════════════════\n';
        report += '                   END OF REPORT\n';
        report += '═══════════════════════════════════════════════════════\n';

        return report;
    }

    /**
     * Format a category for the report
     * @param {string} title - Category title
     * @param {Array} items - Items in category
     * @param {Function} formatter - Function to format each item
     * @returns {string} Formatted category
     */
    formatCategory(title, items, formatter) {
        let output = '───────────────────────────────────────────────────────\n';
        output += `${title} (${items.length})\n`;
        output += '───────────────────────────────────────────────────────\n';
        
        items.forEach((item, index) => {
            output += `${index + 1}. ${formatter(item)}\n\n`;
        });
        
        return output;
    }
}

// UI Controller
class UIController {
    constructor() {
        this.analyzer = new URLAnalyzer();
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.fileUploadArea = document.getElementById('fileUploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.htmlInput = document.getElementById('htmlInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.loadingState = document.getElementById('loadingState');
        this.resultsSection = document.getElementById('resultsSection');
        this.statsGrid = document.getElementById('statsGrid');
        this.categoriesContainer = document.getElementById('categoriesContainer');
    }

    attachEventListeners() {
        // File upload area click
        this.fileUploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Drag and drop
        this.fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.fileUploadArea.classList.add('dragover');
        });

        this.fileUploadArea.addEventListener('dragleave', () => {
            this.fileUploadArea.classList.remove('dragover');
        });

        this.fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.fileUploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
                this.handleFileUpload(file);
            } else {
                alert('Please drop an HTML file (.html or .htm)');
            }
        });

        // Analyze button
        this.analyzeBtn.addEventListener('click', () => {
            this.performAnalysis();
        });

        // Clear button
        this.clearBtn.addEventListener('click', () => {
            this.clearAll();
        });

        // Download button
        this.downloadBtn.addEventListener('click', () => {
            this.downloadResults();
        });
    }

    handleFileUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.htmlInput.value = e.target.result;
        };
        reader.readAsText(file);
    }

    performAnalysis() {
        const htmlContent = this.htmlInput.value.trim();

        if (!htmlContent) {
            alert('Please enter or upload HTML content to analyze.');
            return;
        }

        // Show loading state
        this.loadingState.classList.add('active');
        this.resultsSection.classList.remove('active');

        // Perform analysis with a slight delay for UI feedback
        setTimeout(() => {
            try {
                const results = this.analyzer.analyze(htmlContent);
                this.displayResults(results);
            } catch (error) {
                alert('Error analyzing HTML: ' + error.message);
                console.error(error);
            } finally {
                this.loadingState.classList.remove('active');
            }
        }, 300);
    }

    displayResults(results) {
        const summary = this.analyzer.getSummary();

        // Display statistics
        this.displayStatistics(summary);

        // Display categories
        this.displayCategories(results, summary);

        // Show results section
        this.resultsSection.classList.add('active');

        // Scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    displayStatistics(summary) {
        this.statsGrid.innerHTML = `
            <div class="stat-card">
                <h4>${summary.total}</h4>
                <p>Total URLs</p>
            </div>
            <div class="stat-card">
                <h4>${summary.hyperlinks}</h4>
                <p>Hyperlinks</p>
            </div>
            <div class="stat-card">
                <h4>${summary.images}</h4>
                <p>Images</p>
            </div>
            <div class="stat-card">
                <h4>${summary.scripts}</h4>
                <p>Scripts</p>
            </div>
            <div class="stat-card">
                <h4>${summary.stylesheets}</h4>
                <p>Stylesheets</p>
            </div>
            <div class="stat-card">
                <h4>${summary.shadowDOM}</h4>
                <p>Shadow DOM</p>
            </div>
        `;
    }

    displayCategories(results, summary) {
        this.categoriesContainer.innerHTML = '';

        // Hyperlinks
        if (summary.hyperlinks > 0) {
            this.addCategory('🔗 Hyperlinks', results.hyperlinks, (item) => {
                return `
                    <span class="type-label">${item.type}</span>
                    <strong>${item.url}</strong>
                    <div class="text-muted small mt-1">Text: "${item.text}"</div>
                `;
            });
        }

        // Images
        if (summary.images > 0) {
            this.addCategory('🖼️ Images', results.images, (item) => {
                return `
                    <span class="type-label">${item.type}</span>
                    <strong>${item.url}</strong>
                    <div class="text-muted small mt-1">Alt: "${item.alt}"</div>
                `;
            });
        }

        // Scripts
        if (summary.scripts > 0) {
            this.addCategory('📜 JavaScript Files', results.scripts, (item) => {
                return `
                    <span class="type-label">${item.type}</span>
                    <strong>${item.url}</strong>
                    <div class="text-muted small mt-1">
                        ${item.async ? 'Async' : ''} ${item.defer ? 'Defer' : ''}
                    </div>
                `;
            });
        }

        // Stylesheets
        if (summary.stylesheets > 0) {
            this.addCategory('🎨 Stylesheets', results.stylesheets, (item) => {
                return `
                    <span class="type-label">${item.rel}</span>
                    <strong>${item.url}</strong>
                    <div class="text-muted small mt-1">Media: ${item.media}</div>
                `;
            });
        }

        // iFrames
        if (summary.iframes > 0) {
            this.addCategory('🖥️ iFrames', results.iframes, (item) => {
                return `
                    <strong>${item.url}</strong>
                    <div class="text-muted small mt-1">Title: "${item.title}"</div>
                `;
            });
        }

        // Videos
        if (summary.videos > 0) {
            this.addCategory('🎥 Videos', results.videos, (item) => {
                return `
                    <span class="type-label">${item.type}</span>
                    <strong>${item.url}</strong>
                    ${item.poster ? `<div class="text-muted small mt-1">Poster: ${item.poster}</div>` : ''}
                `;
            });
        }

        // Audios
        if (summary.audios > 0) {
            this.addCategory('🔊 Audios', results.audios, (item) => {
                return `
                    <span class="type-label">${item.type}</span>
                    <strong>${item.url}</strong>
                `;
            });
        }

        // Data Attributes
        if (summary.dataAttributes > 0) {
            this.addCategory('📊 Data Attributes', results.dataAttributes, (item) => {
                return `
                    <span class="type-label">${item.attribute}</span>
                    <strong>${item.url}</strong>
                    <div class="text-muted small mt-1">Tag: &lt;${item.tagName}&gt;</div>
                `;
            });
        }

        // Shadow DOM
        if (summary.shadowDOM > 0) {
            this.addCategory('👻 Shadow DOM URLs', results.shadowDOM, (item) => {
                return `
                    <span class="type-label">${item.type}</span>
                    <span class="shadow-dom-indicator">Shadow DOM</span>
                    <strong>${item.url}</strong>
                    <div class="text-muted small mt-1">
                        Tag: &lt;${item.tagName}&gt;${item.text ? ` | Text: "${item.text}"` : ''}
                    </div>
                `;
            });
        }

        // Show empty state if no URLs found
        if (summary.total === 0) {
            this.categoriesContainer.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 3rem; margin-bottom: 15px;">🔍</div>
                    <h4>No URLs Found</h4>
                    <p>The HTML content doesn't contain any extractable URLs.</p>
                </div>
            `;
        }
    }

    addCategory(title, items, formatter) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-section';

        const urlListHTML = items.map(item => `
            <div class="url-item">
                ${formatter(item)}
            </div>
        `).join('');

        categoryDiv.innerHTML = `
            <div class="category-header">
                <h4>${title}</h4>
                <span class="category-badge">${items.length}</span>
            </div>
            <div class="url-list">
                ${urlListHTML}
            </div>
        `;

        this.categoriesContainer.appendChild(categoryDiv);
    }

    downloadResults() {
        const report = this.analyzer.generateReport();
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `url-analysis-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearAll() {
        this.htmlInput.value = '';
        this.fileInput.value = '';
        this.resultsSection.classList.remove('active');
        this.analyzer.reset();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new UIController();
});
