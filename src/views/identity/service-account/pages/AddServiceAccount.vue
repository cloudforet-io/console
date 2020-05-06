<template>
    <general-page-layout>
        <PPageTitle

            class="mb-6 mt-2"
            title="Add Service Account"
            child
            @goBack="goBack"
        >
            <template #before-title>
                <div class="inline-block ml-2 mr-4">
                    <img v-if="providerIcon"
                         width="32px" height="32px"
                         :src="providerIcon"
                         :alt="provider"
                    >
                    <p-i v-else name="ic_provider_other"
                         width="32px"
                         height="32px"
                    />
                </div>
            </template>
        </PPageTitle>
        <p-pane-layout class="panel">
            <div class="title">
                Base Information
            </div>
            <div class="form-box">
                <PJsonSchemaForm v-bind="actFixFormTS.state" :item.sync="actFixFormTS.syncState.item" />
                <PJsonSchemaForm v-bind="actJscTS.state" :item.sync="actJscTS.syncState.item" />
            </div>
            <div class="text-lg font-bold my-2" style="line-height: 120%;">
                {{ $t('PANEL.TAG') }}
            </div>
            <div class="text-sm mb-4" style="line-height: 150%;">
                <span class="font-bold">[{{ actFixFormTS.syncState.item.name }}]</span> 과 관련된 태그를 추가합니다. <br>
                {{ $t('ACTION.DICT.HELPMSG') }}
            </div>

            <p-dict-input-group
                v-bind="tagsTS.state"
                :items.sync="tagsTS.syncState.items"
                :show-header="true"
                v-on="tagsTS.events"
            >
                <template #addButton="scope">
                    <p-icon-text-button
                        outline style-type="primary" :disabled="scope.disabled"
                        name="ic_plus_bold"
                        @click="scope.addPair($event)"
                    >
                        {{ $t('BTN.ADD_TAG') }}
                    </p-icon-text-button>
                </template>
            </p-dict-input-group>
        </p-pane-layout>
        <p-pane-layout class="panel">
            <div class="title">
                Credentials
            </div>
            <div class="form-box">
                <PJsonSchemaForm v-bind="crdFixFormTS.state" :item.sync="crdFixFormTS.syncState.item" />
            </div>

            <PFieldGroup
                label="Secret Type"
                required
            >
                <div class="flex">
                    <div v-for="(name, idx) in schemaNames" :key="idx" class="mr-12">
                        <p-radio
                            v-model="selectSchema"
                            :value="name"
                        />
                        {{ name }}
                    </div>
                </div>
            </PFieldGroup>
            <div class="form-box">
                <PJsonSchemaForm v-bind="crdFormTS.state" :item.sync="crdFormTS.syncState.item" />
            </div>
        </p-pane-layout>
        <SProjectTreePanel ref="projectRef" class="panel">
            <template #top>
                <div class="mb-6">
                    <span class="title">Project</span><span>  (optional)</span>
                </div>
            </template>
        </SProjectTreePanel>

        <div class="bottom">
            <p-button class="item" style-type="primary" @click="confirm">
                {{ $t('BTN.SAVE') }}
            </p-button>
            <p-button class="item" outline style-type="primary-dark"
                      @click="goBack"
            >
                {{ $t('BTN.CANCEL') }}
            </p-button>
        </div>
    </general-page-layout>
</template>
<script lang="ts">

import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup.vue';
import { DictIGToolSet } from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';
import {
    CustomKeywords,
    JsonSchemaFormToolSet,
    CustomValidator,
} from '@/components/organisms/forms/json-schema-form/toolset';
import PJsonSchemaForm from '@/components/organisms/forms/json-schema-form/JsonSchemaForm.vue';
import { JsonSchemaObjectType } from '@/lib/type';
import { fluentApi } from '@/lib/fluent-api';
import {
    computed,
    getCurrentInstance, onMounted, reactive, ref, watch,
} from '@vue/composition-api';
import { AxiosResponse } from 'axios';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PPageTitle from '@/components/organisms/title/page-title/PageTitle.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import PRadio from '@/components/molecules/forms/radio/Radio.vue';
import SProjectTreePanel from '@/components/organisms/panels/project-tree-panel/SProjectTreePanel.vue';
import { useStore } from '@/store/toolset';
import PI from '@/components/atoms/icons/PI.vue';

const accountFormSetup = (props) => {
    const actFixFormTS = new JsonSchemaFormToolSet();
    const schema = new JsonSchemaObjectType();
    schema.addStringProperty('name', 'Name', true);

    actFixFormTS.setProperty(schema, ['name']);

    const actJscTS = new JsonSchemaFormToolSet();
    onMounted(async () => {
        const resp = await fluentApi.identity().provider().get().setId(props.provider)
            .setOnly('template.service_account.schema')
            .execute();
        actJscTS.setProperty(resp.data.template.service_account.schema as JsonSchemaObjectType);
    });
    return {
        actFixFormTS,
        actJscTS,
    };
};

const credentialsFormSetup = (props) => {
    const crdFixFormTS = new JsonSchemaFormToolSet();
    const schemaNames = ref<string[]>([]);
    const selectSchema = ref<string>('');
    const crdState = reactive({
        formSchema: {},
    });

    const checkNameUnique = (...args: any[]) => fluentApi.secret().secret().list()
        .setFilter({ key: 'name', operator: '=', value: args[1] })
        .setCountOnly()
        .execute()
        .then(resp => resp.data.total_count === 0);

    const validation: CustomKeywords = {
        uniqueName: new CustomValidator(checkNameUnique, 'name is duplicated'),
    };

    const makeFixSchema = () => {
        const sch = new JsonSchemaObjectType(undefined, undefined, true);
        sch.addStringProperty('name', 'Name', true, undefined, { uniqueName: true });
        return sch;
    };
    watch(schemaNames, (after, before) => {
        if (after !== before) {
            const sch = makeFixSchema();
            crdFixFormTS.setProperty(sch, ['name'], validation);
            selectSchema.value = schemaNames.value[0];
        }
    });


    const crdFormTS = new JsonSchemaFormToolSet();
    const getSchema = async (name) => {
        if (name) {
            const resp: AxiosResponse<any> = await fluentApi.repository().schema().getByName().setId(name)
                .execute();
            crdFormTS.setProperty(resp.data.schema);
        }
    };

    watch(selectSchema, async (after, before) => {
        if (after && after !== before) {
            await getSchema(after);
        }
    });
    onMounted(async () => {
        const resp = await fluentApi.identity().provider().get().setId(props.provider)
            .setOnly('template.service_account.schema', 'capability.supported_schema')
            .execute();
        crdState.formSchema = resp.data.template.service_account.schema;
        schemaNames.value = resp.data.capability.supported_schema;
    });
    return {
        crdFormTS,
        crdFixFormTS,
        selectSchema,
        schemaNames,
    };
};

export default {
    name: 'SSecretCreateFormModal',
    components: {
        PPageTitle,
        PFieldGroup,
        PDictInputGroup,
        PJsonSchemaForm,
        PPaneLayout,
        GeneralPageLayout,
        PIconTextButton,
        PButton,
        PRadio,
        SProjectTreePanel,
        PI,
    },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        provider: {
            type: String,
            default: null,
        },
    },
    setup(props, context) {
        const { provider } = useStore();
        provider.getProvider();
        const tagsTS = new DictIGToolSet({
            showValidation: true,
        });
        const providerIcon = computed(() => provider.state.providers[props.provider]?.icon);
        const vm = getCurrentInstance();
        const {
            actFixFormTS,
            actJscTS,
        } = accountFormSetup(props);
        const {
            crdFormTS,
            crdFixFormTS,
            selectSchema,
            schemaNames,
        } = credentialsFormSetup(props);

        const goBack = () => {
            const nextPath = vm?.$route.query.nextPath as string|undefined;
            if (nextPath) {
                vm?.$router.push(nextPath);
            } else {
                vm?.$router.back();
            }
        };

        const deleteAccount = async (accountId: string) => {
            await fluentApi.identity().serviceAccount().delete().setId(accountId)
                .execute();
        };
        const projectRef = ref<any>(null);
        const confirm = async () => {
            const actFixFormValid = await actFixFormTS.formState.validator();
            const actJscFormValid = await actJscTS.formState.validator();

            const crdFixFormValid = await crdFixFormTS.formState.validator();
            const crdJscFormValid = await crdFormTS.formState.validator();
            if (tagsTS.allValidation()
                && actFixFormValid && actJscFormValid
                && crdFixFormValid && crdJscFormValid
                && (projectRef.value.release || (!projectRef.value.release && !projectRef.value.error))
            ) {
                const item: any = {
                    name: actFixFormTS.syncState.item.name,
                    provider: props.provider,
                    data: actJscTS.syncState.item,
                    tags: tagsTS.vdState.newDict,
                };
                if (!projectRef.value.release && projectRef.value.selectNode) {
                    // eslint-disable-next-line camelcase
                    item.project_id = projectRef.value.selectNode.data.id;
                }
                await fluentApi.identity().serviceAccount().create().setParameter(item)
                    .execute()
                    .then(async (resp) => {
                        await fluentApi.secret().secret().create().setParameter({
                            name: crdFixFormTS.syncState.item.name,
                            data: crdFormTS.syncState.item,
                            // eslint-disable-next-line camelcase
                            secret_type: 'CREDENTIALS',
                            // eslint-disable-next-line camelcase
                            service_account_id: resp.data.service_account_id,
                        })
                            .execute()
                            .then(() => {
                                context.root.$notify({
                                    group: 'noticeBottomRight',
                                    type: 'success',
                                    title: 'Add Success',
                                    duration: 2000,
                                    speed: 1000,
                                });
                                goBack();
                            })
                            .catch(async (errorResp) => {
                                console.debug(errorResp);
                                await deleteAccount(resp.data.service_account_id);
                                vm?.$notify({
                                    group: 'noticeBottomRight',
                                    type: 'alert',
                                    title: 'Add Fail',
                                    duration: 2000,
                                    speed: 1000,
                                });
                            });
                    })
                    .catch((eResp) => {
                        console.debug(eResp);
                        vm?.$notify({
                            group: 'noticeBottomRight',
                            type: 'alert',
                            title: 'Add Fail',
                            duration: 2000,
                            speed: 1000,
                        });
                    });
            }
        };

        return {
            tagsTS,
            crdFormTS,
            crdFixFormTS,
            confirm,
            goBack,
            selectSchema,
            schemaNames,
            actFixFormTS,
            actJscTS,
            providerIcon,
            projectRef,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .panel{
        @apply w-full px-4 py-8 mb-4;
        &:nth-last-child(1){
            @apply mb-0;

        }
    }
    .bottom{
        @apply flex flex-row-reverse mt-8;
        .item{
            @apply mr-8;
        }
    }
    .title{
        @apply text-2xl mb-8;
        line-height: 120%;
    }
    .form-box{
        @apply max-w-145;
    }
</style>
