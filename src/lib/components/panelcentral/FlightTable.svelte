<script lang="ts">
    import type { PlaneDTO } from "$lib/types/api";

    export let planes: PlaneDTO[] = [];

    // Estado actual de vuelos (no en "gone" o "diverted")
    $: activeFlights = planes.filter(
        (p) => p.state !== "gone" && p.state !== "diverted",
    );

    // Sorting
    let sortBy: "code" | "distance" | "fuel" | "airline" = "distance";
    let sortDesc = false;

    $: sortedFlights = [...activeFlights].sort((a, b) => {
        let aVal: any, bVal: any;

        switch (sortBy) {
            case "code":
                aVal = a.flight_code;
                bVal = b.flight_code;
                break;
            case "distance":
                aVal = a.distancia;
                bVal = b.distancia;
                break;
            case "fuel":
                aVal = a.combustible;
                bVal = b.combustible;
                break;
            case "airline":
                aVal = a.airline.name;
                bVal = b.airline.name;
                break;
        }

        if (aVal < bVal) return sortDesc ? 1 : -1;
        if (aVal > bVal) return sortDesc ? -1 : 1;
        return 0;
    });

    function toggleSort(column: typeof sortBy) {
        if (sortBy === column) {
            sortDesc = !sortDesc;
        } else {
            sortBy = column;
            sortDesc = false;
        }
    }

    // Estado en español con iconos
    const stateLabels: Record<string, string> = {
        arriving: "🛬 Llegando",
        holding: "🔄 En órbita",
        waiting: "⏳ En tierra",
        queued_departure: "📋 En cola",
        departing: "🛫 Despegando",
        diverted: "↗️ Desviado",
        gone: "✓ Completado",
    };
</script>

<div class="flight-table-container">
    <div class="table-header">
        <h3 class="text-white text-sm font-semibold">
            Tabla de Vuelos ({activeFlights.length})
        </h3>
    </div>

    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th on:click={() => toggleSort("code")} class="sortable">
                        Código {sortBy === "code" ? (sortDesc ? "▼" : "▲") : ""}
                    </th>
                    <th on:click={() => toggleSort("airline")} class="sortable">
                        Aerolínea {sortBy === "airline"
                            ? sortDesc
                                ? "▼"
                                : "▲"
                            : ""}
                    </th>
                    <th>Estado</th>
                    <th
                        on:click={() => toggleSort("distance")}
                        class="sortable"
                    >
                        Distancia {sortBy === "distance"
                            ? sortDesc
                                ? "▼"
                                : "▲"
                            : ""}
                    </th>
                    <th on:click={() => toggleSort("fuel")} class="sortable">
                        Combustible {sortBy === "fuel"
                            ? sortDesc
                                ? "▼"
                                : "▲"
                            : ""}
                    </th>
                    <th>Prioridad</th>
                </tr>
            </thead>
            <tbody>
                {#each sortedFlights as flight (flight.id)}
                    <tr class:emergency={flight.emergencia}>
                        <!-- Código de vuelo -->
                        <td class="font-mono font-bold">
                            {flight.flight_code}
                        </td>

                        <!-- Aerolínea con color -->
                        <td>
                            <span
                                class="airline-badge"
                                style="background-color: {flight.airline
                                    .color}20; color: {flight.airline
                                    .color}; border-color: {flight.airline
                                    .color};"
                            >
                                {flight.airline.name}
                            </span>
                        </td>

                        <!-- Estado -->
                        <td class="text-xs">
                            {stateLabels[flight.state] || flight.state}
                        </td>

                        <!-- Distancia -->
                        <td class="text-right">
                            {flight.distancia.toFixed(1)} km
                        </td>

                        <!-- Combustible con barra -->
                        <td>
                            <div class="fuel-container">
                                <div
                                    class="fuel-bar"
                                    style="width: {flight.combustible}%;"
                                    class:low={flight.combustible <= 20}
                                    class:medium={flight.combustible > 20 &&
                                        flight.combustible <= 50}
                                    class:high={flight.combustible > 50}
                                ></div>
                                <span class="fuel-text"
                                    >{flight.combustible}%</span
                                >
                            </div>
                        </td>

                        <!-- Prioridad -->
                        <td class="text-center">
                            {#if flight.emergencia}
                                <span class="priority-icon emergency-icon"
                                    >🚨</span
                                >
                            {:else if flight.prioridad === 1}
                                <span class="priority-icon warning-icon"
                                    >⚠️</span
                                >
                            {:else}
                                <span class="priority-icon">✓</span>
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>

        {#if activeFlights.length === 0}
            <div class="empty-state">
                <p>No hay vuelos activos</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .flight-table-container {
        background: #1a2b3a;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid #1f3a55;
    }

    .table-header {
        padding: 12px 16px;
        border-bottom: 1px solid #1f3a55;
    }

    .table-wrapper {
        max-height: 400px;
        overflow-y: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    thead {
        position: sticky;
        top: 0;
        background: #0f1c2d;
        z-index: 10;
    }

    th {
        padding: 12px;
        text-align: left;
        font-size: 11px;
        font-weight: 600;
        color: #9fb9d8;
        text-transform: uppercase;
        border-bottom: 1px solid #1f3a55;
    }

    th.sortable {
        cursor: pointer;
        user-select: none;
    }

    th.sortable:hover {
        background: #162333;
        color: #26c6da;
    }

    td {
        padding: 10px 12px;
        font-size: 13px;
        color: #e4f4ff;
        border-bottom: 1px solid #1f3a5530;
    }

    tbody tr {
        transition: background 0.2s;
    }

    tbody tr:hover {
        background: #0f1c2d;
    }

    tbody tr.emergency {
        background: #dc262620;
    }

    tbody tr.emergency:hover {
        background: #dc262630;
    }

    .airline-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        border: 1px solid;
    }

    .fuel-container {
        position: relative;
        width: 80px;
        height: 16px;
        background: #0f1c2d;
        border-radius: 8px;
        overflow: hidden;
    }

    .fuel-bar {
        height: 100%;
        transition: width 0.3s;
        border-radius: 8px;
    }

    .fuel-bar.high {
        background: #26c6da;
    }

    .fuel-bar.medium {
        background: #f59e0b;
    }

    .fuel-bar.low {
        background: #ef4444;
    }

    .fuel-text {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 600;
        color: white;
        text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    }

    .priority-icon {
        font-size: 16px;
    }

    .empty-state {
        padding: 40px;
        text-align: center;
        color: #9fb9d8;
        font-size: 14px;
    }

    /* Scrollbar styling */
    .table-wrapper::-webkit-scrollbar {
        width: 8px;
    }

    .table-wrapper::-webkit-scrollbar-track {
        background: #0f1c2d;
    }

    .table-wrapper::-webkit-scrollbar-thumb {
        background: #1f3a55;
        border-radius: 4px;
    }

    .table-wrapper::-webkit-scrollbar-thumb:hover {
        background: #26c6da;
    }
</style>
