const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
app.use(cors()); // En producción, luego afinamos CORS con whitelist
app.use(express.json());

// ===== OpenAPI (Swagger) =====
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Mock para Karate',
    version: '1.0.0',
    description: 'API emulada para pruebas automáticas con Karate.'
  },
  servers: [{ url: 'https://TU-URL-PUBLICA', description: 'Prod (Render)' }],
  components: {
    schemas: {
      Registro: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'REG-001' },
          propiedad1: { type: 'string', example: 'valor' },
          propiedad2: { type: 'number', example: 123.45 },
          propiedad3: { type: 'boolean', example: true },
          propiedad4: { type: 'string', format: 'date-time', example: '2025-09-02T12:00:00Z' }
        },
        required: ['id']
      }
    }
  },
  paths: {
    '/api/registro': {
      get: {
        tags: ['Registro'],
        summary: 'Obtiene un registro por usuario',
        parameters: [
          { in: 'query', name: 'usuario', schema: { type: 'string' }, required: true }
        ],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Registro' } } } },
          400: { description: 'Falta parámetro "usuario".' }
        }
      }
    }
  }
};
const swaggerOptions = { definition: swaggerDefinition, apis: [] };
const openapiSpec = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// ===== Endpoint mock =====
app.get('/api/registro', (req, res) => {
  const { usuario } = req.query;
  if (!usuario) return res.status(400).json({ error: 'Debe enviar ?usuario=' });
  const registro = {
    id: 'REG-001',
    propiedad1: `hola-${usuario}`,
    propiedad2: 42,
    propiedad3: true,
    propiedad4: new Date().toISOString()
  };
  return res.json(registro);
});

// ===== Arranque =====
const PORT = process.env.PORT || 3000;
app.get('/', (_req, res) => res.send('OK')); // Healthcheck simple para Render
app.listen(PORT, () => console.log(`Escuchando en puerto ${PORT}`));
