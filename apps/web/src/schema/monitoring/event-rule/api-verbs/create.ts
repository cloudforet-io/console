import type { Tags } from '@/schema/_common/model';
import type { EventRuleModel } from '@/schema/monitoring/event-rule/model';
import type {
    EventRuleActions, EventRuleCondition,
    EventRuleConditionsPolicy, EventRuleOptions,
} from '@/schema/monitoring/event-rule/type';

export interface EventRuleCreateParameters {
    conditions: EventRuleCondition[];
    conditions_policy: EventRuleConditionsPolicy;
    actions: EventRuleActions;
    resource_group: EventRuleModel['resource_group'];
    name?: string;
    project_id?: string;
    options?: EventRuleOptions;
    tags?: Tags;
}
