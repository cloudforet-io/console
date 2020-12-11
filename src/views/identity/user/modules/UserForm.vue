<template>
    <p-button-modal class="user-form-modal"
                    :header-title="headerTitle"
                    :centered="true"
                    :scrollable="true"
                    size="lg"
                    :fade="true"
                    :backdrop="true"
                    :visible.sync="proxyVisible"
                    @confirm="confirm"
    >
        <template #body>
            <div class="user-input-wrapper">
                <div class="top-part">
                    <p-field-group :label="$t('IDENTITY.USER.FORM.USER_ID')"
                                   :required="true"
                                   :invalid="!validationState.isUserIdValid"
                                   :invalid-text="validationState.userIdInvalidText"
                                   :valid="validationState.isUserIdValid"
                                   :valid-text="validationState.userIdValidText"
                    >
                        <template #default="{invalid}">
                            <div>
                                <p-text-input v-model="formState.user_id"
                                              v-focus
                                              :placeholder="$t('IDENTITY.USER.FORM.NAME_PLACEHOLDER')"
                                              :disabled="updateMode"
                                              :class="{'is-invalid': invalid}"
                                />
                                <p-button style-type="primary-dark" :disabled="updateMode" class="user-id-check-button"
                                          @click="checkUserID"
                                >
                                    {{ $t('IDENTITY.USER.FORM.CHECK_USER_ID') }}
                                </p-button>
                            </div>
                        </template>
                    </p-field-group>
                </div>
                <div class="bottom-part">
                    <div class="bottom-left-part">
                        <p-field-group :label="$t('IDENTITY.USER.FORM.NAME')">
                            <p-text-input v-model="formState.name" class="block" />
                        </p-field-group>
                        <p-field-group :label="$t('IDENTITY.USER.FORM.EMAIL')">
                            <p-text-input v-model="formState.email" class="block" />
                        </p-field-group>
                        <p-field-group :label="'Domain Role'" class="input-form">
                            <p-select-dropdown v-model="formState.domainRole"
                                               :items="formState.domainRoleItem"
                                               auto-height
                                               class="dropdown"
                            />
                        </p-field-group>
                    </div>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { TranslateResult } from 'vue-i18n';

import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import TagsInputGroup from '@/views/common/components/tags/TagsInputGroup.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PHr from '@/components/atoms/hr/PHr.vue';

import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';

export default {
    name: 'PUserForm',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
        PButton,
    },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        headerTitle: {
            type: String,
            required: true,
        },
        visible: {
            type: Boolean,
            default: false,
        },
        item: {
            type: Object,
            default: undefined,
        },
        updateMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
        });
        const formState = reactive({
            user_id: '',
            name: '',
            email: '',
            domainRole: '',
            domainRoleItem: [
                { type: 'item', label: 'Not select role', name: '' },
                { type: 'item', label: 'Domain Admin', name: '' },
            ],
        });
        const validationState = reactive({
            isUserIdValid: undefined as undefined | boolean,
            userIdInvalidText: '' as TranslateResult | string,
            userIdValidText: computed(() => vm.$t('IDENTITY.USER.FORM.NAME_VALID')),
        });

        /* util */
        const checkUserID = async () => {
            validationState.isUserIdValid = undefined;
            validationState.userIdInvalidText = '';

            if (formState.user_id) {
                if (formState.user_id.replace(/ /g, '').length !== formState.user_id.length) {
                    validationState.isUserIdValid = false;
                    validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID');
                    return;
                }
                // if (!state.isInternalAuth) {
                //     await SpaceConnector.client.identity.user.find({
                //         search: { user_id: formState.user_id },
                //         domain_id: store.state.domain.domainId,
                //     }).catch(() => {
                //         validationState.isUserIdValid = false;
                //         validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.USER_ID_NOT_EXIST');
                //     });
                // }
                await SpaceConnector.client.identity.user.get({ user_id: formState.user_id })
                    .then(() => {
                        validationState.isUserIdValid = false;
                        validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.USER_ID_DUPLICATED');
                    })
                    .catch(() => {});
                if (typeof validationState.isUserIdValid !== 'boolean') validationState.isUserIdValid = true;
            } else {
                validationState.isUserIdValid = false;
                validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD');
            }
        };

        const confirm = async () => {
            if (!props.updateMode) {
                await checkUserID();
                if (!validationState.isUserIdValid) {
                    return;
                }
            }

            const data = {} as any;
            ['user_id', 'name', 'email'].forEach((key) => {
                if (formState[key]) {
                    data[key] = formState[key];
                }
            });
            emit('confirm', data);
        };

        const init = () => {
            if (props.updateMode) {
                formState.user_id = props.item.user_id;
                formState.name = props.item.name;
                formState.email = props.item.email;
            }
        };
        init();

        return {
            ...toRefs(state),
            formState,
            validationState,
            confirm,
            checkUserID,
        };
    },
};
</script>

<style lang="postcss">
.user-form-modal {
    .user-input-wrapper {
        .top-part {
            padding-bottom: 0.25rem;
        }
        .bottom-part {
            padding-bottom: 2rem;
            .bottom-left-part {
                display: inline-grid;
                width: 50%;
            }
            .bottom-right-part {
                display: inline-grid;
                width: 50%;
            }
            .p-field-group {
                width: 100%;
            }
        }
        .p-text-input {
            @apply text-gray-900;
            width: 100%;
            max-width: 19rem;
            appearance: none;
            font-size: 0.875rem;
            line-height: 1.5;
            border-radius: 0.125rem;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
        }
        .p-select-dropdown {
            max-width: 19rem;
            width: 100%;
        }
        .tag-input {
            @apply bg-primary4;
            padding-top: 0.5rem;
            .tags-group .input-box {
                width: auto;
            }
        }
        .user-id-check-button {
            margin-left: 0.5rem;
            min-height: 2rem;
        }
        .p-divider {
            margin-bottom: 1.5rem;
            margin-top: .5rem;
        }
    }
}
</style>
