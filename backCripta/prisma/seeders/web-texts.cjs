require('dotenv').config();
const mongoose = require('mongoose');

const WebTextSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true },
    section: { type: String, required: true, index: true, trim: true },
    type: { type: String, enum: ['text', 'textarea', 'markdown'], default: 'text' },
    locale: { type: String, required: true, default: 'es', index: true, trim: true },
  },
  { timestamps: true },
);

WebTextSchema.index({ key: 1, locale: 1 }, { unique: true });

const TEXTOS = [
  {
    key: 'home.hero.titlePrefix',
    value: 'Bienvenido',
    section: 'home.hero',
    type: 'text',
  },
  {
    key: 'home.hero.titleSuffix',
    value: 'a La Cripta',
    section: 'home.hero',
    type: 'text',
  },
  {
    key: 'home.hero.subtitle',
    value: 'Asociación sin ánimo de lucro dedicada al ocio alternativo para jóvenes. Juegos de mesa, rol, videojuegos y mucho más.',
    section: 'home.hero',
    type: 'textarea',
  },
  {
    key: 'home.hero.primaryCta',
    value: 'Únete al Club',
    section: 'home.hero',
    type: 'text',
  },
  {
    key: 'home.hero.secondaryCta',
    value: 'Ver Eventos',
    section: 'home.hero',
    type: 'text',
  },
  {
    key: 'home.about.badge',
    value: 'Asociación sin ánimo de lucro',
    section: 'home.about',
    type: 'text',
  },
  {
    key: 'home.about.title',
    value: '¿Quiénes somos?',
    section: 'home.about',
    type: 'text',
  },
  {
    key: 'home.about.body',
    value: 'Llenamos el vacío de ocio alternativo en Puertollano. Un espacio donde los jóvenes conectan, crean y juegan, sin necesidad de salir de su ciudad.',
    section: 'home.about',
    type: 'textarea',
  },
  {
    key: 'home.membership.badge',
    value: 'Membresía',
    section: 'home.membership',
    type: 'text',
  },
  {
    key: 'home.membership.title',
    value: 'Hazte Socio',
    section: 'home.membership',
    type: 'text',
  },
  {
    key: 'home.membership.subtitle',
    value: 'Únete a la comunidad y accede a todo lo que La Cripta de Doge tiene para ofrecerte. Una cuota, infinitas posibilidades.',
    section: 'home.membership',
    type: 'textarea',
  },
  {
    key: 'home.membership.ctaText',
    value: '¿Te interesa? Te enviamos toda la información directamente a tu correo.',
    section: 'home.membership',
    type: 'textarea',
  },
  {
    key: 'home.membership.ctaButton',
    value: 'Quiero ser socio',
    section: 'home.membership',
    type: 'text',
  },
  {
    key: 'home.location.badge',
    value: 'Ubicación',
    section: 'home.location',
    type: 'text',
  },
  {
    key: 'home.location.title',
    value: '¿Dónde encontrarnos?',
    section: 'home.location',
    type: 'text',
  },
  {
    key: 'home.location.subtitle',
    value: 'Estamos en Puertollano, fácilmente accesible para todo el mundo.',
    section: 'home.location',
    type: 'textarea',
  },
  {
    key: 'home.location.addressName',
    value: 'La Cripta de Doge Club',
    section: 'home.location',
    type: 'text',
  },
  {
    key: 'home.location.addressLine1',
    value: 'C/ Abajo, s/n',
    section: 'home.location',
    type: 'text',
  },
  {
    key: 'home.location.addressLine2',
    value: '13500 Puertollano, Ciudad Real',
    section: 'home.location',
    type: 'text',
  },
  {
    key: 'home.sponsors.badge',
    value: 'Patrocinadores',
    section: 'home.sponsors',
    type: 'text',
  },
  {
    key: 'home.sponsors.title',
    value: 'Quienes nos apoyan',
    section: 'home.sponsors',
    type: 'text',
  },
  {
    key: 'home.sponsors.subtitle',
    value: 'Gracias a estas empresas y negocios locales por hacer posible nuestra asociación.',
    section: 'home.sponsors',
    type: 'textarea',
  },
  {
    key: 'home.sponsors.cta',
    value: '¿Quieres patrocinar la asociación?',
    section: 'home.sponsors',
    type: 'text',
  },
  {
    key: 'home.contact.badge',
    value: 'Contacto',
    section: 'home.contact',
    type: 'text',
  },
  {
    key: 'home.contact.title',
    value: '¿Tienes preguntas?',
    section: 'home.contact',
    type: 'text',
  },
  {
    key: 'home.contact.subtitle',
    value: 'Contáctanos a través de cualquiera de nuestros canales o envíanos un mensaje directo.',
    section: 'home.contact',
    type: 'textarea',
  },
  {
    key: 'home.contact.formTitle',
    value: 'Envíanos un mensaje',
    section: 'home.contact',
    type: 'text',
  },
  {
    key: 'home.contact.formSubtitle',
    value: 'Te responderemos lo antes posible',
    section: 'home.contact',
    type: 'text',
  },
  {
    key: 'footer.description',
    value: 'Asociación sin ánimo de lucro dedicada al ocio alternativo para jóvenes en Puertollano.',
    section: 'footer',
    type: 'textarea',
  },
  {
    key: 'footer.contact.location',
    value: 'Puertollano',
    section: 'footer',
    type: 'text',
  },
  {
    key: 'footer.contact.email',
    value: 'info@criptadeldoge.es',
    section: 'footer',
    type: 'text',
  },
  {
    key: 'footer.contact.hours',
    value: 'Lun - Vie 17:00 - 22:00',
    section: 'footer',
    type: 'text',
  },
  {
    key: 'footer.copyright',
    value: '© 2026 La Cripta de Doge Club. Todos los derechos reservados.',
    section: 'footer',
    type: 'text',
  },
];

async function main() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/cripta-db';

  console.log('Iniciando seeder de textos configurables en MongoDB...');
  await mongoose.connect(mongoUrl);

  const WebText = mongoose.model('WebText', WebTextSchema);

  for (const texto of TEXTOS) {
    await WebText.findOneAndUpdate(
      { key: texto.key, locale: 'es' },
      { $setOnInsert: { ...texto, locale: 'es' } },
      { upsert: true, new: true },
    );
    console.log(`  OK ${texto.key}`);
  }

  console.log('Textos configurables sembrados correctamente');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
