export interface Auth {
    signIn: (...args: unknown[]) => Promise<void>;
    signOut: () => Promise<void>;
}
