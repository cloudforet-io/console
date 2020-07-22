<template>
    <p-button-modal :header-title="$t('COMMON.PROFILE')"
                    centered
                    fade
                    backdrop
                    size="xl"
                    :footer-cancel-button-bind="{
                        styleType: 'gray900',
                        outline: true,
                    }"
                    :footer-confirm-button-bind="{
                        styleType: 'primary-dark',
                    }"
                    :visible.sync="proxyVisible"
                    :loading="loading"
                    @confirm="onClickConfirm"
    >
        <template #body>
            <p-row class="profile-form" wrap="wrap">
                <p-col class="form-div" :col="6">
                    <p-field-group :label="$t('COMMON.ID')">
                        <br>
                        <p-text-input :value="userId" disabled block />
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.EMAIL')"
                                   :invalid-text="invalidMsg.email"
                                   :invalid="invalidState.email"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="userState.email"
                                          class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                          :class="{'is-invalid': invalid}"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.NAME')"
                                   :invalid-text="invalidMsg.name"
                                   :invalid="invalidState.name"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="userState.name" block
                                          class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                          :class="{'is-invalid': invalid}"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group v-if="showPassword"
                                   :label="$t('FORM.LABEL.PWD')"
                                   :invalid-text="invalidMsg.password"
                                   :invalid="invalidState.password"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="userState.password" block type="password"
                                          class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                          :class="{'is-invalid': invalid}"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group v-if="showPassword"
                                   :label="$t('FORM.LABEL.PWD_CHECK')"
                                   :invalid-text="invalidMsg.passwordCheck"
                                   :invalid="invalidState.passwordCheck"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="userState.passwordCheck" block type="password"
                                          class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                          :class="{'is-invalid': invalid}"
                            />
                        </template>
                    </p-field-group>
                </p-col>
                <p-col class="form-div" :col="6">
                    <p-field-group :label="$t('COMMON.PHONE')">
                        <br>
                        <p-text-input v-model="userState.mobile"
                                      block
                        />
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.GROUP')">
                        <br>
                        <p-text-input v-model="userState.group"
                                      block
                        />
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.LANGUAGE')">
                        <p-select-dropdown v-model="userState.language"
                                           :items="languages"
                                           auto-height
                        />
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.TIMEZONE')">
                        <p-select-dropdown v-model="userState.timezone"
                                           :items="timezones"
                                           auto-height
                        />
                    </p-field-group>
                </p-col>
            </p-row>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    reactive, toRefs, computed, getCurrentInstance,
} from '@vue/composition-api';
import moment from 'moment-timezone';
import {
    makeProxy, formValidation, lengthMinValidation, lengthMaxValidation, Validation, requiredValidation,
} from '@/lib/compostion-util';
import GNBEventBus from '@/views/containers/gnb/GNBEventBus';
import { LANGUAGES } from '@/lib/global-enums';
import { MenuItem } from '@/lib/util';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';


export const profileSetup = (props, context) => {
    const vm: any = getCurrentInstance();

    const userState = reactive({
        password: '',
        passwordCheck: '',
        name: '',
        email: '',
        mobile: '',
        group: '',
        language: '',
        timezone: '',
    });

    const updateUserValidations = {
        name: [requiredValidation('Please enter name')],
        email: [requiredValidation('Please enter email')],
        password: [lengthMinValidation(5), lengthMaxValidation(12)],
        passwordCheck: [
            new Validation((value, data) => data.password === value, 'please enter same value again'),
        ],
    };

    const state = reactive({
        proxyVisible: makeProxy('visible', props, context.emit),
        loading: true,
        showPassword: computed(() => state.isDomainOwner || state.isLocalType),
        userState,
        languages: context.root.$i18n.availableLocales.map(lang => (new MenuItem(lang, LANGUAGES[lang]))),
        timezones: moment.tz.names().map(tz => new MenuItem(tz, tz)),
        showValidation: false,
        ...formValidation(userState, updateUserValidations),
        isLocalType: computed(() => vm.$ls.domain.state.isLocalType),
        isDomainOwner: computed(() => vm.$ls.user.state.isDomainOwner),
    });

    const params: any = {};
    if (state.isDomainOwner) {
        // eslint-disable-next-line camelcase
        params.owner_id = props.userId;
        GNBEventBus.$emit('getOwner', params);
    } else {
        // eslint-disable-next-line camelcase
        params.user_id = props.userId;
        GNBEventBus.$emit('getUser', params);
    }

    const onClickConfirm = async () => {
        state.showValidation = true;
        const result = await state.allValidation();
        if (!result) return;

        const userParam = { ...state.userState };
        delete userParam.passwordCheck;
        if (!state.showPassword) delete userParam.password;

        if (state.isDomainOwner) {
            // eslint-disable-next-line camelcase
            userParam.owner_id = props.userId;
            GNBEventBus.$emit('updateOwner', userParam);
        } else {
            // eslint-disable-next-line camelcase
            userParam.user_id = props.userId;
            GNBEventBus.$emit('updateUser', userParam);
        }

        state.proxyVisible = false;
    };

    return {
        ...toRefs(state),
        onClickConfirm,
    };
};

export default {
    name: 'ProfileModalTemplate',
    components: {
        PSelectDropdown,
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PRow,
        PCol,
    },
    props: {
        visible: Boolean,
        userId: String,
    },
    setup(props, context) {
        return profileSetup(props, context);
    },
};
</script>

<style lang="postcss" scoped>
    .profile-form {
        text-align: left;
    .form-div {
        padding: 0 1rem;
    }
    .dropdown {
        text-align: left;
    }
    }
</style>
