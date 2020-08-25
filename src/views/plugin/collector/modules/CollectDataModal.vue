<template>
    <p-button-modal :header-title="$t('COMMON.COL_DATA')"
                    centered
                    size="md"
                    fade
                    backdrop
                    :loading="loading"
                    :footer-cancel-button-bind="{
                        styleType: 'gray900',
                        outline: true,
                    }"
                    :footer-confirm-button-bind="confirmBtnStyle"
                    :visible.sync="proxyVisible"
                    @confirm="onClickCollectConfirm"
    >
        <template #body>
            <div class="w-full">
                <!--                <div class="left-container">-->
                <div class="flex w-full">
                    <p-lazy-img :img-url="image"
                                width="5.5rem" height="5.5rem"
                                class="mr-10 flex-grow-0"
                    />
                    <div>
                        <p class="name">
                            {{ collector ? collector.name : '' }}
                        </p>
                        <p class="info">
                            {{ $t('WORD.COLLECTOR') }} {{ $t('WORD.ID') }}: {{ collectorId }}
                        </p>
                        <p class="info">
                            {{ $t('WORD.VERSION') }}: {{ version }}
                        </p>
                    </div>
                </div>
                <p class="desc">
                    {{ description }}
                </p>
                <p class="sub-header">
                    {{ $t('INVENTORY.COL_OPS') }}
                </p>
                <p-field-group :label="$t('COMMON.CREDENTIAL')">
                    <p-text-input :value="credential ? credential.name : $t('COMMON.ALL')"
                                  disabled
                                  class="w-full"
                    />
                </p-field-group>
                <p-field-group label="Action type">
                    <p-select-dropdown v-model="selectedCollectMode" :items="collectModeMenu" />
                </p-field-group>
                <!--                </div>-->
                <!--                <div class="right-container">-->
                <!--                    <p class="sub-header">-->
                <!--                        {{ $t('INVENTORY.FILTERS') }}-->
                <!--                    </p>-->
                <!--                    <p-dynamic-form v-for="(form, idx) in filterFormats" :key="idx"-->
                <!--                                    v-model="filters[form.key]"-->
                <!--                                    :form="form"-->
                <!--                                    :invalid="showValidation ? vdApi.invalidState[form.key] : false"-->
                <!--                                    :invalid-text="vdApi.invalidMsg[form.key]"-->
                <!--                    />-->
                <!--                    <p-empty v-if="filterFormats.length === 0">-->
                <!--                        No Filters-->
                <!--                    </p-empty>-->
                <!--                </div>-->
            </div>
        </template>

        <!--        <template #footer-extra>-->
        <!--            <p-button class="reset-btn"-->
        <!--                      style-type="primary-dark"-->
        <!--                      outline-->
        <!--                      size="lg"-->
        <!--                      :disabled="loading"-->
        <!--                      @click="onClickReset"-->
        <!--            >-->
        <!--                {{ $t('BTN.RESET') }}-->
        <!--            </p-button>-->
        <!--        </template>-->
    </p-button-modal>
</template>

<script lang="ts">
    import {
        toRefs, reactive, computed, SetupContext, watch, UnwrapRef,
    } from '@vue/composition-api';
import { get } from 'lodash';
import { makeTrItems } from '@/lib/view-helper';
import { makeProxy } from '@/lib/compostion-util';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import { fluentApi } from '@/lib/fluent-api';
import { COLLECT_MODE, CollectorModel } from '@/lib/fluent-api/inventory/collector.type';
import { SecretModel } from '@/lib/fluent-api/secret/secret';
import { MenuItem } from '@/components/organisms/context-menu/PContextMenu.toolset';
import { showErrorMessage } from '@/lib/util';
import { formValidation, requiredValidation } from '@/components/util/composition-helpers';

interface State {
    loading: boolean;
    proxyVisible: boolean;
    credential: SecretModel | null;
    collector: CollectorModel | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filterFormats: readonly any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters: any;
    showValidation: boolean;
    collectModeMenu: readonly MenuItem[];
    selectedCollectMode: COLLECT_MODE;
    image: string;
    version: string;
    description: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    confirmBtnStyle: any;
}

interface Props {
    visible: boolean;
    credentialId: string | null;
    collectorId: string;
}

const map = {
    key: 'key',
    label: 'name',
    required: 'is_required',
    placeholder: 'example',
    type: 'type',
    default: 'default',
    menu: 'enums',
};

const setValidation = (forms, values) => {
    const formKey = map.key;
    const vd = {};

    forms.forEach((form) => {
        vd[form[formKey]] = form[map.required] ? [requiredValidation()] : [];
    });

    const {
        allValidation,
        fieldValidation,
        invalidMsg,
        invalidState,
        isAllValid,
    } = formValidation(values, vd);

    return {
        formKey,
        allValidation,
        fieldValidation,
        invalidMsg,
        invalidState,
        isAllValid,
    };
};

export default {
    name: 'CollectDataModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
        PLazyImg,
    },
    props: {
        /* sync */
        visible: Boolean,
        credentialId: {
            type: String,
            default: null,
        },
        collectorId: {
            type: String,
            default: '',
        },
    },
    setup(props: Props, context: SetupContext) {
        const state: UnwrapRef<State> = reactive({
            loading: false,
            proxyVisible: makeProxy('visible', props, context.emit),
            collector: null,
            credential: null,
            showValidation: false,
            collectModeMenu: computed<MenuItem[]>(() => makeTrItems([
                [COLLECT_MODE.all, 'INVENTORY.ACTION.COLLECT_ALL'],
                [COLLECT_MODE.create, 'INVENTORY.ACTION.COLLECT_CREATE'],
            ], null, { type: 'item' })),
            selectedCollectMode: COLLECT_MODE.all,
            image: computed<string>(() => get(state.collector, 'tags.icon', '')),
            version: computed<string>(() => get(state.collector, 'plugin_info.version', '')),
            description: computed<string>(() => get(state.collector, 'tags.description', '')),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filterFormats: computed<any[]>(() => get(state.collector, 'plugin_info.options.filter_format', [])),
            filters: {},
            confirmBtnStyle: computed(() => ({
                styleType: state.loading ? 'gray200' : 'primary-dark',
            })),
        });

        let vdApi = setValidation(state.filterFormats, state.filters);

        const onChange = async (val): Promise<void> => {
            if (!state.showValidation) return;
            await vdApi.fieldValidation(val);
            context.emit('changeValidState', vdApi.isAllValid);
        };

        const onClickReset = (): void => {
            if (state.loading) return;

            state.selectedCollectMode = COLLECT_MODE.all;
            state.showValidation = false;
            state.filters = {};
            vdApi = setValidation(state.filterFormats, state.filters);
        };

        const collectorApi = fluentApi.inventory().collector();

        const collectApi = computed(() => {
            const api = collectorApi.collect()
                .setId(props.collectorId)
                .setCollectMode(state.selectedCollectMode as COLLECT_MODE);
            if (props.credentialId) api.setSecretId(props.credentialId);
            return api;
        });

        const onClickCollectConfirm = async (): Promise<void> => {
            state.loading = true;
            state.showValidation = true;
            try {
                await collectApi.value.execute();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    text: 'Collect Data',
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Collect Data', e, context.root);
            } finally {
                state.proxyVisible = false;
            }
            // }
            state.loading = false;
        };


        const getCollector = async (): Promise<void> => {
            state.loading = true;
            try {
                const res = await collectorApi.get().setId(props.collectorId)
                    .execute();
                state.collector = res.data;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const secretManagerApi = fluentApi.secret().secret().get();

        const getCredential = async (): Promise<void> => {
            state.loading = true;
            state.credential = null;
            try {
                const res = await secretManagerApi.setId(props.credentialId as string)
                    .execute();
                state.credential = res.data;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        watch(() => props.collectorId, (id) => {
            if (id) getCollector();
        });

        watch(() => props.credentialId, (id) => {
            if (id) getCredential();
            else state.credential = null;
        });

        return {
            ...toRefs(state),
            vdApi,
            onChange,
            onClickReset,
            onClickCollectConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.left-container {
    @apply border-r border-gray-200 flex-grow-0 w-1/2 pr-4;

    .name {
        font-size: 1.125rem;
        margin-bottom: 1rem;
    }
    .info {
        font-size: 0.875rem;
    }
    .desc {
        margin-top: 1rem;
        margin-bottom: 2rem;
        font-size: 0.875rem;
    }
}
.right-container {
    @apply px-4 w-1/2;
}
.sub-header {
    @apply text-gray-400;
    margin-bottom: 0.875rem;
    margin-top: 0.875rem;
    font-size: 0.875rem;
    font-weight: bold;
}
.reset-btn {
    margin-right: auto;
}
.confirm-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    .spinner {
        display: inline-flex;
        padding-right: 0.25rem;
    }
}
</style>
