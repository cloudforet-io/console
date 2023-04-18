export const getQuerySearchTags = () => [
    { key: { label: 'ID', name: 'id' }, value: { label: 'Hello', name: 'hello' }, operator: '' },
    { key: null, value: { label: 'No key', name: 'no key' }, operator: '' },
    {
        key: { label: 'DataTypes', name: 'data types' },
        value: { label: 'The same with QuerySearch data types.', name: 'datetime, integer, ...' },
        operator: '',
        invalid: true,
    },
    {
        key: { label: 'Operators', name: 'operators' },
        value: { label: 'The same with QuerySearch operators.', name: '=, !=, ...' },
        operator: '=',
    },
    {
        key: { label: 'Invalid Case', name: 'invalid case', dataType: 'datetime' },
        value: { label: 'If the value is not suitable format for data type, it displays tags like this.', name: 'invalid!' },
        operator: '',
        invalid: true,
        description: 'Invalid Case',
    },
    {
        key: { label: 'Clear all', name: 'clear all' },
        value: { label: 'If there is no tag, nothing will be displayed.', name: 'no tags' },
        operator: '',
    },
];
