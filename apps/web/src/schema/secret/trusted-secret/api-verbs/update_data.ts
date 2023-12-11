export interface TrustedSecretUpdateDataParameters {
    trusted_secret_id: string;
    schema_id?: string,
    data: Record<string, any>
    workspace_id?: string,
}
