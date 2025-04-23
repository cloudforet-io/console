import type { Tags } from '@/api-clients/_common/schema/model';
import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { DashboardTemplateType } from '@/api-clients/repository/dashboard-template/schema/type';

export interface DashboardTemplateRegisterParameters {
    template_id?: string;
    name: string;
    template_type?: DashboardTemplateType;
    dashboards?: DashboardModel[];
    labels?: string[];
    tags?: Tags;
}
