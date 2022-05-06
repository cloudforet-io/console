const POLICY_TYPES = Object.freeze({
    MANAGED: 'MANAGED',
    CUSTOM: 'CUSTOM',
} as const);

type POLICY_TYPES = typeof POLICY_TYPES[keyof typeof POLICY_TYPES];

export {
    POLICY_TYPES,
};
