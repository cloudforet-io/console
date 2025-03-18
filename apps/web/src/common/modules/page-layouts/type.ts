import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import type { ProjectGroupTreeNodeData } from '@/services/project/v-shared/types/project-tree-type';

export interface Breadcrumb {
    name: TranslateResult|string;
    to?: Location;
    copiable?: boolean;
    data?: ProjectGroupTreeNodeData // REFACTOR: refactor this with renewaled project tree
}
