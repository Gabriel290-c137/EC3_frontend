// src/lib/types/api.ts - TIPOS ACTUALIZADOS

export type ClimaType =
  | "ninguno"
  | "normal"
  | "lluvia"
  | "tormenta"
  | "viento_fuerte"
  | "niebla"
  | "microburst";

export type ScenarioType = "Equilibrio" | "Normal" | "Sobrecarga" | "Libre";

export type ApiError = {
  message?: string;
  detail?: string;
  status?: number; // ← ahora sí puedes usar status
};

export interface SimulationConfig {
  scenario: ScenarioType;
  allow_diversion: boolean;
  max_holding_time: number;
  clima_manual: ClimaType;
  usar_probabilidades: boolean;
  arrival_rate?: number;
  max_ground?: number;
  turn_time?: number;
  takeoff_time?: number;
  max_release_per_step?: number;
  minutes_per_step?: number;
}

export interface AirlineDTO {
  name: string;
  code: string;
  color: string;
}

export interface PlaneDTO {
  id: number;
  flight_code: string;
  x: number;
  y: number;
  state: string;
  prioridad: number;
  combustible: number;
  emergencia: boolean;
  goaround_blink: number;
  desviado: boolean;
  distancia: number;
  holding_time: number;
  airline: AirlineDTO;
}

// 🆕 NUEVOS TIPOS PARA COSTOS Y PERFORMANCE

export interface AirlineCosts {
  fuel: number;
  delays: number;
  diversions: number;
  emergencies: number;
  total: number;
}

export interface AirlinePerformance {
  avg_holding_time: number;
  diversion_rate: number;
  cost_per_flight: number;
  completed_flights: number;
  efficiency_score: number;
}

export interface AirlineExtendedDTO extends AirlineDTO {
  vuelos: number;
  desvios: number;
  costos: AirlineCosts;
  performance: AirlinePerformance;
}

// 🆕 MÉTRICAS AVANZADAS

export interface AdvancedMetrics {
  throughput: number;
  runway_utilization: number;
  avg_holding_time: number;
  fuel_efficiency: number;
  emergency_rate: number;
}

export interface TowerStatistics {
  reordenamientos: number;
  emergencias_atendidas: number;
  desviaciones: number;
  eficiencia: number;
}

export interface TimeInfo {
  hour: number;
  minute: number;
  period: "morning" | "day" | "evening" | "night";
}

export interface ClimaInfo {
  tipo: ClimaType;
  factor: number;
}

export interface Metrics {
  total_arrivals: number;
  total_departures: number;
  total_diverted: number;
  emergencias: number;
  en_espera: number;
  advanced: AdvancedMetrics;
  tower: TowerStatistics;
  clima: ClimaInfo;
  time: TimeInfo;
}

export interface RunwayDTO {
  id: number;
  busy: boolean;
  remaining: number;
  plane_id: number | null;
}

export interface SimulationSnapshot {
  step: number;
  config: SimulationConfig;
  planes: PlaneDTO[];
  airlines: AirlineExtendedDTO[];
  metrics: Metrics;
  runways: RunwayDTO[];
}

// 🆕 TIPOS PARA EXPORTACIÓN

export interface ExportData {
  steps: number[];
  llegadas: number[];
  salidas: number[];
  emergencias: number[];
  desviados: number[];
  en_espera: number[];
  aviones_en_holding: number[];
  tiempo_holding_promedio: number[];
  utilizacion_pistas: number[];
  throughput: number[];
  eficiencia_combustible: number[];
  tasa_emergencias: number[];
}

export interface SimulationSummary {
  scenario: string;
  total_steps: number;
  horas_simuladas: number;
  kpis: {
    total_flights: number;
    success_rate: number;
    diversion_rate: number;
    throughput: number;
    runway_utilization: number;
    avg_holding_time: number;
  };
  best_airline: {
    name: string;
    score: number;
  };
  tower_performance: TowerStatistics;
}