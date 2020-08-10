<template>
    <p-button-modal class="collector-update-modal"
                    :header-title="$t('INVENTORY.UPT_COL')"
                    centered
                    size="xl"
                    fade
                    backdrop
                    :loading="loading"
                    :footer-cancel-button-bind="{
                        styleType: 'gray900',
                        outline: true,
                    }"
                    :footer-confirm-button-bind="confirmBtnBind"
                    :visible.sync="proxyVisible"
                    @confirm="onClickConfirm"
    >
        <template #body>
            <div class="collector-input-lap">
                <p-lazy-img class="flex-shrink-0 mr-8"
                            :img-url="imageUrl"
                            width="5.5rem" height="5.5rem"
                />
                <div class="flex-grow">
                    <p-field-group :label="$t('COMMON.NAME')"
                                   :invalid-text="nameInvalidText"
                                   :invalid="!isNameValid"
                                   :required="true"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="newName" block
                                          class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                          :class="{'is-invalid': invalid}"
                                          @keyup="onNameInputChange"
                            />
                        </template>
                    </p-field-group>

                    <p-field-group :label="$t('COMMON.PRIORITY')"
                                   :invalid-text="priorityInvalidText"
                                   :invalid="!isPriorityValid"
                                   :required="true"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="newPriority" block
                                          type="number"
                                          class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                          :class="{'is-invalid': invalid}"
                                          @change="onPriorityInputChange"
                                          @keyup="onPriorityInputChange"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.VERSION')"
                                   :required="true"
                    >
                        <p-select-dropdown v-model="newVersion" :items="versions" />
                    </p-field-group>
                </div>
            </div>
        </template>

        <template #footer-extra>
            <p-button class="reset-btn"
                      style-type="primary-dark"
                      size="lg"
                      :outline="true"
                      :disabled="loading"
                      @click="onClickReset"
            >
                {{ $t('BTN.RESET') }}
            </p-button>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { toRefs, reactive, computed } from '@vue/composition-api';
import { get, cloneDeep } from 'lodash';
import { makeProxy } from '@/lib/compostion-util';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import { fluentApi } from '@/lib/fluent-api';
import { CollectorPluginModel, CollectorUpdateParameter } from '@/lib/fluent-api/inventory/collector.type';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

export default {
    name: 'CollectorUpdateModal',
    components: {
        PButtonModal,
        PButton,
        PLazyImg,
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
    },
    props: {
        visible: Boolean, // sync prop
        collectorId: {
            type: String,
            default: null,
        },
    },
    setup(props, { root, emit }) {
        const state = reactive({
            loading: true,
            imageUrl: computed(() => get(state.collector, 'tags.icon', '')),
            proxyVisible: makeProxy<boolean>('visible', props, emit),
            isValid: true,
            collector: null,
            pluginInfo: computed<CollectorPluginModel>(() => get(state.collector, 'plugin_info')),
            confirmBtnBind: computed(() => {
                const defaultStyle: any = { style: { padding: 0 }, disabled: !state.isValid };
                defaultStyle.styleType = state.loading ? 'gray200' : 'primary-dark';
                return defaultStyle;
            }),
            //
            newCollectorParam: {} as CollectorUpdateParameter,
            newName: '',
            newPriority: null,
            newVersion: null,
            isNameValid: true,
            isPriorityValid: true,
            nameInvalidText: '',
            priorityInvalidText: '',
            versions: [],
        });

        const getCollector = async (): Promise<void> => {
            try {
                const res = await fluentApi.inventory().collector().get().setId(props.collectorId)
                    .execute();
                state.collector = res.data;
                state.newName = res.data.name;
                state.newPriority = res.data.priority;
                state.newVersion = res.data.plugin_info.version;
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Get Collector', e, root);
            }
        };
        const getVersions = async () => {
            try {
                state.versions = [];
                const res = await fluentApi.repository().plugin().getVersions().setId(state.pluginInfo.plugin_id)
                    .execute();
                res.data.results.forEach((value, index) => {
                    if (index === 0) {
                        state.versions.push({ label: `${value} (latest)`, name: value, type: 'item' });
                    } else {
                        state.versions.push({ label: value, name: value, type: 'item' });
                    }
                });
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Get Versions', e, root);
            }
        };

        const onNameInputChange = (e) => {
            if (e.target.value.length < 2) {
                state.isNameValid = false;
                state.nameInvalidText = 'should NOT be shorter than 2 characters';
                state.isValid = false;
            } else {
                state.isNameValid = true;
                state.nameInvalidText = '';
                state.isValid = true;
            }
        };
        const onPriorityInputChange = (e) => {
            if (e.target.value > 11) {
                state.isPriorityValid = false;
                state.priorityInvalidText = 'should be <= 10';
                state.isValid = false;
            } else if (e.target.value < 1) {
                state.isPriorityValid = false;
                state.priorityInvalidText = 'should be >= 1';
                state.isValid = false;
            } else {
                state.isPriorityValid = true;
                state.priorityInvalidText = '';
                state.isValid = true;
            }
        };

        const onClickReset = (): void => {
            if (state.loading) return;
            state.newName = get(state.collector, 'name', '');
            state.newPriority = get(state.collector, 'priority', null);
            state.newVersion = get(state.collector, 'plugin_info.version', null);
            state.isValid = true;
        };
        const onClickConfirm = async (): Promise<void> => {
            if (state.isValid) {
                state.loading = true;

                const newPluginInfo = cloneDeep(state.pluginInfo);
                newPluginInfo.version = state.newVersion;
                state.newCollectorParam = {
                    // eslint-disable-next-line camelcase
                    collector_id: props.collectorId,
                    name: state.newName,
                    // eslint-disable-next-line camelcase
                    plugin_info: newPluginInfo,
                    priority: state.newPriority,
                };

                try {
                    await fluentApi.inventory().collector().update()
                        .setParameter(state.newCollectorParam)
                        .setId(props.collectorId)
                        .execute();
                    showSuccessMessage('success', 'Update Collector', root);
                } catch (e) {
                    console.error(e);
                    showErrorMessage('Fail to Update Collector', e, root);
                } finally {
                    state.loading = false;
                    state.proxyVisible = false;
                }
            }
        };

        const init = async () => {
            state.loading = true;
            await getCollector();
            await getVersions();
            state.loading = false;
        };
        init();

        return {
            ...toRefs(state),
            onClickReset,
            onClickConfirm,
            onNameInputChange,
            onPriorityInputChange,
        };
    },
};
</script>

<style lang="postcss">
.collector-update-modal {
    .collector-input-lap {
        @apply flex border-r border-gray-200;
        width: 50%;
        padding: 2.5rem;
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
}
</style>
