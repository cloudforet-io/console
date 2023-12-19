import type { ApiKeyModel } from '@/schema/identity/api-key/model';
import type { AppModel } from '@/schema/identity/app/model';

export type SingleSelectedData = Partial<ApiKeyModel> & Partial<AppModel>;
