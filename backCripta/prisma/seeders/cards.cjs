require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const CARDS = [
  { name: 'Doge Entrenador',            rarity: 'COMUN',      dropWeight: 50 },
  { name: 'Doge Hechicero',             rarity: 'COMUN',      dropWeight: 50 },
  { name: 'Doge Guerrero Maker',        rarity: 'COMUN',      dropWeight: 50 },
  { name: 'Doge Destellante',           rarity: 'COMUN',      dropWeight: 50 },
  { name: 'Doge Luchador de Softcombat',rarity: 'COMUN',      dropWeight: 50 },
  { name: 'Doge Minero de Cripto',      rarity: 'RARA',       dropWeight: 20 },
  { name: 'Doge Programador Codi',      rarity: 'RARA',       dropWeight: 20 },
  { name: 'Doge Maestro Retro',         rarity: 'EPICA',      dropWeight: 8  },
  { name: 'Doge Pintor de Miniaturas',  rarity: 'EPICA',      dropWeight: 8  },
  { name: 'Doge Director de Eventos',   rarity: 'LEGENDARIA', dropWeight: 4  },
];

async function main() {
  console.log('Seeding cards...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  for (const card of CARDS) {
    await prisma.card.upsert({
      where: { id: CARDS.indexOf(card) + 1 },
      update: card,
      create: card,
    });
  }

  console.log(`${CARDS.length} cartas creadas/actualizadas.`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
