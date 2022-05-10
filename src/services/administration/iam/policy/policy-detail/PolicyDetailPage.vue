<template>
    <section>
        <h1>{{ policyInfo.name }}</h1>
    </section>
</template>

<script lang="ts">
import { administrationStore } from '@/services/administration/store';
import {
    computed, reactive, toRefs, defineComponent,
} from '@vue/composition-api';
import { PolicyDetailPageProps } from '@/services/administration/iam/policy/lib/type';

export default defineComponent<PolicyDetailPageProps>({
    name: 'PolicyDetailPage',
    props: {
        id: {
            type: String,
            default: null,
        },
    },
    setup(props) {
        const state = reactive({
            policyInfo: computed(() => administrationStore.state.policy.policyData),
        });

        (async () => {
            try {
                await administrationStore.dispatch('policy/getPolicyData', props.id);
            } catch (e) {
                console.error(e);
            }
        })();

        return {
            ...toRefs(state),
        };
    },
});
</script>
