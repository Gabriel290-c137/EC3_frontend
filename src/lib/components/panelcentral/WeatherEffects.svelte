<!-- src/lib/components/panelcentral/WeatherEffects.svelte -->

<script lang="ts">
    import type { ClimaType } from "$lib/types/api";
    import { onMount } from "svelte";

    export let clima: ClimaType | "ninguno" = "ninguno";

    // Mostrar efectos según el clima
    $: showRain = clima === "lluvia" || clima === "tormenta";
    $: showLightning = clima === "tormenta";
    $: showFog = clima === "niebla";
    $: showWind = clima === "viento_fuerte";

    // Lightning flash trigger
    let lightningActive = false;

    function triggerLightning() {
        if (showLightning && Math.random() < 0.3) {
            lightningActive = true;
            setTimeout(() => {
                lightningActive = false;
            }, 150);
        }
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    $: {
        if (showLightning) {
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(
                triggerLightning,
                2000 + Math.random() * 3000,
            );
        } else {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }
    }

    onMount(() => {
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    });
</script>

{#if showRain || showLightning || showFog || showWind}
    <div class="weather-effects">
        {#if showRain}
            <div class="rain">
                {#each Array(80) as _, i}
                    <div
                        class="rain-drop"
                        style="left: {Math.random() *
                            100}%; animation-delay: {Math.random() *
                            2}s; animation-duration: {0.8 +
                            Math.random() * 0.4}s;"
                    ></div>
                {/each}
            </div>
        {/if}

        {#if showFog}
            <div class="fog">
                <div class="fog-layer fog-layer-1"></div>
                <div class="fog-layer fog-layer-2"></div>
                <div class="fog-layer fog-layer-3"></div>
            </div>
        {/if}

        {#if showWind}
            <div class="wind">
                {#each Array(20) as _, i}
                    <div
                        class="wind-line"
                        style="top: {Math.random() *
                            100}%; animation-delay: {Math.random() *
                            3}s; animation-duration: {1 +
                            Math.random() * 0.5}s;"
                    ></div>
                {/each}
            </div>
        {/if}

        {#if lightningActive}
            <div class="lightning-flash"></div>
        {/if}
    </div>
{/if}

<style>
    .weather-effects {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
        overflow: hidden;
        border-radius: 1rem;
    }

    /* LLUVIA */
    .rain {
        position: absolute;
        top: -50px;
        left: 0;
        width: 100%;
        height: calc(100% + 100px);
    }

    .rain-drop {
        position: absolute;
        top: -50px;
        width: 2px;
        height: 20px;
        background: linear-gradient(
            to bottom,
            rgba(174, 194, 224, 0),
            rgba(174, 194, 224, 0.8)
        );
        animation: fall linear infinite;
        opacity: 0.6;
    }

    @keyframes fall {
        from {
            transform: translateY(0);
        }
        to {
            transform: translateY(calc(100vh + 100px));
        }
    }

    /* NIEBLA */
    .fog {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .fog-layer {
        position: absolute;
        width: 100%;
        height: 100%;
        background: radial-gradient(
            ellipse at center,
            rgba(200, 200, 220, 0.4) 0%,
            rgba(150, 150, 180, 0.2) 50%,
            transparent 100%
        );
        animation: fogMove linear infinite;
    }

    .fog-layer-1 {
        animation-duration: 20s;
        opacity: 0.6;
    }

    .fog-layer-2 {
        animation-duration: 30s;
        animation-delay: -10s;
        opacity: 0.4;
    }

    .fog-layer-3 {
        animation-duration: 25s;
        animation-delay: -5s;
        opacity: 0.5;
    }

    @keyframes fogMove {
        0% {
            transform: translateX(-10%) translateY(-10%) scale(1);
        }
        50% {
            transform: translateX(10%) translateY(5%) scale(1.1);
        }
        100% {
            transform: translateX(-10%) translateY(-10%) scale(1);
        }
    }

    /* VIENTO FUERTE */
    .wind {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .wind-line {
        position: absolute;
        left: -100px;
        width: 100px;
        height: 2px;
        background: linear-gradient(
            to right,
            transparent,
            rgba(200, 220, 240, 0.6),
            transparent
        );
        animation: windBlow linear infinite;
    }

    @keyframes windBlow {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(calc(100vw + 200px));
        }
    }

    /* RELÁMPAGO */
    .lightning-flash {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.7);
        animation: flash 0.15s ease-out;
        border-radius: 1rem;
    }

    @keyframes flash {
        0% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }
</style>