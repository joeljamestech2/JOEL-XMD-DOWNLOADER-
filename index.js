const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const pages = path.resolve(path.join(__dirname, 'SRC'));
const visitorsPath = path.join(pages, 'visitors.txt');
let port = parseInt(process.env.PORT) || 8000;

function serr(res, err) {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Server Error\nAn error occurred on the server.');
  console.error(`ERROR: ${err}`);
}

async function serve_html(res, file_name) {
  fs.readFile(path.join(pages, file_name), (err, data) => {
    if (err) return serr(res, err);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
    console.log(`INFO: 200 OK - ${file_name}`);
  });
}

async function serve_img(res, file_name) {
  fs.readFile(path.join(pages, file_name), (err, data) => {
    if (err) return serr(res, err);
    const ext = path.extname(file_name).slice(1);
    res.writeHead(200, { 'Content-Type': `image/${ext}` });
    res.end(data);
    console.log(`INFO: 200 OK - ${file_name}`);
  });
}

const htmlRoutes = {
  "/": "menu.html",
  "/404": "404.html",
  "/app": "app.html",
  "/capcut": "capcut.html",
  "/facebok": "facebok.html",
  "/googledrive": "googledrive.html",
  "/hentai": "hentai.html",
  "/insta": "insta.html",
  "/main": "main.html",
  "/mediafile": "mediafile.html",
  "/menu": "menu.html",
  "/snapchat": "snapchat.html",
  "/support": "support.html",
  "/tiktok": "tiktok.html",
  "/twitter": "twitter.html",
  "/xnx": "xnx.html",
  "/xvideo": "xvideo.html",
  "/youtube": "youtube.html"
};

async function server(req, res) {
  const url = req.url.toLowerCase();
  console.log(`\nINFO: Request - ${req.method} ${url}`);

  // Global visitor counter (file-based)
  if (!fs.existsSync(visitorsPath)) fs.writeFileSync(visitorsPath, "0");
  let count = parseInt(fs.readFileSync(visitorsPath, "utf8")) || 0;
  count++;
  fs.writeFileSync(visitorsPath, count.toString());

  // API to return global count
  if (url === "/api/visitors") {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ count }));
    return;
  }

  // Serve known HTML pages
  if (htmlRoutes[url]) {
    return await serve_html(res, htmlRoutes[url]);
  }

  // Serve image
  if (url === "/owner.jpg") {
    return await serve_img(res, "owner.jpg");
  }

  // Manifest
  if (url === "/site.webmanifest") {
    fs.readFile(path.join(pages, 'site.webmanifest'), (err, data) => {
      if (err) return serr(res, err);
      res.writeHead(200, { 'Content-Type': 'application/manifest+json' });
      res.end(data);
      console.log(`INFO: 200 OK - site.webmanifest`);
    });
    return;
  }

  // Default: 404
  fs.readFile(path.join(pages, '404.html'), (err, data) => {
    if (err) return serr(res, err);
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(data);
    console.error(`WARN: 404 Not Found - ${url}`);
  });
}

if (isNaN(port)) {
  console.warn(`WARNING: Invalid port specified, falling back to 8000`);
  port = 8000;
}

const s = http.createServer(server);
s.listen(port, () => {
  const host = os.hostname();
  console.log(`\n✅ Server running at: http://${host}:${port}`);
  console.log(`📂 Serving from: ${pages}`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  s.close(() => process.exit(0));
});
