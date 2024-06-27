import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';

export const sortWidgetTableFields = (fields: string[]) => {
    const priorityFields = Object.values(DATE_FIELD) as string[];
    const prioritySet = new Set(priorityFields);

    const priority = fields.filter((field) => prioritySet.has(field));
    const others = fields.filter((field) => !prioritySet.has(field)).sort();

    const sortedPriority = priorityFields.filter((field) => priority.includes(field));

    return [...sortedPriority, ...others];
};
