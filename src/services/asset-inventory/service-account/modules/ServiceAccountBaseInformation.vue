<template>
    <p-pane-layout class="service-account-base-information">
        <div class="title">
            {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_TITLE') }}
        </div>
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
        <p-json-schema-form v-if="serviceAccountSchema"
                            :form-data.sync="customSchemaForm"
                            :schema="serviceAccountSchema"
                            :language="$store.state.user.language"
                            @validate="handleAccountValidate"
        />
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
    </p-pane-layout>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PJsonSchemaForm, PFieldGroup, PPaneLayout, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';
import { useFormValidator } from '@/common/composables/form-validator';

import type { BaseInformationData } from '@/services/asset-inventory/service-account/type';


export default {
    name: 'ServiceAccountBaseInformation',
    components: {
        TagsInputGroup,
        PJsonSchemaForm,
        PFieldGroup,
        PPaneLayout,
        PTextInput,
    },
    props: {
        mode: {
            type: String,
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
                } if (state.serviceAccountNames.includes(val)) {
                    return i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_DUPLICATED');
                }
                return true;
            },
        });
        const state = reactive({
            serviceAccountNames: [] as string[],
            serviceAccountSchema: computed(() => props.providerData.template?.service_account?.schema ?? null),
            customSchemaForm: {},
            isCustomSchemaFormValid: undefined,
            tags: {},
            isTagsValid: true,
            formData: computed<BaseInformationData>(() => ({
                accountName: serviceAccountName.value,
                customSchemaForm: state.customSchemaForm,
                tags: state.tags,
            })),
            isAllValid: computed(() => !invalidState.serviceAccountName
                && state.isTagsValid
                && (state.serviceAccountSchema ? state.isCustomSchemaFormValid : true)),
        });

        /* Util */

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

        watch(() => state.isAllValid, (isAllValid) => {
            emit('update:isValid', isAllValid);
        });
        watch(() => state.formData, (formData) => {
            emit('change', formData);
        });

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
};
</script>
<style lang="postcss" scoped>
.service-account-base-information {
    padding: 2rem 1rem;
    .title {
        font-size: 1.5rem;
        line-height: 120%;
        margin-bottom: 2rem;
    }
}
</style>
