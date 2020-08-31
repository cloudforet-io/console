<template>
    <general-page-layout>
        <div class="page-navigation">
            <p-page-navigation :routes="route" />
        </div>
        <p-page-title
            class="mb-6"
            title="Add Service Account"
            child
            @goBack="goBack"
        >
            <template #before-title>
                <div class="inline-block ml-2 mr-2 -mt-1">
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
        </p-page-title>
        <p-collapsible-panel>
            <template #content>
                <div class="p-4">
                    <s-dynamic-layout v-bind="description" :vbind="{showTitle:false}" />
                </div>
            </template>
        </p-collapsible-panel>
        <p-pane-layout class="panel">
            <div class="title">
                Base Information
            </div>
            <div class="form-box">
                <p-json-schema-form v-bind="actFixFormTS.state" :item.sync="actFixFormTS.syncState.item" />
                <p-json-schema-form v-bind="actJscTS.state" :item.sync="actJscTS.syncState.item" />
            </div>
            <div class="tag-title">
                {{ $t('PANEL.TAG') }}
            </div>
            <div class="tag-help-msg">
                <i18n path="ACTION.DICT.ADD_TAG_BY">
                    <template #name>
                        <span v-if="actFixFormTS.syncState.item.name" class="font-bold">[{{ actFixFormTS.syncState.item.name }}]</span>
                        <span v-else> Account</span>
                    </template>
                </i18n>
                <br>
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
                <p-json-schema-form v-bind="crdFixFormTS.state" :item.sync="crdFixFormTS.syncState.item" />
            </div>

            <p-field-group
                label="Secret Type"
                required
            >
                <div class="flex">
                    <span v-for="(name, idx) in schemaNames" :key="idx" class="secret-type-name">
                        <p-radio
                            v-model="selectSchema"
                            :value="name"
                        />
                        {{ name }}
                    </span>
                </div>
            </p-field-group>
            <div class="custom-schema-box">
                <div class="form-box">
                    <p-json-schema-form v-bind="crdFormTS.state" :item.sync="crdFormTS.syncState.item" />
                </div>
            </div>
        </p-pane-layout>
        <s-project-tree-panel ref="projectRef" class="panel"
                              :resource-name="$t('WORD.SERVICE_ACCOUNT')"
                              :target-name="actFixFormTS.syncState.item.name"
        />
        <div class="bottom">
            <p-button class="item" style-type="primary-dark" size="lg"
                      @click="confirm"
            >
                {{ $t('BTN.SAVE') }}
            </p-button>
            <p-button class="item" style-type="outline gray900" size="lg"
                      @click="goBack"
            >
                {{ $t('BTN.CANCEL') }}
            </p-button>
        </div>
    </general-page-layout>
</template>
<script lang="ts">

import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup.vue';
import { DictIGToolSet } from '@/components/organisms/forms/dict-input-group/PDictInputGroup.toolset';
import {
    CustomKeywords,
    JsonSchemaFormToolSet,
    CustomValidator,
} from '@/components/organisms/forms/json-schema-form/toolset';
import PJsonSchemaForm from '@/components/organisms/forms/json-schema-form/PJsonSchemaForm.vue';
import { JsonSchemaObjectType } from '@/lib/type';
import { fluentApi } from '@/lib/fluent-api';
import {
    ComponentRenderProxy,
    computed,
    getCurrentInstance, onMounted, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import { AxiosResponse } from 'axios';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';
import SProjectTreePanel from '@/views/identity/service-account/modules/ProjectTreePanel.vue';
import { useStore } from '@/store/toolset';
import PI from '@/components/atoms/icons/PI.vue';
import { get } from 'lodash';
import SDynamicLayout from '@/views/common/dynamic-layout/SDynamicLayout.vue';
import { showErrorMessage } from '@/lib/util';
import PCollapsiblePanel from '@/components/molecules/collapsible/collapsible-panel/PCollapsiblePanel.vue';

const accountFormSetup = (props) => {
    const actFixFormTS = new JsonSchemaFormToolSet();
    const schema = new JsonSchemaObjectType();
    schema.addStringProperty('name', 'Name', true, 'Cloud Account Name');

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
    const description = ref<string|undefined>(undefined);
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
        sch.addStringProperty('name', 'Name', true, 'Credentials Name', { uniqueName: true });
        return sch;
    };
    watch(schemaNames, (after, before) => {
        if (after !== before) {
            const sch = makeFixSchema();
            crdFixFormTS.setProperty(sch, ['name'], validation);
            selectSchema.value = schemaNames.value[0];
        }
    }, { immediate: true });


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
    }, { immediate: true });
    onMounted(async () => {
        const descriptionPath = 'metadata.view.layouts.help:service_account:create';
        const resp = await fluentApi.identity().provider().get().setId(props.provider)
            .setOnly('template.service_account.schema', 'capability.supported_schema', descriptionPath)
            .execute();
        crdState.formSchema = resp.data.template.service_account.schema;
        schemaNames.value = resp.data.capability.supported_schema;
        // eslint-disable-next-line camelcase
        description.value = get(resp.data, descriptionPath);
    });
    return {
        crdFormTS,
        crdFixFormTS,
        selectSchema,
        schemaNames,
        description,
    };
};

export default {
    name: 'SSecretCreateFormModal',
    components: {
        PCollapsiblePanel,
        PPageTitle,
        PPageNavigation,
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
        SDynamicLayout,
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
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const {
            actFixFormTS,
            actJscTS,
        } = accountFormSetup(props);
        const {
            crdFormTS,
            crdFixFormTS,
            selectSchema,
            schemaNames,
            description,
        } = credentialsFormSetup(props);

        const routeState = reactive({
            route: [{ name: 'Identity', path: '/identity' }, { name: 'Service Account', path: '/identity/service-account' },
                { name: 'Add Account', path: `/identity/service-account/add/${props.provider}` }],
        });

        const goBack = () => {
            const nextPath = vm?.$route.query.nextPath as string|undefined;
            if (nextPath) {
                vm.$router.push(nextPath);
            } else {
                vm.$router.back();
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
                && !projectRef.value.error
            ) {
                const item: any = {
                    name: actFixFormTS.syncState.item.name,
                    provider: props.provider,
                    data: actJscTS.syncState.item,
                    tags: tagsTS.vdState.newDict,
                };
                if (projectRef.value.selectNode) {
                    // eslint-disable-next-line camelcase
                    item.project_id = projectRef.value.selectNode.node.data.id;
                }
                await fluentApi.identity().serviceAccount().create().setParameter(item)
                    .execute()
                    .then(async (resp) => {
                        await fluentApi.secret().secret().create().setParameter({
                            name: crdFixFormTS.syncState.item.name,
                            data: crdFormTS.syncState.item,
                            schema: selectSchema.value,
                            // eslint-disable-next-line camelcase
                            secret_type: 'CREDENTIALS',
                            // eslint-disable-next-line camelcase
                            service_account_id: resp.data.service_account_id,
                        })
                            .execute()
                            .then(() => {
                                context.root.$notify({
                                    group: 'noticeTopRight',
                                    type: 'success',
                                    title: 'Add Success',
                                    text: 'Service Account has been successfully registered.',
                                    duration: 2000,
                                    speed: 1000,
                                });
                                goBack();
                            })
                            .catch(async (errorResp) => {
                                console.error(errorResp);
                                await deleteAccount(resp.data.service_account_id);
                                showErrorMessage('Fail to Add Account', errorResp, context.root);
                            });
                    })
                    .catch((eResp) => {
                        console.error(eResp);
                        showErrorMessage('Request Fail', eResp, context.root);
                    });
            }
        };

        return {
            ...toRefs(routeState),
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
            description,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .panel {
        @apply w-full px-4 py-8 mb-4;
        &:nth-last-child(1) {
            @apply mb-0;
        }
    }
    .bottom {
        @apply flex flex-row-reverse;
        margin-top: 1rem;
        .item {
            margin-left: 1rem;
        }
    }
    .title {
        @apply text-2xl mb-8;
        line-height: 120%;
    }
    .tag-title {
        @apply text-sm font-bold mb-2 mt-8;
        line-height: 120%;
    }
    .tag-help-msg {
        @apply text-sm mb-6;
        line-height: 150%;
    }
    .form-box {
        @apply w-full;

        @screen lg {
            @apply max-w-1/2;
        }
    }
    .secret-type-name {
        margin-right: 4.375rem;
    }
    .custom-schema-box {
        @apply border rounded-sm border-gray-200 border-l-4 px-8 py-5;
    }
</style>
