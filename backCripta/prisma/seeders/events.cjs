require('dotenv').config();
const mongoose = require('mongoose');

const eventLabelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    color: String,
  },
  { timestamps: true },
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: String, required: true, index: true },
    time: String,
    label: { type: String, required: true },
    status: String,
    attendees: {
      type: [
        {
          userId: { type: String, required: true },
          joinedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

const EventLabel = mongoose.model('EventLabel', eventLabelSchema);
const Event = mongoose.model('Event', eventSchema);

const labels = [
  { name: 'Cartas', color: '#ef4444' },
  { name: 'Rol', color: '#8b5cf6' },
  { name: 'Mesa', color: '#22c55e' },
  { name: 'Taller', color: '#f59e0b' },
];

const events = [
  {
    title: 'Torneo de Magic: The Gathering',
    description: 'Torneo formato Commander con premios para los 3 primeros.',
    date: '2026-06-06',
    time: '17:00',
    label: 'Cartas',
  },
  {
    title: 'Campana de D&D: La Cripta Olvidada',
    description: 'Sesion semanal de Dungeons & Dragons, capitulo 1.',
    date: '2026-06-07',
    time: '16:00',
    label: 'Rol',
  },
  {
    title: 'Tarde de Catan',
    description: 'Partidas abiertas de Catan y expansiones.',
    date: '2026-06-07',
    time: '18:30',
    label: 'Mesa',
  },
  {
    title: 'Torneo Pokemon TCG',
    description: 'Formato estandar. Trae tu mazo y compite por el titulo.',
    date: '2026-06-13',
    time: '11:00',
    label: 'Cartas',
  },
  {
    title: 'One Shot de Vampiro: La Mascarada',
    description: 'Historia autoconclusiva ambientada en Madrid nocturno.',
    date: '2026-06-14',
    time: '17:00',
    label: 'Rol',
  },
  {
    title: 'Noche de Eurogames',
    description: 'Partidas a Wingspan, Brass Birmingham y Terraforming Mars.',
    date: '2026-06-20',
    time: '19:00',
    label: 'Mesa',
  },
  {
    title: 'Taller de pintura de miniaturas',
    description: 'Sesion guiada para imprimar, sombrear y rematar miniaturas.',
    date: '2026-06-21',
    time: '11:30',
    label: 'Taller',
  },
];

async function main() {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('No has definido MONGO_URL en tu archivo .env');
  }

  console.log('Iniciando el seeder de eventos en La Cripta...');

  await mongoose.connect(mongoUrl);

  await EventLabel.deleteMany({});
  await Event.deleteMany({});

  await EventLabel.insertMany(labels);
  await Event.insertMany(events);

  console.log(`Etiquetas creadas: ${labels.length}`);
  console.log(`Eventos creados: ${events.length}`);

  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error('Error inyectando los eventos:', e.message || e);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
