import type { Tags } from '@/api-clients/_common/schema/model';
import type { EventRuleModel } from '@/api-clients/monitoring/event-rule/schema/model';
import type {
    EventRuleActions, EventRuleCondition,
    EventRuleConditionsPolicy, EventRuleOptions,
} from '@/api-clients/monitoring/event-rule/schema/type';

export interface EventRuleCreateParameters {
    conditions: EventRuleCondition[];
    conditions_policy: EventRuleConditionsPolicy;
    actions?: EventRuleActions;
    resource_group: EventRuleModel['resource_group'];
    name?: string;
    project_id?: string;
    options?: EventRuleOptions;
    tags?: Tags;
}
