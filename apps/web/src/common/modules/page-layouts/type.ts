import type { TranslateResult } from 'vue-i18n';
import type { RouteLocation } from 'vue-router';

export interface Breadcrumb {
    name: TranslateResult;
    to: RouteLocation;
    copiable?: boolean;
}
