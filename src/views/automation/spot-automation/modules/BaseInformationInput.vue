<template>
    <div>
        <p-field-group required
                       :label="$t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.NAME_LABEL')"
                       :invalid="!isNameValid"
                       :invalid-text="$t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.NAME_REQUIRED')"
        >
            <div class="desc">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.NAME_DESC_1') }}
                <br>
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.NAME_DESC_2') }}
            </div>
            <p-text-input v-model="name" class="name-input" :invalid="!isNameValid"
                          block @input="emitChange"
            />
        </p-field-group>

        <p-field-group class="mt-3" :label="$t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.TAG_LABEL')">
            <div class="desc">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.TAG_DESC_1') }}
                <br><br>
                <p class="text-gray-500">
                    {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.TAG_DESC_2') }}
                </p>
                <br>
            </div>
            <tags-input-group :tags.sync="tags"
                              :show-validation="showValidation"
                              :is-valid.sync="isTagsValid"
                              :show-header="tags.length > 0"
                              @update:is-valid="emitChange"
            >
                <template #addButton="{disabled, addPair}">
                    <p-icon-text-button
                        outline style-type="primary" :disabled="disabled"
                        name="ic_plus_bold"
                        class="mb-2"
                        @click="addPair($event)"
                    >
                        {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.TAG_ADD') }}
                    </p-icon-text-button>
                </template>
            </tags-input-group>
        </p-field-group>
    </div>
</template>

<script lang="ts">
import { PFieldGroup, PIconTextButton, PTextInput } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import TagsInputGroup from '@/common/components/tags-input-group/TagsInputGroup.vue';

export default {
    name: 'BaseInformationInput',
    components: {
        PFieldGroup,
        PTextInput,
        PIconTextButton,
        TagsInputGroup,
    },
    props: {
        showValidation: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            name: '',
            tags: [],
            isNameValid: computed(() => (props.showValidation ? !!state.name : true)),
            isTagsValid: true,
            isAllValid: computed(() => state.isNameValid && state.isTagsValid),
        });

        const emitChange = () => {
            emit('change', { name: state.name, tags: state.tags }, state.isAllValid);
        };
        return {
            ...toRefs(state),
            emitChange,
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
.desc {
    font-size: 0.875rem;
    line-height: 1.6;
}
</style>
