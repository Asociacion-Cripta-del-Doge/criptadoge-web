require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Iniciando el seeder de socios de prueba en La Cripta...');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  const hashedUserPass = await bcrypt.hash('1234', 10);

  const mockMembers = [
    {
      dni: '11111111B',
      name: 'Alex Gamer',
      email: 'alex@ejemplo.com',
      password: hashedUserPass,
      role: 'MEMBER',
      status: 'Activo',
      lastRenewal: '2024-01-15',
      expirationDate: '2025-01-15',
      coins: 100,
    },
    {
      dni: '22222222C',
      name: 'Laura Friki',
      email: 'laura@ejemplo.com',
      password: hashedUserPass,
      role: 'MEMBER',
      status: 'Pendiente',
      lastRenewal: null,
      expirationDate: null,
      coins: 100,
    },
    {
      dni: '33333333D',
      name: 'Carlos Rolero',
      email: 'carlos@ejemplo.com',
      password: hashedUserPass,
      role: 'MEMBER',
      status: 'Inactivo',
      lastRenewal: '2022-05-10',
      expirationDate: '2023-05-10',
      coins: 100,
    },
  ];

  for (const member of mockMembers) {
    await prisma.user.upsert({
      where: { email: member.email },
      update: member,
      create: member,
    });
    console.log(`Socio creado o actualizado: ${member.name} (${member.status})`);
  }

  console.log('Todos los socios de prueba han sido plantados con exito');

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error('Error inyectando los socios:', e.message || e);
  process.exit(1);
});
