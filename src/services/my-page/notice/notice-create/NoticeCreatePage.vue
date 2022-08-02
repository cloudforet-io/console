<template>
    <div class="notice-create-page">
        <!--        song-lang-->
        <p-page-title title="Create Notice" @go-back="$router.go(-1)" />
        <p-pane-layout class="notice-create-wrapper">
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
                <p-text-input value="" class="" />
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
            <p-field-group class="notice-label-wrapper" label="Title" required>
                <p-text-input :value="noticeTitle" class="" />
            </p-field-group>
            <p-field-group class="notice-label-wrapper" label="Content" required>
                <!--                FIXME:: textInput -> textEditor-->
                <p-text-input value="" class="" />
            </p-field-group>
            <div class="notice-create-options-wrapper">
                <p-check-box>
                    <!--                song-lang-->
                    <span>Pin Notice</span>
                </p-check-box>
                <p-check-box>
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
                @click="handleCreateNotice"
            >
                <!--                song-lang-->
                Confirm
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import {
    PPageTitle, PPaneLayout, PLabel, PFieldGroup, PTextInput, PRadio, PSelectDropdown, PCheckBox, PButton,
} from '@spaceone/design-system';

import { useFormValidator } from '@/common/composables/form-validator';

export default {
    name: 'NoticeCreatePage',
    components: {
        PPageTitle,
        PPaneLayout,
        PLabel,
        PFieldGroup,
        PTextInput,
        PRadio,
        PSelectDropdown,
        PCheckBox,
        PButton,
    },
    setup() {
        const {
            forms: {
                noticeTitle,
            },
            setForm,
            invalidState,
            invalidTexts,
            isAllValid,
        } = useFormValidator({
            noticeTitle: '',
        }, {
            noticeTitle(value: string) { return value.trim().length ? '' : 'Title required'; },
        });

        const state = reactive({});

        const handleCreateNotice = () => console.log(1);

        return {
            ...toRefs(state),
            handleCreateNotice,
            noticeTitle,
            setForm,
            invalidState,
            invalidTexts,
            isAllValid,
        };
    },
};
</script>

<style scoped lang="postcss">
.notice-create-wrapper {
    padding: 26px 10px;
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
