import type { DynamicLayoutOptions } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type/layout-schema';


// NOTE: Temporary hard coding for agent mode, before separating or adding more agent.
export const convertAgentModeOptions = (options: DynamicLayoutOptions) => {
    const optionsField = [...options.fields];
    const agentFields = optionsField.filter((field) => field.key !== 'is_managed');

    return {
        ...options,
        fields: agentFields,
    };
};
