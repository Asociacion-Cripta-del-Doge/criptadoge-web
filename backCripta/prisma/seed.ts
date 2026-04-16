import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as any);

  await prisma.$connect();

  const email = 'admin@cripta.com';
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log('El usuario admin ya existe, no se crea de nuevo.');
  } else {
    const hashed = await bcrypt.hash('Admin1234!', 10);
    await prisma.user.create({
      data: {
        name: 'Admin',
        email,
        password: hashed,
        role: 'ADMIN',
        status: 'Activo',
      },
    });
    console.log('Usuario admin creado:');
    console.log('  Email:    admin@cripta.com');
    console.log('  Password: Admin1234!');
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
