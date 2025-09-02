// api/openapi.json.js
export default function handler(req, res) {
  const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;

  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'API Mock para Karate',
      version: '1.0.0',
      description: 'API emulada para pruebas con Karate, desplegada en Vercel.'
    },
    servers: [{ url: origin, description: 'Prod' }],
    paths: {
      '/api/registro': {
        get: {
          tags: ['Registro'],
          summary: 'Obtiene un registro por usuario',
          parameters: [
            { in: 'query', name: 'usuario', schema: { type: 'string' }, required: true, description: 'Identificador del usuario' }
          ],
          responses: {
            200: {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Registro' }
                }
              }
            },
            400: { description: 'Falta parámetro usuario' }
          }
        }
      }
    },
    components: {
      schemas: {
        Registro: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'REG-001' },
            propiedad1: { type: 'string', example: 'hola-diego' },
            propiedad2: { type: 'number', example: 42 },
            propiedad3: { type: 'boolean', example: true },
            propiedad4: { type: 'string', format: 'date-time', example: '2025-09-02T12:00:00Z' }
          },
          required: ['id']
        }
      }
    }
  };

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json(spec);
}
