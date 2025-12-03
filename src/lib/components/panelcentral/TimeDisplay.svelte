<script lang="ts">
    import type { TimeInfo } from "$lib/types/api";

    export let time: TimeInfo | undefined = undefined;

    // Iconos según período del día
    const icons: Record<string, string> = {
        morning: "🌅",
        day: "☀️",
        evening: "🌇",
        night: "🌙",
    };

    $: icon = time ? icons[time.period] || "🕐" : "🕐";
    $: hourStr = time ? String(time.hour).padStart(2, "0") : "00";
    $: minuteStr = time ? String(time.minute).padStart(2, "0") : "00";
</script>

<div
    class="bg-[#020817] border border-[#1F3A55] rounded-xl px-4 py-2 shadow-md flex items-center gap-3"
>
    <span class="text-2xl">{icon}</span>
    <div>
        <p class="text-[10px] text-[#9FB9D8] uppercase tracking-wide">Hora</p>
        <p class="text-lg font-bold text-[#E4F4FF]">
            {hourStr}:{minuteStr}
        </p>
    </div>
</div>
