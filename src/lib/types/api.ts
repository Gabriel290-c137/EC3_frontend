// src/lib/types/api.ts

// ====== Tipos básicos que reflejan el backend (api.py) ======

export type ScenarioType = "Equilibrio" | "Normal" | "Sobrecarga" | "Libre";

export type ClimaType =
  | "ninguno"
  | "normal"
  | "lluvia"
  | "tormenta"
  | "viento_fuerte"
  | "niebla"
  | "microburst";

export type TimePeriod = "morning" | "day" | "evening" | "night";

export interface TimeInfo {
  hour: number;
  minute: number;
  period: TimePeriod;
}

// Configuración que viaja entre frontend y backend
export interface SimulationConfig {
  scenario: ScenarioType;
  allow_diversion: boolean;
  max_holding_time: number;
  clima_manual: ClimaType;
  usar_probabilidades: boolean;

  // Parámetros granulares (opcionales)
  arrival_rate?: number;
  max_ground?: number;
  turn_time?: number;
  takeoff_time?: number;
  max_release_per_step?: number;

  // Sistema de tiempo
  minutes_per_step?: number;
}

// Info mínima de una aerolínea asociada a un avión
export interface PlaneAirlineInfo {
  name: string;
  code: string;
  color: string;
}

// Estados posibles del avión (coinciden con tu lógica en Airplane.step)
export type PlaneState =
  | "arriving"
  | "holding"
  | "waiting"
  | "queued_departure"
  | "departing"
  | "diverted"
  | "gone"
  | "unknown";

// DTO de avión que devuelve el backend
export interface PlaneDTO {
  id: number;
  flight_code: string;
  x: number;
  y: number;
  state: PlaneState;
  prioridad: number;
  combustible: number;
  emergencia: boolean;
  goaround_blink: number;
  desviado: boolean;
  distancia: number;
  airline: PlaneAirlineInfo;
}

// DTO de aerolínea global (no solo el avion)
export interface AirlineDTO {
  name: string;
  code: string;
  color: string;
  vuelos: number;
  desvios: number;
  costo: number;             // por ahora placeholder
  retraso_promedio: number;  // placeholder
}

// Info de clima dentro de las métricas
export interface ClimaInfo {
  tipo: ClimaType | "ninguno";
  factor: number;
}

// Métricas globales (equivalente al InfoPanel + ChartModule)
export interface Metrics {
  total_arrivals: number;     // Llegadas
  total_departures: number;   // Salidas
  total_diverted: number;     // Desviados
  emergencias: number;        // aviones emergencia
  en_espera: number;          // prioridad 1
  clima: ClimaInfo;           // clima_actual + factor_clima
  time?: TimeInfo;            // información de hora (opcional para retrocompatibilidad)
}

// Pistas simples
export interface RunwayDTO {
  id: number;
  busy: boolean;
  remaining: number;
  plane_id: number | null;
}

// Snapshot completo que devuelve /simulacion/reset, /simulacion/step, /simulacion/estado
export interface SimulationSnapshot {
  step: number;
  config: SimulationConfig;
  planes: PlaneDTO[];
  airlines: AirlineDTO[];
  metrics: Metrics;
  runways: RunwayDTO[];
}

// Para manejar errores que vengan del backend
export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}
