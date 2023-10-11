<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import Description from "./lib/Description.svelte";
  import Header from "./lib/Header.svelte";
  import { useSkyWay } from "./lib/skyway";
  import Memo from "./lib/Memo.svelte";
  import Link from "./lib/Link.svelte";

  const {
    seiyaUrl,
    gameId,
    hasSetting,
    connect,
    cleanup,
    syncMemo,
    takeScreenshot,
  } = useSkyWay();

  $: connectPromise = connect();
  onDestroy(cleanup);
</script>

<main
  class="bg-bg-primary w-full h-full max-w-full max-h-full grid grid-rows-[min-content_1fr] overflow-hidden"
>
  <Header />
  {#if hasSetting}
    {#await connectPromise}
      <div class="flex-(~ col) items-center justify-center gap-5 w-full p-12">
        <div
          class="w-20 h-20 border-(12px solid #D9D9D9 t-#2D2D2D t-rounded) rounded-full animate-spin"
        />
        <div class="text-(text-primary h3) font-bold">処理中</div>
      </div>
    {:then}
      <div class="w-full h-full grid grid-rows-[min-content_1fr]">
        <div class="flex items-center gap-0 px-4 pt-4">
          <Link
            href="https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/game.php?game={gameId}"
            withIcon>ErogameScape</Link
          >
          <Link href={seiyaUrl ?? ""} withIcon>誠也の部屋</Link>
        </div>
        <Memo
          on:sync={(e) => syncMemo(e.detail.value)}
          on:takeScreenshot={(e) => takeScreenshot(e.detail.cursorLine)}
        />
      </div>
    {/await}
  {:else}
    <div class="p-4">
      <Description />
    </div>
  {/if}
</main>
