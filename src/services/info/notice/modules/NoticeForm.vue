<template>
    <div class="notice-form">
        <p-pane-layout class="notice-form-wrapper">
            <p-field-group class="notice-label-wrapper writer-name-input" :label="$t('INFO.NOTICE.FORM.LABEL_WRITER_NAME')" required>
                <template #default="{invalid}">
                    <p-text-input :value="writerName" :invalid="invalid"
                                  :placeholder="$store.state.user.name || $t('INFO.NOTICE.FORM.PLACEHOLDER_REQUIRED')"
                                  @input="setForm('writerName', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group v-if="hasSystemRole" class="notice-label-wrapper" :label="$t('INFO.NOTICE.FORM.LABEL_VIEWER')"
                           required
            >
                <p-radio :selected="isAllDomainSelected" class="mr-4" @click="handleClickAllDomainRadio">
                    <span>{{ $t('INFO.NOTICE.FORM.ALL_DOMAINS') }}</span>
                </p-radio>
                <p-radio :selected="!isAllDomainSelected" @click="handleClickSelectDomainRadio">
                    <span>{{ $t('INFO.NOTICE.FORM.SELECTED_DOMAIN') }}</span>
                </p-radio>
                <br>
                <p-search-dropdown class="mt-2 w-1/2"
                                   :menu="domainList"
                                   :selected="selectedDomain"
                                   :disabled="isAllDomainSelected"
                                   :placeholder="isAllDomainSelected ? $t('INFO.NOTICE.FORM.PLACEHOLDER_ALL') : ''"
                                   @update:selected="handleSelectDomain"
                />
            </p-field-group>
            <p-field-group class="notice-label-wrapper" :label="$t('INFO.NOTICE.FORM.LABEL_TITLE')" required
                           :invalid="invalidState.noticeTitle"
                           :invalid-text="invalidTexts.noticeTitle"
            >
                <template #default="{invalid}">
                    <p-text-input :value="noticeTitle" :invalid="invalid"
                                  class="w-full"
                                  @input="setForm('noticeTitle', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group class="notice-label-wrapper" :label="$t('INFO.NOTICE.FORM.LABEL_CONTENT')" required>
                <text-editor v-model.lazy="contents" :image-uploader="uploadImage" />
            </p-field-group>
            <div class="notice-create-options-wrapper">
                <p-check-box v-model="isPinned">
                    <span>{{ $t('INFO.NOTICE.FORM.PIN_NOTICE') }}</span>
                </p-check-box>
                <p-check-box v-model="isPopup">
                    <span>{{ $t('INFO.NOTICE.FORM.IN_POP_UP') }}</span>
                </p-check-box>
            </div>
        </p-pane-layout>
        <div class="notice-create-buttons-wrapper">
            <p-button
                style-type="gray-border"
                size="lg"
                @click="$router.go(-1)"
            >
                {{ $t('INFO.NOTICE.FORM.CANCEL') }}
            </p-button>
            <p-button
                style-type="primary-dark"
                size="lg"
                :disabled="!isAllValid"
                @click="handleConfirm"
            >
                {{ $t('INFO.NOTICE.FORM.CONFIRM') }}
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
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import TextEditor from '@/common/components/editor/TextEditor.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import type { NoticePostModel } from '@/services/info/notice/type';
import { INFO_ROUTE } from '@/services/info/route-config';


interface DomainItem {
    name: string;
    label: string;
}

type NoticeFormType = 'CREATE' | 'EDIT';

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
            type: String,
            default: undefined,
        },
        type: {
            default: 'CREATE',
            type: String as PropType<NoticeFormType>,
        },
        noticePostData: {
            default: () => {},
            type: Object as PropType<Partial<NoticePostModel>>,
        },
    },
    setup(props) {
        const state = reactive({
            hasSystemRole: computed<boolean>(() => store.getters['user/hasSystemRole']),
            userName: computed<string>(() => store.state.user.name),
            isPinned: false,
            isPopup: false,
            contents: '',
            isAllDomainSelected: !!store.getters['user/hasSystemRole'],
            boardIdState: '',
            domainList: [] as Array<DomainItem>,
            selectedDomain: store.getters['user/hasSystemRole']
                ? []
                : [{ name: store.state.domain.domainId, label: store.state.domain.domainId }] as Array<DomainItem>,
            postId: '',
        });

        const {
            forms: {
                noticeTitle,
                writerName,
            },
            setForm,
            invalidState,
            invalidTexts,
            isAllValid,
        } = useFormValidator({
            noticeTitle: props.noticePostData?.title ?? '',
            writerName: props.noticePostData?.writer || state.userName || '',
        }, {
            noticeTitle(value: string) { return value.trim().length ? '' : i18n.t('INFO.NOTICE.FORM.TITLE_REQUIRED'); },
            writerName(value: string) { return value.trim().length ? '' : i18n.t('INFO.NOTICE.FORM.WRITER_REQUIRED'); },
        });

        const formData:ComputedRef = computed(() => ({
            board_id: state.boardIdState,
            title: noticeTitle.value,
            writer: writerName.value,
            contents: state.contents,
            options: {
                is_pinned: state.isPinned,
                is_popup: state.isPopup,
            },
        }));

        const handleConfirm = () => {
            if (props.type === 'CREATE') handleCreateNotice();
            if (props.type === 'EDIT') handleEditNotice();
        };

        const handleCreateNotice = async () => {
            try {
                await SpaceConnector.client.board.post.create(
                    state.isAllDomainSelected ? formData.value
                        : { ...formData.value, domain_id: state.selectedDomain[0].name },
                );
                showSuccessMessage(i18n.t('INFO.NOTICE.FORM.ALT_S_CREATE_NOTICE'), '');
                await SpaceRouter.router.push({ name: INFO_ROUTE.NOTICE._NAME, query: {} });
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('INFO.NOTICE.FORM.ALT_E_CREATE_NOTICE'));
            }
        };
        const handleEditNotice = async () => {
            try {
                await SpaceConnector.client.board.post.update(
                    state.isAllDomainSelected
                        ? {
                            ...formData.value,
                            post_id: state.postId,
                        }
                        : {
                            ...formData.value,
                            domain_id: state.selectedDomain[0].name,
                            post_id: state.postId,
                        },
                );
                showSuccessMessage(i18n.t('INFO.NOTICE.FORM.ALT_S_UPDATE_NOTICE'), '');
                await SpaceRouter.router.back();
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('INFO.NOTICE.FORM.ALT_E_UPDATE_NOTICE'));
            }
        };

        const handleClickAllDomainRadio = () => { state.isAllDomainSelected = true; };
        const handleClickSelectDomainRadio = () => { state.isAllDomainSelected = false; };

        const handleSelectDomain = (domain: Array<DomainItem>) => {
            if (!state.isAllDomainSelected) {
                state.selectedDomain = domain;
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

        const getBoardList = async () => {
            try {
                const { results } = await SpaceConnector.client.board.board.list({
                    domain_id: state.domainList.length ? state.domainList.map(d => d.name)
                        : store.state.domain.domainId,
                });
                state.boardIdState = results.filter(d => d.name === 'Notice')[0]?.board_id ?? '';
            } catch (e) {
                ErrorHandler.handleError(e);
                state.boardIdState = '';
            }
        };

        // TODO: api binding. must return Promise<string>
        const uploadImage = (): Promise<string> => new Promise((resolve) => {
            setTimeout(() => {
                resolve('https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/spaceone.svg');
            }, 1000);
        });

        watch(() => state.isAllDomainSelected, (isAllDomain: boolean) => {
            if (isAllDomain) state.selectedDomain = [];
        });

        watch(() => props.noticePostData, (d: Partial<NoticePostModel>) => {
            if (!Object.keys(d).length) return;
            state.isPinned = d.options?.is_pinned ?? false;
            state.isPopup = d.options?.is_popup ?? false;
            state.contents = d.contents ?? '';
            state.isAllDomainSelected = !!d.domain_id;
            state.boardIdState = d?.board_id ?? '';
            state.selectedDomain = d?.domain_id
                ? [{ name: d.domain_id, label: d.domain_id }]
                : [{ name: store.state.domain.domainId, label: store.state.domain.domainId }];
            state.postId = d.post_id ?? '';
            setForm('writerName', d.writer);
            setForm('noticeTitle', d.title);
        });

        (async () => {
            if (state.hasSystemRole) await getDomainList();
            await getBoardList();
        })();

        return {
            ...toRefs(state),
            handleConfirm,
            handleClickAllDomainRadio,
            handleClickSelectDomainRadio,
            handleSelectDomain,
            noticeTitle,
            writerName,
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
