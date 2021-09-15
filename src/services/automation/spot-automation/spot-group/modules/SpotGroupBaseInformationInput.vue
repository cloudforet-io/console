<template>
    <spot-group-add-section :title="$t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.LABEL')">
        <p-field-group required
                       :label="$t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.NAME_LABEL')"
                       :invalid="!isNameValid"
                       :invalid-text="name ? $t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.NAME_DESC_1') : $t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.NAME_REQUIRED')"
        >
            <div class="desc">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.NAME_DESC_1') }}
                <br>
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.NAME_DESC_2') }}
            </div>
            <p-text-input v-model="name" class="name-input" :invalid="!isNameValid"
                          block @input="onChangeName"
            />
        </p-field-group>

        <p-field-group class="tags-field" :label="$t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.TAG_LABEL')"
                       @click-label="onFoldTags"
        >
            <template #label-extra>
                <p-i :name="isTagsFolded ? 'ic_arrow_bottom' : 'ic_arrow_top'" color="inherit" />
            </template>
            <template v-if="!isTagsFolded" #default>
                <div class="desc">
                    {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.TAG_DESC_1') }}
                    <br><br>
                </div>
                <tags-input-group :tags.sync="tags"
                                  :show-validation="showTagsValidation"
                                  :is-valid.sync="isTagsValid"
                                  :show-header="tags.length > 0"
                                  @update:is-valid="emitChange"
                >
                    <template #addButton="{disabled, addPair}">
                        <p-icon-text-button
                            outline style-type="primary-dark" :disabled="disabled"
                            name="ic_plus_bold"
                            class="mb-2"
                            @click="addPair($event)"
                        >
                            {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.TAG_ADD') }}
                        </p-icon-text-button>
                    </template>
                </tags-input-group>
            </template>
        </p-field-group>
    </spot-group-add-section>
</template>

<script lang="ts">
import {
    PFieldGroup, PI, PIconTextButton, PTextInput,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import { makeProxy } from '@spaceone/console-core-lib';
import SpotGroupAddSection from '@/services/automation/spot-automation/spot-group/components/SpotGroupAddSection.vue';
import { spotGroupNameRegex } from '@/services/automation/spot-automation/lib/validations';


export default {
    name: 'SpotGroupBaseInformationInput',
    components: {
        SpotGroupAddSection,
        PFieldGroup,
        PTextInput,
        PIconTextButton,
        TagsInputGroup,
        PI,
    },
    setup(props, { emit }) {
        const state = reactive({
            name: '',
            isTagsFolded: true,
            tags: {},
            showNameValidation: false,
            showTagsValidation: true,
            isNameValid: computed(() => (!state.showNameValidation || spotGroupNameRegex.test(state.name))),
            isTagsValid: true,
            isAllValid: computed(() => state.isNameValid && state.isTagsValid),
        });

        const emitChange = () => {
            emit('change', {
                name: state.name,
                tags: state.tags,
            }, state.isAllValid);
        };

        const onChangeName = () => {
            if (!state.showNameValidation) state.showNameValidation = true;
            emitChange();
        };

        const onFoldTags = () => {
            if (state.isTagsValid) {
                state.isTagsFolded = !state.isTagsFolded;
            }
        };

        return {
            ...toRefs(state),
            emitChange,
            onChangeName,
            onFoldTags,
        };
    },
};
</script>

<style lang="postcss" scoped>
.name-input {
    margin-top: 0.375rem;
    max-width: 30rem;
    width: 100%;
}
.tags-field::v-deep {
    label {
        @media (hover: hover) {
            &:hover {
                @apply text-secondary;
                cursor: pointer;
                .optional-mark {
                    @apply text-secondary;
                }
            }
        }
    }
}
.desc {
    font-size: 0.875rem;
    line-height: 1.6;
}
</style>
