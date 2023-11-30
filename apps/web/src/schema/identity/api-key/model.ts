import type { ApiKeyState } from '@/schema/identity/api-key/_types/api-key-type';

export interface ApiKeyModel {
    api_key_id: string;
    api_key?: string;
    name: string;
    state: ApiKeyState;
    user_id: string;
    domain_id: string;
    created_at: string;
    last_accessed_at?: string;
    expired_at?: string;
}
