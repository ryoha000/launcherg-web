<script lang="ts">
  import EasyMDE from "easymde";
  import { createEventDispatcher } from "svelte";
  import { base64ImageStore, memo } from "../store/memo";

  let height: number;

  const dispather = createEventDispatcher<{
    sync: {
      value: string;
    };
    takeScreenshot: {
      cursorLine: number;
    };
  }>();

  const mde = (node: HTMLElement) => {
    const easyMDE = new EasyMDE({
      element: node,
      spellChecker: false,
      sideBySideFullscreen: false,
      previewImagesInEditor: true,
      autofocus: true,
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        {
          name: "screenshot",
          action: async () => {
            const cursor = easyMDE.codemirror.getCursor();
            dispather("takeScreenshot", { cursorLine: cursor.line });
          },
          className: "fa fa-desktop",
          title: "Insert screenshot",
        },
      ],
      imagesPreviewHandler: (imagePath) => {
        const dataUrl = $base64ImageStore[imagePath];
        if (dataUrl === undefined) {
          setTimeout(() => {
            easyMDE.value(easyMDE.value());
          }, 10);
          return "";
        }
        return dataUrl;
      },
    });

    const syncTimer = setInterval(() => {
      const current = easyMDE.value();
      if ($memo.value !== current) {
        memo.set({ value: current, lastModified: "local" });
        dispather("sync", { value: easyMDE.value() });
      }
    }, 1000);

    const unsubscribe = memo.subscribe((value) => {
      if (value.lastModified === "remote" && easyMDE.value() !== value.value) {
        easyMDE.value(value.value);
      }
    });

    return {
      destroy: () => {
        clearInterval(syncTimer);
        unsubscribe();
      },
    };
  };
</script>

<div class="w-full h-full min-w-0" bind:clientHeight={height}>
  <textarea id="mde" use:mde />
</div>
