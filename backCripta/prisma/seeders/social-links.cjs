require('dotenv').config();
const mongoose = require('mongoose');

const SocialLinkSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    handle: { type: String, required: true },
    url:    { type: String, required: true },
    color:  { type: String, required: true },
    icon:   { type: String, required: true },
    orden:  { type: Number, default: 0 },
  },
  { timestamps: true },
);

const REDES = [
  {
    nombre: 'Discord',
    handle: 'La Cripta de Doge',
    url: 'https://discord.gg/lacriptadedoge',
    color: '#5865F2',
    icon: 'discord',
    orden: 1,
  },
  {
    nombre: 'Instagram',
    handle: '@lacriptadedoge',
    url: 'https://www.instagram.com/lacriptadedoge',
    color: '#E1306C',
    icon: 'instagram',
    orden: 2,
  },
  {
    nombre: 'WhatsApp',
    handle: 'Grupo de WhatsApp',
    url: 'https://chat.whatsapp.com/lacriptadedoge',
    color: '#25D366',
    icon: 'whatsapp',
    orden: 3,
  },
  {
    nombre: 'Twitch',
    handle: 'lacriptadedoge',
    url: 'https://www.twitch.tv/lacriptadedoge',
    color: '#9146FF',
    icon: 'twitch',
    orden: 4,
  },
];

async function main() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/cripta-db';

  console.log('Iniciando seeder de redes sociales en MongoDB...');
  await mongoose.connect(mongoUrl);

  const SocialLink = mongoose.model('SocialLink', SocialLinkSchema);

  for (const red of REDES) {
    await SocialLink.findOneAndUpdate(
      { icon: red.icon },
      red,
      { upsert: true, returnDocument: 'after' },
    );
    console.log(`  ✓ ${red.nombre} (${red.handle})`);
  }

  console.log('Redes sociales sembradas correctamente');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
