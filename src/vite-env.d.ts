/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_OPENAI_MODEL?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_MISTRAL_API_KEY?: string;
  readonly VITE_MISTRAL_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}