export const LOADER_TYPES = {
    spinner: 'spinner',
    skeleton: 'skeleton',
} as const;

export type LoaderTypes = typeof LOADER_TYPES[keyof typeof LOADER_TYPES];
