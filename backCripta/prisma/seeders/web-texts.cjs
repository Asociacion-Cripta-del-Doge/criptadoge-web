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

const WEB_TEXT_DEFAULTS = {
  'nav.brand': 'LA CRIPTA DE DOGE',
  'nav.links.home': 'Inicio',
  'nav.links.events': 'Eventos',
  'nav.links.gallery': 'Galería',
  'nav.links.location': 'Ubicación',
  'nav.links.sponsors': 'Patrocinadores',
  'nav.links.contact': 'Contacto',
  'nav.login': 'Iniciar sesión',
  'nav.membership': 'Membresía',

  'home.hero.titlePrefix': 'Bienvenido',
  'home.hero.titleSuffix': 'a La Cripta',
  'home.hero.subtitle':
    'Asociación sin ánimo de lucro dedicada al ocio alternativo para jóvenes. Juegos de mesa, rol, videojuegos y mucho más.',
  'home.hero.primaryCta': 'Únete al Club',
  'home.hero.secondaryCta': 'Ver Eventos',

  'home.about.badge': 'Asociación sin ánimo de lucro',
  'home.about.title': '¿Quiénes somos?',
  'home.about.body':
    'Llenamos el vacío de ocio alternativo en Puertollano. Un espacio donde los jóvenes conectan, crean y juegan, sin necesidad de salir de su ciudad.',
  'home.about.activitiesTitle': 'Nuestras actividades',
  'home.about.stats.activities': 'Actividades',
  'home.about.stats.nonProfit': 'Sin ánimo de lucro',
  'home.about.stats.location': 'Puertollano',
  'home.about.activities.boardGames': 'Juegos de mesa',
  'home.about.activities.tcg': 'TCG',
  'home.about.activities.roleplay': 'Rol de mesa',
  'home.about.activities.arcade': 'Arcade & Retro',
  'home.about.activities.softcombat': 'Softcombat',
  'home.about.activities.it': 'Informática',
  'home.about.activities.print3d': 'Impresión 3D',
  'home.about.activities.painting': 'Pintado figuras',
  'home.about.pillars.community.title': 'Comunidad',
  'home.about.pillars.community.description':
    'Un punto de encuentro real para la juventud de Puertollano.',
  'home.about.pillars.creativity.title': 'Creatividad',
  'home.about.pillars.creativity.description':
    'Fomentamos habilidades, pensamiento estratégico e imaginación.',
  'home.about.pillars.culture.title': 'Cultura',
  'home.about.pillars.culture.description':
    'Ocio alternativo y enriquecedor al alcance de todos.',

  'home.membership.badge': 'Membresía',
  'home.membership.title': 'Hazte Socio',
  'home.membership.subtitle':
    'Únete a la comunidad y accede a todo lo que La Cripta de Doge tiene para ofrecerte. Una cuota, infinitas posibilidades.',
  'home.membership.ctaText':
    '¿Te interesa? Te enviamos toda la información directamente a tu correo.',
  'home.membership.ctaButton': 'Quiero ser socio',
  'home.membership.benefits.boardGames.title': 'Juegos de Mesa',
  'home.membership.benefits.boardGames.description':
    'Acceso a cientos de juegos modernos, cooperativos y de estrategia para todos los niveles.',
  'home.membership.benefits.tcg.title': 'TCG & Cartas',
  'home.membership.benefits.tcg.description':
    'Torneos y partidas de Pokémon y otros juegos de cartas coleccionables.',
  'home.membership.benefits.roleplay.title': 'Juegos de Rol',
  'home.membership.benefits.roleplay.description':
    'Sesiones inmersivas de rol de mesa con narrativa colaborativa y dungeon masters experimentados.',
  'home.membership.benefits.arcade.title': 'Arcade & Retrogaming',
  'home.membership.benefits.arcade.description':
    'Máquinas arcade originales y consolas retro para revivir los clásicos del videojuego.',
  'home.membership.benefits.softcombat.title': 'Softcombat',
  'home.membership.benefits.softcombat.description':
    'Talleres de esgrima acolchada y eventos de recreación histórica de forma segura y divertida.',
  'home.membership.benefits.creative.title': 'Talleres Creativos',
  'home.membership.benefits.creative.description':
    'Programación, impresión 3D y pintado de figuras guiado por expertos del club.',
  'home.membership.modal.close': 'Cerrar',
  'home.membership.modal.title': '¡Únete a la Cripta!',
  'home.membership.modal.body':
    'Déjanos tu correo y te enviamos toda la información para hacerte socio de la asociación.',
  'home.membership.modal.emailPlaceholder': 'tu@email.com',
  'home.membership.modal.loading': 'Enviando...',
  'home.membership.modal.submit': 'Enviar información',
  'home.membership.modal.successTitle': '¡Correo en camino!',
  'home.membership.modal.successBody':
    'En breve recibirás toda la información en tu bandeja de entrada. ¡Nos vemos en la Cripta!',

  'home.events.titleHighlight': 'Calendario',
  'home.events.titleSuffix': 'de Eventos',
  'home.events.subtitle': 'Descubre todas las actividades que tenemos preparadas para ti',
  'home.events.loading': 'Cargando eventos...',
  'home.events.error': 'No se pudieron cargar los eventos.',
  'home.events.emptySelect': 'Selecciona un día del calendario\npara ver los eventos disponibles',
  'home.events.dayEventsPrefix': 'Eventos del',
  'home.events.emptyDay': 'No hay eventos este día',
  'home.events.emptyCategory': 'de la categoría',
  'home.events.more': 'Ver más →',
  'home.events.modal.close': 'Cerrar',
  'home.events.modal.description': 'Descripción',
  'home.events.modal.date': 'Fecha',
  'home.events.modal.time': 'Hora',
  'home.events.modal.category': 'Categoría',
  'home.events.modal.status': 'Estado',
  'home.events.modal.attendees': 'Asistentes',
  'home.events.modal.join': 'Inscribirse',
  'home.events.emptyValue': 'Vacío',

  'home.location.badge': 'Ubicación',
  'home.location.title': '¿Dónde encontrarnos?',
  'home.location.subtitle': 'Estamos en Puertollano, fácilmente accesible para todo el mundo.',
  'home.location.addressName': 'La Cripta de Doge Club',
  'home.location.addressLine1': 'C/ Abajo, s/n',
  'home.location.addressLine2': '13500 Puertollano, Ciudad Real',
  'home.location.mapTitle': 'Ubicación La Cripta de Doge',
  'home.location.scheduleTitle': 'Horario',
  'home.location.quickContactTitle': 'Contacto Rápido',
  'home.location.phone': '+34 657 53 84 30',
  'home.location.email': 'info@criptadoge.club',
  'home.location.days.monday': 'Lunes',
  'home.location.days.tuesday': 'Martes',
  'home.location.days.wednesday': 'Miércoles',
  'home.location.days.thursday': 'Jueves',
  'home.location.days.friday': 'Viernes',
  'home.location.days.saturday': 'Sábado',
  'home.location.days.sunday': 'Domingo',
  'home.location.hours.weekday': '17:00 - 22:00',
  'home.location.hours.friday': '17:00 - 00:00',
  'home.location.hours.saturday': '11:00 - 00:00',
  'home.location.hours.sunday': '11:00 - 20:00',

  'home.sponsors.badge': 'Patrocinadores',
  'home.sponsors.title': 'Quienes nos apoyan',
  'home.sponsors.subtitle':
    'Gracias a estas empresas y negocios locales por hacer posible nuestra asociación.',
  'home.sponsors.cta': '¿Quieres patrocinar la asociación?',
  'home.sponsors.ctaLink': 'Contáctanos',
  'home.sponsors.tiers.gold': 'Oro',
  'home.sponsors.tiers.silver': 'Plata',
  'home.sponsors.tiers.bronze': 'Bronce',
  'home.sponsors.group.gold': 'Patrocinadores Oro',
  'home.sponsors.group.silver': 'Patrocinadores Plata',
  'home.sponsors.group.bronze': 'Patrocinadores Bronce',
  'home.sponsors.mock.dragon.name': 'Dragón de Papel',
  'home.sponsors.mock.dragon.description': 'Tienda de juegos de rol y coleccionables',
  'home.sponsors.mock.nexo.name': 'Nexo Gaming',
  'home.sponsors.mock.nexo.description': 'Centro de entretenimiento digital',
  'home.sponsors.mock.dungeon.name': 'Cafetería El Dungeon',
  'home.sponsors.mock.dungeon.description': 'Café temático para jugadores',
  'home.sponsors.mock.runica.name': 'Imprenta Rúnica',
  'home.sponsors.mock.runica.description': 'Impresión y diseño gráfico local',
  'home.sponsors.mock.dado.name': 'El Dado Negro',
  'home.sponsors.mock.dado.description': 'Tienda especializada en wargames',
  'home.sponsors.mock.arcana.name': 'Librería Arcana',
  'home.sponsors.mock.arcana.description': 'Libros y novelas fantásticas',
  'home.sponsors.mock.mithril.name': 'Talleres Mithril',
  'home.sponsors.mock.mithril.description': 'Pintura y modelado de miniaturas',
  'home.sponsors.mock.pixel.name': 'Pixel & Pergamino',
  'home.sponsors.mock.pixel.description': 'Diseño web para pequeños negocios',

  'home.contact.badge': 'Contacto',
  'home.contact.title': '¿Tienes preguntas?',
  'home.contact.titlePrefix': '¿Tienes',
  'home.contact.titleHighlight': 'Preguntas',
  'home.contact.subtitle':
    'Contáctanos a través de cualquiera de nuestros canales o envíanos un mensaje directo.',
  'home.contact.formTitle': 'Envíanos un mensaje',
  'home.contact.formSubtitle': 'Te responderemos lo antes posible',
  'home.contact.fields.name': 'Nombre',
  'home.contact.fields.namePlaceholder': 'Tu nombre',
  'home.contact.fields.email': 'Email',
  'home.contact.fields.emailPlaceholder': 'tu@email.com',
  'home.contact.fields.subject': 'Asunto',
  'home.contact.fields.subjectPlaceholder': '¿Sobre qué nos escribes?',
  'home.contact.fields.message': 'Mensaje',
  'home.contact.fields.messagePlaceholder': 'Escribe tu mensaje aquí...',
  'home.contact.submit.idle': 'Enviar Mensaje',
  'home.contact.submit.sending': 'Enviando mensaje...',
  'home.contact.submit.ok': '✓ Mensaje enviado',
  'home.contact.submit.error': '✕ Error al enviar',
  'home.contact.socialTitle': 'Síguenos en Redes',
  'home.contact.socialSubtitle': 'Mantente al día con todas las novedades',
  'home.contact.twitch.live': 'EN VIVO',
  'home.contact.twitch.offline': '⚫ OFFLINE',
  'home.contact.twitch.liveShort': '🔴 LIVE',
  'home.contact.twitch.offlineShort': '⚫ Offline',
  'home.contact.twitch.watchLive': 'Ver Directo',
  'home.contact.twitch.watchChannel': 'Ver Canal',
  'home.contact.instagramTitle': 'Instagram',
  'home.contact.instagramCta': 'Ver Perfil',

  'footer.brand': 'LA CRIPTA DE DOGE',
  'footer.description':
    'Asociación sin ánimo de lucro dedicada al ocio alternativo para jóvenes en Puertollano.',
  'footer.linksTitle': 'Enlaces',
  'footer.links.home': 'Inicio',
  'footer.links.events': 'Eventos',
  'footer.links.about': 'Nosotros',
  'footer.links.membership': 'Únete al club',
  'footer.legalTitle': 'Legal',
  'footer.legal.privacy': 'Política de privacidad',
  'footer.legal.terms': 'Términos y condiciones',
  'footer.legal.cookies': 'Política de cookies',
  'footer.contactTitle': 'Contacto',
  'footer.contact.location': 'Puertollano',
  'footer.contact.email': 'info@criptadeldoge.es',
  'footer.contact.hours': 'Lun - Vie 17:00 - 22:00',
  'footer.copyright': '© 2026 La Cripta de Doge Club. Todos los derechos reservados.',
  'footer.backToTop': 'Volver arriba',

  'auth.backHome': 'Volver al inicio',
  'auth.tabs.login': 'Iniciar sesión',
  'auth.tabs.register': 'Registrarse',
  'auth.title.login': 'INICIAR SESIÓN',
  'auth.title.register': 'CREAR CUENTA',
  'auth.fields.username': 'Nombre de usuario',
  'auth.fields.email': 'tu@email.com',
  'auth.fields.forgotPassword': '¿Olvidaste tu contraseña?',
  'auth.fields.password': 'Contraseña',
  'auth.fields.confirmPassword': 'Confirmar contraseña',
  'auth.submit.loading': 'Cargando...',
  'auth.submit.login': 'Iniciar sesión',
  'auth.submit.register': 'Crear cuenta',
  'auth.divider': 'o continúa con',
  'auth.google': 'Continuar con Google',
  'auth.switch.noAccount': '¿No tienes cuenta?',
  'auth.switch.register': 'Regístrate',
  'auth.switch.hasAccount': '¿Ya tienes cuenta?',
  'auth.switch.login': 'Inicia sesión',
  'auth.errors.passwordMismatch': 'Las contraseñas no coinciden',
  'auth.errors.passwordLength': 'La contraseña debe tener al menos 8 caracteres',
  'auth.errors.invalidCredentials': 'Credenciales incorrectas',
  'auth.errors.createAccount': 'Error al crear la cuenta',
  'auth.errors.connection': 'Error de conexión. Inténtalo de nuevo',
  'auth.success.accountCreated': '¡Cuenta creada! Ya puedes iniciar sesión.',

  'profile.status.active': 'Activo',
  'profile.status.pending': 'Pendiente de activación',
  'profile.status.expired': 'Expirado',
  'profile.status.cancelled': 'Cancelado',
  'profile.errors.nameMin': 'Mínimo 2 caracteres',
  'profile.errors.saveName': 'Error al guardar, inténtalo de nuevo',
  'profile.errors.uploadAvatar': 'Error subiendo avatar',
  'profile.badge.admin': 'ADMIN',
  'profile.stats.events': 'Eventos',
  'profile.stats.memberSince': 'Miembro desde',
  'profile.stats.status': 'Estado',
  'profile.membership.title': 'Membresía',
  'profile.membership.lastPayment': 'Último pago',
  'profile.membership.expiresAt': 'Expira el',
  'profile.membership.expiringSoon': '⚠️ Expira pronto',
  'profile.membership.remainingTime': 'Tiempo restante',
  'profile.membership.becomeMember': 'Hazte miembro',
  'profile.logout.confirm': '¿Estás seguro?',
  'profile.logout.yes': 'Sí, salir',
  'profile.logout.cancel': 'Cancelar',
  'profile.logout.button': 'Cerrar sesión',
};

const TEXTAREA_KEY_PARTS = [
  'body',
  'description',
  'subtitle',
  'ctaText',
  'emptySelect',
  'successBody',
];

function getSection(key) {
  if (key.startsWith('home.')) {
    return key.split('.').slice(0, 2).join('.');
  }

  return key.split('.')[0];
}

function getType(key, value) {
  if (value.includes('\n') || TEXTAREA_KEY_PARTS.some((part) => key.includes(part))) {
    return 'textarea';
  }

  return 'text';
}

const TEXTOS = Object.entries(WEB_TEXT_DEFAULTS).map(([key, value]) => ({
  key,
  value,
  section: getSection(key),
  type: getType(key, value),
}));

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

  console.log(`${TEXTOS.length} textos configurables sembrados correctamente`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
