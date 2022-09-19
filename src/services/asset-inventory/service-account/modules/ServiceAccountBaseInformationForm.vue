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
                              @input="setForm('serviceAccountName', $event)"
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
        <!--        song-lang-->
        <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.TAG_LABEL')"
                       help-text="Set Account's tag.
The Key - Value pair is a required field. Only underscores (_), characters, and numbers are allowed. International characters are allowed."
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
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PFieldGroup, PJsonSchemaForm, PTextInput,
} from '@spaceone/design-system';
import { isEmpty } from 'lodash';
import type { PropType, SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

import { i18n } from '@/translations';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';
import { useFormValidator } from '@/common/composables/form-validator';

import type { BaseInformationForm, PageMode } from '@/services/asset-inventory/service-account/type';


interface Props {
    editMode: PageMode;
    schema: any;
    isValid: boolean;
    originFormData: BaseInformationForm;
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
        originFormData: {
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
                    if (props.originFormData?.accountName === val) return true;
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
        const initFormData = () => {
            setForm('serviceAccountName', props.originFormData?.accountName ?? '');
            state.customSchemaForm = props.originFormData?.customSchemaForm ?? {};
            state.tags = props.originFormData?.tags ?? {};
            // init validation
            state.isCustomSchemaFormValid = true;
        };

        /* Api */
        const listServiceAccounts = async () => {
            const { results } = await SpaceConnector.client.identity.serviceAccount.list({
                only: 'name',
            });
            state.serviceAccountNames = results.map(v => v.name);
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
        watch(() => props.editMode, (editMode) => {
            if (editMode === 'UPDATE') {
                initFormData();
            }
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

    @screen tablet {
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
</style>
