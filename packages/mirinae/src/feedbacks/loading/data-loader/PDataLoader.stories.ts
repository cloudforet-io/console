import { reactive, toRefs } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import { range } from 'lodash';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/controls/buttons/button/PButton.vue';
import { getDataLoaderArgs, getDataLoaderArgTypes, getDataLoaderParameters } from '@/feedbacks/loading/data-loader/story-helper';



import PDataLoader from './PDataLoader.vue';

type PDataLoaderPropsAndCustomArgs = ComponentProps<typeof PDataLoader>;

const meta : Meta<PDataLoaderPropsAndCustomArgs> = {
    title: 'Feedbacks/loading/Data Loader',
    component: PDataLoader,
    argTypes: {
        ...getDataLoaderArgTypes(),
    },
    parameters: {
        ...getDataLoaderParameters(),
    },
    args: {
        ...getDataLoaderArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PDataLoader>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PDataLoader },
        template: `
            <p-data-loader v-bind="$props" class="p-3 bg-gray-100 border border-gray-200"  style="height: 300px;">
                <div v-for="(d, i) in data" :key="i" class="mb-3 leading-5">
                    {{d}}
                </div>
            </p-data-loader>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PDataLoader, PButton },
        template: `
            <div class="w-full">
                <p-button class="mb-2" @click="fetchData">Reload Data</p-button>
                <p-data-loader :loading="loading" :data="data"
                    class="p-3 bg-gray-100 border border-gray-200"
                    style="width: 100%; height: 300px;"
                >
                    <div v-for="(d, i) in data" :key="i" class="mb-3 leading-5">
                        {{d}}
                    </div>
                </p-data-loader>
            </div>
        `,
        setup() {
            const state = reactive({
                loading: true,
                data: []as string[],
            });
            const fetchData = async () => {
                state.loading = true;
                state.data = await new Promise<string[]>((resolve) => {
                    setTimeout(() => {
                        resolve(range(15).map(() => faker.lorem.lines()));
                    }, 2000);
                });
                state.loading = false;
            };
            fetchData();
            return {
                ...toRefs(state),
                fetchData,
            };
        },
    }),
};

export const DisableEmptyCase: Story = {
    render: () => ({
        components: { PDataLoader, PButton },
        template: `
            <div class="w-full">
                <p-button class="mb-2" @click="fetchData">{{data.length ? 'Empty Data' : 'Load Data'}}</p-button>
                <p-data-loader :loading="loading" :data="data" disable-empty-case
                    class="p-3 bg-gray-100 border border-gray-200"
                    style="width: 100%; height: 300px;"
                >
                    <div v-for="(d, i) in data" :key="i" class="mb-3 leading-5">
                        {{d}}
                    </div>
                </p-data-loader>
            </div>
        `,
        setup() {
            const state = reactive({
                loading: false,
                data: range(15).map(() => faker.lorem.lines()),
            });
            const fetchData = async () => {
                state.loading = true;
                state.data = await new Promise((resolve) => {
                    setTimeout(() => {
                        if (state.data.length) resolve([]);
                        else resolve(range(15).map(() => faker.lorem.lines()));
                    }, 1000);
                });
                state.loading = false;
            };
            return {
                ...toRefs(state),
                fetchData,
            };
        },
    }),
};

export const ShowDataFromScratch: Story = {
    render: () => ({
        components: { PDataLoader },
        template: `
            <div class="w-full">
                <p class="font-lg font-bold my-4">Initial Loading with normal mode (empty case)</p>
                <p-data-loader :loading="true" :data="[]"
                    class="p-3 bg-gray-100 border border-gray-200"
                    style="width: 100%; height: 300px;"
                >
                </p-data-loader>
                <p class="font-lg font-bold my-4">Initial Loading with <span class="text-secondary">showDataFromScratch</span> mode (empty case)</p>
                <p-data-loader :loading="true" :data="[]" :show-data-from-scratch="true"
                    class="p-3 bg-gray-100 border border-gray-200"
                    style="width: 100%; height: 300px;"
                >
                </p-data-loader>
                <p class="font-lg font-bold my-4">Initial Loading with normal mode</p>
                <p-data-loader :loading="true" :data="data"
                    class="p-3 bg-gray-100 border border-gray-200"
                    style="width: 100%; height: 300px;"
                >
                    <div v-for="(d, i) in data" :key="i" class="mb-3 leading-5">
                        {{d}}
                    </div>
                </p-data-loader>
                <p class="font-lg font-bold my-4">Initial Loading with <span class="text-secondary">showDataFromScratch</span> mode</p>
                <p-data-loader :loading="true" :data="data" :show-data-from-scratch="true"
                    class="p-3 bg-gray-100 border border-gray-200"
                    style="width: 100%; height: 300px;"
                >
                    <div v-for="(d, i) in data" :key="i" class="mb-3 leading-5">
                        {{d}}
                    </div>
                </p-data-loader>
            </div>
        `,
        setup() {
            const state = reactive({
                data: range(15).map(() => faker.lorem.lines()),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const MinLoading: Story = {
    render: () => ({
        components: { PDataLoader, PButton },
        template: `
            <div class="w-full">
                <p-button class="mb-2" @click="fetchData">Reload Data</p-button>
                <p-data-loader :loading="loading" :data="data" :min-loading-time="1000"
                    class="p-3 bg-gray-100 border border-gray-200"
                    style="width: 100%; height: 300px;"
                >
                    <div v-for="(d, i) in data" :key="i" class="mb-3 leading-5">
                        {{d}}
                    </div>
                </p-data-loader>
            </div>
        `,
        setup() {
            const state = reactive({
                loading: true,
                data: [] as string[],
            });
            const fetchData = async () => {
                state.loading = true;
                state.data = await new Promise<string[]>((resolve) => {
                    setTimeout(() => {
                        resolve(range(15).map(() => faker.lorem.lines()));
                    }, 2000);
                });
                state.loading = false;
            };
            fetchData();
            return {
                ...toRefs(state),
                fetchData,
            };
        },
    }),
};

export const LazyLoadingAndMinLoading: Story = {
    render: () => ({
        components: { PDataLoader, PButton },
        template: `
            <div class="w-full">
                <p-button class="mb-2" @click="fetchData">Reload Data (data loading time: 1500)</p-button>
                <div class="grid grid-cols-2">
                    <div class="mx-2">
                        <p class="font-lg font-bold my-4">Lazy Loading(time: 1000)</p>
                        <p-data-loader :loading="loading" :data="data" :lazy-loading-time="1000"
                            class="p-3 bg-gray-100 border border-gray-200"
                            style="width: 100%; height: 100px;"
                        >
                            <div v-for="(d, i) in data" :key="i" class="mb-3 leading-5">
                                {{d}}
                            </div>
                        </p-data-loader>
                    </div>
                    <div class="mx-2">
                        <p class="font-lg font-bold my-4">Lazy Loading(time: 2000)</p>
                        <p-data-loader :loading="loading" :data="data" :lazy-loading-time="2000"
                            class="p-3 bg-gray-100 border border-gray-200"
                            style="width: 100%; height: 100px;"
                        >
                            <div v-for="(d, i) in data" :key="i" class="mb-3 leading-5">
                                {{d}}
                            </div>
                        </p-data-loader>
                    </div>
                    <div class="mx-2">
                        <p class="font-lg font-bold my-4">Lazy Loading(time: 1000) & Min Loading(time: 1000)</p>
                        <p-data-loader :loading="loading" :data="data" :lazy-loading-time="1000" :min-loading-time="1000"
                            class="p-3 bg-gray-100 border border-gray-200"
                            style="width: 100%; height: 100px;"
                        >
                            <div v-for="(d, i) in data" :key="i" class="mb-3 leading-5">
                                {{d}}
                            </div>
                        </p-data-loader>
                    </div>
                    <div class="mx-2">
                        <p class="font-lg font-bold my-4">Lazy Loading(time: 1000) & Min Loading(time: 1500)</p>
                        <p-data-loader :loading="loading" :data="data" :lazy-loading-time="1000" :min-loading-time="1500"
                            class="p-3 bg-gray-100 border border-gray-200"
                            style="width: 100%; height: 100px;"
                        >
                            <div v-for="(d, i) in data" :key="i" class="mb-3 leading-5">
                                {{d}}
                            </div>
                        </p-data-loader>
                    </div>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                loading: true,
                data: [] as string[],
            });
            const fetchData = async () => {
                state.loading = true;
                state.data = await new Promise<string[]>((resolve) => {
                    setTimeout(() => {
                        resolve(range(15).map(() => faker.lorem.lines()));
                    }, 1500);
                });
                state.loading = false;
            };
            fetchData();
            return {
                ...toRefs(state),
                fetchData,
            };
        },
    }),
};

export const LoaderBackdropOpacityAndColor: Story = {
    render: () => ({
        components: { PDataLoader },
        template: `
            <div class="w-full">
                <div class="grid grid-cols-2">
                    <div class="mx-2">
                        <p class="font-lg font-bold my-4">Opacity: 0.6, Color: indianred</p>
                        <p-data-loader :loading="loading" :data="data"
                                        show-data-from-scratch
                                        :loader-backdrop-opacity="0.6"
                                        loader-backdrop-color="indianred"
                                        class="p-3 bg-gray-100 border border-gray-200"
                                        style="width: 100%; height: 100px; background-color: indianred"
                        >
                            <div v-for="(d, i) in data" :key="i" class="mb-3 leading-5">
                                {{d}}
                            </div>
                        </p-data-loader>
                    </div>
                    <div class="mx-2">
                        <p class="font-lg font-bold my-4">Opacity: 0.9, Color: indianred</p>
                        <p-data-loader :loading="loading" :data="data"
                                        show-data-from-scratch
                                        :loader-backdrop-opacity="0.9"
                                        loader-backdrop-color="indianred"
                                        class="p-3 bg-gray-100 border border-gray-200"
                                        style="width: 100%; height: 100px; background-color: indianred"
                        >
                            <div v-for="(d, i) in data" :key="i" class="mb-3 leading-5">
                                {{d}}
                            </div>
                        </p-data-loader>
                    </div>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                loading: true,
                data: range(15).map(() => faker.lorem.lines()),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const DisableTransition: Story = {
    render: () => ({
        components: { PDataLoader, PButton },
        template: `
            <div class="w-full">
                <p-button class="flex-shrink-0 mb-2" @click="fetchData">Refresh</p-button>
                <div class="grid grid-cols-2">
                    <div class="mx-2">
                        <p class="font-lg font-bold my-4">normal</p>
                        <p-data-loader :loading="loading" :data="data"
                                        show-data-from-scratch
                                        :loader-backdrop-opacity="1"
                                        class="p-3 bg-gray-100 border border-gray-200"
                                        style="width: 100%; height: 100px;"
                        >
                            <div v-for="(d, i) in data" :key="i" class="mb-3 leading-5">
                                {{d}}
                            </div>
                        </p-data-loader>
                    </div>
                    <div class="mx-2">
                        <p class="font-lg font-bold my-4">disable transition</p>
                        <p-data-loader :loading="loading" :data="data"
                                        show-data-from-scratch
                                        :loader-backdrop-opacity="1"
                                        disable-transition
                                        class="p-3 bg-gray-100 border border-gray-200"
                                        style="width: 100%; height: 100px;"
                        >
                            <div v-for="(d, i) in data" :key="i" class="mb-3 leading-5">
                                {{d}}
                            </div>
                        </p-data-loader>
                    </div>
                </div>
            </div>
            <!--<div>-->
        `,
        setup() {
            const state = reactive({
                loading: true,
                data: [] as string[],
            });
            const fetchData = async () => {
                state.loading = true;
                state.data = await new Promise<string[]>((resolve) => {
                    setTimeout(() => {
                        resolve(range(15).map(() => faker.lorem.lines()));
                    }, 1000);
                });
                state.loading = false;
            };
            fetchData();
            return {
                ...toRefs(state),
                fetchData,
            };
        },
    }),
};

export const NoData: Story = {
    render: () => ({
        components: { PDataLoader, PButton },
        template: `
            <div class="w-full">
            <p-data-loader :data="false" :loading="false"
                class="p-3 bg-gray-100 border border-gray-200"
                style="width: 100%; height: 300px;"
            >
            </p-data-loader>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
