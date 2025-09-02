// api/docs.js
const html = (origin) => `<!doctype html>
<html><head>
  <meta charset="utf-8" />
  <title>Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
</head><body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
  <script>
    window.addEventListener('load', () => {
      window.ui = SwaggerUIBundle({
        url: '${origin}/api/openapi.json',
        dom_id: '#swagger-ui'
      });
    });
  </script>
</body></html>`;

export default function handler(req, res) {
  const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html(origin));
}
