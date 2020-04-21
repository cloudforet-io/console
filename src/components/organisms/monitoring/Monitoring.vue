<template>
    <div>
        <slot name="buttons" :buttons="buttons" :selectedButton="selectedButton">
            <p-select-btn-group class="py-4" :buttons="buttons" :selected.sync="selectedButton" />
        </slot>
        <slot name="legends">
            <p class="title">
                {{ $t('WORD.INSTANCE') }}
            </p>
            <div v-for="(resource, idx) in resources" :key="resource.id" class="inline-flex items-center text-sm">
                <span class="flex-shrink-0 rounded-sm h-3 w-3 mr-2"
                      :style="{ backgroundColor: colors[idx] }"
                />
                {{ resource.id }}{{ resource.name ? `(${resource.name})` : '' }}
            </div>
        </slot>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import { monitoringProps, MonitoringProps } from '@/components/organisms/monitoring/Monitoring.toolset';
import PSelectBtnGroup from '@/components/organisms/buttons/select-btn-group/SelectBtnGroup.vue';
import {
    coral, blue, violet, yellow, green, peacock,
} from '@/styles/colors';

export default defineComponent({
    name: 'SMonitoring',
    components: {
        PSelectBtnGroup,
    },
    props: monitoringProps,
    setup(props: MonitoringProps) {
        console.debug('###################');
        console.debug('MONITORING CREATED');
        console.debug('resources: ', props.resources);
        console.debug('props.dataTools: ', props.dataTools);

        const colors = [coral[500], blue[500], violet[500], yellow[500], green[400], coral[400], peacock[600], coral[200], peacock[400], green[200]];
        const state = reactive({
            buttons: computed(() => props.dataTools.map(d => ({
                name: d, label: d, vbind: { styleType: 'black', outline: state.selectedButton !== d },
            }))),
            selectedButton: props.dataTools[0],
        });

        return {
            ...toRefs(state),
            colors,
        };
    },
});
</script>

<style lang="postcss" scoped>
    .title {
        @apply text-sm font-bold capitalize;
    }
</style>
