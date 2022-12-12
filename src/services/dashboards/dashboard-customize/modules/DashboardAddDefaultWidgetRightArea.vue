<template>
    <div class="dashboard-add-default-widget-right-area">
        <div v-if="!widgetConfigId"
             class="no-selected-wrapper"
        >
            <!--song-lang-->
            <span class="title">{{ $t('No Selected Widget') }}</span>
            <span class="text">{{ $t('Information of the widget selected in the left panel and configurable items are displayed.') }}</span>
        </div>
        <div v-else
             class="form-wrapper"
        >
            <!--song-lang-->
            <p-field-group :label="$t('Name')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <!--song-lang-->
                <p-text-input :value="name"
                              :invalid="invalidState.name"
                              :placeholder="widgetConfig?.title"
                              class="input"
                              @input="setForm('name', $event)"
                />
            </p-field-group>
            <div class="description-text">
                {{ $t('Displays the top list of 10 highest spending throughout the whole period of filtered date, aggregated by selected Group-By.') }}
            </div>
            <div>
                <p-json-schema-form v-if="widgetConfig?.widget_options_schema"
                                    :schema="widgetConfig.widget_options_schema"
                                    :form-data.sync="formData"
                />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import {
    PFieldGroup, PTextInput, PJsonSchemaForm,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import { CONSOLE_WIDGET_CONFIGS } from '@/services/dashboards/widgets/widget-config-list';

interface Props {
    widgetConfigId?: string;
}
export default defineComponent<Props>({
    components: {
        PTextInput,
        PFieldGroup,
        PJsonSchemaForm,
    },
    props: {
        widgetConfigId: {
            type: String,
            default: undefined,
        },
        isValid: {
            type: Boolean,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            nameRef: null as null | HTMLElement,
            widgetConfig: computed(() => (props.widgetConfigId ? CONSOLE_WIDGET_CONFIGS[props.widgetConfigId] : undefined)),
            formData: {},
        });

        const {
            forms: {
                name,
            },
            setForm,
            invalidState,
            invalidTexts,
        } = useFormValidator({
            name: '',
        }, {
            name(value: string) { return value.trim().length ? '' : i18n.t('Please enter name.'); },
        });

        /* Watcher */

        return {
            ...toRefs(state),
            name,
            setForm,
            invalidState,
            invalidTexts,
        };
    },
});
</script>

<style lang="postcss" scoped>
.dashboard-add-default-widget-right-area {
    height: 100%;
    .no-selected-wrapper {
        @apply flex flex-col justify-center items-center;
        height: 100%;
        font-size: 0.875rem;
        text-align: center;
        .title {
            @apply text-primary-2;
            padding-bottom: 0.75rem;
        }
        .text {
            @apply text-gray-600;
        }
    }

    .form-wrapper {
        @apply flex flex-col overflow-hidden;
        gap: 1rem;
        height: 100%;
        overflow: auto;
        .p-field-group {
            margin: 0;
            .input {
                width: 100%;
            }
        }
        .description-text {
            @apply bg-gray-100 text-gray-600 rounded-md;
            font-size: 0.875rem;
            font-weight: 400;
            padding: 0.75rem;
        }
    }
}
</style>
