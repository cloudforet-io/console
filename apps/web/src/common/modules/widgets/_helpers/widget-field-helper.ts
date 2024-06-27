export const sortWidgetTableFields = (fields: string[]) => {
    const priorityFields = ['Date', 'Year', 'Month', 'Day'];
    const prioritySet = new Set(priorityFields);

    const priority = fields.filter((field) => prioritySet.has(field));
    const others = fields.filter((field) => !prioritySet.has(field)).sort();

    const sortedPriority = priorityFields.filter((field) => priority.includes(field));

    return [...sortedPriority, ...others];
};
