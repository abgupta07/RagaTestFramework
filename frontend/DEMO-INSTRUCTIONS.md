# 🎯 HTML URL Analyzer - Demo Instructions

## Quick Demo Guide

### Step 1: Start the Server
```bash
cd /vercel/sandbox/frontend
python3 -m http.server 9000
```

### Step 2: Open in Browser
Navigate to: `http://localhost:9000/url-analyzer.html`

### Step 3: Try the Tool

#### Option A: Use the Test File
1. Click on the file upload area
2. Select `test-sample.html` from the frontend directory
3. Click "🔍 Analyze URLs"
4. View the comprehensive results!

#### Option B: Paste HTML Content
1. Copy this sample HTML:
```html
<html>
<head>
  <link rel="stylesheet" href="https://cdn.example.com/styles.css">
  <script src="https://cdn.example.com/app.js"></script>
</head>
<body>
  <a href="https://example.com">Visit Example</a>
  <img src="https://example.com/logo.png" alt="Logo">
  <img srcset="small.jpg 480w, large.jpg 1200w" alt="Responsive">
  <iframe src="https://youtube.com/embed/video"></iframe>
  <video src="https://example.com/video.mp4"></video>
  <audio src="https://example.com/audio.mp3"></audio>
  <div data-src="https://example.com/lazy.jpg"></div>
</body>
</html>
```

2. Paste it into the textarea
3. Click "🔍 Analyze URLs"
4. See the magic happen!

### Step 4: Explore Results

You'll see:
- **Statistics Dashboard** with colorful cards showing counts
- **Categorized Lists** for each URL type:
  - 🔗 Hyperlinks
  - 🖼️ Images
  - 📜 JavaScript Files
  - 🎨 Stylesheets
  - 🖥️ iFrames
  - 🎥 Videos
  - 🔊 Audios
  - 📊 Data Attributes
  - 👻 Shadow DOM URLs

### Step 5: Download Results
Click the "💾 Download Results as Text File" button to get a formatted report!

## 🎨 What to Look For

### Beautiful UI Elements
- Gradient purple background
- Smooth hover animations
- Color-coded type labels
- Responsive grid layout
- Custom scrollbars

### Detailed Information
Each URL shows:
- The actual URL/path
- Type label (src, srcset, anchor, etc.)
- Metadata (alt text, titles, media queries)
- Shadow DOM indicators (if applicable)

### Export Format
The downloaded text file includes:
- Header with timestamp
- Summary statistics
- Detailed categorized listings
- Clean, readable formatting

## 🧪 Test Scenarios

### Test 1: Basic HTML
Paste simple HTML with a few links and images.
**Expected**: Quick analysis with accurate counts.

### Test 2: Complex HTML
Use the provided `test-sample.html` file.
**Expected**: All 9 URL categories populated with correct data.

### Test 3: Responsive Images
Include `srcset` attributes.
**Expected**: Multiple image entries from single `<img>` tag.

### Test 4: CSS @import
Add `<style>@import url('...')</style>`.
**Expected**: Stylesheet detected with "import" label.

### Test 5: Data Attributes
Use `data-src`, `data-url`, etc.
**Expected**: Separate "Data Attributes" category populated.

### Test 6: Empty HTML
Paste minimal HTML with no URLs.
**Expected**: "No URLs Found" message with search icon.

## 📊 Expected Results (test-sample.html)

When analyzing the provided test file, you should see:

| Category | Count | Examples |
|----------|-------|----------|
| Total URLs | 40+ | All combined |
| Hyperlinks | 7 | example.com, blog links, map areas |
| Images | 8+ | Hero images, responsive images, srcset |
| Scripts | 4 | jQuery, app.js, analytics, bootstrap |
| Stylesheets | 3 | main.css, fonts, @import |
| iFrames | 2 | YouTube, Google Maps |
| Videos | 4 | MP4, WebM, OGG sources |
| Audios | 4 | MP3, OGG, WAV sources |
| Data Attributes | 5 | lazy-load, data-url, data-href |

## 🎯 Key Features to Demonstrate

1. **Drag & Drop**: Drag an HTML file onto the upload area
2. **File Upload**: Click to browse and select a file
3. **Paste Content**: Copy/paste HTML directly
4. **Real-time Analysis**: See loading spinner during processing
5. **Categorization**: URLs organized by type
6. **Metadata Display**: Alt text, titles, media queries shown
7. **Scrollable Lists**: Each category scrolls independently
8. **Download Export**: Get formatted text report
9. **Clear Function**: Reset and start over
10. **Responsive Design**: Resize browser to see responsive layout

## 💡 Pro Tips

- **Large Files**: The tool handles large HTML files efficiently
- **Malformed HTML**: Parser handles errors gracefully
- **Relative URLs**: Both relative and absolute URLs are captured
- **Data URLs**: Base64 data URLs are included
- **No Server Needed**: Can run directly from file:// protocol
- **Privacy**: All processing happens in your browser

## 🐛 Troubleshooting

**Issue**: No results showing
**Solution**: Check browser console for errors, ensure HTML is valid

**Issue**: Some URLs missing
**Solution**: Verify the HTML contains the expected tags and attributes

**Issue**: Download not working
**Solution**: Check browser download settings and permissions

**Issue**: Styling looks broken
**Solution**: Ensure Bootstrap CDN is accessible or use local server

## 🎉 Success Indicators

✅ Statistics cards display with correct counts  
✅ Each category shows relevant URLs  
✅ Type labels are color-coded  
✅ Metadata is displayed correctly  
✅ Download generates a text file  
✅ UI is responsive and smooth  
✅ No console errors  

## 📸 Screenshot Checklist

When demonstrating, capture:
1. Initial landing page with upload area
2. Filled textarea with HTML content
3. Statistics dashboard with counts
4. Categorized results with scrollable lists
5. Downloaded text file content
6. Mobile responsive view

---

**Ready to Demo!** 🚀

Start the server and open the tool to see it in action!
