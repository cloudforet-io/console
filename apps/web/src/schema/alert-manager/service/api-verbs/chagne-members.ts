import type { MembersType } from '@/schema/alert-manager/service/type';

export interface ServiceChangeMembersParameters {
    service_id: string;
    members: Record<MembersType, string[]>;
}
