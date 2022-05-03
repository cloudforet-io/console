import { Timestamp } from '@spaceone/design-system/dist/src/util/type';
import { Tags } from '@/models';
import { ROLE_TYPE } from '@/services/administration/iam/role/config';

interface Policy {
    policy_id: string;
    policy_type: string;
}

export interface RoleData {
    created_at: Timestamp;
    deleted_at?: Timestamp;
    domain_id: string;
    name: string;
    policies?: Policy[];
    role_id: string;
    role_type: ROLE_TYPE;
    tags?: Tags; // [ description: string ]
}
