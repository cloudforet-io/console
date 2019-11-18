<template>
    <ul class="nav nav-tabs">
        <li
            v-for="tab in tabData"
            :key="tab.name"
            class="nav-item"
            @click="tabClick(tab.name)"
        >
            <a
                class="nav-link"
                :class="{active: activeTab === tab.name, disabled: tab.disabled,'one-tab':isOne }"
            >
                {{ tab.label }}
            </a>
        </li>
    </ul>
</template>

<script>
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

export default {
    name: 'PTabBar',
    mixins: [tabBarProps],
    setup(props, { emit }) {
        return {
            tabData: tabData(props),
            isOne: isOne(props),
            tabClick: tabClick(props, emit),
            isActive: isActive(props),
        };
    },
};
</script>

<style lang="scss" scoped>
.nav-tabs{
    > li {
        cursor: pointer;
    }
    .nav-item{
        .nav-link{
            border: 1px solid $gray3;
            background-color: $white;
            font: Bold 14px/16px Arial;
            min-width: 7.5rem;
            min-height: 2rem;
            max-height: 2rem;
            border-radius: 2px 2px 0px 0px;
            text-align: center;
            margin-bottom: -1px;
            &.active{
                box-shadow: 0.25rem -0.25rem 0.75rem -0.25rem  #4D49B614,
                            -0.25rem -0.25rem 0.75rem -0.25rem #4D49B614;
                color: $primary;
                &:not(.one-tab){
                    border-bottom: 2px solid $primary;
                }
                &.one-tab{
                    border-bottom: 2px solid $white;
                }
            }
            &:not(.active){
                box-shadow: inset 0px -8px 8px -8px #4D49B614;
            }
        }

    }
}
</style>
