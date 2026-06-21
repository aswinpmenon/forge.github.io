<script>
  let {
    data = [],
    color = 'var(--color-lime)',
    height = 120,
    fill = true,
    labels = []
  } = $props();

  const W = 320;
  const H = $derived(height);
  const pad = 8;

  const pts = $derived(data.length ? data : [0]);
  const max = $derived(Math.max(...pts, 1));
  const min = $derived(Math.min(...pts, 0));
  const span = $derived(max - min || 1);

  function x(i) {
    return pts.length === 1 ? W / 2 : pad + (i * (W - pad * 2)) / (pts.length - 1);
  }
  function y(v) {
    return H - pad - ((v - min) / span) * (H - pad * 2);
  }

  const line = $derived(pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' '));
  const area = $derived(`${line} L${x(pts.length - 1).toFixed(1)},${H - pad} L${x(0).toFixed(1)},${H - pad} Z`);
</script>

<svg viewBox="0 0 {W} {H}" width="100%" {height} preserveAspectRatio="none" style="overflow:visible">
  <defs>
    <linearGradient id="lcfill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color={color} stop-opacity="0.28" />
      <stop offset="100%" stop-color={color} stop-opacity="0" />
    </linearGradient>
  </defs>
  {#if fill}<path d={area} fill="url(#lcfill)" />{/if}
  <path d={line} fill="none" stroke={color} stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  {#each pts as v, i}
    <circle cx={x(i)} cy={y(v)} r="2.5" fill={color} />
  {/each}
</svg>
{#if labels.length}
  <div class="flex justify-between mt-1.5 px-1">
    {#each labels as l}<span class="text-[10px] text-(--color-ink-faint)">{l}</span>{/each}
  </div>
{/if}
