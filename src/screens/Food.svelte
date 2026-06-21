<script>
  import Glass from '../lib/components/Glass.svelte';
  import Icon from '../lib/components/Icon.svelte';
  import { AI } from '../lib/supabase.js';
  import { addFood, deleteFood, todayFood, todayTotals, foodName } from '../lib/stores/data.js';
  import { toast } from '../lib/toast.js';

  const courses = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  let course = $state('Lunch');
  let name = $state('');
  let calories = $state('');
  let protein = $state('');
  let carbs = $state('');
  let fat = $state('');

  let analyzing = $state(false);
  let aiItems = $state([]);
  let listening = $state(false);
  let fileInput;

  async function submit() {
    const kcal = parseInt(calories, 10);
    if (!name.trim() || !kcal) {
      toast('Add a name and calories', false);
      return;
    }
    const err = await addFood({
      course, name: name.trim(), calories: kcal,
      protein: +protein || 0, carbs: +carbs || 0, fat: +fat || 0,
      location: 'Manual'
    });
    if (err) { toast('Save failed', false); return; }
    toast('Logged ' + kcal + ' kcal');
    name = ''; calories = ''; protein = ''; carbs = ''; fat = '';
  }

  async function analyzePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    analyzing = true;
    aiItems = [];
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(AI.analyze, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      aiItems = (data.items || []).map((i) => ({ name: i.name, calories: i.calories }));
      if (!aiItems.length) toast('No food recognized', false);
      else toast('AI estimate ready');
    } catch {
      toast('AI analysis failed', false);
    } finally {
      analyzing = false;
      e.target.value = '';
    }
  }

  const aiTotal = $derived(aiItems.reduce((a, i) => a + (+i.calories || 0), 0));

  async function confirmAi() {
    if (!aiTotal) return;
    const label = aiItems.map((i) => i.name).join(', ');
    await addFood({ course, name: label, calories: aiTotal, location: 'AI Scan' });
    toast('Logged ' + aiTotal + ' kcal');
    aiItems = [];
  }

  function voice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Voice not supported here', false); return; }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    listening = true;
    rec.onresult = (ev) => {
      const text = ev.results[0][0].transcript;
      const m = text.match(/(\d+)\s*(cal|kcal|calorie)/i);
      if (m) { calories = m[1]; name = text.replace(m[0], '').trim(); }
      else name = text;
    };
    rec.onerror = () => toast('Could not hear that', false);
    rec.onend = () => (listening = false);
    rec.start();
  }
</script>

<header class="flex items-center gap-2.5 mb-3 px-1">
  <h1 class="text-2xl font-extrabold tracking-tight">Log food</h1>
  <span class="ml-auto tnum text-(--color-ink-dim) text-sm">{$todayTotals.kcal.toLocaleString()} kcal today</span>
</header>

<!-- course pills -->
<div class="flex gap-2 mb-3 overflow-x-auto no-sb">
  {#each courses as c}
    <button onclick={() => (course = c)}
      class="px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition"
      style="{course === c
        ? 'background:linear-gradient(145deg,#d6ff3a,#9ee000);color:#0a2000'
        : 'background:rgba(255,255,255,.08);color:var(--color-ink-dim);border:1px solid rgba(255,255,255,.12)'}">
      {c}
    </button>
  {/each}
</div>

<!-- capture row -->
<Glass class="mb-3 flex items-center gap-2.5">
  <Icon name="search" size={18} color="var(--color-ink-dim)" />
  <input bind:value={name} placeholder="Describe a meal…"
    class="flex-1 bg-transparent outline-none text-sm placeholder:text-(--color-ink-faint)" />
  <button onclick={voice} aria-label="Voice entry"
    class="w-9 h-9 rounded-full grid place-items-center"
    style="color:#0a2000;background:linear-gradient(145deg,#d6ff3a,#9ee000);{listening ? 'animation:pulse 1s infinite' : ''}">
    <Icon name="mic" size={16} />
  </button>
  <button onclick={() => fileInput.click()} aria-label="Photo analysis"
    class="w-9 h-9 rounded-full grid place-items-center"
    style="color:#062018;background:linear-gradient(145deg,#5effb0,#1fd98a)">
    <Icon name="camera" size={16} />
  </button>
  <input bind:this={fileInput} onchange={analyzePhoto} type="file" accept="image/*" capture="environment" class="hidden" />
</Glass>

{#if analyzing}
  <Glass class="mb-3 text-center text-sm text-(--color-ink-dim) py-5">Analyzing photo…</Glass>
{/if}

{#if aiItems.length}
  <Glass class="mb-3" style="border-color:rgba(184,255,0,.35)">
    <div class="flex items-center gap-1.5 mb-3">
      <Icon name="sparkles" size={15} color="var(--color-lime)" />
      <span class="text-[11px] font-semibold tracking-wide" style="color:var(--color-lime)">AI ANALYSIS</span>
      <span class="ml-auto num text-lg" style="color:var(--color-lime)">{aiTotal}</span>
    </div>
    <div class="flex flex-col gap-2 mb-3">
      {#each aiItems as item, i}
        <div class="flex items-center justify-between gap-2 text-sm">
          <span>{item.name}</span>
          <input type="number" bind:value={aiItems[i].calories}
            class="w-20 text-right bg-transparent outline-none tnum font-semibold rounded-lg px-2 py-1"
            style="background:rgba(255,255,255,.08)" />
        </div>
      {/each}
    </div>
    <div class="flex gap-2.5">
      <button onclick={() => (aiItems = [])} class="flex-1 py-2.5 rounded-2xl text-sm font-medium text-(--color-ink-dim)" style="background:rgba(255,255,255,.08)">Discard</button>
      <button onclick={confirmAi} class="flex-[2] py-2.5 rounded-2xl text-sm font-semibold" style="background:linear-gradient(145deg,#d6ff3a,#9ee000);color:#0a2000">Add to log</button>
    </div>
  </Glass>
{/if}

<!-- manual entry -->
<Glass class="mb-3">
  <div class="text-[11px] font-semibold tracking-wide text-(--color-ink-dim) mb-3">QUICK ADD</div>
  <div class="grid grid-cols-2 gap-2.5 mb-2.5">
    <label class="col-span-2 flex flex-col gap-1">
      <span class="text-[11px] text-(--color-ink-dim)">Calories (kcal)</span>
      <input bind:value={calories} type="number" inputmode="numeric" placeholder="520"
        class="bg-transparent outline-none rounded-xl px-3 py-2.5 text-sm tnum" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)" />
    </label>
    {#each [['Protein', 'protein'], ['Carbs', 'carbs'], ['Fat', 'fat']] as [lbl, key]}
      <label class="flex flex-col gap-1">
        <span class="text-[11px] text-(--color-ink-dim)">{lbl} (g)</span>
        <input value={key === 'protein' ? protein : key === 'carbs' ? carbs : fat}
          oninput={(e) => { if (key==='protein') protein=e.target.value; else if (key==='carbs') carbs=e.target.value; else fat=e.target.value; }}
          type="number" inputmode="numeric" placeholder="0"
          class="bg-transparent outline-none rounded-xl px-3 py-2.5 text-sm tnum" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)" />
      </label>
    {/each}
  </div>
  <button onclick={submit} class="w-full py-3 rounded-2xl text-sm font-semibold active:scale-[.98] transition"
    style="background:linear-gradient(145deg,#d6ff3a,#9ee000);color:#0a2000">Add to log</button>
</Glass>

<!-- today's entries -->
<div class="text-[11px] font-semibold tracking-wide text-(--color-ink-dim) mb-2 px-1">
  TODAY · {$todayFood.length} {$todayFood.length === 1 ? 'ENTRY' : 'ENTRIES'}
</div>
<Glass padding="p-1.5">
  {#if $todayFood.length === 0}
    <p class="text-sm text-(--color-ink-faint) py-6 text-center">Nothing logged yet.</p>
  {:else}
    {#each $todayFood as r, i}
      {#if i > 0}<div class="h-px mx-3" style="background:rgba(255,255,255,.08)"></div>{/if}
      <div class="flex items-center gap-3 px-2.5 py-2.5">
        <div class="flex-1 min-w-0">
          <div class="text-sm truncate">{foodName(r)}</div>
          <div class="text-[11px] text-(--color-ink-dim)">{r.course} · {r.location}</div>
        </div>
        <span class="tnum text-sm font-semibold">{r.calories_kcal}</span>
        <button onclick={() => deleteFood(r.id)} aria-label="Delete" class="text-(--color-ink-faint) hover:text-(--color-danger)">
          <Icon name="trash" size={16} />
        </button>
      </div>
    {/each}
  {/if}
</Glass>

<style>
  @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(214,255,58,.5); } 50% { box-shadow: 0 0 0 8px rgba(214,255,58,0); } }
</style>
