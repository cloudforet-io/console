<template>
    <div />
</template>

<script>
import { Splitpanes, Pane } from 'splitpanes';

export default {
    name: 'PVerticalLayout2',
    components: {
    },

    setup() {
        const state = reactive({
        });

        return { // binding되는 것들
            ...toRefs(state),
        };
    },
};
</script>

<style lang="scss" scoped>

</style>
