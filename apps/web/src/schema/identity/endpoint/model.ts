export interface EndpointModel {
    name: string;
    service: string;
    endpoint: string;
    state?: 'ACTIVE';
    version?: string;
}
