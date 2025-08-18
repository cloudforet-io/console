import type { MembersType } from '@/api-clients/alert-manager/service/schema/type';

export interface ServiceChangeMembersParameters {
    service_id: string;
    members: Record<MembersType, string[]>;
}
