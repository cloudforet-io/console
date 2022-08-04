<template>
    <div class="notice-form">
        <p-pane-layout class="notice-form-wrapper">
            <p-field-group class="notice-label-wrapper">
                <!--            song-lang-->
                <p-label>Author</p-label>
                <p class="text-sm text-gray-900">
                    <!--                    song-lang-->
                    {{ hasSystemRole ? '시스템 운영자' : '도메인 관리자' }}
                </p>
            </p-field-group>
            <!--                song-lang-->
            <p-field-group class="notice-label-wrapper" label="Writer Name" required>
                <p-text-input v-model="writerNameState" class="" />
            </p-field-group>
            <!--                song-lang-->
            <p-field-group v-if="hasSystemRole" class="notice-label-wrapper" label="Viewer"
                           required
            >
                <p-radio :selected="isAllDomainSelectedState" class="mr-4" @click="handleClickAllDomainRadio">
                    <!--                    song-lang-->
                    <span>All Domains</span>
                </p-radio>
                <p-radio :selected="!isAllDomainSelectedState" @click="handleClickSelectDomainRadio">
                    <!--                    song-lang-->
                    <span>Selected Domains</span>
                </p-radio>
                <br>
                <!--                TODO:: add loading-->
                <p-search-dropdown class="mt-2 w-1/2"
                                   multi-selectable
                                   :menu="domainList"
                                   :selected="selectedDomainsState"
                                   :disabled="isAllDomainSelectedState"
                                   @update:selected="handleSelectDomain"
                />
            </p-field-group>
            <!--            song-lang-->
            <p-field-group class="notice-label-wrapper" label="Title" required
                           :invalid="invalidState.noticeTitleState"
                           :invalid-text="invalidTexts.noticeTitleState"
            >
                <template #default="{invalid}">
                    <p-text-input :value="noticeTitleState" :invalid="invalid"
                                  @input="setForm('noticeTitleState', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group class="notice-label-wrapper" label="Content" required>
                <text-editor v-model.lazy="contentState" :image-uploader="uploadImage" />
            </p-field-group>
            <div class="notice-create-options-wrapper">
                <p-check-box v-model="isPinState">
                    <!--                song-lang-->
                    <span>Pin Notice</span>
                </p-check-box>
                <p-check-box v-model="isPopupState">
                    <!--                song-lang-->
                    <span>Display in pop-up</span>
                </p-check-box>
            </div>
        </p-pane-layout>
        <div class="notice-create-buttons-wrapper">
            <p-button
                style-type="gray-border"
                size="lg"
                @click="$router.go(-1)"
            >
                <!--                song-lang-->
                Cancel
            </p-button>
            <p-button
                style-type="primary-dark"
                size="lg"
                :disabled="!isAllValid"
                @click="handleConfirm"
            >
                <!--                song-lang-->
                Confirm
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from '@vue/composition-api';
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PPaneLayout, PLabel, PFieldGroup, PTextInput, PRadio, PSearchDropdown, PCheckBox, PButton,
} from '@spaceone/design-system';


import { store } from '@/store';

import TextEditor from '@/common/components/editor/TextEditor.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';


type noticeFormType = 'CREATE' | 'EDIT';

export default {
    name: 'NoticeForm',
    components: {
        TextEditor,
        PPaneLayout,
        PLabel,
        PFieldGroup,
        PTextInput,
        PRadio,
        PSearchDropdown,
        PCheckBox,
        PButton,
    },
    props: {
        type: {
            default: 'CREATE',
            type: String as PropType<noticeFormType>,
        },
        writerName: {
            default: '',
            type: String,
        },
        noticeTitle: {
            default: '',
            type: String,
        },
        isPin: {
            default: false,
            type: Boolean,
        },
        isPopup: {
            default: false,
            type: Boolean,
        },
        isAllDomainSelected: {
            default: false,
            type: Boolean,
        },
        selectedDomains: {
            default: () => ([]),
            type: Array,
        },
        content: {
            default: '',
            type: String,
        },
    },
    setup(props) {
        const {
            forms: {
                noticeTitleState,
            },
            setForm,
            invalidState,
            invalidTexts,
            isAllValid,
        } = useFormValidator({
            noticeTitleState: props.noticeTitle,
        }, {
            // song-lang
            noticeTitleState(value: string) { return value.trim().length ? '' : 'Title is required'; },
        });

        const state = reactive({
            hasSystemRole: computed<boolean>(() => store.getters['user/hasSystemRole']),
            writerNameState: props.writerName ?? '',
            isPinState: props.isPin ?? false,
            isPopupState: props.isPopup ?? false,
            contentState: props.content ?? '',
            isAllDomainSelectedState: props.isAllDomainSelected ?? true,
            domainList: [],
            selectedDomainsState: props.selectedDomains.length ? props.selectedDomains : [],
        });

        const handleConfirm = () => {
            if (props.type === 'CREATE') handleCreateNotice();
            if (props.type === 'EDIT') handleEditNotice();
        };

        const handleCreateNotice = async () => {
            try {
                await console.log('create', state.writerNameState, noticeTitleState.value, state.isPinState, state.isPopupState);
            } catch (e) {
                // song-lang
                ErrorHandler.handleRequestError(e, 'Failed to create notice');
            }
        };
        const handleEditNotice = async () => {
            try {
                await console.log('edit', state.writerNameState, noticeTitleState.value, state.isPinState, state.isPopupState);
            } catch (e) {
                // song-lang
                ErrorHandler.handleRequestError(e, 'Failed to edit notice');
            }
        };

        const handleClickAllDomainRadio = () => { state.isAllDomainSelectedState = true; };
        const handleClickSelectDomainRadio = () => { state.isAllDomainSelectedState = false; };

        const handleSelectDomain = (domains) => {
            if (!state.isAllDomainSelectedState) {
                state.selectedDomainsState = domains;
            }
        };

        const getDomainList = async () => {
            try {
                const { results } = await SpaceConnector.client.identity.domain.list();
                state.domainList = results.map(d => ({
                    name: d.domain_id,
                    label: d.name,
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
                state.domainList = [];
            }
        };

        // TODO: api binding. must return Promise<string>
        const uploadImage = (): Promise<string> => new Promise((resolve) => {
            setTimeout(() => {
                resolve('https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/spaceone.svg');
            }, 1000);
        });

        watch(() => state.isAllDomainSelectedState, (isAllDomain) => {
            if (isAllDomain) state.selectedDomainsState = [];
        });

        (async () => {
            if (state.hasSystemRole) await getDomainList();
        })();

        return {
            ...toRefs(state),
            handleConfirm,
            handleClickAllDomainRadio,
            handleClickSelectDomainRadio,
            handleSelectDomain,
            noticeTitleState,
            setForm,
            invalidState,
            invalidTexts,
            isAllValid,
            uploadImage,
        };
    },
};
</script>

<style scoped lang="postcss">
.notice-form-wrapper {
    padding: 1.625rem 0.625rem;
    .notice-label-wrapper {
        @apply mb-4;
        .p-radio {
            @apply inline-flex gap-1;
        }
    }
    .notice-create-options-wrapper {
        @apply flex flex-col gap-2;
    }
}
.notice-create-buttons-wrapper {
    @apply inline-flex;
    float: right;
    margin-top: 1rem;

    & .p-button {
        margin-left: 1rem;
    }
}
</style>
