import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import type { ProjectGroupTreeNodeData } from '@/services/project/types/project-tree-type';

export interface Breadcrumb {
    name: TranslateResult;
    to?: Location;
    copiable?: boolean;
    data?: ProjectGroupTreeNodeData
}
