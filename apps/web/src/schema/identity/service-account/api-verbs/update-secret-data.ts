export interface ServiceAccountUpdateSecretDataParameters {
    service_account_id: string;
    secret_data: any;
    secret_schema_id: string;
    trusted_account_id?: string;
}
