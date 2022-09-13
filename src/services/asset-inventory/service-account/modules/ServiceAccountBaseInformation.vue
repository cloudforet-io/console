<template>
    <p-pane-layout class="service-account-base-information">
        <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_TITLE')">
            <template v-if="mode === 'READ'" #extra>
                <p-button icon="ic_edit">
                    <!--song-lang-->
                    Edit
                </p-button>
            </template>
        </p-panel-top>
        <div class="content-wrapper">
            <template v-if="mode === 'READ'">
                <p-dynamic-layout v-if="readState.detailSchema"
                                  v-bind="readState.detailSchema"
                                  :type-options="{
                                      loading: readState.loading
                                  }"
                                  :data="readState.items"
                                  :field-handler="fieldHandler"
                />
            </template>
            <template v-if="EDIT_MODE.includes(mode)">
                <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_LABEL')"
                               :invalid="invalidState.serviceAccountName"
                               :invalid-text="invalidTexts.serviceAccountName"
                               :required="true"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="serviceAccountName"
                                      class="account-name-input block"
                                      :invalid="invalid"
                                      :placeholder="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_NAME_PLACEHOLDER')"
                                      @input="setForm('serviceAccountName', $event)"
                        />
                    </template>
                </p-field-group>
                <p-json-schema-form v-if="formState.serviceAccountSchema"
                                    class="p-json-schema-form"
                                    :form-data.sync="formState.customSchemaForm"
                                    :schema="formState.serviceAccountSchema"
                                    :language="$store.state.user.language"
                                    @validate="handleAccountValidate"
                />
                <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.TAG_LABEL')"
                               help-text="Set Account's tag.
The Key - Value pair is a required field. Only underscores (_), characters, and numbers are allowed. International characters are allowed."
                >
                    <tags-input-group :tags="formState.tags"
                                      show-validation
                                      :is-valid.sync="formState.isTagsValid"
                                      @update-tags="handleUpdateTags"
                    />
                </p-field-group>
            </template>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PButton,
    PDynamicLayout,
    PFieldGroup,
    PJsonSchemaForm,
    PPaneLayout,
    PPanelTop,
    PTextInput,
} from '@spaceone/design-system';
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, watch,
} from 'vue';

import { i18n } from '@/translations';

import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import type { BaseInformationForm, PageMode, ProviderModel } from '@/services/asset-inventory/service-account/type';
import { EDIT_MODE } from '@/services/asset-inventory/service-account/type';


interface Props {
    mode: PageMode;
    providerData: ProviderModel;
    isValid: boolean;
    serviceAccountId?: string;
}

export default defineComponent<Props>({
    name: 'ServiceAccountBaseInformation',
    components: {
        TagsInputGroup,
        PJsonSchemaForm,
        PFieldGroup,
        PPaneLayout,
        PTextInput,
        PPanelTop,
        PButton,
        PDynamicLayout,
    },
    props: {
        mode: {
            type: String as PropType<PageMode>,
            default: 'READ',
        },
        providerData: {
            type: Object,
            default: () => ({}),
        },
        isValid: {
            type: Boolean,
            default: false,
        },
        serviceAccountId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const {
            forms: { serviceAccountName },
            invalidState,
            invalidTexts,
            setForm,
        } = useFormValidator({
            serviceAccountName: '',
        }, {
            serviceAccountName: (val: string) => {
                if (val.length < 2) {
                    return i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_INVALID');
                } if (formState.serviceAccountNames.includes(val)) {
                    return i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_DUPLICATED');
                }
                return true;
            },
        });
        const formState = reactive({
            serviceAccountNames: [] as string[],
            serviceAccountSchema: computed(() => props.providerData.template?.service_account?.schema ?? null),
            customSchemaForm: {},
            isCustomSchemaFormValid: undefined,
            tags: {},
            isTagsValid: true,
            formData: computed<BaseInformationForm>(() => ({
                accountName: serviceAccountName.value,
                customSchemaForm: formState.customSchemaForm,
                tags: formState.tags,
            })),
            isAllValid: computed(() => !invalidState.serviceAccountName
                && formState.isTagsValid
                && (formState.serviceAccountSchema ? formState.isCustomSchemaFormValid : true)),
        });
        const readState = reactive({
            loading: true,
            detailSchema: {},
            items: [],
            fieldHandler: [],
        });

        /* Util */
        const fieldHandler = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };

        /* Api */
        const listServiceAccounts = async () => {
            const { results } = await SpaceConnector.client.identity.serviceAccount.list({
                only: 'name',
            });
            formState.serviceAccountNames = results.map(v => v.name);
        };
        const getDetailSchema = async (provider) => {
            const result = await SpaceConnector.client.addOns.pageSchema.get({
                resource_type: 'identity.ServiceAccount',
                schema: 'details',
                options: {
                    provider,
                },
            });
            readState.detailSchema = result.details[0];
        };
        const getServiceAccount = async (serviceAccountId) => {
            try {
                readState.loading = true;
                const result = await SpaceConnector.client.identity.serviceAccount.get({
                    service_account_id: serviceAccountId,
                });
                readState.items = result;
            } catch (e) {
                ErrorHandler.handleError(e);
                readState.items = [];
            } finally {
                readState.loading = false;
            }
        };

        /* Event */
        const handleUpdateTags = (tags: Tag) => {
            formState.tags = tags;
        };
        const handleAccountValidate = (isValid) => {
            formState.isCustomSchemaFormValid = isValid;
        };

        /* Init */
        (async () => {
            await listServiceAccounts();
        })();

        /* Watcher */
        watch(() => formState.isAllValid, (isAllValid) => {
            emit('update:isValid', isAllValid);
        });
        watch(() => formState.formData, (formData) => {
            emit('change', formData);
        });
        watch(() => props.providerData, (providerData) => {
            if (providerData.provider) {
                getDetailSchema(providerData.provider);
            }
        });
        watch(() => props.serviceAccountId, (serviceAccountId) => {
            if (serviceAccountId) getServiceAccount(serviceAccountId);
        }, { immediate: true });

        return {
            formState,
            readState,
            serviceAccountName,
            invalidState,
            invalidTexts,
            setForm,
            EDIT_MODE,
            handleUpdateTags,
            handleAccountValidate,
            fieldHandler,
        };
    },
});
</script>
<style lang="postcss" scoped>
.service-account-base-information {
    .p-panel-top::v-deep {
        .extra {
            text-align: right;
        }
    }
    .content-wrapper::v-deep {
        padding: 0.5rem 1rem;
        .account-name-input::v-deep {
            .input-container {
                width: 50%;
            }
        }
        .p-json-schema-form::v-deep {
            .p-text-input {
                width: 100%;
                .input-container {
                    width: 50%;
                }
            }
        }
        .p-panel-top {
            display: none;
        }
    }

    @screen tablet {
        .content-wrapper {
            .account-name-input::v-deep {
                .input-container {
                    width: 100%;
                }
            }
            .p-json-schema-form::v-deep {
                .p-text-input {
                    .input-container {
                        width: 100%;
                    }
                }
            }
        }
    }
}
</style>
