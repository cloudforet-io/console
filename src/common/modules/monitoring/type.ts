export interface MonitoringResourceType {
    id: string;
    name?: string;
}

export interface MonitoringProps {
    resourceType: string;
    resources: MonitoringResourceType[];
    showTools?: boolean;
    selectedMetrics?: string[];
}
