/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string;
    readonly __APP_VER__: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
