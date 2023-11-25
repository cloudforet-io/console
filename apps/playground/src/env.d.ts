/// <reference types="vite/client" />

declare readonly const VITE_APP_VER: string;
// more env variables...

interface ImportMetaEnv {
    readonly VITE_APP_VER: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
