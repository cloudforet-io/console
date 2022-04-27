import { Location } from 'vue-router';
import { TranslateResult } from 'vue-i18n';

export interface Breadcrumb {
    name: TranslateResult;
    to: Location;
    copiable?: boolean;
}
