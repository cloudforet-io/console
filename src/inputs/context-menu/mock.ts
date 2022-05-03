import faker from 'faker';

export const menuItems = [

    { type: 'header', label: 'Actions', name: 'actions' },
    {
        label: 'Create', name: 'create',
    },
    {
        label: 'Update', name: 'update',
    },
    {
        label: 'Delete', name: 'delete', disabled: true,
    },
    { type: 'divider', name: 'collect-divider' },
    {
        label: 'Collect', name: 'collect',
    },
    { type: 'divider' },
    { type: 'header', label: 'Others', name: 'others' },
    {
        label: 'Go to Google', name: 'google', link: 'https://www.google.com', target: '_blank',
    },
    { type: 'divider' },
    { type: 'info', label: 'Information', name: 'information' },
    {
        label: 'Hello', name: 'hello',
    },
];
export const longMenuItems = [
    {
        label: faker.lorem.sentence(30), name: 'create',
    },
    {
        label: faker.lorem.sentence(30), name: 'update',
    },
    {
        label: faker.lorem.sentence(30), name: 'delete', disabled: true,
    },
    { type: 'divider', name: 'collect-divider' },
    {
        label: faker.lorem.sentence(30), name: 'collect',
    },
    { type: 'divider' },
    { type: 'header', label: 'Others', name: 'others' },
    {
        label: faker.lorem.sentence(30), name: 'google', link: 'https://www.google.com', target: '_blank',
    },
];
