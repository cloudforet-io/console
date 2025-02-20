import type { Tags } from '@/api-clients/_common/schema/model';

export interface AppUpdateParameters {
    app_id: string;
    name?: string;
    tags?: Tags;
}
