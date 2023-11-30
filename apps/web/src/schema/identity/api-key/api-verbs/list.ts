import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ApiKeyState } from '@/schema/identity/api-key/_types/api-key-type';
import type { ApiKeyModel } from '@/schema/identity/api-key/model';

export interface ApiKeyListParameters {
    api_key_id?: string;
    state?: ApiKeyState;
    user_id?: string;
    query?: Query;
}

export interface ApiKeyListResponse {
    results: ApiKeyModel[];
    total_count: number;
}
