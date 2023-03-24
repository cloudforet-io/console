<template>
    <div />
</template>

<script lang="ts">
import {
    defineComponent, reactive, toRefs,
} from 'vue';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
}

export default defineComponent<Props>({
    name: 'CostAnalysisQueryWidget',
    components: {},
    props: {},
    setup() {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});
</script>
