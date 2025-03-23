import { privateDashboardKeys } from '@/api-clients/dashboard/private-dashboard/keys';
import { privateDataTableKeys } from '@/api-clients/dashboard/private-data-table/keys';
import { privateFolderKeys } from '@/api-clients/dashboard/private-folder/keys';
import { privateWidgetKeys } from '@/api-clients/dashboard/private-widget/keys';
import { publicDashboardKeys } from '@/api-clients/dashboard/public-dashboard/keys';
import { publicDataTableKeys } from '@/api-clients/dashboard/public-data-table/keys';
import { publicFolderKeys } from '@/api-clients/dashboard/public-folder/keys';
import { publicWidgetKeys } from '@/api-clients/dashboard/public-widget/keys';
import { commentKeys } from '@/api-clients/opsflow/comment/keys';
import { eventKeys } from '@/api-clients/opsflow/event/keys';
import { taskCategoryKeys } from '@/api-clients/opsflow/task-category/keys';
import { taskTypeKeys } from '@/api-clients/opsflow/task-type/keys';
import { taskKeys } from '@/api-clients/opsflow/task/keys';

export const API_QUERY_KEY_MAP = {
    dashboard: {
        publicFolder: publicFolderKeys,
        publicDashboard: publicDashboardKeys,
        publicDataTable: publicDataTableKeys,
        publicWidget: publicWidgetKeys,
        privateFolder: privateFolderKeys,
        privateDashboard: privateDashboardKeys,
        privateDataTable: privateDataTableKeys,
        privateWidget: privateWidgetKeys,
    },
    opsflow: {
        comment: commentKeys,
        task: taskKeys,
        taskCategory: taskCategoryKeys,
        taskType: taskTypeKeys,
        event: eventKeys,
    },
} as const;
