<script>
  let {
    value = 0,
    max = 100,
    size = 108,
    stroke = 11,
    color = 'var(--color-lime)',
    label = ''
  } = $props();

  const r = $derived((size - stroke) / 2 - 2);
  const circ = $derived(2 * Math.PI * r);
  const pct = $derived(Math.max(0, Math.min(1, max ? value / max : 0)));
  const offset = $derived(circ * (1 - pct));
</script>

<div class="relative inline-grid place-items-center" style="width:{size}px;height:{size}px">
  <svg width={size} height={size} style="transform:rotate(-90deg)">
    <circle cx={size / 2} cy={size / 2} {r} fill="none" stroke="rgba(255,255,255,0.12)" stroke-width={stroke} />
    <circle
      cx={size / 2}
      cy={size / 2}
      {r}
      fill="none"
      stroke={color}
      stroke-width={stroke}
      stroke-linecap="round"
      stroke-dasharray={circ}
      stroke-dashoffset={offset}
      style="transition:stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)"
    />
  </svg>
  <div class="absolute inset-0 grid place-content-center text-center">
    <div class="num text-[22px] text-white leading-none">{value.toLocaleString()}</div>
    {#if label}<div class="text-[9px] text-(--color-ink-dim) font-medium mt-0.5">{label}</div>{/if}
  </div>
</div>
