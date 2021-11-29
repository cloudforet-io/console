<template>
    <component :is="component" />
</template>

<script lang="ts">
import { isEqual } from 'lodash';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

interface Props {
    widgetId: string;
}

export default {
    name: 'DynamicWidget',
    props: {
        widgetId: {
            type: String,
            default: '',
        },
    },
    setup(props: Props) {
        // noinspection TypeScriptCheckImport
        const state = reactive({
            component: null as any,
            loader: computed<() => Promise<any>>(() => () => import(`@/services/billing/cost-management/widgets/${props.widgetId}.vue`)) as unknown as () => Promise<any>,
        });

        const getComponent = async () => {
            try {
                await state.loader();

                // TODO: throw new Error(`[] Unacceptable Layout: layout type must be one of ${...}. ${props.widgetId} is not acceptable.`);
                state.component = async () => state.loader();
            } catch (e) {
                console.error(e);
            }
        };

        watch([() => props.widgetId], (aft, bef) => {
            if (!isEqual(aft, bef)) {
                getComponent();
            }
        }, { immediate: true });


        return {
            ...toRefs(state),
            getComponent,
        };
    },
};
</script>
