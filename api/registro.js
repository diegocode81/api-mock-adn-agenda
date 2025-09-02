// api/registro.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { usuario } = req.query;
  if (!usuario) {
    return res.status(400).json({ error: 'Debe enviar ?usuario=' });
  }

  const registro = {
    id: 'REG-001',
    propiedad1: `hola-${usuario}`,
    propiedad2: 42,
    propiedad3: true,
    propiedad4: new Date().toISOString()
  };

  res.setHeader('Access-Control-Allow-Origin', '*'); // CORS abierto para QA
  return res.status(200).json(registro);
}
