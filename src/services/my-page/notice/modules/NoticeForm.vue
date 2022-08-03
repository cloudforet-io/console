<template>
    <div class="notice-form">
        <p-pane-layout class="notice-form-wrapper">
            <p-field-group class="notice-label-wrapper">
                <!--            song-lang-->
                <p-label>Author</p-label>
                <p class="text-sm text-gray-900">
                    <!--            FIXME:: apply js-->
                    시스템 운영자
                </p>
            </p-field-group>
            <!--                song-lang-->
            <p-field-group class="notice-label-wrapper" label="Writer Name" required>
                <p-text-input v-model="writerNameState" class="" />
            </p-field-group>
            <!--                song-lang-->
            <p-field-group class="notice-label-wrapper" label="Viewer" required>
                <p-radio class="mr-4">
                    <!--                    song-lang-->
                    <span>All Domains</span>
                </p-radio>
                <p-radio>
                    <!--                    song-lang-->
                    <span>Selected Domains</span>
                </p-radio>
                <br>
                <p-select-dropdown class="mt-2 w-1/2" />
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
                <!--                FIXME:: textInput -> textEditor-->
                <p-text-input v-model="contentState" class="" />
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
    reactive, toRefs,
} from '@vue/composition-api';

import {
    PPaneLayout, PLabel, PFieldGroup, PTextInput, PRadio, PSelectDropdown, PCheckBox, PButton,
} from '@spaceone/design-system';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';


type noticeFormType = 'CREATE' | 'EDIT';

export default {
    name: 'NoticeForm',
    components: {
        PPaneLayout,
        PLabel,
        PFieldGroup,
        PTextInput,
        PRadio,
        PSelectDropdown,
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
        viewer: {
            default: () => ([]),
            type: Array,
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
            noticeTitleState(value: string) { return value.trim().length ? '' : 'Title required'; },
        });

        const state = reactive({
            writerNameState: props.writerName || '',
            viewerState: props.viewer || [],
            isPinState: props.isPin || false,
            isPopupState: props.isPopup || false,
            contentState: props.content || '',
        });

        const handleConfirm = () => {
            if (props.type === 'CREATE') handleCreateNotice();
            if (props.type === 'EDIT') handleEditNotice();
        };

        const handleCreateNotice = async () => {
            try {
                await console.log('create', state.writerNameState, noticeTitleState.value, state.isPinState, state.isPopupState);
            } catch (e) {
                ErrorHandler.handleRequestError(e, 'Failed to create notice');
            }
        };
        const handleEditNotice = async () => {
            try {
                await console.log('edit', state.writerNameState, noticeTitleState.value, state.isPinState, state.isPopupState);
            } catch (e) {
                ErrorHandler.handleRequestError(e, 'Failed to edit notice');
            }
        };

        return {
            ...toRefs(state),
            handleConfirm,
            noticeTitleState,
            setForm,
            invalidState,
            invalidTexts,
            isAllValid,
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
