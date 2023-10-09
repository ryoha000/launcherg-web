<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import Description from "./lib/Description.svelte";
  import Header from "./lib/Header.svelte";
  import { useSkyWay } from "./lib/skyway";
  import Memo from "./lib/Memo.svelte";
  import Link from "./lib/Link.svelte";

  const { hasSetting, connect, cleanup, syncMemo } = useSkyWay();
  onMount(connect);
  onDestroy(cleanup);

  let memo = "";
</script>

<main
  class="bg-bg-primary w-full h-full max-w-full max-h-full grid grid-rows-[min-content_1fr] overflow-hidden"
>
  <Header />
  <div class="w-full h-full grid grid-rows-[min-content_1fr]">
    <div class="flex items-center gap-0 px-4 pt-4">
      <Link href="https://google.com" withIcon>ErogameScape</Link>
      <Link href="https://google.com" withIcon>誠也の部屋</Link>
    </div>
    <Memo on:sync={(e) => syncMemo(e.detail.value)} />
  </div>
  <!-- {#if hasSetting}
    <div>connect</div>
    <Memo {gameId} />
    <textarea
      class="w-full h-64 bg-bg-secondary text-text-primary text-body p-2 rounded-md"
      placeholder="memo"
      bind:value={memo}
    />
  {:else}
    <div class="p-4">
      <Description />
    </div>
  {/if} -->
</main>
