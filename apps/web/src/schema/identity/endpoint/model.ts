export interface EndpointModel {
    name: string;
    service: string;
    endpoint: string;
    state?: 'ACTIVE'|'INACTIVE';
    version?: string;
}
