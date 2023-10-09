<script lang="ts">
  export let href: string;
  export let withIcon: boolean;
</script>

<a
  {href}
  target="_blank"
  rel="noopener noreferrer"
  class="rounded flex h-8 items-center px-3 gap-2 bg-transparent transition-all hover:bg-bg-button-hover"
>
  <div class="whitespace-nowrap text-(body2 text-link) font-medium">
    <slot />
  </div>
  {#if withIcon}
    <div
      class="w-4 h-4 color-text-link i-material-symbols-open-in-new-rounded"
    />
  {/if}
</a>
