// src/lib/stores/model.ts
import { writable } from "svelte/store";
import type { SimulationSnapshot } from "$lib/types/api";

export const estado = writable<SimulationSnapshot | null>(null);
export const inicializado = writable(false);
