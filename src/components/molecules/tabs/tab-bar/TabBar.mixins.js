import { computed } from '@vue/composition-api';

export const tabBarProps = {
    props: {
        tabs: {
            type: Array,
            default: () => [],
        },
        activeTab: {
            type: String,
        },
    },
};
export const tabData = props => computed(() => {
    const tab = [];
    props.tabs.forEach((value) => {
        if (typeof value === 'string') {
            tab.push({ name: value, label: value });
        } else {
            value.label = value.label || value.name;
            tab.push(value);
        }
    });
    return tab;
});
export const isOne = props => computed(() => props.tabs.length === 1);

export const tabClick = (props, emit) => (name) => {
    if (props.activeTab !== name) {
        emit('update:activeTab', name);
        emit('changeTab', name);
    }
};

export const isActive = props => name => props.activeTab === name;
