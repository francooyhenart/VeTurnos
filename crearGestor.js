const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-1-us-west-1.pooler.supabase.com',
  // Es vital incluir el sufijo del usuario que aparece en tu properties
  user: 'postgres.edjsxhzyaoachsivbmyv',
  password: 'OxrLQRGUSqtzIJgZ',
  database: 'postgres',
  port: 6543,
  ssl: { rejectUnauthorized: false } // Indispensable para conectar a Supabase desde fuera
});

async function sanearYCrear() {
  try {
    console.log('🧹 Limpiando registros inválidos de la base de datos...');
    
    // Ejecutamos la corrección
    const res = await pool.query("UPDATE usuarios SET rol = 'GESTOR_VETERINARIOS' WHERE rol = 'ADMIN'");
    
    console.log(`✅ Registros corregidos: ${res.rowCount}`);
    console.log('Todo listo. Ya podés probar la app nuevamente.');

    await pool.end();
  } catch (err) {
    console.error('❌ Error de conexión o ejecución:', err.message);
    await pool.end();
  }
}

sanearYCrear();