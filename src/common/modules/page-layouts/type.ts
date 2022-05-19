import { TranslateResult } from 'vue-i18n';
import { Location } from 'vue-router';

export interface Breadcrumb {
    name: TranslateResult;
    to: Location;
    copiable?: boolean;
}
