/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEXT_APP_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
