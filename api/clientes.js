// api/clientes.js
// Mock para 2 analistas de negocio con paginación y categorías

// === Configuración de usuarios (ADN) válidos ===
const ANALISTAS = ['adn1', 'adn2'];

// Generador determinístico de clientes por usuario
function generarClientes(usuario) {
  // 24 registros por usuario para probar paginación
  const nombresBase = [
    'Zoe Álvarez', 'Yolanda Pérez', 'Ximena Jara', 'William García', 'Valeria Mora',
    'Ulises Torres', 'Tomás López', 'Sofía Castillo', 'Rubén Delgado', 'Raúl Ibarra',
    'Quito Maldonado', 'Pablo Naranjo', 'Olivia Villacís', 'Nicolás Bravo', 'María Zamora',
    'Lucía Vega', 'Karina Paredes', 'Jorge Ortiz', 'Isabela Cedeño', 'Hugo Herrera',
    'Gabriela Vinueza', 'Fernando Paz', 'Esteban Reinoso', 'Daniela Cárdenas'
  ];

  // Distribuciones de ejemplo para cubrir los CA:
  // - estadoCliente: vigente | inactivo | prospecto
  // - campanaActiva: true/false (Estado "con campaña"/"sin campaña")
  // - nuevoProspecto: true si es prospecto con campaña (CA3)
  // - riesgo: bajo|medio|alto (repartido)
  // - numOfertas: 0..5
  // - updatedAt: ahora (CA5)

  const riesgos = ['bajo', 'medio', 'alto'];
  const estados = ['vigente', 'inactivo', 'prospecto'];

  const seed = usuario === 'adn1' ? 17 : 29; // pequeños cambios por usuario
  const clientes = nombresBase.map((nombre, idx) => {
    const r = riesgos[(idx + seed) % riesgos.length];
    const estadoCliente = estados[(idx + seed * 2) % estados.length];
    const campanaActiva = ((idx + seed * 3) % 2) === 0; // alterna
    const nuevoProspecto = estadoCliente === 'prospecto' && campanaActiva;
    const numOfertas = ((idx + seed) % 6); // 0..5

    return {
      nombre,
      riesgo: r,                                  // 'bajo' | 'medio' | 'alto'
      estado: campanaActiva ? 'con campaña' : 'sin campaña', // solicitado
      estadoCliente,                              // 'vigente' | 'inactivo' | 'prospecto'
      numeroOfertas: numOfertas,                  // solicitado (# de ofertas)
      campanaActiva,                              // boolean de apoyo
      nuevoProspecto,                             // para CA3
      updatedAt: new Date().toISOString()         // CA5: dato reciente
    };
  });

  // Orden alfabético DESCENDENTE por nombre (solicitado)
  clientes.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es', { sensitivity: 'base' }));
  return clientes;
}

// Helper de paginación
function paginate(list, page = 1, pageSize = 10) {
  const p = Math.max(parseInt(page || 1, 10), 1);
  const ps = Math.max(parseInt(pageSize || 10, 10), 1);
  const start = (p - 1) * ps;
  const end = start + ps;
  return {
    page: p,
    pageSize: ps,
    total: list.length,
    items: list.slice(start, end)
  };
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Query params:
  // ?usuario=adn1|adn2  [requerido]
  // ?page=1&pageSize=10 [opcional]
  // ?estadoCliente=vigente|inactivo|prospecto [opcional, para filtrar]
  // ?conCampana=true|false [opcional, para filtrar]
  const { usuario, page, pageSize, estadoCliente, conCampana } = req.query;

  if (!usuario || !ANALISTAS.includes(String(usuario).toLowerCase())) {
    return res.status(400).json({ error: 'Debe enviar ?usuario=adn1|adn2' });
  }
  const data = generarClientes(String(usuario).toLowerCase());

  // Filtros opcionales
  let filtrados = data;
  if (estadoCliente) {
    const e = String(estadoCliente).toLowerCase();
    if (!['vigente', 'inactivo', 'prospecto'].includes(e)) {
      return res.status(400).json({ error: 'estadoCliente inválido. Use vigente|inactivo|prospecto' });
    }
    filtrados = filtrados.filter(c => c.estadoCliente === e);
  }
  if (typeof conCampana !== 'undefined') {
    const bool = String(conCampana).toLowerCase();
    if (!['true', 'false'].includes(bool)) {
      return res.status(400).json({ error: 'conCampana inválido. Use true|false' });
    }
    const flag = bool === 'true';
    filtrados = filtrados.filter(c => c.campanaActiva === flag);
  }

  // Secciones / conteos para CA1, CA2, CA3, CA4, CA6
  const seccion = {
    vigente: filtrados.filter(c => c.estadoCliente === 'vigente'),
    inactivo: filtrados.filter(c => c.estadoCliente === 'inactivo'),
    prospecto: filtrados.filter(c => c.estadoCliente === 'prospecto'),
    prospectoConCampana: filtrados.filter(c => c.estadoCliente === 'prospecto' && c.campanaActiva)
  };

  const categorias = {
    vigente: seccion.vigente.length,
    inactivo: seccion.inactivo.length,
    prospecto: seccion.prospecto.length,
    conCampana: filtrados.filter(c => c.campanaActiva).length,
    sinCampana: filtrados.filter(c => !c.campanaActiva).length,
    prospectoConCampana: seccion.prospectoConCampana.length
  };

  // CA4: “las 5 categorías mencionadas en la HU”
  // Suponemos las siguientes 5 para identificar en un tablero:
  // 1) vigente, 2) inactivo, 3) prospecto, 4) con campaña, 5) sin campaña.
  const categoriasTablero = ['vigente', 'inactivo', 'prospecto', 'conCampana', 'sinCampana'];

  // Mensaje CA6 si alguna categoría no tiene clientes
  const mensajesPorCategoria = {};
  categoriasTablero.forEach(cat => {
    if (categorias[cat] === 0) {
      mensajesPorCategoria[cat] = 'No existen registros disponibles';
    }
  });

  // Paginación sobre el listado combinado (filtrado) principal
  const pageObj = paginate(filtrados, page, pageSize);

  // Solo exponemos en "items" los campos solicitados + estadoCliente para poder agrupar en UI
  const items = pageObj.items.map(c => ({
    nombre: c.nombre,
    riesgo: c.riesgo,                 // bajo | medio | alto
    estado: c.estado,                 // "con campaña" | "sin campaña"
    numeroOfertas: c.numeroOfertas,   // # de ofertas
    estadoCliente: c.estadoCliente    // vigente | inactivo | prospecto (para agrupar)
  }));

  // CORS abierto para QA (ajustable a whitelist si necesitas)
  res.setHeader('Access-Control-Allow-Origin', '*');

  return res.status(200).json({
    usuario,
    page: pageObj.page,
    pageSize: pageObj.pageSize,
    total: pageObj.total,
    categorias,              // contadores por categoría
    mensajesPorCategoria,    // CA6
    secciones: {
      vigente: seccion.vigente.length,
      inactivo: seccion.inactivo.length,
      prospecto: seccion.prospecto.length,
      prospectoConCampana: seccion.prospectoConCampana.length // CA3
    },
    items,                   // listado paginado, ordenado DESC alfabético por nombre
    updatedAt: new Date().toISOString() // CA5
  });
}
