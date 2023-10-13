export const getVariableKeyFromWidgetSchemaProperty = (property: string): string => {
    if (property.startsWith('filters.')) {
        return property.replace('filters.', '');
    }
    return property;
};
