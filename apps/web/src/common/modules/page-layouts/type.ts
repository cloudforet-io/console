import type { RouteLocation } from 'vue-router';

export interface Breadcrumb {
    name: string;
    to: RouteLocation;
    copiable?: boolean;
}
