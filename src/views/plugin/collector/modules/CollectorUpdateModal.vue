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
                                   :invalid="!nameValidator.valid"
                                   :required="true"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="name" block
                                          class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                          :class="{'is-invalid': invalid}"
                            />
                        </template>
                    </p-field-group>

                    <p-field-group :label="$t('COMMON.PRIORITY')"
                                   :invalid-text="priorityInvalidText"
                                   :invalid="!priorityValidator.valid"
                                   :required="true"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model.number="priority" block
                                          type="number"
                                          class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                          :class="{'is-invalid': invalid}"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.VERSION')"
                                   :required="true"
                    >
                        <p-select-dropdown v-model="version" :items="versions" />
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
import { get, cloneDeep } from 'lodash';
import { Validator } from 'jsonschema';

import { toRefs, reactive, computed } from '@vue/composition-api';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';

import { fluentApi } from '@/lib/fluent-api';
import { makeProxy } from '@/lib/compostion-util';
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
        const validator = new Validator();
        const state = reactive({
            loading: true,
            collector: null,
            imageUrl: computed(() => get(state.collector, 'tags.icon', '')),
            proxyVisible: makeProxy<boolean>('visible', props, emit),
            pluginInfo: computed<CollectorPluginModel>(() => get(state.collector, 'plugin_info')),
            confirmBtnBind: computed(() => {
                const defaultStyle: any = { style: { padding: 0 }, disabled: !state.isValid };
                defaultStyle.styleType = state.loading ? 'gray200' : 'primary-dark';
                return defaultStyle;
            }),
            //
            collectorUpdateParam: {} as CollectorUpdateParameter,
            versions: [],
            names: [],
            name: '',
            priority: 10,
            version: null,
            //
            errorText: {
                format: 'name is duplicated',
                minLength: 'should NOT be shorter than 2 characters',
                minimum: 'should be >= 1',
                maximum: 'should be <= 10',
            },
            nameValidator: computed(() => validator.validate(state.name, {
                type: 'string',
                required: true,
                minLength: 2,
                format: 'nameFormat',
            })),
            priorityValidator: computed(() => validator.validate(state.priority, {
                type: 'number',
                required: true,
                minimum: 1,
                maximum: 10,
            })),
            nameInvalidText: computed(() => state.errorText[state.nameValidator.errors[0]?.name]),
            priorityInvalidText: computed(() => state.errorText[state.priorityValidator.errors[0]?.name]),
            isValid: computed(() => state.nameValidator.valid && state.priorityValidator.valid),
        });

        const getCollector = async (): Promise<void> => {
            try {
                const res = await fluentApi.inventory().collector().get().setId(props.collectorId)
                    .execute();
                state.collector = res.data;
                state.name = res.data.name;
                state.priority = Number(res.data.priority);
                state.version = res.data.plugin_info.version;
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Get Collector', e, root);
            }
        };
        const getNames = async () => {
            const res = await fluentApi.inventory().collector().list()
                .setFilter({ key: 'name', operator: '!=', value: state.name })
                .execute();
            state.names = res.data.results.map(v => v.name);
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

        const onClickReset = (): void => {
            if (state.loading) return;
            state.name = get(state.collector, 'name', '');
            state.priority = get(state.collector, 'priority', null);
            state.version = get(state.collector, 'plugin_info.version', null);
        };
        const onClickConfirm = async (): Promise<void> => {
            if (state.isValid) {
                state.loading = true;

                const newPluginInfo = cloneDeep(state.pluginInfo);
                newPluginInfo.version = state.version;
                state.collectorUpdateParam = {
                    collector_id: props.collectorId,
                    name: state.name,
                    plugin_info: newPluginInfo,
                    priority: state.priority,
                };

                try {
                    await fluentApi.inventory().collector().update()
                        .setParameter(state.collectorUpdateParam)
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
            //
            await getNames();
            validator.customFormats.nameFormat = input => !(state.names.includes(input)); // set name custom format
            //
            await getVersions();
            state.loading = false;
        };
        init();

        return {
            ...toRefs(state),
            onClickReset,
            onClickConfirm,
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
