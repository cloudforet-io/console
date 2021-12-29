<template>
    <div class="period">
        <span class="label">{{ $t('INVENTORY.CLOUD_SERVICE.MAIN.FILTERED_BY_DATE') }}:</span>
        <template v-if="periodText">
            <span class="text">UTC</span>
            <p-tag v-if="periodText" :deletable="!readOnly" @delete="handleDeletePeriod">
                {{ periodText }}
            </p-tag>
        </template>
        <span v-else class="text">{{ $t('INVENTORY.CLOUD_SERVICE.MAIN.AUTO_PERIOD') }}</span>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent,
    reactive, toRefs,
} from '@vue/composition-api';
import { PTag } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { Period } from '@/services/billing/cost-management/type';

interface Props {
    period?: Period;
    readOnly?: boolean;
}

export default defineComponent<Props>({
    name: 'CloudServicePeriodFilter',
    components: {
        PTag,
    },
    props: {
        /* sync */
        period: {
            type: Object as () => Period|undefined,
            default: undefined,
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            periodText: computed<string>(() => {
                if (props.period?.start) {
                    return `${dayjs.utc(props.period.start).format('MMM, YYYY')} ~ ${dayjs.utc(props.period.end).format('MMM, YYYY')}`;
                }
                return '';
            }),
        });

        const handleDeletePeriod = () => {
            emit('update:period', undefined);
            emit('delete-period');
        };

        return {
            ...toRefs(state),
            handleDeletePeriod,
        };
    },
});
</script>

<style lang="postcss" scoped>
.period {
    @apply mb-4;
    font-size: 0.875rem;
    line-height: 1.5;
    .label {
        @apply mr-2 font-bold;
    }
    .text {
        @apply text-gray-500 mr-2;
    }
}

@screen mobile {
    .period {
        .label {
            @apply block;
        }
    }
}
</style>
