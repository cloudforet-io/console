<template>
    <div class="p-progress-tab">
        <p-progress-tab-bar
            :tabs.sync="tabs"
            :show-validation="showValidation"
            @changeTabs="onChangeTabs"
        />
    </div>
</template>

<script>
import PProgressTabBar from '@/components/molecules/tabs/progress-tab-bar/ProgressTabBar';

export default {
    name: 'PProgressWizard',
    components: {
        PProgressTabBar,
    },
    props: {
        tabs: Object,
        showValidation: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, context) {
        const onChangeTabs = () => {};
        return {
            onChangeTabs,
        };
    },
};
</script>

<style lang="scss" scoped>

</style>
