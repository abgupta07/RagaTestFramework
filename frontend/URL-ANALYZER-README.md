# HTML URL Analyzer Tool

A comprehensive, standalone HTML URL extraction tool that analyzes HTML content and extracts all types of URLs including those within Shadow DOM elements.

## 🚀 Features

### Complete URL Extraction
The tool extracts URLs from:

1. **Hyperlinks**
   - `<a>` tags with `href` attributes
   - `<area>` tags (image maps) with `href` attributes

2. **Images**
   - `<img>` tags with `src` attributes
   - `<img>` tags with `srcset` attributes (responsive images)
   - `<picture>` elements with `<source>` tags

3. **JavaScript Files**
   - `<script>` tags with `src` attributes
   - Detects async and defer attributes

4. **Stylesheets**
   - `<link rel="stylesheet">` tags
   - `<link rel="preload" as="style">` tags
   - `@import` statements within `<style>` tags

5. **iFrames**
   - `<iframe>` tags with `src` attributes

6. **Video Sources**
   - `<video>` tags with `src` attributes
   - `<source>` tags within `<video>` elements
   - Poster images from `poster` attributes

7. **Audio Sources**
   - `<audio>` tags with `src` attributes
   - `<source>` tags within `<audio>` elements

8. **Data Attributes**
   - `data-src` (lazy loading)
   - `data-url`
   - `data-href`
   - `data-background`
   - `data-image`

9. **Shadow DOM Detection**
   - Automatically detects Shadow DOM elements
   - Recursively traverses nested Shadow DOMs
   - Extracts all URL types from within shadow roots
   - Clearly labels Shadow DOM URLs in results

### Results Display

- **Statistics Dashboard**: Visual cards showing counts for each URL category
- **Categorized Lists**: URLs organized by type with detailed metadata
- **Scrollable Sections**: Each category has a scrollable list for easy navigation
- **Type Labels**: Color-coded labels indicating the source type of each URL
- **Metadata Display**: Shows relevant information like alt text, titles, media queries, etc.
- **Shadow DOM Indicators**: Special badges for URLs found in Shadow DOM

### Export Functionality

- **Download as Text File**: Export all results as a formatted text report
- **Comprehensive Report**: Includes summary statistics and detailed listings
- **Timestamped**: Each report includes generation date and time

## 📁 Files

- `url-analyzer.html` - Main HTML page with UI
- `url-analyzer.js` - JavaScript logic for URL extraction and UI control
- `test-sample.html` - Sample HTML file for testing

## 🎯 Usage

### Method 1: File Upload
1. Open `url-analyzer.html` in a web browser
2. Click on the file upload area or drag and drop an HTML file
3. Click "Analyze URLs" button
4. View categorized results

### Method 2: Paste HTML
1. Open `url-analyzer.html` in a web browser
2. Paste HTML content into the textarea
3. Click "Analyze URLs" button
4. View categorized results

### Download Results
- Click the "Download Results as Text File" button
- A formatted text file will be downloaded with all extracted URLs

## 🌐 Running Locally

### Using Python HTTP Server
```bash
cd frontend
python3 -m http.server 9000
```
Then open `http://localhost:9000/url-analyzer.html` in your browser.

### Using Node.js HTTP Server
```bash
cd frontend
npx http-server -p 9000
```
Then open `http://localhost:9000/url-analyzer.html` in your browser.

### Direct File Access
Simply open `url-analyzer.html` directly in your web browser (file:// protocol).

## 🧪 Testing

A sample HTML file (`test-sample.html`) is included with various URL types for testing:
- Multiple hyperlinks and area tags
- Images with src and srcset
- JavaScript and CSS files
- iFrames (YouTube, Google Maps)
- Video and audio elements with multiple sources
- Data attributes
- Image maps

## 🎨 UI Features

- **Modern Design**: Gradient backgrounds and smooth animations
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Color-Coded Categories**: Each URL type has distinct visual styling
- **Hover Effects**: Interactive elements with visual feedback
- **Custom Scrollbars**: Styled scrollbars for better aesthetics
- **Loading States**: Visual feedback during analysis

## 📊 Results Format

### Statistics Cards
- Total URLs Found
- Hyperlinks Count
- Images Count
- Scripts Count
- Stylesheets Count
- Shadow DOM URLs Count

### Detailed Categories
Each category shows:
- URL/Path
- Type label (src, srcset, anchor, area, etc.)
- Relevant metadata (alt text, title, media query, etc.)
- Shadow DOM indicator (if applicable)

### Text Export Format
```
═══════════════════════════════════════════════════════
           HTML URL ANALYZER REPORT
═══════════════════════════════════════════════════════

Generated: [Date and Time]
Total URLs Found: [Count]

───────────────────────────────────────────────────────
SUMMARY BY CATEGORY
───────────────────────────────────────────────────────
Hyperlinks:       [Count]
Images:           [Count]
Scripts:          [Count]
Stylesheets:      [Count]
iFrames:          [Count]
Videos:           [Count]
Audios:           [Count]
Data Attributes:  [Count]
Shadow DOM:       [Count]

[Detailed listings for each category...]
```

## 🔧 Technical Details

### URL Validation
- Filters out `javascript:`, `mailto:`, `tel:` protocols
- Accepts `http://`, `https://`, relative URLs, and `data:` URLs
- Ignores empty strings and hash-only anchors (`#`)

### Shadow DOM Detection
- Automatically detects elements with `shadowRoot` property
- Recursively traverses nested Shadow DOMs
- Extracts all URL types from shadow roots
- Maintains separate category for Shadow DOM URLs

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses DOMParser API for HTML parsing
- No external dependencies required

## 🎯 Use Cases

1. **SEO Analysis**: Extract all links and images from a webpage
2. **Asset Inventory**: List all scripts, stylesheets, and media files
3. **Link Checking**: Identify all hyperlinks for validation
4. **Migration Planning**: Catalog all resources before site migration
5. **Security Audit**: Find all external resources loaded by a page
6. **Web Scraping**: Extract URLs for further processing
7. **Documentation**: Generate resource lists for documentation

## 🚫 Limitations

- Shadow DOM detection works only for elements accessible in the parsed HTML
- Dynamic JavaScript-generated content is not analyzed
- URLs generated at runtime are not captured
- Requires valid HTML structure for accurate parsing

## 💡 Tips

- For best results, use the complete HTML source including `<head>` and `<body>` tags
- The tool handles malformed HTML gracefully but may miss some URLs
- Large HTML files are processed efficiently with no size limits
- Use the download feature to save results for later analysis

## 🔒 Privacy

- All processing happens locally in your browser
- No data is sent to any server
- No tracking or analytics
- Completely offline-capable

## 📝 License

This tool is part of the AI Test App project and follows the ISC License.

## 🤝 Contributing

Feel free to enhance the tool by:
- Adding support for more URL types
- Improving Shadow DOM detection
- Adding export formats (JSON, CSV)
- Enhancing the UI/UX

---

**Created**: November 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
