import { useCallback, useEffect, useState } from "react";
import { useSiteController } from "../controllers/useSiteController.js";
import { resolveMediaUrl } from "../models/apiClient.js";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  MapPin,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import "../styles.css";
import ToastNotice from "./ToastNotice.jsx";

const imageUrl = (id, width = 900) =>
  id?.startsWith("https://")
    ? id
    : id?.startsWith("/uploads/")
      ? resolveMediaUrl(id)
      : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

function updateMeta(selector, attribute, value) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    if (selector.startsWith('meta[property=')) element.setAttribute("property", selector.match(/"([^"]+)"/)[1]);
    else element.setAttribute("name", selector.match(/"([^"]+)"/)[1]);
    document.head.append(element);
  }
  element.setAttribute(attribute, value);
}

function useSearchMetadata(settings, services) {
  useEffect(() => {
    const companyName = settings.companyName || "S.B Luxos";
    const serviceNames = services.map((service) => service.name).filter(Boolean);
    const description = `${companyName}: ${serviceNames.slice(0, 3).join(", ") || "acabamentos e design de interiores"} em Benfica, Luanda. Peça o seu orçamento pelo WhatsApp.`.slice(0, 160);
    const title = `${companyName} | Acabamentos e design de interiores em Luanda`;
    const socialImage = imageUrl(settings.heroImage, 1200);
    document.title = title;
    updateMeta('meta[name="description"]', "content", description);
    updateMeta('meta[name="robots"]', "content", "index, follow, max-image-preview:large");
    updateMeta('meta[property="og:title"]', "content", title);
    updateMeta('meta[property="og:description"]', "content", description);
    updateMeta('meta[property="og:image"]', "content", socialImage);
    updateMeta('meta[property="og:image:alt"]', "content", `Interior com acabamentos contemporâneos da ${companyName}`);
    updateMeta('meta[name="twitter:title"]', "content", title);
    updateMeta('meta[name="twitter:description"]', "content", description);
    updateMeta('meta[name="twitter:image"]', "content", socialImage);

    const canonical = document.head.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = `${window.location.origin}${window.location.pathname}`;
    if (!canonical.isConnected) document.head.append(canonical);

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "HomeAndConstructionBusiness",
      name: companyName,
      description,
      url: canonical.href,
      image: socialImage,
      telephone: settings.phone,
      email: settings.email || undefined,
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address,
        addressLocality: "Luanda",
        addressRegion: "Luanda",
        addressCountry: "AO",
      },
      areaServed: { "@type": "City", name: "Luanda" },
      hasMap: settings.mapUrl || undefined,
      knowsAbout: serviceNames,
    };
    let script = document.getElementById("business-structured-data");
    if (!script) {
      script = document.createElement("script");
      script.id = "business-structured-data";
      script.type = "application/ld+json";
      document.head.append(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }, [settings, services]);
}

function videoEmbedUrl(videoUrl) {
  try {
    const url = new URL(videoUrl);
    if (url.hostname === "youtu.be") return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    if (url.hostname === "youtube.com" || url.hostname === "www.youtube.com") {
      const videoId = url.searchParams.get("v");
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
    if (url.hostname === "vimeo.com" || url.hostname === "www.vimeo.com") {
      return `https://player.vimeo.com/video/${url.pathname.split("/").filter(Boolean).pop()}`;
    }
    return "";
  } catch {
    return "";
  }
}

function HomePage() {
  const { content, submitQuote, contentError } = useSiteController();
  const services = content.services;
  const gallery = content.gallery;
  const videos = content.videos;
  const brands = content.brands || [];
  const settings = content.settings;
  useSearchMetadata(settings, services);
  const phoneDigits = settings.phone.replace(/\D/g, "");
  const directWhatsAppUrl = `https://wa.me/${settings.whatsapp}`;
  const [menuOpen, setMenuOpen] = useState(false);
  const [formState, setFormState] = useState("idle");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [toast, setToast] = useState(null);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (contentError) setToast({ type: "error", message: "Ocorreu um erro ao carregar o site." });
  }, [contentError]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormState("sending");
    setWhatsappUrl("");
    try {
      const result = await submitQuote(Object.fromEntries(new FormData(event.currentTarget).entries()));
      setWhatsappUrl(result.whatsappUrl);
      setFormState("success");
      setToast({ type: "success", message: "O pedido está pronto para enviar pelo WhatsApp." });
    } catch {
      setFormState("idle");
      setToast({ type: "error", message: "Ocorreu um erro ao preparar o pedido. Tente novamente." });
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <ToastNotice toast={toast} onDismiss={dismissToast} />
      <header className="header">
        <a className="brand" href="#inicio" aria-label={`${settings.companyName}, ${settings.navHome.toLowerCase()}`} onClick={closeMenu}>
          <span className="brand-initials">{settings.brandInitials}</span>
          <span className="brand-name"><strong>{settings.brandName}</strong><small>{settings.headerBrandSubtitle}</small></span>
        </a>
        <button
          className="mobile-menu"
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={menuOpen ? "nav nav-open" : "nav"} aria-label="Navegação principal">
          <a href="#inicio" onClick={closeMenu}>{settings.navHome}</a>
          <a href="#sobre" onClick={closeMenu}>{settings.navAbout}</a>
          <a href="#servicos" onClick={closeMenu}>{settings.navServices}</a>
          <a href="#marcas" onClick={closeMenu}>Marcas</a>
          <a href="#projetos" onClick={closeMenu}>{settings.navGallery}</a>
          <a href="#contacto" onClick={closeMenu}>{settings.navContact}</a>
        </nav>
        <a className="header-button" href="#contacto">{settings.headerCta} <ArrowUpRight size={16} /></a>
      </header>

      <main className="site-sections">
        <section className="hero" id="inicio">
          <div className="hero-photo" role="img" aria-label={settings.heroCaption} style={{ backgroundImage: `url("${imageUrl(settings.heroImage, 1800)}")` }} />
          <div className="hero-overlay" />
          <div className="hero-copy">
            <div className="eyebrow eyebrow-white"><span /> {settings.heroEyebrow}</div>
            <h1>{settings.heroTitle}</h1>
            <p>{settings.heroDescription}</p>
            <div className="hero-actions">
              <a className="button button-white" href="#contacto">{settings.heroPrimaryButton} <ArrowRight size={17} /></a>
              <a className="hero-link" href="#servicos">{settings.heroSecondaryButton} <ArrowDown size={16} /></a>
            </div>
          </div>
          <div className="hero-caption"><span /> {settings.heroCaption}</div>
        </section>

        <section className="facts" aria-label={settings.factsAriaLabel}>
          <div><span className="fact-icon"><Sparkles size={18} /></span><span>{settings.factsServiceTitle}<br /><strong>{settings.factsServiceText}</strong></span></div>
          <div><span className="fact-icon"><Clock3 size={18} /></span><span>{settings.factsExperienceTitle}<br /><strong>{settings.yearsExperience} {settings.factsExperienceText}</strong></span></div>
          <a href={settings.mapUrl} target="_blank" rel="noreferrer">
            <span className="fact-icon"><MapPin size={18} /></span><span>{settings.factsLocationTitle}<br /><strong>{settings.address} <ArrowUpRight size={13} /></strong></span>
          </a>
        </section>

        <section className="about section" id="sobre">
          <div className="about-visual">
            <img src={imageUrl(settings.aboutImage, 1100)} alt={settings.aboutImageAlt} loading="lazy" />
            <div className="about-label"><strong>{settings.yearsExperience.padStart(2, "0")}</strong><span>{settings.aboutExperienceText}</span></div>
            <span className="image-outline" />
          </div>
          <div className="about-copy">
            <div className="eyebrow"><span /> {settings.aboutEyebrow}</div>
            <h2>{settings.aboutTitle}</h2>
            <p>{settings.aboutDescription}</p>
            <p>{settings.aboutSecondParagraph}</p>
            <a className="underlined-link" href="#servicos">{settings.aboutButton} <ArrowRight size={17} /></a>
          </div>
        </section>

        <section className="services section" id="servicos">
          <div className="section-top">
            <div><div className="eyebrow"><span /> {settings.servicesEyebrow}</div><h2>{settings.servicesTitle}</h2></div>
            <p>{settings.servicesDescription}</p>
          </div>
          <div className="service-grid">
            {services.map((service, index) => (
              <article className="service-card" key={service.id}>
                <a className="service-image" href="#contacto" aria-label={`Pedir orçamento: ${service.name}`}>
                  <img src={imageUrl(service.image, 900)} alt="" loading="lazy" />
                  <span className="service-index">0{index + 1}</span>
                  <span className="service-arrow"><ArrowUpRight size={18} /></span>
                </a>
                <div className="service-text"><h3>{service.name}</h3><p>{service.detail}</p></div>
              </article>
            ))}
          </div>
          <div className="services-cta"><span>{settings.servicesCtaText}</span><a className="underlined-link" href="#contacto">{settings.servicesCtaButton} <ArrowRight size={16} /></a></div>
        </section>

        <section className="brands section" id="marcas" aria-labelledby="brands-title">
          <div className="section-top">
            <div><div className="eyebrow"><span /> PARCERIAS</div><h2 id="brands-title">Marcas que confiam em nós.</h2></div>
            <p>Marcas com quem já colaborámos e que continuam a fazer parte do nosso percurso.</p>
          </div>
          {brands.length > 0
            ? <div className="brands-grid">
              {brands.map((brand) => <div className="brand-card" key={brand.id}>{brand.logo ? <img src={imageUrl(brand.logo, 360)} alt={`Logótipo ${brand.name}`} loading="lazy" /> : <strong>{brand.name}</strong>}<span>{brand.status === "actual" ? "Colaboração actual" : "Colaboração anterior"}</span></div>)}
            </div>
            : <p className="brands-empty">Os logótipos das marcas parceiras serão apresentados aqui.</p>}
        </section>

        <section className="inspiration section" id="projetos">
          <div className="section-top">
            <div><div className="eyebrow"><span /> {settings.galleryEyebrow}</div><h2>{settings.galleryTitle}</h2></div>
            <p>{settings.galleryDescription}</p>
          </div>
          {gallery.length > 0 && (
            <div className="inspiration-grid">
              {gallery.map((item, index) => (
                <article className={`inspiration-card${index === 0 ? " inspiration-large" : ""}`} key={item.id}>
                  <img src={resolveMediaUrl(item.imageUrl)} alt={item.title} loading="lazy" />
                  <div><small>{item.category || settings.galleryCategoryFallback}</small><h3>{item.title}</h3></div>
                </article>
              ))}
            </div>
          )}
          {gallery.length === 0 && <div className="gallery-empty">{settings.galleryEmptyText}</div>}
        </section>

        {videos.length > 0 && (
          <section className="video-section section" id="videos">
            <div className="section-top">
              <div><div className="eyebrow"><span /> {settings.videoEyebrow}</div><h2>{settings.videoTitle}</h2></div>
              <p>{settings.videoDescription}</p>
            </div>
            <div className="video-grid">
              {videos.map((video) => {
                const embedUrl = videoEmbedUrl(video.videoUrl);
                const playableVideoUrl = resolveMediaUrl(video.videoUrl);
                const directVideo = /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(video.videoUrl);
                return (
                  <article className="video-card" key={video.id}>
                    {directVideo
                      ? <video src={playableVideoUrl} controls preload="metadata" />
                      : embedUrl
                        ? <iframe src={embedUrl} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                        : <a className="video-external" href={video.videoUrl} target="_blank" rel="noreferrer">{settings.videoExternalLabel} <ArrowUpRight size={17} /></a>}
                    <div className="video-caption"><h3>{video.title}</h3>{video.description && <p>{video.description}</p>}</div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section className="callout">
          <div className="callout-photo" role="img" aria-label={settings.calloutImageAlt} style={{ backgroundImage: `url("${imageUrl(settings.calloutImage, 1400)}")` }} />
          <div className="callout-copy">
            <div className="eyebrow eyebrow-white"><span /> {settings.calloutEyebrow}</div>
            <h2>{settings.calloutTitle}</h2>
            <p>{settings.calloutDescription}</p>
            <ul>
              <li><Check size={16} /> {settings.calloutBulletOne}</li>
              <li><Check size={16} /> {settings.calloutBulletTwo}</li>
              <li><Check size={16} /> Atendimento próximo em {settings.address.split(",")[0]}</li>
            </ul>
            <a className="button button-white" href="#contacto">{settings.calloutButton} <ArrowRight size={17} /></a>
          </div>
        </section>

        <section className="contact section" id="contacto">
          <div className="contact-copy">
            <div className="eyebrow"><span /> {settings.contactEyebrow}</div>
            <h2>{settings.contactTitle}</h2>
            <p>{settings.contactDescription}</p>
            <div className="contact-list">
              <a href={`tel:+${phoneDigits}`}><span className="contact-icon"><Phone size={18} /></span><span><small>{settings.contactPhoneLabel}</small>{settings.phone}</span></a>
              <a href={settings.mapUrl} target="_blank" rel="noreferrer">
                <span className="contact-icon"><MapPin size={18} /></span>
                <span><small>{settings.contactAddressLabel}</small>{settings.address}</span>
              </a>
              <div><span className="contact-icon"><Clock3 size={18} /></span><span><small>{settings.contactHoursLabel}</small>{settings.openingHours}</span></div>
              {settings.email && <a href={`mailto:${settings.email}`}><span className="contact-icon"><Mail size={18} /></span><span><small>{settings.contactEmailLabel}</small>{settings.email}</span></a>}
            </div>
            <a className="map-link" href={settings.mapUrl} target="_blank" rel="noreferrer">
              {settings.mapButton} <ArrowUpRight size={15} />
            </a>
          </div>
          <form className="quote-form" onSubmit={handleSubmit}>
            <div className="form-title"><div><small>{settings.formEyebrow}</small><h3>{settings.formTitle}</h3></div><MessageCircle size={23} /></div>
            <label>{settings.formNameLabel}<input name="name" type="text" placeholder={settings.formNamePlaceholder} autoComplete="name" required /></label>
            <label>{settings.formPhoneLabel}<input name="phone" type="tel" placeholder={settings.formPhonePlaceholder} autoComplete="tel" required /></label>
            <label>{settings.formServiceLabel}
              <select name="service" defaultValue="" required>
                <option value="" disabled>{settings.formServicePlaceholder}</option>
                {services.map((service) => <option key={service.name} value={service.name}>{service.name}</option>)}
              </select>
            </label>
            <label>{settings.formMessageLabel} <span className="optional">{settings.formOptionalText}</span><textarea name="message" rows="3" placeholder={settings.formMessagePlaceholder} /></label>
            {formState === "success" && (
              <div className="form-success" role="status">
                <p>{settings.formSuccessText}</p>
                <a href={whatsappUrl} target="_blank" rel="noreferrer">{settings.formSendLabel} <ArrowUpRight size={15} /></a>
              </div>
            )}
            <button className="button button-blue" type="submit" disabled={formState === "sending"}>
              {formState === "sending" ? settings.formSubmittingLabel : settings.formSubmitLabel} <ArrowRight size={17} />
            </button>
            <div className="form-privacy"><ShieldCheck size={14} /> {settings.formPrivacyText}</div>
          </form>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#inicio">
          <span className="brand-initials">{settings.brandInitials}</span>
          <span className="brand-name"><strong>{settings.brandName}</strong><small>{settings.headerBrandSubtitle}</small></span>
        </a>
        <p>{settings.footerDescription}<br />{settings.footerLocation}</p>
        <div className="footer-nav"><a href="#inicio">{settings.navHome}</a><a href="#sobre">{settings.navAbout}</a><a href="#servicos">{settings.navServices}</a><a href="#projetos">{settings.navGallery}</a><a href="#contacto">{settings.navContact}</a></div>
        <a className="footer-wa" href={directWhatsAppUrl} target="_blank" rel="noreferrer"><MessageCircle size={16} /> {settings.footerWhatsAppLabel} <ArrowUpRight size={14} /></a>
        <small className="copyright">© {new Date().getFullYear()} {settings.companyName}. {settings.footerCopyright} <a href="/admin">{settings.footerAdminLabel}</a></small>
      </footer>
      <a className="floating-wa" href={directWhatsAppUrl} target="_blank" rel="noreferrer" aria-label={settings.floatingWhatsAppLabel}><MessageCircle size={23} /><span>{settings.floatingWhatsAppLabel}</span></a>
    </>
  );
}

export default HomePage;
