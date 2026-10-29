import path from "node:path";
import fs from "node:fs/promises";
import { projectDirectory } from "../config/env.js";
import { config } from "../config/env.js";
import { executeRead, getPool } from "../database/pool.js";

const legacyFilePath = path.join(projectDirectory, "server", "data", "site-content.json");

class ContentValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

function storedMediaFilename(value) {
  if (typeof value !== "string") return "";
  const mediaPrefix = `${config.mediaRoute}/`;
  return value.startsWith(mediaPrefix) ? value.slice(mediaPrefix.length) : value;
}

function mediaNameForStorage(value) {
  const mediaPrefix = `${config.mediaRoute}/`;
  return typeof value === "string" && value.startsWith(mediaPrefix)
    ? value.slice(mediaPrefix.length)
    : value;
}

function isStoredImage(value) {
  return /^[a-f0-9-]{36}\.(jpg|png|webp|gif|avif)$/i.test(storedMediaFilename(value));
}

function isStoredMedia(value, section) {
  const filename = storedMediaFilename(value);
  const extensionPattern = section === "videos"
    ? /\.(mp4|webm|mov)$/i
    : /\.(jpg|png|webp|gif|avif)$/i;
  return /^[a-f0-9-]{36}\.(jpg|png|webp|gif|avif|mp4|webm|mov)$/i.test(filename) && extensionPattern.test(filename);
}

const defaultContent = {
  settings: {
    heroImage: "photo-1600607687920-4e2a09cf159d",
    heroEyebrow: "BENFICA · LUANDA",
    heroTitle: "Um espaço com a sua marca.",
    heroDescription: "Acabamentos e design de interiores para transformar boas ideias em espaços onde apetece estar.",
    heroCaption: "Espaços pensados para si",
    heroPrimaryButton: "Fale-nos do seu projeto",
    heroSecondaryButton: "Conheça os serviços",
    yearsExperience: "3",
    factsAriaLabel: "Sobre a S.B Luxos",
    factsServiceTitle: "Acabamentos & design",
    factsServiceText: "Uma equipa, várias soluções",
    factsExperienceTitle: "Experiência",
    factsExperienceText: "anos a transformar espaços",
    factsLocationTitle: "Estamos em",
    aboutEyebrow: "SOBRE A S.B LUXOS",
    aboutTitle: "O cuidado está em cada detalhe.",
    aboutDescription: "Somos uma empresa de acabamentos e design de interiores sediada em Benfica. Há três anos ajudamos clientes a dar vida aos seus espaços, com atenção ao detalhe e soluções adequadas a cada projeto.",
    aboutSecondParagraph: "Ouvimos as suas ideias e trabalhamos consigo para encontrar os acabamentos certos — do primeiro toque de tinta ao último detalhe.",
    aboutImage: "photo-1600607687920-4e2a09cf159d",
    aboutImageAlt: "Interior residencial com acabamentos contemporâneos",
    aboutExperienceText: "anos de dedicação a cada projeto",
    aboutButton: "Descubra o que fazemos",
    servicesEyebrow: "OS NOSSOS SERVIÇOS",
    servicesTitle: "Da ideia ao acabamento.",
    servicesDescription: "Uma variedade de soluções para renovar, cuidar e dar personalidade ao seu espaço.",
    servicesCtaText: "Não sabe por onde começar? Ajudamos a encontrar a solução.",
    servicesCtaButton: "Peça um orçamento",
    galleryEyebrow: "UM PONTO DE PARTIDA",
    galleryTitle: "Imagine o que é possível.",
    galleryDescription: "Fotografias dos nossos serviços e trabalhos realizados. A galeria será atualizada com as imagens da equipa.",
    galleryEmptyText: "As fotografias dos nossos trabalhos serão publicadas aqui. Para saber mais, fale connosco.",
    galleryCategoryFallback: "GALERIA S.B LUXOS",
    videoEyebrow: "VÍDEOS",
    videoTitle: "Veja o nosso trabalho.",
    videoDescription: "Conheça mais sobre os nossos serviços e projetos através dos vídeos.",
    videoExternalLabel: "Ver vídeo",
    calloutEyebrow: "O SEU PROJETO, A SUA ESCOLHA",
    calloutTitle: "Vamos dar forma à sua ideia?",
    calloutDescription: "Explique-nos o que pretende. Conversamos consigo e preparamos um orçamento à medida do seu projeto.",
    calloutBulletOne: "Orçamento solicitado pelo WhatsApp",
    calloutBulletTwo: "Serviços para diferentes tipos de espaço",
    calloutButton: "Comece uma conversa",
    calloutImageAlt: "Referência de interior residencial acolhedor",
    calloutImage: "photo-1600210492486-724fe5c67fb0",
    contactEyebrow: "CONTACTE-NOS",
    contactTitle: "O próximo passo começa com uma conversa.",
    contactDescription: "Preencha os seus dados e a mensagem fica pronta para enviar diretamente pelo WhatsApp.",
    contactPhoneLabel: "TELEFONE / WHATSAPP",
    contactAddressLabel: "VISITE-NOS",
    contactHoursLabel: "HORÁRIO DE CONTACTO",
    contactEmailLabel: "E-MAIL",
    mapButton: "Ver localização no mapa",
    formEyebrow: "VAMOS CONVERSAR",
    formTitle: "Peça o seu orçamento",
    formNameLabel: "O seu nome",
    formNamePlaceholder: "Como se chama?",
    formPhoneLabel: "O seu telefone",
    formPhonePlaceholder: "+244 9XX XXX XXX",
    formServiceLabel: "Serviço pretendido",
    formServicePlaceholder: "Escolha um serviço",
    formMessageLabel: "Conte-nos um pouco mais",
    formMessagePlaceholder: "O que gostaria de transformar?",
    formOptionalText: "(opcional)",
    formSuccessText: "A mensagem está pronta. Clique abaixo para continuar no WhatsApp.",
    formSendLabel: "Enviar mensagem no WhatsApp",
    formSubmitLabel: "Preparar pedido no WhatsApp",
    formSubmittingLabel: "A preparar...",
    formPrivacyText: "Os seus dados são usados apenas para responder ao seu pedido.",
    headerCta: "Pedir orçamento",
    headerBrandSubtitle: "ACABAMENTOS & DESIGN",
    brandInitials: "S.B",
    brandName: "LUXOS",
    companyName: "S.B Luxos",
    navHome: "Início",
    navAbout: "Sobre nós",
    navServices: "Serviços",
    navGallery: "Inspiração",
    navContact: "Contacto",
    footerDescription: "Acabamentos e design de interiores.",
    footerLocation: "Benfica, Luanda — Angola.",
    footerCopyright: "Todos os direitos reservados.",
    footerWhatsAppLabel: "WhatsApp",
    floatingWhatsAppLabel: "Fale connosco",
    whatsapp: config.whatsappNumber,
    phone: "+244 947 655 469",
    email: "sbluxoscomercioeservicoso@gmail.com",
    address: "Benfica, Bairro das Tendas, antes da Unidade da Guarda Presidencial",
    openingHours: "Todos os dias, das 05h às 22h",
    mapUrl: "https://maps.google.com/?q=Benfica,+Bairro+das+Tendas,+Luanda",
  },
  services: [
    { id: "pintura", name: "Pintura", detail: "Pintura para interiores com um acabamento limpo e cuidado.", image: "photo-1562259949-e8e7689d7828" },
    { id: "estuque-sancas", name: "Estuque & sancas", detail: "Paredes e tetos com linhas definidas e detalhes à medida.", image: "photo-1600210492486-724fe5c67fb0" },
    { id: "papel-parede", name: "Papel de parede", detail: "Texturas e padrões para dar personalidade a qualquer divisão.", image: "photo-1616486338812-3dadae4b4ace" },
    { id: "tecto-falso", name: "Tecto falso", detail: "Soluções de teto falso com um acabamento contemporâneo.", image: "photo-1600607687939-ce8a6c25118c" },
    { id: "pisos", name: "Pisos", detail: "Chão flutuante, epóxi e tapetes para diferentes espaços.", image: "photo-1600566753086-00f18fb6b3ea" },
    { id: "caixilharia-portao", name: "Caixilharia & portão rolante", detail: "Caixilharia e portões de enrolar adaptados ao seu projeto.", image: "photo-1600607687920-4e2a09cf159d" },
  ],
  gallery: [
    ],
  videos: [],
  brands: [],
};

function validateContent(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ContentValidationError("O conteúdo enviado é inválido.");
  }

  const settings = Object.fromEntries(
    Object.entries(defaultContent.settings).map(([field, defaultValue]) => [
      field,
      value.settings?.[field] ?? defaultValue,
    ]),
  );
  const settingsFields = Object.keys(defaultContent.settings);
  for (const field of settingsFields) {
    if (typeof settings[field] !== "string" || settings[field].length > 2000) {
      throw new ContentValidationError(`A definição "${field}" é inválida.`);
    }
  }
  settings.whatsapp = settings.whatsapp.replace(/\D/g, "");
  if (settings.whatsapp.length < 7 || settings.whatsapp.length > 20) {
    throw new ContentValidationError("Indique um número de WhatsApp válido com indicativo do país.");
  }
  if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
    throw new ContentValidationError("Indique um endereço de e-mail válido.");
  }
  if (!/^\d{1,3}$/.test(settings.yearsExperience)) {
    throw new ContentValidationError("Os anos de experiência devem ser um número entre 0 e 999.");
  }
  if (settings.heroImage && (settings.heroImage.startsWith(`${config.mediaRoute}/`) || isStoredImage(settings.heroImage))) {
    if (!isStoredImage(settings.heroImage)) {
      throw new ContentValidationError("A imagem principal carregada não é válida.");
    }
    for (const [field, label] of [["aboutImage", "secção Sobre"], ["calloutImage", "convite de contacto"]]) {
      if (settings[field] && (settings[field].startsWith(`${config.mediaRoute}/`) || isStoredImage(settings[field]))) {
        if (!isStoredImage(settings[field])) {
          throw new ContentValidationError(`A imagem da ${label} carregada não é válida.`);
        }
      } else if (settings[field] && !settings[field].startsWith("photo-")) {
        let parsed;
        try {
          parsed = new URL(settings[field]);
        } catch {
          throw new ContentValidationError(`O endereço da imagem da ${label} não é válido.`);
        }
        if (parsed.protocol !== "https:") {
          throw new ContentValidationError(`A imagem da ${label} deve usar HTTPS.`);
        }
      }
    }
  } else if (settings.heroImage && !settings.heroImage.startsWith("photo-")) {
    let parsed;
    try {
      parsed = new URL(settings.heroImage);
    } catch {
      throw new ContentValidationError("O endereço da imagem principal não é válido.");
    }
    if (parsed.protocol !== "https:") {
      throw new ContentValidationError("A imagem principal deve usar HTTPS.");
    }
  }
  try {
    if (new URL(settings.mapUrl).protocol !== "https:") throw new Error();
  } catch {
    throw new ContentValidationError("O endereço do mapa deve ser HTTPS.");
  }

  for (const section of ["services", "gallery", "videos", "brands"]) {
    const sectionItems = section === "brands" ? value.brands ?? [] : value[section];
    if (!Array.isArray(sectionItems) || sectionItems.length > 100) {
      throw new ContentValidationError(`A lista "${section}" deve conter no máximo 100 itens.`);
    }

    const ids = new Set();
    for (const item of sectionItems) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw new ContentValidationError(`Existe um item inválido na lista "${section}".`);
      }
      if (typeof item.id !== "string" || !item.id.trim() || ids.has(item.id)) {
        throw new ContentValidationError(`Os itens de "${section}" precisam de identificadores únicos.`);
      }
      ids.add(item.id);

      const requiredFields = section === "brands"
        ? ["name", "status", "logo"]
        : section === "services"
        ? ["name", "detail", "image"]
        : section === "gallery"
          ? ["title", "imageUrl"]
          : ["title", "videoUrl"];

      for (const field of requiredFields) {
        if (typeof item[field] !== "string" || !item[field].trim() || item[field].length > 2000) {
          throw new ContentValidationError(`O campo "${field}" é obrigatório em "${section}".`);
        }
      }

      if (section === "brands") {
        if (!["actual", "anterior"].includes(item.status)) {
          throw new ContentValidationError("A colaboração da marca deve ser actual ou anterior.");
        }
        if (item.logo !== undefined && typeof item.logo !== "string") {
          throw new ContentValidationError("O logótipo da marca deve ser um endereço de imagem válido.");
        }
      }

      const mediaUrl = section === "brands" ? item.logo : section === "services" ? item.image : section === "gallery" ? item.imageUrl : item.videoUrl;
      if (mediaUrl && typeof mediaUrl === "string" && (mediaUrl.startsWith(`${config.mediaRoute}/`) || isStoredMedia(mediaUrl, section))) {
        if (!isStoredMedia(mediaUrl, section)) {
          throw new ContentValidationError(`O ficheiro carregado em "${section}" não é válido.`);
        }
      } else if (mediaUrl && typeof mediaUrl === "string" && !mediaUrl.startsWith("photo-")) {
        let parsed;
        try {
          parsed = new URL(mediaUrl);
        } catch {
          throw new ContentValidationError(`O endereço de mídia em "${section}" não é válido.`);
        }
        if (parsed.protocol !== "https:") {
          throw new ContentValidationError("Os endereços de mídia devem usar HTTPS.");
        }
      }
    }
  }

  return {
    settings: {
      ...settings,
      heroImage: mediaNameForStorage(settings.heroImage),
      aboutImage: mediaNameForStorage(settings.aboutImage),
      calloutImage: mediaNameForStorage(settings.calloutImage),
    },
    services: value.services.map((item) => ({ ...item, image: mediaNameForStorage(item.image) })),
    gallery: value.gallery.map((item) => ({ ...item, imageUrl: mediaNameForStorage(item.imageUrl) })),
    videos: value.videos.map((item) => ({ ...item, videoUrl: mediaNameForStorage(item.videoUrl) })),
    brands: (value.brands ?? []).map((item) => ({ ...item, logo: mediaNameForStorage(item.logo) })),
  };
}

export async function getContent() {
  const pool = getPool();
  const [rows] = await executeRead(
    "SELECT settings, services, gallery, videos, brands FROM site_content WHERE id = 1",
  );
  if (rows.length) return validateContent(parseContentRow(rows[0]));

  const initialContent = await readLegacyContent();
  const validContent = validateContent(initialContent);
  await pool.execute(
    `INSERT INTO site_content (id, settings, services, gallery, videos, brands)
     VALUES (1, CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON))
     ON DUPLICATE KEY UPDATE id = id`,
    [
      JSON.stringify(validContent.settings),
      JSON.stringify(validContent.services),
      JSON.stringify(validContent.gallery),
      JSON.stringify(validContent.videos),
      JSON.stringify(validContent.brands),
    ],
  );
  const [seededRows] = await executeRead(
    "SELECT settings, services, gallery, videos, brands FROM site_content WHERE id = 1",
  );
  return validateContent(parseContentRow(seededRows[0]));
}

export async function saveContent(content) {
  const validContent = validateContent(content);
  const pool = getPool();
  await pool.execute(
    `INSERT INTO site_content (id, settings, services, gallery, videos, brands)
     VALUES (1, CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON))
     ON DUPLICATE KEY UPDATE
       settings = VALUES(settings),
       services = VALUES(services),
       gallery = VALUES(gallery),
       videos = VALUES(videos),
       brands = VALUES(brands)`,
    [
      JSON.stringify(validContent.settings),
      JSON.stringify(validContent.services),
      JSON.stringify(validContent.gallery),
      JSON.stringify(validContent.videos),
      JSON.stringify(validContent.brands),
    ],
  );
  return validContent;
}

export async function getServiceByName(name) {
  const content = await getContent();
  return content.services.find((service) => service.name === name);
}

function parseContentRow(row) {
  return Object.fromEntries(
    ["settings", "services", "gallery", "videos", "brands"].map((section) => [
      section,
      typeof row[section] === "string" ? JSON.parse(row[section]) : row[section],
    ]),
  );
}

async function readLegacyContent() {
  try {
    const legacyContent = JSON.parse(await fs.readFile(legacyFilePath, "utf8"));
    if (isSampleGallery(legacyContent.gallery)) legacyContent.gallery = [];
    return legacyContent;
  } catch (error) {
    if (error.code === "ENOENT") return structuredClone(defaultContent);
    throw error;
  }
}

function isSampleGallery(gallery) {
  return Array.isArray(gallery) &&
    gallery.length === 3 &&
    gallery.every((item, index) =>
      item?.id === `inspiracao-${index + 1}` &&
      item.category === "Referência de interiores",
    );
}
