declare module '@vue/runtime-core' {
    export interface GlobalComponents {
        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        LottiePlayer: typeof import('vue3-lottie')['Vue3Lottie']
    }
}
export {};
