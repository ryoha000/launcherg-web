import "@unocss/reset/tailwind-compat.css";
import "uno.css";
import "./index.scss";
import "easymde/dist/easymde.min.css";
import App from "./App.svelte";

const app = new App({
  target: document.getElementById("app")!,
});

export default app;
