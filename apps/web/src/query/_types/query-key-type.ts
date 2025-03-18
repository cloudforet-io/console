
export interface QueryContext {
    mode: 'admin' | 'workspace',
    workspaceId: string | undefined,
    context: 'service' | 'reference',
}


export type QueryKeyArray = unknown[];

