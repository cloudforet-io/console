export interface SecretUpdateDataParameters {
    secret_id: string;
    schema_id?: string,
    data: Record<string, any>
    workspace_id?: string,
}
