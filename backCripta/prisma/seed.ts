import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { EventLabelSchema } from '../src/event-labels/schemas/event-label.schema';
import { EventSchema } from '../src/events/schemas/events.schema';

function formatFutureDate(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as any);

  await prisma.$connect();

  const email = 'admin@cripta.com';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD debe estar definido para ejecutar el seeder.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log('El usuario admin ya existe, no se crea de nuevo.');
  } else {
    const hashed = await bcrypt.hash(adminPassword, 10);
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
    console.log('  Password: definida por ADMIN_PASSWORD');
  }

  await seedEvents();

  await prisma.$disconnect();
  await pool.end();
}

async function seedEvents() {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('MONGO_URL debe estar definido para ejecutar el seeder de eventos.');
  }

  await mongoose.connect(mongoUrl);

  const EventLabel =
    mongoose.models.EventLabel || mongoose.model('EventLabel', EventLabelSchema);
  const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

  const labels = [
    { name: 'Torneo', color: '#ef4444' },
    { name: 'Rol', color: '#8b5cf6' },
    { name: 'Comunidad', color: '#22c55e' },
  ];

  for (const label of labels) {
    await EventLabel.updateOne({ name: label.name }, { $set: label }, { upsert: true });
  }

  const events = [
    {
      title: 'Torneo de apertura',
      description: 'Partidas de bienvenida para probar la agenda de eventos.',
      date: formatFutureDate(7),
      time: '18:00',
      label: 'Torneo',
    },
    {
      title: 'Mesa de rol introductoria',
      description: 'Sesion abierta para socios nuevos y veteranos.',
      date: formatFutureDate(14),
      time: '19:30',
      label: 'Rol',
    },
    {
      title: 'Quedada de comunidad',
      description: 'Encuentro mensual para organizar actividades del club.',
      date: formatFutureDate(21),
      time: '17:00',
      label: 'Comunidad',
    },
  ];

  for (const event of events) {
    await Event.updateOne(
      { title: event.title },
      { $set: event, $setOnInsert: { attendees: [] } },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  console.log(`Eventos creados o actualizados: ${events.length}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
