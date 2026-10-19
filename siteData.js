/* ==========================================================================
   siteData.js — ÚNICO lugar para editar datos de la Fundación CJNH
   --------------------------------------------------------------------------
   Aquí viven: nombre, contacto, horario, enlaces, cifras, junta directiva,
   aliados y la campaña de Donorbox. Los textos largos (misión, visión,
   historia, cómo trabajamos) están en index.html. script.js llena la página
   con los datos de este archivo.

   Convenciones:
   - "PENDIENTE" marca un dato que la fundación aún no ha entregado.
     Mientras esté vacío ("" o null), la web pública NO muestra datos falsos:
     oculta el elemento o muestra "próximamente".
   - No escribir aquí nombres, edades, escuelas ni datos de personas menores
     de edad beneficiarias. Nunca.
   ========================================================================== */

const SITE_DATA = {

  /* ------------------------------------------------------------------------
     DONACIONES — Donorbox (campaña activa)
     `campaign` es el identificador de la campaña (lo que va en
     <dbox-widget campaign="...">). Donorbox gestiona el formulario y el pago;
     este sitio no recoge datos de pago.
     `campaignUrl` es la página pública de la misma campaña (enlace alterno
     por si el formulario no carga, por ejemplo con un bloqueador de anuncios).
     `autoScroll` replica enable-auto-scroll del código oficial. Si al usar el
     formulario la página "salta" de forma molesta, ponerlo en false.
     ------------------------------------------------------------------------ */
  donorbox: {
    campaign: "fundacion-club-de-jovenes-y-ninos-horizontes",
    campaignUrl: "https://donorbox.org/fundacion-club-de-jovenes-y-ninos-horizontes",
    autoScroll: true
  },

  /* ------------------------------------------------------------------------
     INSTITUCIÓN
     ------------------------------------------------------------------------ */
  org: {
    name: "Fundación Club de Jóvenes y Niños Horizontes",
    acronym: "CJNH",
    foundedYear: 2017,
    foundedDateText: "7 de marzo de 2017",

    // Se muestra tal cual. No es una dirección residencial: solo barrio y cantón.
    locationText: "Barrio Lourdes, San Rafael de Alajuela, Costa Rica",
    coordinatesText: "9°58'32.4\"N 84°13'13.8\"W",
    mapsUrl: "https://maps.app.goo.gl/wxN7BGicX7xFHJ998",

    scheduleText: "Todos los sábados, de 1:00 p. m. a 3:00 p. m.",
    visitNote: "Para visitarnos, escríbenos antes por WhatsApp y coordinamos.",

    // Cédula jurídica de la fundación (publicación autorizada).
    legalId: "3-006-796468",

    // Fundador (publicación autorizada). Nombre completo según la carta institucional;
    // la grafía "Jeffrey" es la que indicó la fundación para el sitio.
    founderText: "Jeffrey Robles Pérez, fundador de la fundación",
    founderName: "Jeffrey Robles Pérez",

    // Lema institucional (indicado por la fundación, oct. 2026).
    motto: "“Permítete ser una explosión de color.”",

    // Correo oficial. Confirmado: Jeffrey también atiende este canal, por eso se muestra.
    email: "cjnh17@gmail.com"
  },

  /* ------------------------------------------------------------------------
     CONTACTO PÚBLICO — Jeffrey (llamada o WhatsApp) y el correo oficial,
     que Jeffrey también atiende.
     `phone` va sin guiones ni espacios; `display` es lo que se ve en pantalla.
     Los números de otras personas se retiraron del sitio por indicación.
     El número es un enlace tel: (oct. 2026: se pidió que sea funcional en el
     celular; solo abre el marcador al tocarlo) y tiene un botón para copiarlo.
     WhatsApp abre un chat con un mensaje sin enviar y el correo abre un
     borrador, solo cuando la persona pulsa.
     ------------------------------------------------------------------------ */
  countryCode: "506", // Costa Rica (+506)
  contacts: [
    { name: "Jeffrey Robles Pérez", role: "Fundador", phone: "88213539", display: "8821-3539" }
  ],

  // Mensajes que se escriben de antemano al abrir WhatsApp.
  messages: {
    generalWhatsApp: "Hola, quisiera información sobre la Fundación CJNH.",
    volunteerWhatsApp: "Hola, me interesa participar como voluntario/a en la Fundación CJNH.",
    volunteerEmailSubject: "Quiero participar como voluntario/a en CJNH",
    volunteerEmailBody: "Hola, me interesa participar. Les comparto mi nombre y la modalidad que me interesa (voluntariado, TCU, TCC o práctica profesional):",
    photoRequestWhatsApp: "Hola, quisiera solicitar el retiro de una fotografía publicada en el sitio de la Fundación CJNH."
  },

  /* ------------------------------------------------------------------------
     REDES SOCIALES  ← ÚNICO LUGAR donde se pegan los enlaces
     Pega la URL oficial entre las comillas de cada red, por ejemplo:
       { label: "Instagram", url: "https://www.instagram.com/usuario_oficial" }
     • url vacía ("")  → esa red NO aparece en la página.
     • Si las tres están vacías, el bloque completo permanece oculto.
     • Para quitar una red, deja su url en "". No hace falta tocar nada más.
     Solo se aceptan URLs https:// del dominio de cada red
     (instagram.com, facebook.com / fb.com, tiktok.com).
     ------------------------------------------------------------------------ */
  socials: [
    { label: "Instagram", url: "" },   // ← pegar aquí la URL de Instagram
    { label: "Facebook",  url: "" },   // ← pegar aquí la URL de Facebook
    { label: "TikTok",    url: "" }    // ← pegar aquí la URL de TikTok
  ],

  /* ------------------------------------------------------------------------
     LOGO
     PENDIENTE: la fundación entregará el archivo (autorizó su uso).
     Cuando llegue, guardarlo en assets/ y escribir la ruta, por ejemplo:
       src: "assets/logo-cjnh.svg"   (o .png)
     Mientras `src` sea "", se muestra un rótulo de texto provisional "CJNH".
     ------------------------------------------------------------------------ */
  logo: {
    src: "assets/logo-cjnh.png",
    alt: "Logo de la Fundación Club de Jóvenes y Niños Horizontes (CJNH)"
  },

  /* ------------------------------------------------------------------------
     ACTIVIDADES, PROGRAMAS, GRUPOS Y "POR QUÉ LO HACEMOS"
     Sus textos explicativos están directamente en index.html (secciones
     "Cómo trabajamos" y "Qué hacemos") para poder leerse aunque falle JavaScript.
     Aquí solo se configuran los LOGOS de cada grupo, que la fundación entregará.
     PENDIENTE: logos de MiniKids, Kids, Legión y Clan. Mientras la ruta esté
     vacía no se muestra nada. Cuando lleguen, guardarlos en assets/grupos/ y escribir:
       kids: { src: "assets/grupos/kids.svg", alt: "Logo del grupo Kids" }
     ------------------------------------------------------------------------ */
  groupLogos: {
    minikids: { src: "", alt: "Logo del grupo MiniKids" },
    kids:     { src: "", alt: "Logo del grupo Kids" },
    legion:   { src: "", alt: "Logo del grupo Legión" },
    clan:     { src: "", alt: "Logo del grupo Clan" }
  },

  /* ------------------------------------------------------------------------
     IMPACTO (cifras definidas por la fundación)
     - Actualizadas en oct. 2026 con los datos nuevos entregados (2.890+, 190+,
       485+, 45+ y 330+). Reemplazan a 3.000+, 200+, 500+, 40+ y 300+.
     - `headline` es el dato principal (acumulado desde 2017).
     - `secondary` son cifras de documentos institucionales. NO se suman al
       total de `headline` ni entre sí: miden poblaciones y periodos distintos.
     - Meta institucional: 50 % de la población menor de edad de Costa Rica
       (redacción indicada en oct. 2026; antes decía "de San Rafael de Alajuela").
       Es una META, no un resultado alcanzado. Las metas de 80 % o 100 % de
       documentos antiguos NO están vigentes: no agregarlas.
     ------------------------------------------------------------------------ */
  impact: {
    headline: {
      value: "2.890+",
      sentence: "Desde 2017, más de 2.890 personas han sido alcanzadas directa o indirectamente por el trabajo de la fundación, incluidas familias y comunidades.",
      measures: "Personas alcanzadas por el trabajo de la fundación, de forma directa e indirecta, incluidas familias y comunidades.",
      period: "Acumulado desde 2017",
      why: "Muestra el alcance de casi diez años de trabajo comunitario.",
      note: "Cifra reportada por la fundación. No es un dato anual ni auditado externamente."
    },
    secondaryNote: "Cifras documentadas institucionalmente por la fundación. No se suman entre sí ni al total anterior, y algunas no indican fecha de corte.",
    secondary: [
      {
        value: "190+",
        label: "niñas, niños y jóvenes vinculados a la fundación",
        period: "Dato de un documento institucional, sin fecha de corte indicada",
        why: "Da una idea del tamaño de la comunidad que forma parte de CJNH."
      },
      {
        value: "485+",
        label: "personas menores de edad alcanzadas",
        period: "Acumulado desde 2017",
        why: "Refleja cuántas vidas jóvenes ha acompañado la fundación a lo largo de su camino."
      },
      {
        value: "45+",
        label: "jóvenes alcanzados mediante campamentos",
        period: "Dato documentado; no indica si es por edición o acumulado",
        why: "El campamento fortalece las habilidades blandas, la escucha y la toma de acción."
      },
      {
        value: "330+",
        label: "personas menores de edad alcanzadas en actividades navideñas",
        period: "Acumulado; sin fecha de corte indicada",
        why: "Las campañas navideñas llegan también a otros espacios en vulnerabilidad social."
      }
    ],
    goal: {
      value: "50 %",
      text: "Beneficiar directa o indirectamente al menos al 50 % de la población menor de edad de Costa Rica.",
      note: "Es una meta institucional hacia la que trabajamos, no un resultado ya alcanzado."
    }
  },

  /* ------------------------------------------------------------------------
     GALERÍA DE ACTIVIDADES
     La fundación indicó (7 oct 2026) que cuenta con los permisos de los
     responsables para publicar fotos de participantes en actividades y
     reuniones del grupo. Por eso `consentConfirmed` está en true.
     La sección permanece OCULTA mientras `items` esté vacío.
     Las fotos nuevas pueden guardarse en assets/galeria/ y agregarse al FINAL de `items` (si la foto es vertical, añadir `tall: true`).
     REGLA: una foto no se repite en ninguna parte de la página (ni en carruseles, ni en Campamentos, ni en Donaciones).
     Se ven en cuadrícula y se amplían al tocarlas.

     Para agregar una foto:
       { src: "assets/galeria/actividad-01.jpg",
         alt: "Descripción de la escena, SIN nombres (ej.: Grupo de participantes en una siembra de árboles)",
         caption: "Texto opcional, SIN nombres ni datos identificables" }

     Reglas (ver README): nunca nombres en alt, caption ni nombre del archivo;
     solo fotos de actividades grupales; quitar la ubicación (GPS) de la foto
     antes de subirla; conservar las autorizaciones firmadas fuera del sitio.
     Si algún responsable pide retirar una imagen, borrarla de `assets/galeria/`
     y de esta lista.
     ------------------------------------------------------------------------ */
  gallery: {
    consentConfirmed: true,
    pageSize: 9,   // fotos visibles al inicio; el resto aparece con el botón "Ver más fotos"
    items: [
      { src: "assets/galeria/momentos-picnic-arboles.jpg",
        alt: "Grupo de jóvenes sentados y recostados sobre una manta en un parque con árboles grandes, conversando y compartiendo",
        caption: "Una tarde de convivencia bajo los árboles." },
      { src: "assets/galeria/momentos-selfi-grupo.jpg", tall: true,
        alt: "Selfi de un grupo numeroso de jóvenes sonriendo juntos",
        caption: "Una selfi de grupo, con muchas sonrisas." },
      { src: "assets/galeria/momentos-camisetas-cjnh.jpg",
        alt: "Dos mujeres sonrientes abrazadas, con camisetas grises con el logo de CJNH, bajo un árbol",
        caption: "Dos integrantes del equipo con la camiseta de la fundación." },
      { src: "assets/galeria/momentos-selfi-amigas.jpg", tall: true,
        alt: "Selfi de cuatro jóvenes sonrientes al aire libre, bajo un árbol",
        caption: "Amistad y buen ánimo al aire libre." },
      { src: "assets/galeria/momentos-piramide.jpg",
        alt: "Jóvenes formando una pirámide humana sobre una cancha de césped sintético",
        caption: "Una pirámide humana en la cancha." }
    ],
    noticeBefore: "Las fotografías se publican con autorización de los responsables de cada participante. Si deseas que retiremos una imagen, escríbenos por WhatsApp a "
  },

  /* Campamentos: misma estructura que `gallery` (sección "Campamentos"). Se oculta si `items` está vacío. */
  camps: {
    consentConfirmed: true,
    pageSize: 9,
    items: [
      { src: "assets/campamentos/campamento-banner-grupo.jpg",
        alt: "Foto grupal numerosa al aire libre, con un banner de la fundación al frente y montañas verdes al fondo",
        caption: "Participantes de un campamento con el banner de la fundación." },
      { src: "assets/campamentos/campamento-paracaidas.jpg",
        alt: "Niñas y niños jugando con un paracaídas de colores sobre el césped, bajo los árboles",
        caption: "Juego con paracaídas de colores." },
      { src: "assets/campamentos/campamento-certificados.jpg",
        alt: "Grupo de niñas, niños y jóvenes sosteniendo certificados frente a una manta naranja decorada con huellas de manos",
        caption: "Participantes con sus certificados, frente a una manta con huellas de manos." },
      { src: "assets/campamentos/campamento-noche-luces.jpg", tall: true,
        alt: "Un grupo de jóvenes con gafas y collares luminosos, de noche, posando divertidos",
        caption: "Noche de campamento con luces y collares de colores." },
      { src: "assets/campamentos/campamento-noche-selfi.jpg", tall: true,
        alt: "Tres jóvenes se toman una selfi de noche, con gafas y anillos luminosos",
        caption: "Jóvenes en una noche de fiesta con luces de colores." }
    ],
    noticeBefore: "Las fotografías se publican con autorización de los responsables de cada participante. Si deseas que retiremos una imagen, escríbenos por WhatsApp a "
  },


  /* ------------------------------------------------------------------------
     JUNTA DIRECTIVA — cinco espacios
     PENDIENTE: nombres públicos completos, cargos y retratos autorizados.
     Para activar una tarjeta hay que completar TODO esto:
       name:  "Nombre y apellidos públicos"
       role:  "Cargo"
       photo: "assets/junta/directivo-1.jpg"   (foto real entregada)
       photoAuthorized: true   ← solo cuando la persona autorizó publicar su retrato
     Mientras falte algo, la tarjeta se muestra discretamente como
     “Información próximamente” (o se oculta si showIncompleteCards es false).
     ------------------------------------------------------------------------ */
  board: {
    showIncompleteCards: true,
    members: [
      { name: "Ilsy Janira Rodríguez Moncada", role: "Directora de Promoción", area: "Promotora social y trabajadora social", career: "Estudiante de Contaduría Pública", photo: "", photoAuthorized: false },  // Directivo/a 1 (tarjeta celeste) — retrato PENDIENTE (oct. 2026: se retiró; las fotos no se veían bien)
      { name: "", role: "", photo: "", photoAuthorized: false },  // Directivo/a 2 — PENDIENTE
      { name: "Andrea Poveda", role: "Dirección General", area: "Trabajadora social y coordinadora de equipo", career: "Licenciatura en Trabajo Social con énfasis en Intervención Terapéutica", photo: "", photoAuthorized: false },  // Directivo/a 3 (tarjeta verde) — retrato PENDIENTE
      { name: "Jeffrey Robles Pérez", role: "Fundador y Dirección General", area: "Representante legal", career: "Administrador de empresas y paramédico", photo: "", photoAuthorized: false },  // Directivo/a 4 (tarjeta azul) — retrato PENDIENTE
      { name: "", role: "", photo: "", photoAuthorized: false }   // Directivo/a 5 — PENDIENTE
    ]
  },

  /* ------------------------------------------------------------------------
     ALIADOS
     PENDIENTE de confirmación por la fundación. La sección permanece OCULTA
     mientras `confirmed` sea false o `items` esté vacío.
     Para cada aliado hace falta (ver README):
       name:        nombre oficial de la institución u organización
       logo:        "assets/aliados/nombre.svg" (o .png) — logo entregado por el aliado
       url:         sitio web oficial (opcional)
       description: una frase sobre la colaboración, sin datos de menores (opcional)
       authorized:  true solo si el aliado autorizó mostrar su nombre y logo
     ------------------------------------------------------------------------ */
  allies: {
    confirmed: false,
    items: [
      // { name: "", logo: "", url: "", description: "", authorized: false }
    ]
  },

  /* ------------------------------------------------------------------------
     VOLUNTARIADO
     ------------------------------------------------------------------------ */
  volunteer: {
    // Regla confirmada: 18 años o más para el voluntariado general; el TCC es la
    // única excepción en la que pueden participar personas menores de edad.
    minAgeText: "Para el voluntariado general se requiere tener 18 años o más. La única excepción es el TCC (Trabajo Comunal Colegial), en el que sí pueden participar personas menores de edad.",
    // Las cinco primeras son las áreas documentadas. Las siguientes se agregaron en
    // oct. 2026 a solicitud del equipo, a partir de actividades reales de la fundación.
    areas: [
      "Social",
      "Psicológico",
      "Educativo",
      "Orientativo",
      "Ambiental",
      "Artístico y cultural",
      "Recreativo y deportivo",
      "Idiomas",
      "Comunicación y diseño",
      "Eventos y campañas navideñas"
    ],
    // PROPUESTAS de nuevas áreas de colaboración, basadas en actividades reales de la fundación.
    // NO se muestran en el sitio: solo se publican cuando la fundación las apruebe
    // (entonces pasarían a la lista `areas` de arriba).
    proposedAreas: [
      "Apoyo en las actividades navideñas y en las campañas de recolección de regalos",
      "Acompañamiento en giras educativas y ambientales",
      "Siembra de árboles y limpieza comunitaria",
      "Clases de inglés y talleres artísticos",
      "Apoyo logístico en el aniversario y en el Festival “Todos Somos Familia”"
    ],
    academic: [
      { title: "TCU", text: "Trabajo Comunal Universitario." },
      { title: "TCC", text: "Trabajo Comunal Colegial. Es la única modalidad en la que pueden participar personas menores de edad." },
      { title: "Prácticas profesionales", text: "La fundación también recibe personas que realizan su práctica profesional." }
    ]
  },

  /* ------------------------------------------------------------------------
     DONACIONES — texto de transparencia
     ------------------------------------------------------------------------ */
  donation: {
    feesNote: "El pago se procesa en Donorbox, una plataforma externa. Donorbox y su procesador de pagos pueden aplicar cargos; revisa sus tarifas y términos antes de donar."
  },

  /* ------------------------------------------------------------------------
     PRIVACIDAD (aviso breve del pie de página)
     ------------------------------------------------------------------------ */
  privacyText: "Este sitio no usa analítica ni cookies de seguimiento propias. El formulario de donación lo ofrece Donorbox, un servicio externo con sus propias políticas y cookies. Si eliges el modo oscuro o claro, tu navegador guarda esa preferencia en tu dispositivo; no se envía a ningún lado. Si nos llamas o escribes por WhatsApp, usaremos tus datos solo para responderte. Las fotografías de actividades se publican solo con autorización de los responsables de cada participante. No publicamos nombres, edades, escuelas, direcciones ni historias identificables de niñas, niños y jóvenes."
};
