// src/lib/utils/model.ts

import type {
  SimulationConfig,
  ScenarioType,
  ClimaType,
  PlaneDTO,
} from "$lib/types/api";

// ====== Config por defecto (igual que en api.py) ======

export const DEFAULT_SCENARIO: ScenarioType = "Equilibrio";
export const DEFAULT_CLIMA: ClimaType = "ninguno";

export const DEFAULT_CONFIG: SimulationConfig = {
  scenario: DEFAULT_SCENARIO,
  allow_diversion: false,
  max_holding_time: 10,
  clima_manual: DEFAULT_CLIMA,
  usar_probabilidades: true,
};

// ====== Helpers simples para el panel ======

/**
 * Cuenta la cantidad total de aviones (puedes luego hacer filtros
 * por estado si quieres algo más detallado).
 */
export function countPlanes(planes: PlaneDTO[] | undefined | null): number {
  if (!planes) return 0;
  return planes.length;
}

/**
 * Ejemplo de helper extra: contar solo aviones en holding.
 */
export function countHolding(planes: PlaneDTO[] | undefined | null): number {
  if (!planes) return 0;
  return planes.filter((p) => p.state === "holding").length;
}

/**
 * Helper para saber si hay algún go-around activo (goaround_blink > 0)
 */
export function hasGoAround(planes: PlaneDTO[] | undefined | null): boolean {
  if (!planes) return false;
  return planes.some((p) => p.goaround_blink > 0);
}
