import type { RouteLocationRaw } from 'vue-router';

export interface Breadcrumb {
    name: string;
    to: RouteLocationRaw;
    copiable?: boolean;
}
