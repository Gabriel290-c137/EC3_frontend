<script lang="ts">
    import type { ClimaType } from "$lib/types/api";

    export let clima: ClimaType | "ninguno" = "ninguno";

    // Mostrar efectos solo para lluvia y tormenta
    $: showRain = clima === "lluvia" || clima === "tormenta";
    $: showLightning = clima === "tormenta";

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

    // Trigger lightning randomly when storm is active
    import { onMount } from "svelte";

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

{#if showRain || showLightning}
    <div class="weather-effects">
        {#if showRain}
            <div class="rain">
                {#each Array(100) as _, i}
                    <div
                        class="rain-drop"
                        style="left: {Math.random() *
                            100}%; animation-delay: {Math.random() *
                            2}s; animation-duration: {0.5 +
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
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
    }

    .rain {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .rain-drop {
        position: absolute;
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
            transform: translateY(-100px);
        }
        to {
            transform: translateY(100vh);
        }
    }

    .lightning-flash {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.7);
        animation: flash 0.15s ease-out;
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
