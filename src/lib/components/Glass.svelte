<script>
  let { strong = false, padding = 'p-4', class: klass = '', children, ...rest } = $props();
</script>

<div class="{strong ? 'glass-strong' : 'glass'} {padding} {klass}" {...rest}>
  {@render children?.()}
</div>
