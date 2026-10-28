import { getContent, saveContent } from "../models/siteContentModel.js";

export async function readContent(_request, response, next) {
  try {
    response.json(await getContent());
  } catch (error) {
    next(error);
  }
}

export async function saveSiteContent(request, response, next) {
  try {
    response.json(await saveContent(request.body));
  } catch (error) {
    if (error.status === 400) {
      return response.status(400).json({ error: error.message });
    }
    next(error);
  }
}

export async function createQuote(request, response, next) {
  try {
    const { name, phone, service, message = "" } = request.body ?? {};
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.length > 120 ||
      typeof phone !== "string" ||
      !phone.trim() ||
      phone.length > 40 ||
      typeof service !== "string" ||
      typeof message !== "string" ||
      message.length > 2000
    ) {
      return response.status(400).json({ error: "Indique um nome, telefone e serviço válidos." });
    }

    const content = await getContent();
    const selectedService = content.services.find((item) => item.name === service);
    if (!selectedService) {
      return response.status(400).json({ error: "Selecione um serviço válido." });
    }

    const text = [
      `Olá! Gostaria de pedir um orçamento à ${content.settings.companyName}.`,
      `Nome: ${name.trim()}`,
      `Telefone: ${phone.trim()}`,
      `Serviço: ${service}`,
      message.trim() ? `Detalhes: ${message.trim()}` : "",
    ].filter(Boolean).join("\n");
    response.json({
      whatsappUrl: `https://wa.me/${content.settings.whatsapp}?text=${encodeURIComponent(text)}`,
    });
  } catch (error) {
    next(error);
  }
}
