
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Handle image sharing API endpoint - for future implementation with Cloudinary
app.post('/api/share', express.json(), (req, res) => {
  const { baseImage, overlayImage, position, rotation, scale } = req.body;
  
  // In a real implementation, this would:
  // 1. Store the images in Cloudinary if they're not already there
  // 2. Generate a unique ID for this AR configuration
  // 3. Store the configuration in a database
  // 4. Return a shareable URL
  
  const shareId = 'demo-' + Math.random().toString(36).substring(2, 10);
  
  res.json({
    success: true,
    shareUrl: `/view/${shareId}`,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://example.com/view/${shareId}`)}`,
  });
});

// Fallback route for SPA - serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
