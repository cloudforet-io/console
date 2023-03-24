<template>
    <p-button-modal class="survey-modal"
                    header-title="더 나은 서비스 제공을 위해 여러분들의 소중한 의견이 필요합니다."
                    size="md"
                    :fade="true"
                    :backdrop="true"
                    :visible.sync="visible"
                    hide-header-close-button
                    hide-footer-close-button
                    :disabled="!selectedAnswer1 || !selectedAnswer2"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div class="content-wrapper">
                <div class="question-wrapper">
                    <p class="title-text">
                        평소에 [Inventory > Server] 페이지를 어느정도 이용하시나요?
                    </p>
                    <div class="select-card-wrapper">
                        <p-select-card v-for="item in answerItems1"
                                       :key="`answer1-${item.name}`"
                                       v-model="selectedAnswer1"
                                       :image-url="require(`@/assets/images/${item.name === selectedAnswer1 ? item.selectedImage : item.unselectedImage}.svg`)"
                                       icon="ic_webhook"
                                       :value="item.name"
                                       :label="item.label"
                        />
                    </div>
                </div>
                <div class="question-wrapper">
                    <p class="title-text">
                        SpaceONE v.2에 Server 메뉴를 삭제하려 하는데 어떻게 생각하시나요?
                    </p>
                    <div class="select-card-wrapper">
                        <p-select-card v-for="(item, index) in answerItems2"
                                       :key="`answer2-${item.name}`"
                                       v-model="selectedAnswer2"
                                       :tab-index="index"
                                       :image-url="require(`@/assets/images/${item.name === selectedAnswer2 ? item.selectedImage : item.unselectedImage}.svg`)"
                                       icon="ic_webhook"
                                       :value="item.name"
                                       :label="item.label"
                        />
                    </div>
                </div>
            </div>
        </template>
        <template #confirm-button>
            의견 보내기
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs, watch,
} from 'vue';

import { PButtonModal, PSelectCard } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

const SURVEY_KEY = '1.9.6';

export default {
    name: 'SurveyModal',
    components: {
        PButtonModal,
        PSelectCard,
    },
    props: {
    },
    setup() {
        const state = reactive({
            visible: false,
            isSessionExpired: computed(() => store.state.user.isSessionExpired),
            userId: computed(() => store.state.user.userId),
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
            answerItems1: computed(() => [
                {
                    name: 1,
                    label: '많이 사용한다',
                    unselectedImage: 'lovely-jellyocto_in-the-box_grayscale',
                    selectedImage: 'lovely-jellyocto_in-the-box',
                },
                {
                    name: 2,
                    label: '별로 사용하고 있지 않다',
                    unselectedImage: 'octopus_in-the-box_grayscale',
                    selectedImage: 'octopus_in-the-box',
                },
                {
                    name: 3,
                    label: '아예 사용하지 않는다',
                    unselectedImage: 'ghost_in-the-box_grayscale',
                    selectedImage: 'ghost_in-the-box',
                },
            ]),
            answerItems2: computed(() => [
                {
                    name: 1,
                    label: '삭제하면 절대 안된다',
                    unselectedImage: 'devil_in-the-box_grayscale',
                    selectedImage: 'devil_in-the-box',
                },
                {
                    name: 2,
                    label: '그래도 있었으면 좋겠다',
                    unselectedImage: 'octopus_in-the-box_grayscale',
                    selectedImage: 'octopus_in-the-box',
                },
                {
                    name: 3,
                    label: '없어도 전혀 상관없다',
                    unselectedImage: 'ghost_in-the-box_grayscale',
                    selectedImage: 'ghost_in-the-box',
                },
            ]),
            selectedAnswer1: undefined,
            selectedAnswer2: undefined,
        });

        /* API */
        const listSurveyConfig = async () => {
            try {
                const { results } = await SpaceConnector.client.config.userConfig.list({
                    user_id: state.userId,
                    name: `console:survey:${SURVEY_KEY}`,
                });
                state.visible = !results.length;
            } catch (e) {
                state.visible = false;
                ErrorHandler.handleError(e);
            }
        };
        const createSurveyConfig = async () => {
            try {
                await SpaceConnector.client.config.userConfig.create({
                    user_id: state.userId,
                    name: `console:survey:${SURVEY_KEY}`,
                    data: {
                        answer1: state.selectedAnswer1,
                        answer2: state.selectedAnswer2,
                    },
                });
                showSuccessMessage('소중한 의견 감사합니다.', '');
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        /* Event */
        const handleConfirm = async () => {
            await createSurveyConfig();
            state.visible = false;
        };

        watch(() => state.isSessionExpired, async (isSessionExpired) => {
            if (!isSessionExpired && !state.isDomainOwner) {
                await listSurveyConfig();
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            handleConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.survey-modal {
    .content-wrapper {
        .question-wrapper {
            padding-bottom: 1.5rem;
        }
        .title-text {
            font-size: 1rem;
            font-weight: 600;
            line-height: 1.5;
            padding-bottom: 0.75rem;
        }
        .select-card-wrapper {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;

            /* custom design-system component - p-select-card */
            :deep(.p-select-card) {
                height: 9.5rem;
            }
        }
    }
}
</style>
