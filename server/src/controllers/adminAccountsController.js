import { addAdmin, listAdmins, removeAdmin } from "../models/adminModel.js";

export async function readAdmins(_request, response, next) {
  try {
    response.json(await listAdmins());
  } catch (error) {
    next(error);
  }
}

export async function createAdminAccount(request, response, next) {
  try {
    const admin = await addAdmin(request.body?.email, request.body?.password);
    response.status(201).json(admin);
  } catch (error) {
    if (error.status) return response.status(error.status).json({ error: error.message });
    next(error);
  }
}

export async function deleteAdminAccount(request, response, next) {
  try {
    await removeAdmin(request.params.id, request.admin.id);
    response.status(204).end();
  } catch (error) {
    if (error.status) return response.status(error.status).json({ error: error.message });
    next(error);
  }
}
