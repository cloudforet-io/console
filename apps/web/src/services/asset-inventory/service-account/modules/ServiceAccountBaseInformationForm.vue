<template>
    <div class="service-account-base-information-form">
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
                              @update:value="setForm('serviceAccountName', $event)"
                />
            </template>
        </p-field-group>
        <p-json-schema-form v-if="schema"
                            class="p-json-schema-form"
                            :form-data.sync="customSchemaForm"
                            :schema="schema"
                            :language="$store.state.user.language"
                            @validate="handleAccountValidate"
        />
        <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.TAG_LABEL')"
                       :help-text="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.BASE_INFO_HELP_TEXT')"
                       class="account-tags"
        >
            <tags-input-group :tags="tags"
                              show-validation
                              :is-valid.sync="isTagsValid"
                              @update-tags="handleUpdateTags"
            />
        </p-field-group>
    </div>
</template>

<script lang="ts">
import type { PropType, SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

import {
    PFieldGroup, PJsonSchemaForm, PTextInput,
} from '@spaceone/design-system';
import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';
import { useFormValidator } from '@/common/composables/form-validator';

import type { BaseInformationForm, PageMode } from '@/services/asset-inventory/service-account/type';

interface Props {
    editMode: PageMode;
    schema: any;
    isValid: boolean;
    originForm: BaseInformationForm;
}

export default defineComponent<Props>({
    name: 'ServiceAccountBaseInformationForm',
    components: {
        TagsInputGroup,
        PJsonSchemaForm,
        PFieldGroup,
        PTextInput,
    },
    props: {
        editMode: {
            type: String as PropType<PageMode>,
            default: 'CREATE',
        },
        schema: {
            type: Object,
            default: () => ({}),
        },
        isValid: {
            type: Boolean,
            default: false,
        },
        originForm: {
            type: Object as PropType<BaseInformationForm>,
            default: () => ({}),
        },
    },
    setup(props, { emit }: SetupContext) {
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
                } if (state.serviceAccountNames.includes(val)) {
                    if (props.originForm?.accountName === val) return true;
                    return i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_DUPLICATED');
                }
                return true;
            },
        });
        const state = reactive({
            serviceAccountNames: [] as string[],
            customSchemaForm: {},
            isCustomSchemaFormValid: undefined,
            tags: {},
            isTagsValid: true,
            formData: computed<BaseInformationForm>(() => ({
                accountName: serviceAccountName.value,
                customSchemaForm: state.customSchemaForm,
                tags: state.tags,
            })),
            isAllValid: computed(() => !invalidState.serviceAccountName
                && state.isTagsValid
                && (isEmpty(props.schema) ? true : state.isCustomSchemaFormValid)),
        });

        /* Util */
        const initFormData = (originForm: BaseInformationForm) => {
            setForm('serviceAccountName', originForm?.accountName ?? '');
            state.customSchemaForm = originForm?.customSchemaForm ?? {};
            state.tags = originForm?.tags ?? {};
            // init validation
            state.isCustomSchemaFormValid = true;
        };

        /* Api */
        const listServiceAccounts = async () => {
            const { results } = await SpaceConnector.client.identity.serviceAccount.list({
                only: 'name',
            });
            state.serviceAccountNames = results.map((v) => v.name);
        };

        /* Event */
        const handleUpdateTags = (tags: Tag) => {
            state.tags = tags;
        };
        const handleAccountValidate = (isValid) => {
            state.isCustomSchemaFormValid = isValid;
        };

        /* Init */
        (async () => {
            await listServiceAccounts();
        })();

        /* Watcher */
        watch(() => state.isAllValid, (isAllValid) => {
            emit('update:isValid', isAllValid);
        });
        watch(() => state.formData, (formData) => {
            emit('change', formData);
        });
        watch(() => props.originForm, (originForm) => {
            if (!isEmpty(originForm)) initFormData(originForm);
        }, { immediate: true });

        return {
            ...toRefs(state),
            serviceAccountName,
            invalidState,
            invalidTexts,
            setForm,
            handleUpdateTags,
            handleAccountValidate,
        };
    },
});
</script>
<style lang="postcss" scoped>
.service-account-base-information-form {
    /* custom design-system component - p-text-input */
    :deep(.account-name-input) {
        .input-container {
            max-width: 30rem;
            width: 50%;
        }
    }

    /* custom design-system component - p-field-group */
    :deep(.account-tags) {
        .help-msg {
            font-size: 0.875rem;
            white-space: pre-line;
        }
    }

    /* custom design-system component - p-json-schema-form */
    :deep(.p-json-schema-form) {
        .p-text-input {
            width: 100%;
            .input-container {
                max-width: 30rem;
                width: 50%;
            }
        }
    }

    @screen tablet {
        /* custom design-system component - p-text-input */
        :deep(.account-name-input) {
            .input-container {
                width: 100%;
            }
        }

        /* custom design-system component - p-json-schema-form */
        :deep(.p-json-schema-form) {
            .p-text-input {
                .input-container {
                    width: 100%;
                }
            }
        }
    }
}
</style>
