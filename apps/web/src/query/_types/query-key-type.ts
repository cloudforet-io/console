
export type QueryKeyBase = [
    mode: 'ADMIN' | 'WORKSPACE',
    workspaceId: string | undefined,
    others: Record<string, any> | undefined,
];



