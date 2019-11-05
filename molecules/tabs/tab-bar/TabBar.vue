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
                :class="{active: activeTab === tab.name, disabled: tab.disabled }"
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
    .nav-item{
        .nav-link{
            border: 1px solid $gray3;
            background-color: $white;
            &.active{
                box-shadow: 0px 0px 8px #4D49B614;
            }
        }

    }
}
</style>
