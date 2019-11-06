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
export default {
    name: 'PTabBar',
    props: {
        tabs: {
            type: Array,
            default: () => [],
        },
        activeTab: {
            type: String,
        },
    },
    computed: {
        tabData() {
            const tab = [];
            this.tabs.forEach((value) => {
                if (typeof value === 'string') {
                    tab.push({
                        name: value,
                        label: value,
                    });
                } else if (!value.hasOwnProperty('label')) {
                    value.label = value.name;
                } else {
                    tab.push(value);
                }
            });
            return tab;
        },
        isOne() {
            return this.tabs.length === 1;
        },
    },
    methods: {
        tabClick(name) {
            if (this.activeTab !== name) {
                this.$emit('update:activeTab', name);
                this.$emit('changeTab', name);
            }
        },
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
