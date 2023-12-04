import type { Location } from 'vue-router';


export interface Route {
    name: string;
    path?: string;
    to?: Location;
}
