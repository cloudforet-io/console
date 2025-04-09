import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import type { ProjectGroupTreeNodeData } from '@/common/modules/project/project-tree-type';

export interface Breadcrumb {
    name: TranslateResult|string;
    to?: Location;
    copiable?: boolean;
    data?: ProjectGroupTreeNodeData // REFACTOR: refactor this with renewaled project tree
}
