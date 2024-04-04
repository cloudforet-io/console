import type { Tags } from '@/schema/_common/model';

export interface AppUpdateParameters {
    app_id: string;
    name?: string;
    tags?: Tags;
}
