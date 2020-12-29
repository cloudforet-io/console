import PGridLayout from '@/molecules/layouts/grid-layout/PGridLayout.vue';

export default {
    title: 'Others/GridLayout',
    component: PGridLayout,
};

export const defaultCase = () => ({
    components: { PGridLayout },
    template: '<div style="width: 100vw"><PGridLayout card-min-width="5rem" card-height="10rem" :items="items" /></div>',
    setup(props, context) {
        return {
            items: ['1', '2', '3', '4', '5'],
        };
    },
});

// column fix 예제 추
export const cardMinMaxCase = () => ({
    components: { PGridLayout },
    template: `<div style="width: 28rem">
        <h1>No card max width</h1>
        <PGridLayout card-min-width="5rem" card-height="5rem" :items="items" />
        <br>
        <br>
        <br>
        <h1>Apply card max width</h1>
        <PGridLayout card-min-width="5rem" card-max-width="8rem" card-height="5rem" :items="items" />
    </div>`,
    setup(props, context) {
        return {
            items: ['1', '2', '3', '4', '5'],
        };
    },
});

export const CustomStyleCase = () => ({
    components: { PGridLayout },
    template: `<div style="width: 80vw">
            <PGridLayout card-min-width="5rem" card-height="10rem" :items="items" :card-style="defaultCardStyle" />
        <h1>Style by index</h1>
        <PGridLayout card-min-width="5rem" card-height="5rem" :items="items" :card-style="indexCardStyle" />
        <br>
        <br>
        <br>
        <h1>Style by contents</h1>
        <PGridLayout card-min-width="5rem" card-height="5rem" :items="items" :card-style="contentsCardStyle" />
    </div>`,
    setup(props, context) {
        return {
            items: [{
                color: 'red',
                data: 'a',
            }, {
                color: 'blue',
                data: 'b',
            }, {
                color: 'orange',
                data: 'c',
            }, {
                color: 'red',
                data: 'a',
            }, {
                color: 'blue',
                data: 'b',
            }, {
                color: 'orange',
                data: 'c',
            }],
            defaultCardStyle(item, index) {
                return {
                    border: '#181b1e 1px',
                    'background-color': 'rgba(10, 10, 10, 0.3)',
                };
            },
            indexCardStyle(item, index) {
                return {
                    'background-color': index % 2 == 0 ? 'rgba(191,1,16,0.4)' : 'rgba(10, 10, 10, 0.3)',
                };
            },
            contentsCardStyle(item, index) {
                return {
                    'background-color': item.color,
                };
            },
        };
    },
});

export const CustomClassCase = () => ({
    components: { PGridLayout },
    template: `<div style="width: 80vw">
        <h1>Default case : () => {'px-4':true, 'text-lg':true}</h1>
            <PGridLayout card-min-width="5rem" card-height="5rem" :items="items" :card-class="defaultCard"/>
        <br>
        <br>
        <br>
        <h1>Default case : () => ['px-4', 'text-lg']</h1>
        <PGridLayout card-min-width="5rem" card-height="5rem" :items="items" :card-class="defaultArrayCard"/>
        <br>
        <br>
        <br>
        <h1>Style by index</h1>
        <PGridLayout card-min-width="5rem" card-height="5rem" :items="items" :card-class="indexCard" />
        <br>
        <br>
        <br>
        <h1>Style by contents</h1>
        <PGridLayout card-min-width="5rem" card-height="5rem" :items="items" :card-class="contentsCard" />
    </div>`,
    setup(props, context) {
        return {
            items: [{
                size: 'xs',
                data: 'a',
            }, {
                size: 'base',
                data: 'b',
            }, {
                size: 'lg',
                data: 'c',
            }, {
                size: 'xl',
                data: 'a',
            }, {
                size: '2xl',
                data: 'b',
            }],
            defaultCard(item, index) {
                return { 'px-4': true, 'text-lg': true };
            },
            defaultArrayCard(item, index) {
                return ['px-4', 'text-lg'];
            },
            indexCard(item, index) {
                return index % 2 === 0 ? ['text-xs'] : ['text-lg'];
            },
            contentsCard(item, index) {
                return [`text-${item.size}`];
            },
        };
    },
});

export const overflowSampleCase = () => ({
    components: { PGridLayout },
    template: `<div style="width: 28rem">
        <PGridLayout card-min-width="5rem" card-height="10rem" :items="items" :card-style="defaultCardStyle" style="overflow-y: scroll; height: 20rem;" />
    </div>`,
    setup(props, context) {
        return {
            items: ['1', '2', '3', '4', '5', '1', '2', '3', '4', '5'],
        };
    },
});
