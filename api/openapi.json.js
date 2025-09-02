// api/openapi.json.js
export default function handler(req, res) {
  const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;

  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'API Mock ADN - Bandeja de Clientes',
      version: '1.1.0',
      description: 'Mock para pruebas con Karate. Soporta 2 analistas (adn1, adn2), paginación y categorías.'
    },
    servers: [{ url: origin, description: 'Prod' }],
    paths: {
      '/api/clientes': {
        get: {
          tags: ['Bandeja'],
          summary: 'Obtiene clientes para un analista (ADN) con paginación',
          parameters: [
            { in: 'query', name: 'usuario', required: true, schema: { type: 'string', enum: ['adn1','adn2'] }, description: 'Analista de negocio: adn1 | adn2' },
            { in: 'query', name: 'page', required: false, schema: { type: 'integer', minimum: 1, default: 1 } },
            { in: 'query', name: 'pageSize', required: false, schema: { type: 'integer', minimum: 1, default: 10 } },
            { in: 'query', name: 'estadoCliente', required: false, schema: { type: 'string', enum: ['vigente','inactivo','prospecto'] }, description: 'Filtro opcional por estado del cliente' },
            { in: 'query', name: 'conCampana', required: false, schema: { type: 'boolean' }, description: 'Filtro opcional: true = con campaña; false = sin campaña' }
          ],
          responses: {
            200: {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      usuario: { type: 'string', example: 'adn1' },
                      page: { type: 'integer', example: 1 },
                      pageSize: { type: 'integer', example: 10 },
                      total: { type: 'integer', example: 24 },
                      categorias: {
                        type: 'object',
                        properties: {
                          vigente: { type: 'integer', example: 8 },
                          inactivo: { type: 'integer', example: 8 },
                          prospecto: { type: 'integer', example: 8 },
                          conCampana: { type: 'integer', example: 12 },
                          sinCampana: { type: 'integer', example: 12 },
                          prospectoConCampana: { type: 'integer', example: 4 }
                        }
                      },
                      mensajesPorCategoria: {
                        type: 'object',
                        additionalProperties: { type: 'string', example: 'No existen registros disponibles' }
                      },
                      secciones: {
                        type: 'object',
                        properties: {
                          vigente: { type: 'integer', example: 8 },
                          inactivo: { type: 'integer', example: 8 },
                          prospecto: { type: 'integer', example: 8 },
                          prospectoConCampana: { type: 'integer', example: 4 }
                        }
                      },
                      items: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            nombre: { type: 'string', example: 'Zoe Álvarez' },
                            riesgo: { type: 'string', enum: ['bajo','medio','alto'], example: 'medio' },
                            estado: { type: 'string', enum: ['con campaña','sin campaña'], example: 'con campaña' },
                            numeroOfertas: { type: 'integer', example: 3 },
                            estadoCliente: { type: 'string', enum: ['vigente','inactivo','prospecto'], example: 'vigente' }
                          },
                          required: ['nombre','riesgo','estado','numeroOfertas','estadoCliente']
                        }
                      },
                      updatedAt: { type: 'string', format: 'date-time', example: '2025-09-02T15:10:00Z' }
                    },
                    required: ['usuario','page','pageSize','total','items','updatedAt']
                  }
                }
              }
            },
            400: { description: 'Parámetros inválidos' }
          }
        }
      }
    }
  };

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json(spec);
}
