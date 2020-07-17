<template>
    <general-page-layout>
        <div class="page-nav">
            <div class="left">
                <p-icon-button name="ic_back" width="2rem" height="2rem" class="mr-2"
                               @click="goBack()"
                />
                <div class="title">
                    Tag
                </div>
            </div>
            <div class="right" />
        </div>
        <p-pane-layout class="w-full px-4 py-8">
            <div v-if="items.length == 0" class="comment">
                <span class="highlight">{{ $t('ACTION.DICT.NO_TAG') }}</span><br>
                {{ $t('ACTION.DICT.CLICK_ADD_BTN_MSG') }}
            </div>
            <div v-else class="comment">
                <span class="highlight">{{ $t('ACTION.DICT.ADD_TAG') }}</span><br>
                {{ $t('ACTION.DICT.HELPMSG') }}
            </div>

            <p-dict-input-group
                :items.sync="items"
                :disabled="loading"
                :invalid-messages="invalidMessages"
                :show-validation="showValidation"
                :show-header="true"
                v-on="dictIGListeners"
            >
                <template #addButton="scope">
                    <p-icon-text-button
                        outline style-type="primary-dark" :disabled="scope.disabled"
                        name="ic_plus_bold"
                        @click="scope.addPair($event)"
                    >
                        {{ $t('BTN.ADD_TAG') }}
                    </p-icon-text-button>
                </template>
            </p-dict-input-group>
        </p-pane-layout>
        <div class="buttons">
            <p-button style-type="gray900" :outline="true" @click="goBack">
                {{ $t('BTN.CANCEL') }}
            </p-button>
            <p-button style-type="primary-dark" @click="onSave">
                {{ $t('BTN.SAVE') }}
            </p-button>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    reactive, toRefs, computed, getCurrentInstance,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/Button.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';

import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import { DictPanelAPI } from '@/lib/api/dict';
import {
    DictItem,
    dictValidation,
    getNewDict,
    toDictItems,
} from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';
import _ from 'lodash';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';

export default {
    name: 'CloudServicePage',
    components: {
        GeneralPageLayout,
        PIconButton,
        PButton,
        PPaneLayout,
        PDictInputGroup,
        PIconTextButton,
    },
    props: {
        resourceId: {
            type: String,
            default: '',
            // required: true,
        },
        nextPath: {
            type: String,
            default: '',
        },
    },
    setup(props, context) {
        const vm = getCurrentInstance();

        const state = reactive({
            showValidation: true,
            loading: false,
            items: [] as unknown as DictItem[],
            parentRouter: computed(() => vm?.$route.matched[vm?.$route.matched.length - 2]),
            resource: computed(() => state.parentRouter?.meta),
        });


        if (!state.resource) {
            console.error(`please add resource fluentAPI to ${state.parentRouter?.name || state.parentRouter?.path} router.meta.api`);
        }
        const goBack = () => {
            if (!vm?.$route.query.nextPath) {
                vm?.$router.push(state.parentRouter?.path as string);
            }
            vm?.$router.push(vm?.$route.query.nextPath as string);
        };

        const tagsApi = new DictPanelAPI(state.resource.api);


        const { invalidMessages, allValidation, itemValidation } = dictValidation(computed(() => state.items as unknown as DictItem[]));
        // const isAllValid = computed(() => _.every(invalidMessages.value, (item: any) => !item.key && !item.value));
        const newDict = computed(() => getNewDict(state.items as unknown as DictItem[], invalidMessages.value));

        const dictIGListeners = {
            'change:value': _.debounce((idx) => { itemValidation(idx, 'value'); }, 100),
            'change:key': _.debounce(() => { allValidation('key', false); }, 100),
            'change:add': (idx) => { itemValidation(idx); },
            'change:delete': () => { allValidation(); },
        };
        const reset = async () => {
            tagsApi.setId(props.resourceId);
            await tagsApi.getData();
            state.items = toDictItems(tagsApi.ts.syncState.dict);
        };
        const onSave = async () => {
            if (!state.showValidation) state.showValidation = true;
            if (!allValidation()) return;
            tagsApi.ts.syncState.dict = newDict.value;
            await tagsApi.updateData();

            goBack();
        };
        reset();

        return {
            ...toRefs(state),
            invalidMessages,
            goBack,
            tagsApi,
            onSave,
            dictIGListeners,

        };
    },
};

</script>

<style lang="postcss" scoped>
    .page-nav{
        @apply flex items-center justify-between mb-6;
        .left{
            @apply flex;
            .title{
                @apply font-bold text-2xl;
                line-height: 120%;
            }
        }

    }
    .comment{
        @apply mb-6;
        line-height: 150%;
        .highlight{
            @apply font-bold;
        }
    }
    .buttons{
        @apply flex mt-8;
        justify-content: flex-end;
        .p-button{
            @apply ml-4;
        }
    }
</style>
