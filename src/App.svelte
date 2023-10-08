<script lang="ts">
  import { onMount } from "svelte";
  import Description from "./lib/Description.svelte";
  import Header from "./lib/Header.svelte";
  import { useWebRTC } from "./lib/webrtc";

  const { hasSetting, connect } = useWebRTC();
  onMount(connect);

  let memo = "";
</script>

<main class="bg-bg-primary w-full h-full">
  <Header />
  <div class="p-4">
    {#if hasSetting}
      <div>connect</div>
      <textarea
        class="w-full h-64 bg-bg-secondary text-text-primary text-body p-2 rounded-md"
        placeholder="memo"
        bind:value={memo}
      />
    {:else}
      <Description />
    {/if}
  </div>
</main>
