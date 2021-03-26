<template>
    <div>
        <div class="toggle-wrapper" :class="{optimized: isOptimized}">
            <p-toggle-button :value="isOptimized" @change="onToggleChange" />
            <span class="label">{{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.INSTANCE_TYPE.OPTIMIZED_TYPE') }}</span>
        </div>
        <table />
        <p v-if="showValidation && !selectedInstanceType">
            {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.INSTANCE_TYPE.ONE_MORE_REQUIRED') }}
        </p>
    </div>
</template>

<script lang="ts">
import { reactive, toRefs, watch } from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import { PToggleButton } from '@spaceone/design-system';

interface Props {
    resourceId: string;
    resourceType: string;
    showValidation: boolean;
}

export default {
    name: 'InstanceTypeSelection',
    components: { PToggleButton },
    props: {
        resourceId: {
            type: String,
            default: '',
        },
        resourceType: {
            type: String,
            default: '',
        },
        showValidation: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props) {
        const state = reactive({
            candidates: [],
            isOptimized: true,
            selectedInstanceType: '',
        });

        const onToggleChange = ({ value }) => {
            state.isOptimized = value;
        };

        const getCandidates = async () => {
            try {
                const { results } = await SpaceConnector.client.spotAutomation.spotGroup.getCandidates({
                    resource_id: props.resourceId,
                    resource_type: props.resourceType,
                });
                state.candidates = results;
                console.debug('candidates', results);
            } catch (e) {
                console.error(e);
                state.candidates = [];
            }
        };

        watch(() => props.resourceId, async (resourceId) => {
            if (resourceId) await getCandidates();
        }, { immediate: true });

        return {
            ...toRefs(state),
            onToggleChange,
        };
    },
};
</script>

<style lang="postcss" scoped>
.toggle-wrapper {
    display: flex;
    align-items: center;
    .label {
        margin-left: 0.25rem;
        font-size: 0.875rem;
        line-height: 1.5;
    }
    &.optimized {
        .label {
            @apply text-secondary;
        }
    }
}
</style>
