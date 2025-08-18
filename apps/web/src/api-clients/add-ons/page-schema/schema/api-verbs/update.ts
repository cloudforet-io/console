export interface PageSchemaUpdateParameters {
    resource_type: string;
    schema: 'table' | 'details';
    data: any;
    options: Record<string, any>;
}
