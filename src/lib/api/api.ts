// src/lib/api/api.ts
import type {
  SimulationConfig,
  SimulationSnapshot,
  ApiError,
} from "$lib/types/api";

const BASE_URL = "http://127.0.0.1:8000";

// Helper genérico para revisar la respuesta y parsear errores
async function check<T>(res: Response): Promise<T> {
  // Leemos el body una sola vez
  const text = await res.text();
  let data: any = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Si no es JSON, lo guardamos como detail de texto
      data = { detail: text };
    }
  }

  if (!res.ok) {
    const err: ApiError = {
      ...(data as object),
      status: res.status,
    };
    throw err;
  }

  return data as T;
}

export async function resetSimulation(
  config: SimulationConfig,
): Promise<SimulationSnapshot> {
  const res = await fetch(`${BASE_URL}/simulacion/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  return check<SimulationSnapshot>(res);
}

export async function stepSimulation(
  steps = 1,
): Promise<SimulationSnapshot> {
  const res = await fetch(
    `${BASE_URL}/simulacion/step?steps=${steps}`,
    {
      method: "POST",
      headers: { "Accept": "application/json" },
    },
  );
  return check<SimulationSnapshot>(res);
}

export async function getEstado(): Promise<SimulationSnapshot> {
  const res = await fetch(`${BASE_URL}/simulacion/estado`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  return check<SimulationSnapshot>(res);
}