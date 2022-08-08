<template>
    <div class="notice-form">
        <p-pane-layout class="notice-form-wrapper">
            <!--                song-lang-->
            <p-field-group class="notice-label-wrapper writer-name-input" label="Writer Name" required>
                <template #default="{invalid}">
                    <!--                    song-lang-->
                    <p-text-input :value="writerNameState" :invalid="invalid"
                                  :placeholder="$store.state.user.name || 'Required'"
                                  @input="setForm('writerNameState', $event)"
                    />
                </template>
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
                <!--               song-lang -->
                <p-search-dropdown class="mt-2 w-1/2"
                                   :menu="domainList"
                                   :selected="selectedDomainState"
                                   :disabled="isAllDomainSelectedState"
                                   :placeholder="isAllDomainSelectedState ? 'All' : ''"
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
                                  class="w-full"
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
import type { ComputedRef, PropType } from '@vue/composition-api';
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PPaneLayout, PFieldGroup, PTextInput, PRadio, PSearchDropdown, PCheckBox, PButton,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import TextEditor from '@/common/components/editor/TextEditor.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';


type noticeFormType = 'CREATE' | 'EDIT';

export default {
    name: 'NoticeForm',
    components: {
        TextEditor,
        PPaneLayout,
        PFieldGroup,
        PTextInput,
        PRadio,
        PSearchDropdown,
        PCheckBox,
        PButton,
    },
    props: {
        boardId: {
            default: '',
            type: String,
        },
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
        const state = reactive({
            hasSystemRole: computed<boolean>(() => store.getters['user/hasSystemRole']),
            userName: computed<string>(() => store.state.user.name),
            isPinState: props.isPin ?? false,
            isPopupState: props.isPopup ?? false,
            contentState: props.content ?? '',
            isAllDomainSelectedState: props.isAllDomainSelected ?? true,
            domainList: [],
            selectedDomainState: props.selectedDomains.length ? props.selectedDomains : [],
        });

        const {
            forms: {
                noticeTitleState,
                writerNameState,
            },
            setForm,
            invalidState,
            invalidTexts,
            isAllValid,
        } = useFormValidator({
            noticeTitleState: props.noticeTitle,
            writerNameState: props.writerName || state.userName || '',
        }, {
            // song-lang
            noticeTitleState(value: string) { return value.trim().length ? '' : 'Title is required'; },
            // song-lang
            writerNameState(value: string) { return value.trim().length ? '' : 'Writer name is required'; },
        });

        const formData:ComputedRef = computed(() => ({
            // FIXME:: Below `board_id` is DUMMY
            board_id: props.boardId || 'board-14a09a71f504',
            title: noticeTitleState.value,
            writer: writerNameState.value,
            contents: state.contentState,
            options: {
                is_pinned: state.isPinState,
                is_popup: state.isPopupState,
            },
        }));

        const handleConfirm = () => {
            if (props.type === 'CREATE') handleCreateNotice();
            if (props.type === 'EDIT') handleEditNotice();
        };

        const handleCreateNotice = async () => {
            try {
                await SpaceConnector.client.board.post.create(formData.value);
                // song-lang
                showSuccessMessage('Successfully created notice', '');
                await SpaceRouter.router.push({ name: MY_PAGE_ROUTE.INFO.NOTICE._NAME, query: {} });
            } catch (e) {
                // song-lang
                ErrorHandler.handleRequestError(e, 'Failed to create notice');
            }
        };
        const handleEditNotice = async () => {
            try {
                await SpaceConnector.client.board.post.update(formData.value);
                // song-lang
                showSuccessMessage('Successfully edited notice', '');
                // TODO:: add below `query`
                await SpaceRouter.router.push({ name: MY_PAGE_ROUTE.INFO.NOTICE.DETAIL._NAME, query: {} });
            } catch (e) {
                // song-lang
                ErrorHandler.handleRequestError(e, 'Failed to edit notice');
            }
        };

        const handleClickAllDomainRadio = () => { state.isAllDomainSelectedState = true; };
        const handleClickSelectDomainRadio = () => { state.isAllDomainSelectedState = false; };

        const handleSelectDomain = (domain: Array<string>) => {
            if (!state.isAllDomainSelectedState) {
                state.selectedDomainState = domain;
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
            if (isAllDomain) state.selectedDomainState = [];
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
            writerNameState,
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
    .writer-name-input {
        .p-text-input::v-deep {
            @apply w-1/2;
            .input-container {
                @apply w-full;
            }
        }
    }
    .notice-create-options-wrapper {
        @apply flex flex-col gap-2;
    }
}
.notice-create-buttons-wrapper {
    @apply inline-flex float-right mt-4;
    & .p-button {
        @apply ml-4;
    }
}
</style>
