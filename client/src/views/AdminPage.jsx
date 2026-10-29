import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Image, LogOut, Pencil, Plus, Save, Settings, Trash2, Users, UserPlus, Video, Wrench, X } from "lucide-react";
import { useAdminController } from "../controllers/useAdminController.js";
import { resolveMediaUrl } from "../models/apiClient.js";
import ToastNotice from "./ToastNotice.jsx";

const sections = [
  { key: "services", label: "Serviços", icon: Wrench, mediaField: "image", mediaKind: "image", mediaAccept: "image/jpeg,image/png,image/webp,image/gif,image/avif", mediaLabel: "Carregar fotografia do computador", fields: [["name", "Nome do serviço"], ["detail", "Descrição"], ["image", "Foto (URL ou imagem carregada)"]] },
  { key: "gallery", label: "Galeria", icon: Image, mediaField: "imageUrl", mediaKind: "image", mediaAccept: "image/jpeg,image/png,image/webp,image/gif,image/avif", mediaLabel: "Carregar fotografia do computador", fields: [["title", "Título / nome do trabalho"], ["category", "Serviço realizado"], ["imageUrl", "Foto (URL ou imagem carregada)"]] },
  { key: "videos", label: "Vídeos", icon: Video, mediaField: "videoUrl", mediaKind: "video", mediaAccept: "video/mp4,video/webm,video/quicktime", mediaLabel: "Carregar vídeo do computador", fields: [["title", "Título"], ["description", "Descrição"], ["videoUrl", "Vídeo (URL ou ficheiro carregado)"]] },
  { key: "brands", label: "Marcas", icon: Users, mediaField: "logo", mediaKind: "image", mediaAccept: "image/jpeg,image/png,image/webp,image/gif,image/avif", mediaLabel: "Carregar logótipo da marca", fields: [["name", "Nome da marca"], ["status", "Colaboração (actual ou anterior)"], ["logo", "Logótipo (URL ou imagem carregada)"]] },
];

const settingsFieldGroups = [
  { title: "Destaque principal", fields: [
    ["heroEyebrow", "Localização curta"],
    ["heroTitle", "Título principal"],
    ["heroDescription", "Texto do destaque", "textarea"],
    ["heroCaption", "Legenda da imagem"],
    ["heroPrimaryButton", "Texto do botão principal"],
    ["heroSecondaryButton", "Texto do botão secundário"],
  ] },
  { title: "Dados rápidos", fields: [
    ["factsAriaLabel", "Descrição acessível da secção"],
    ["factsServiceTitle", "Título da informação de serviços"],
    ["factsServiceText", "Texto da informação de serviços"],
    ["factsExperienceTitle", "Título da informação de experiência"],
    ["yearsExperience", "Anos de experiência", "number"],
    ["factsExperienceText", "Texto após os anos de experiência"],
    ["factsLocationTitle", "Título da informação de localização"],
  ] },
  { title: "Sobre nós", fields: [
    ["aboutEyebrow", "Etiqueta da secção"],
    ["aboutTitle", "Título"],
    ["aboutDescription", "Primeiro parágrafo", "textarea"],
    ["aboutSecondParagraph", "Segundo parágrafo", "textarea"],
    ["aboutImageAlt", "Descrição acessível da imagem"],
    ["aboutExperienceText", "Texto junto aos anos de experiência"],
    ["aboutButton", "Texto do botão"],
  ] },
  { title: "Serviços", fields: [
    ["servicesEyebrow", "Etiqueta da secção"],
    ["servicesTitle", "Título"],
    ["servicesDescription", "Descrição", "textarea"],
    ["servicesCtaText", "Texto de apoio"],
    ["servicesCtaButton", "Texto do botão"],
  ] },
  { title: "Galeria", fields: [
    ["galleryEyebrow", "Etiqueta da secção"],
    ["galleryTitle", "Título"],
    ["galleryDescription", "Descrição", "textarea"],
    ["galleryEmptyText", "Texto quando não há trabalhos", "textarea"],
    ["galleryCategoryFallback", "Categoria predefinida das fotografias"],
  ] },
  { title: "Vídeos", fields: [
    ["videoEyebrow", "Etiqueta da secção"],
    ["videoTitle", "Título"],
    ["videoDescription", "Descrição", "textarea"],
    ["videoExternalLabel", "Texto do link para vídeos externos"],
  ] },
  { title: "Convite para contacto", fields: [
    ["calloutEyebrow", "Etiqueta da secção"],
    ["calloutTitle", "Título"],
    ["calloutDescription", "Descrição", "textarea"],
    ["calloutBulletOne", "Primeiro destaque"],
    ["calloutBulletTwo", "Segundo destaque"],
    ["calloutButton", "Texto do botão"],
    ["calloutImageAlt", "Descrição acessível da imagem"],
  ] },
  { title: "Contactos e formulário", fields: [
    ["contactEyebrow", "Etiqueta da secção"],
    ["contactTitle", "Título"],
    ["contactDescription", "Descrição", "textarea"],
    ["contactPhoneLabel", "Etiqueta do telefone"],
    ["contactAddressLabel", "Etiqueta do endereço"],
    ["contactHoursLabel", "Etiqueta do horário"],
    ["contactEmailLabel", "Etiqueta do e-mail"],
    ["mapButton", "Texto do link do mapa"],
    ["formEyebrow", "Etiqueta do formulário"],
    ["formTitle", "Título do formulário"],
    ["formNameLabel", "Campo: nome"],
    ["formNamePlaceholder", "Exemplo do nome"],
    ["formPhoneLabel", "Campo: telefone"],
    ["formPhonePlaceholder", "Exemplo do telefone"],
    ["formServiceLabel", "Campo: serviço"],
    ["formServicePlaceholder", "Instrução para escolher serviço"],
    ["formMessageLabel", "Campo: mensagem"],
    ["formMessagePlaceholder", "Exemplo da mensagem"],
    ["formOptionalText", "Texto de campo opcional"],
    ["formSuccessText", "Mensagem após preparar pedido", "textarea"],
    ["formSendLabel", "Texto do link para WhatsApp"],
    ["formSubmitLabel", "Texto do botão de envio"],
    ["formSubmittingLabel", "Texto durante o envio"],
    ["formPrivacyText", "Nota de privacidade", "textarea"],
  ] },
  { title: "Cabeçalho e rodapé", fields: [
    ["brandInitials", "Iniciais do logótipo"],
    ["brandName", "Nome apresentado no logótipo"],
    ["companyName", "Nome da empresa no rodapé"],
    ["headerBrandSubtitle", "Subtítulo da marca"],
    ["headerCta", "Botão do cabeçalho"],
    ["navHome", "Navegação: Início"],
    ["navAbout", "Navegação: Sobre"],
    ["navServices", "Navegação: Serviços"],
    ["navGallery", "Navegação: Galeria"],
    ["navContact", "Navegação: Contacto"],
    ["footerDescription", "Descrição do rodapé"],
    ["footerLocation", "Localização no rodapé"],
    ["footerWhatsAppLabel", "Botão WhatsApp do rodapé"],
    ["footerCopyright", "Texto de direitos reservados"],
    ["floatingWhatsAppLabel", "Botão flutuante do WhatsApp"],
  ] },
];

function makeId() {
  return crypto.randomUUID();
}

function AdminLogin({ setupRequired, onAuthenticate, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (error) setToast({ type: "error", message: "Ocorreu um erro. Tente novamente." });
  }, [error]);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setToast(null);
    try {
      await onAuthenticate(email, password);
    } catch {
      setToast({ type: "error", message: "Ocorreu um erro. Tente novamente." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <ToastNotice toast={toast} onDismiss={dismissToast} />
      <a className="admin-back-link" href="/"><ArrowLeft size={16} /> Voltar ao site</a>
      <form className="admin-login-card" onSubmit={submit}>
        <span className="admin-kicker">S.B LUXOS · ADMINISTRAÇÃO</span>
        <h1>{setupRequired ? "Configure o acesso" : "Bem-vindo de volta"}</h1>
        <p>{setupRequired ? "Crie a primeira conta de administrador com e-mail e senha de pelo menos 12 caracteres." : "Entre com o seu e-mail e senha para gerir o site."}</p>
        <label>E-mail
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength="254" autoComplete="email" required />
        </label>
        <label>Senha de administrador
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={setupRequired ? 12 : 1} maxLength="200" autoComplete={setupRequired ? "new-password" : "current-password"} required />
        </label>
        <button className="admin-primary-button" disabled={submitting}>{submitting ? "A validar..." : setupRequired ? "Criar acesso de administrador" : "Entrar"}</button>
      </form>
    </main>
  );
}

export default function AdminPage() {
  const controller = useAdminController();
  useEffect(() => {
    document.title = "Administração | S.B Luxos";
    const robots = document.head.querySelector('meta[name="robots"]');
    if (robots) robots.content = "noindex, nofollow";
  }, []);
  const [activeSection, setActiveSection] = useState("services");
  const [draft, setDraft] = useState(null);
  const [savingSection, setSavingSection] = useState("");
  const [uploadingId, setUploadingId] = useState("");
  const [newEntry, setNewEntry] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [settingsUploading, setSettingsUploading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [toast, setToast] = useState(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const notify = useCallback((type, message) => setToast({ type, message }), []);

  useEffect(() => {
    if (controller.status === "error") notify("error", "Ocorreu um erro ao carregar os dados.");
  }, [controller.status, notify]);

  useEffect(() => {
    if (!newEntry) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape" && uploadingId !== `${activeSection}:${newEntry.id}`) {
        setNewEntry(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSection, newEntry, uploadingId]);

  if (controller.status === "loading") return <main className="admin-loading">A carregar a área administrativa...</main>;
  if (controller.status === "error") return <main className="admin-loading"><ToastNotice toast={toast} onDismiss={dismissToast} /><p>Ocorreu um erro ao carregar os dados.</p><button className="admin-primary-button" onClick={controller.refresh}>Tentar novamente</button></main>;
  if (!controller.authenticated) {
    return <AdminLogin setupRequired={controller.setupRequired} onAuthenticate={controller.authenticate} error={controller.error} />;
  }

  const section = sections.find((item) => item.key === activeSection);
  const isSettings = activeSection === "settings";
  const isAdminUsers = activeSection === "admins";
  const entries = isSettings || isAdminUsers ? [] : draft?.[activeSection] ?? controller.content[activeSection];
  const settings = { ...controller.content.settings, ...draft?.settings };
  const mediaUploadId = (id) => `${activeSection}:${id}`;
  const changeEntry = (index, field, value) => {
    setDraft((current) => {
      const next = structuredClone(current || controller.content);
      next[activeSection][index][field] = value;
      return next;
    });
  };

  function addEntry() {
    const entry = Object.fromEntries(section.fields.map(([field]) => [field, ""]));
    if (activeSection === "brands") entry.status = "actual";
    entry.id = makeId();
    setEditingIndex(null);
    setNewEntry(entry);
  }

  function editEntry(index) {
    setEditingIndex(index);
    setNewEntry(structuredClone(entries[index]));
  }

  async function confirmAddEntry(event) {
    event.preventDefault();
    if (activeSection === "brands") {
      const currentBrands = structuredClone(draft?.brands ?? controller.content.brands ?? []);
      if (editingIndex === null) currentBrands.push(newEntry);
      else currentBrands[editingIndex] = newEntry;
      const nextContent = structuredClone(controller.content);
      nextContent.brands = currentBrands;
      setSavingSection("brands");
      try {
        await controller.saveContent(nextContent);
        setDraft((current) => {
          if (!current?.brands) return current;
          const next = structuredClone(current);
          delete next.brands;
          return Object.keys(next).length ? next : null;
        });
        setNewEntry(null);
        setEditingIndex(null);
        notify("success", "Marca guardada e publicada no site.");
      } catch (error) {
        notify("error", error.message || "Ocorreu um erro ao guardar a marca.");
      } finally {
        setSavingSection("");
      }
      return;
    }
    setDraft((current) => {
      const next = structuredClone(current || controller.content);
      if (editingIndex === null) next[activeSection].push(newEntry);
      else next[activeSection][editingIndex] = newEntry;
      return next;
    });
    setNewEntry(null);
    setEditingIndex(null);
    notify("success", editingIndex === null ? "Item adicionado. Guarde as alterações para publicar." : "Alteração preparada para guardar.");
  }

  function removeEntry(index) {
    setDraft((current) => {
      const next = structuredClone(current || controller.content);
      next[activeSection].splice(index, 1);
      return next;
    });
    notify("success", "Item removido. Guarde as alterações para publicar.");
  }

  function changeSetting(field, value) {
    setDraft((current) => {
      const next = structuredClone(current || controller.content);
      next.settings[field] = value;
      return next;
    });
  }

  async function handleSettingsImageUpload(field, event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setSettingsUploading(true);
    try {
      const result = await controller.uploadMedia(file, "image");
      changeSetting(field, result.filename);
      notify("success", "Imagem carregada. Guarde as alterações para publicar.");
    } catch (error) {
      notify("error", error.message || "Ocorreu um erro ao carregar a imagem. Tente novamente.");
    } finally {
      setSettingsUploading(false);
    }
  }

  async function handleUpload(index, event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const entryId = entries[index].id;
    setUploadingId(mediaUploadId(entryId));
    try {
      const result = await controller.uploadMedia(file, section.mediaKind);
      changeEntry(index, section.mediaField, section.mediaKind === "image" ? result.filename : result.url);
      notify("success", "Ficheiro carregado. Guarde as alterações para publicar.");
    } catch (error) {
      notify("error", error.message || "Ocorreu um erro ao carregar o ficheiro. Tente novamente.");
    } finally {
      setUploadingId("");
    }
  }

  async function handleNewEntryUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !newEntry) return;

    const entryId = newEntry.id;
    setUploadingId(mediaUploadId(entryId));
    try {
      const result = await controller.uploadMedia(file, section.mediaKind);
      setNewEntry((current) => current ? { ...current, [section.mediaField]: section.mediaKind === "image" ? result.filename : result.url } : current);
      notify("success", "Ficheiro carregado.");
    } catch (error) {
      notify("error", error.message || "Ocorreu um erro ao carregar o ficheiro. Tente novamente.");
    } finally {
      setUploadingId("");
    }
  }

  async function saveChanges(sectionKey = activeSection, fields = null) {
    const sectionDraft = draft?.[sectionKey];
    const settingsSnapshot = fields
      ? Object.fromEntries(fields.map((field) => [field, sectionDraft?.[field] ?? controller.content.settings[field]]))
      : null;
    const nextContent = structuredClone(controller.content);
    if (fields) {
      for (const [field, value] of Object.entries(settingsSnapshot)) {
        nextContent.settings[field] = value;
      }
    } else if (sectionKey !== "settings") {
      nextContent[sectionKey] = sectionDraft ?? controller.content[sectionKey];
    }

    setSavingSection(sectionKey);
    try {
      await controller.saveContent(nextContent);
      setDraft((current) => {
        if (!current) return null;
        if (fields) {
          const next = structuredClone(current);
          for (const field of fields) {
            if (current.settings?.[field] === settingsSnapshot[field]) delete next.settings[field];
          }
          if (next.settings && !Object.keys(next.settings).length) delete next.settings;
          return Object.keys(next).length ? next : null;
        } else if (current[sectionKey] === sectionDraft) {
          const next = structuredClone(current);
          delete next[sectionKey];
          return Object.keys(next).length ? next : null;
        }
        return current;
      });
      notify("success", "Alterações guardadas.");
    } catch (error) {
      notify("error", error.message || "Ocorreu um erro ao guardar as alterações. Tente novamente.");
    } finally {
      setSavingSection("");
    }
  }

  async function handleCreateAdmin(event) {
    event.preventDefault();
    setCreatingAdmin(true);
    try {
      await controller.createAdmin(newAdminEmail, newAdminPassword);
      setNewAdminEmail("");
      setNewAdminPassword("");
      notify("success", "Conta de administrador criada.");
    } catch {
      notify("error", "Ocorreu um erro ao criar a conta. Tente novamente.");
    } finally {
      setCreatingAdmin(false);
    }
  }

  async function handleRemoveAdmin(account) {
    if (!window.confirm(`Remover a conta administrativa ${account.email}?`)) return;
    try {
      await controller.deleteAdmin(account.id);
      notify("success", "Conta de administrador removida.");
    } catch {
      notify("error", "Ocorreu um erro ao remover a conta. Tente novamente.");
    }
  }

  async function signOut() {
    try {
      await controller.logout();
      setDraft(null);
      notify("success", "Sessão terminada.");
    } catch {
      notify("error", "Ocorreu um erro ao terminar a sessão.");
    }
  }

  function selectSection(key) {
    setNewEntry(null);
    setEditingIndex(null);
    setActiveSection(key);
  }

  return (
    <main className="admin-shell">
      <ToastNotice toast={toast} onDismiss={dismissToast} />
      <header className="admin-header">
        <a className="brand" href="/"><span className="brand-initials">S.B</span><span className="brand-name"><strong>LUXOS</strong><small>PAINEL ADMINISTRATIVO</small></span></a>
        <div className="admin-header-actions"><span className="admin-session-info">{controller.admin?.email} · sessão até {new Date(controller.expiresAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</span><a className="admin-back-link" href="/"><ArrowLeft size={15} /> Ver site</a><button className="admin-logout" onClick={signOut}><LogOut size={15} /> Sair</button></div>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <span className="admin-kicker">CONTEÚDO DO SITE</span>
          {sections.map(({ key, label, icon: Icon }) => (
            <button className={activeSection === key ? "admin-tab active" : "admin-tab"} key={key} onClick={() => selectSection(key)}>
              <Icon size={17} /> {label}<span>{controller.content[key].length}</span>
            </button>
          ))}
          <button className={isSettings ? "admin-tab active" : "admin-tab"} onClick={() => selectSection("settings")}><Settings size={17} /> Definições</button>
          <button className={isAdminUsers ? "admin-tab active" : "admin-tab"} onClick={() => selectSection("admins")}><Users size={17} /> Administradores<span>{controller.admins.length}</span></button>
          <p>As alterações são publicadas ao guardar.</p>
        </aside>
        <section className="admin-content">
          <div className="admin-content-heading">
            <div><span className="admin-kicker">GERIR CONTEÚDO</span><h1>{isSettings ? "Definições do site" : isAdminUsers ? "Administradores" : section.label}</h1><p>{isSettings ? "Altere as imagens, textos e informações de contacto." : isAdminUsers ? "Crie e remova contas com acesso à administração do site." : "Adicione, edite ou remova conteúdo apresentado no site."}</p></div>
            <div className="admin-actions">{!isSettings && !isAdminUsers && <button className="admin-secondary-button" onClick={addEntry}><Plus size={16} /> Adicionar</button>}{!isSettings && !isAdminUsers && <button className="admin-primary-button admin-save-button" onClick={() => saveChanges(activeSection)} disabled={Boolean(savingSection)}><Save size={16} /> {savingSection === activeSection ? "A guardar..." : "Guardar alterações"}</button>}</div>
          </div>
          {isAdminUsers ? (
            <div className="admin-settings-form">
              <section className="admin-settings-group">
                <h2>Adicionar administrador</h2>
                <p className="admin-settings-help">Cada conta usa um e-mail próprio e uma senha com pelo menos 12 caracteres.</p>
                <form className="admin-create-account" onSubmit={handleCreateAdmin}>
                  <label className="admin-field">E-mail
                    <input type="email" value={newAdminEmail} onChange={(event) => setNewAdminEmail(event.target.value)} maxLength="254" autoComplete="off" required />
                  </label>
                  <label className="admin-field">Senha
                    <input type="password" value={newAdminPassword} onChange={(event) => setNewAdminPassword(event.target.value)} minLength="12" maxLength="200" autoComplete="new-password" required />
                  </label>
                  <button className="admin-primary-button" disabled={creatingAdmin}><UserPlus size={16} /> {creatingAdmin ? "A criar..." : "Criar administrador"}</button>
                </form>
              </section>
              <section className="admin-settings-group">
                <h2>Contas com acesso</h2>
                <div className="admin-account-list">
                  {controller.admins.map((account) => (
                    <article className="admin-account" key={account.id}>
                      <div><strong>{account.email}</strong><small>{Number(account.id) === controller.admin?.id ? "A sua conta" : `Criada em ${new Date(account.createdAt).toLocaleDateString("pt-PT")}`}</small></div>
                      <button type="button" className="admin-account-remove" disabled={Number(account.id) === controller.admin?.id || controller.admins.length <= 1} aria-label={`Remover ${account.email}`} onClick={() => handleRemoveAdmin(account)}><Trash2 size={16} /> Remover</button>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          ) : isSettings ? (
            <div className="admin-settings-form">
              <section className="admin-settings-group">
                <div className="admin-settings-group-heading"><h2>Imagens das secções</h2><button className="admin-primary-button" disabled={Boolean(savingSection) || settingsUploading} onClick={() => saveChanges("settings", ["heroImage", "aboutImage", "calloutImage"])}><Save size={15} />{savingSection === "settings" ? "A guardar..." : "Guardar imagens"}</button></div>
                <div className="admin-settings-images">
                  {[["heroImage", "Imagem do destaque"], ["aboutImage", "Imagem de Sobre nós"], ["calloutImage", "Imagem do convite"]].map(([field, label]) => (
                    <div className="admin-settings-image" key={field}>
                      <label className="admin-field">{label} (URL HTTPS ou nome do ficheiro carregado)
                        <input value={settings[field] || ""} onChange={(event) => changeSetting(field, event.target.value)} required />
                      </label>
                      <label className="admin-upload-label">Escolher imagem do computador
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={settingsUploading} onChange={(event) => handleSettingsImageUpload(field, event)} />
                      </label>
                      {settings[field] && <img className="admin-settings-preview" src={settings[field].startsWith("photo-") ? `https://images.unsplash.com/${settings[field]}?auto=format&fit=crop&w=640&q=75` : resolveMediaUrl(settings[field])} alt={`Pré-visualização: ${label}`} />}
                    </div>
                  ))}
                </div>
                <small className="admin-settings-help">JPEG, PNG, WebP, GIF ou AVIF. Máximo: 15 MB por imagem.</small>
                {settingsUploading && <small className="admin-upload-progress">A carregar imagem...</small>}
              </section>
              <section className="admin-settings-group">
                <div className="admin-settings-group-heading"><h2>Dados de contacto</h2><button className="admin-primary-button" disabled={Boolean(savingSection)} onClick={() => saveChanges("settings", ["whatsapp", "phone", "email", "address", "openingHours", "mapUrl"])}><Save size={15} />{savingSection === "settings" ? "A guardar..." : "Guardar contactos"}</button></div>
                <div className="admin-fields">
                  {[
                    ["whatsapp", "WhatsApp com indicativo do país", "tel"],
                    ["phone", "Telefone apresentado", "tel"],
                    ["email", "E-mail", "email"],
                    ["address", "Endereço", "textarea"],
                    ["openingHours", "Horário de atendimento"],
                    ["mapUrl", "Link da localização no mapa", "url"],
                  ].map(([field, label, type]) => (
                    <label className={type === "textarea" ? "admin-field admin-field-wide" : "admin-field"} key={field}>{label}
                      {type === "textarea"
                        ? <textarea rows="3" value={settings[field] || ""} onChange={(event) => changeSetting(field, event.target.value)} />
                        : <input type={type || "text"} value={settings[field] || ""} onChange={(event) => changeSetting(field, event.target.value)} required />}
                    </label>
                  ))}
                </div>
              </section>
              {settingsFieldGroups.map(({ title, fields }) => (
                <section className="admin-settings-group" key={title}>
                  <div className="admin-settings-group-heading"><h2>{title}</h2><button className="admin-primary-button" disabled={Boolean(savingSection)} onClick={() => saveChanges("settings", fields.map(([field]) => field))}><Save size={15} />{savingSection === "settings" ? "A guardar..." : "Guardar secção"}</button></div>
                  <div className="admin-fields">
                    {fields.map(([field, label, type]) => (
                      <label className={type === "textarea" ? "admin-field admin-field-wide" : "admin-field"} key={field}>{label}
                        {type === "textarea"
                          ? <textarea rows="3" value={settings[field] || ""} onChange={(event) => changeSetting(field, event.target.value)} />
                          : <input type={type || "text"} value={settings[field] || ""} onChange={(event) => changeSetting(field, event.target.value)} required />}
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : <div className="admin-entry-list">
            {entries.map((entry, index) => (
              <article className="admin-entry" key={entry.id}>
                <div className="admin-entry-top"><span>ITEM {String(index + 1).padStart(2, "0")}</span><div className="admin-entry-actions"><button aria-label={`Editar item ${index + 1}`} onClick={() => editEntry(index)}><Pencil size={15} /></button><button aria-label={`Remover item ${index + 1}`} onClick={() => removeEntry(index)}><Trash2 size={16} /></button></div></div>
                <div className="admin-fields">
                  {section.fields.map(([field, label]) => (
                    <label className={["detail", "description"].includes(field) ? "admin-field admin-field-wide" : "admin-field"} key={field}>{label}
                      {["detail", "description"].includes(field)
                        ? <textarea value={entry[field] || ""} rows="2" onChange={(event) => changeEntry(index, field, event.target.value)} />
                        : field === "status" ? <select value={entry[field] || "actual"} onChange={(event) => changeEntry(index, field, event.target.value)}><option value="actual">Colaboração actual</option><option value="anterior">Colaboração anterior</option></select> : <input value={entry[field] || ""} onChange={(event) => changeEntry(index, field, event.target.value)} placeholder={field === "videoUrl" ? "https://..." : ""} />}
                    </label>
                  ))}
                </div>
                <div className="admin-media-upload">
                  <label>
                    {section.mediaLabel}
                    <input
                      type="file"
                      accept={section.mediaAccept}
                      disabled={uploadingId === mediaUploadId(entry.id)}
                      onChange={(event) => handleUpload(index, event)}
                    />
                  </label>
                  <small>
                    {section.mediaKind === "image"
                      ? "JPEG, PNG, WebP, GIF ou AVIF. Máximo: 15 MB."
                      : "MP4, WebM ou MOV. Máximo: 150 MB."}
                  </small>
                  {uploadingId === mediaUploadId(entry.id) && <small className="admin-upload-progress">A carregar ficheiro...</small>}
                  {section.mediaKind === "image" && entry[section.mediaField] && (
                    <img
                      className="admin-media-preview"
                      src={entry[section.mediaField].startsWith("photo-")
                        ? `https://images.unsplash.com/${entry[section.mediaField]}?auto=format&fit=crop&w=320&q=70`
                        : resolveMediaUrl(entry[section.mediaField])}
                      alt={`Pré-visualização: ${entry.title || entry.name || "imagem"}`}
                    />
                  )}
                  {section.mediaKind === "video" && entry[section.mediaField]?.startsWith("/uploads/") && (
                    <video className="admin-video-preview" src={resolveMediaUrl(entry[section.mediaField])} controls preload="metadata" />
                  )}
                </div>
              </article>
            ))}
            {!entries.length && <div className="admin-empty">Ainda não há conteúdo nesta secção. Use “Adicionar” para criar o primeiro item.</div>}
          </div>}
        </section>
      </div>
      {newEntry && (
        <div className="admin-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && uploadingId !== mediaUploadId(newEntry.id)) setNewEntry(null);
        }}>
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
            <header className="admin-modal-header">
              <div><span className="admin-kicker">{editingIndex === null ? "NOVO CONTEÚDO" : "EDITAR CONTEÚDO"}</span><h2 id="admin-modal-title">{editingIndex === null ? "Adicionar" : "Editar"} {section.label.toLowerCase()}</h2></div>
              <button type="button" className="admin-modal-close" aria-label="Fechar" disabled={uploadingId === mediaUploadId(newEntry.id) || savingSection === "brands"} onClick={() => setNewEntry(null)}><X size={19} /></button>
            </header>
            <form onSubmit={confirmAddEntry}>
              <div className="admin-fields">
                {section.fields.map(([field, label]) => (
                  <label className={["detail", "description"].includes(field) ? "admin-field admin-field-wide" : "admin-field"} key={field}>{label}
                    {["detail", "description"].includes(field)
                      ? <textarea value={newEntry[field] || ""} rows="3" onChange={(event) => setNewEntry((current) => ({ ...current, [field]: event.target.value }))} />
                      : field === "status" ? <select value={newEntry[field] || "actual"} onChange={(event) => setNewEntry((current) => ({ ...current, [field]: event.target.value }))}><option value="actual">Colaboração actual</option><option value="anterior">Colaboração anterior</option></select> : <input value={newEntry[field] || ""} onChange={(event) => setNewEntry((current) => ({ ...current, [field]: event.target.value }))} required={["name", "title", "detail", "image", "imageUrl", "videoUrl", "logo"].includes(field)} placeholder={field === "videoUrl" ? "https://..." : ""} />}
                  </label>
                ))}
              </div>
              <div className="admin-media-upload">
                <label>
                  {section.mediaLabel}
                  <input type="file" accept={section.mediaAccept} disabled={uploadingId === mediaUploadId(newEntry.id)} onChange={handleNewEntryUpload} />
                </label>
                <small>{section.mediaKind === "image" ? "JPEG, PNG, WebP, GIF ou AVIF. Máximo: 15 MB." : "MP4, WebM ou MOV. Máximo: 150 MB."}</small>
                {uploadingId === mediaUploadId(newEntry.id) && <small className="admin-upload-progress">A carregar ficheiro...</small>}
                {section.mediaKind === "image" && newEntry[section.mediaField] && (
                  <img className="admin-media-preview" src={newEntry[section.mediaField].startsWith("photo-")
                    ? `https://images.unsplash.com/${newEntry[section.mediaField]}?auto=format&fit=crop&w=320&q=70`
                    : resolveMediaUrl(newEntry[section.mediaField])} alt={`Pré-visualização: ${newEntry.title || newEntry.name || "imagem"}`} />
                )}
                {section.mediaKind === "video" && newEntry[section.mediaField]?.startsWith("/uploads/") && (
                  <video className="admin-video-preview" src={resolveMediaUrl(newEntry[section.mediaField])} controls preload="metadata" />
                )}
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary-button" disabled={uploadingId === mediaUploadId(newEntry.id) || savingSection === "brands"} onClick={() => setNewEntry(null)}>Cancelar</button>
                <button className="admin-primary-button" disabled={uploadingId === mediaUploadId(newEntry.id) || savingSection === "brands"}>{savingSection === "brands" ? <Save size={16} /> : editingIndex === null ? <Plus size={16} /> : <Save size={16} />} {savingSection === "brands" ? "A publicar..." : activeSection === "brands" ? "Guardar e publicar marca" : editingIndex === null ? "Adicionar item" : "Guardar edição"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

