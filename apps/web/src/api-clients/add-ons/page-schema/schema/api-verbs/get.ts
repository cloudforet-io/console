export interface PageSchemaGetParameters {
    schema: 'table' | 'details';
    resource_type: string;
    options: Record<string, any>;
}
