import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const portArg = process.argv.indexOf('--port');
const PORT = Number(portArg >= 0 ? process.argv[portArg + 1] : process.env.PORT || 3000);
const HOST = '0.0.0.0';

// Serve static files from root directory
app.use(express.static(__dirname));

// Graceful fallback for missing assets in assets/
app.get('/assets/:filename', (req, res, next) => {
  const filePath = path.join(__dirname, 'assets', req.params.filename);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }

  const svgAlternative = path.join(__dirname, 'assets', req.params.filename.replace(/\.(webp|png|jpg|jpeg)$/, '.svg'));
  if (fs.existsSync(svgAlternative) && fs.statSync(svgAlternative).isFile()) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.sendFile(svgAlternative);
  }

  const { filename } = req.params;
  if (filename.endsWith('.webp') || filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
    const title = filename.replace(/\.(webp|png|jpg|jpeg)$/, '').replace(/[-_]/g, ' ').toUpperCase();
    const isDark = filename.includes('dark') || filename.includes('wedding') || filename.includes('grad') || filename.includes('camera');
    const bg = isDark ? '#14161b' : '#f0f2f5';
    const fg = isDark ? '#8e96a4' : '#5a6270';
    const accent = isDark ? '#60a5fa' : '#2563eb';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <rect width="100%" height="100%" fill="${bg}"/>
      <g opacity="0.2">
        <circle cx="400" cy="250" r="140" fill="none" stroke="${fg}" stroke-width="2"/>
        <circle cx="400" cy="250" r="90" fill="none" stroke="${fg}" stroke-width="1.5"/>
        <circle cx="400" cy="250" r="40" fill="none" stroke="${fg}" stroke-width="1"/>
        <line x1="200" y1="250" x2="600" y2="250" stroke="${fg}" stroke-width="1" stroke-dasharray="4 4"/>
        <line x1="400" y1="100" x2="400" y2="400" stroke="${fg}" stroke-width="1" stroke-dasharray="4 4"/>
      </g>
      <rect x="360" y="200" width="80" height="55" rx="8" fill="none" stroke="${fg}" stroke-width="3"/>
      <circle cx="400" cy="227" r="15" fill="none" stroke="${fg}" stroke-width="3"/>
      <circle cx="425" cy="212" r="3" fill="${accent}"/>
      <text x="50%" y="315" text-anchor="middle" fill="${fg}" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" letter-spacing="1.5">${title}</text>
      <text x="50%" y="340" text-anchor="middle" fill="${fg}" opacity="0.65" font-family="system-ui, -apple-system, sans-serif" font-size="11" letter-spacing="1">CAUAN VIDEOMAKER &bull; FOTOGRAFIA</text>
    </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(svg);
  }

  if (filename.endsWith('.mp4') || filename.endsWith('.webm')) {
    return res.status(404).send('Video not found');
  }

  next();
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
