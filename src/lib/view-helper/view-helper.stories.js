import { defaultsDeep, join } from 'lodash';
import { makeTrItems } from '@/lib/view-helper/index';

export default {
    title: 'functions/helper/makeTrItems',
    parameters: {
        info: {
            summary: '',
        },
    },
};

const makeMockItem = (parent, commonOption, name, trLabel, extra) => {
    let item = extra ? { ...extra, name } : { name };
    if (commonOption) {
        item = defaultsDeep(item, commonOption);
    }
    if (trLabel) {
        const label = (typeof trLabel === 'string') ? [trLabel, 'null'] : trLabel;
        item.label = `parent.$t(${join(label)}, parent)`;
    }
    return item;
};

const makeMockTrItems = (items, parent, commonOption) => {
    const result = [];
    items.forEach((item) => {
        result.push(makeMockItem(parent, commonOption, ...item));
    });
    return result;
};

export const base = () => ({
    template: `
<div>
<table>
<thead>
<tr><th>init data</th><th>  =>  </th><th>transform</th><th>  =>  </th><th>result</th></tr>
</thead>
<tbody>
<tr>
<td><pre>
const data =  makeTrItems(
    {{items}},
    parent,
);
</pre></td>
<td>  =>  </td><td><pre>{{transforms}} </pre></td><td>  =>  </td>
<td><pre >
{{result}}
</pre></td>
</tr>
</tbody>
</table>
</div>
`,
    setup(_, { parent }) {
        const items = [
            ['vm_id', 'COMMON.ID'],
            ['vm_name', 'COMMON.NAME'],
            ['platform_type', 'COMMON.PLATFORM'],
            ['image', 'COMMON.IMAGE'],
        ];
        const args = [items, parent];

        return {
            items,
            transforms: JSON.stringify(makeMockTrItems(...args), undefined, 2),
            result: JSON.stringify(makeTrItems(...args), undefined, 2),
        };
    },
});

export const commonOption = () => ({
    template: `
<div>
<table>
<thead>
<tr><th>init data</th><th>  =>  </th><th>transform</th><th>  =>  </th><th>result</th></tr>
</thead>
<tbody>
<tr>
<td><pre>
const data =  makeTrItems(
    {{items}},
    parent,
    {{commonOptions}},
);
</pre></td>
<td>  =>  </td><td><pre>{{transforms}} </pre></td><td>  =>  </td>
<td><pre>
{{result}}
</pre></td>
</tr>
</tbody>
</table>
</div>
`,
    setup(_, { parent }) {
        const items = [
            ['vm_id', 'COMMON.ID'],
            ['vm_name', 'COMMON.NAME'],
            ['platform_type', 'COMMON.PLATFORM'],
            ['image', 'COMMON.IMAGE'],
        ];
        const commonOptions = {
            copyFlay: true,
        };
        const args = [items, parent, commonOptions];
        return {
            items,
            commonOptions: JSON.stringify(commonOptions, undefined, 2),
            transforms: JSON.stringify(makeMockTrItems(...args), undefined, 2),
            result: JSON.stringify(makeTrItems(...args), undefined, 2),
        };
    },
});

export const commonOption2 = () => ({
    template: `
<div>
<table>
<thead>
<tr><th>init data</th><th>  =>  </th><th>transform</th><th>  =>  </th><th>result</th></tr>
</thead>
<tbody>
<tr>
<td><pre>
const data =  makeTrItems(
    {{items}},
    parent,
    {{commonOptions}},
);
</pre></td>
<td>  =>  </td><td><pre>{{transforms}} </pre></td><td>  =>  </td>
<td><pre>
{{result}}
</pre></td>
</tr>
</tbody>
</table>
</div>
`,
    setup(_, { parent }) {
        const items = [
            ['vm_id', 'COMMON.ID'],
            ['vm_name', 'COMMON.NAME'],
            ['platform_type', 'COMMON.PLATFORM'],
            ['image', 'COMMON.IMAGE'],
        ];
        const commonOptions = {
            copyFlay: true,
            vbind: {
                class: { btn: true },
            },
        };
        const args = [items, parent, commonOptions];
        return {
            items,
            commonOptions: JSON.stringify(commonOptions, undefined, 2),
            transforms: JSON.stringify(makeMockTrItems(...args), undefined, 2),
            result: JSON.stringify(makeTrItems(...args), undefined, 2),
        };
    },
});


export const overWirteCommonOptions = () => ({
    template: `
<div>
<table>
<thead>
<tr><th>init data</th><th>  =>  </th><th>transform</th><th>  =>  </th><th>result</th></tr>
</thead>
<tbody>
<tr>
<td><pre>
const data =  makeTrItems(
    {{items}},
    parent,
    {{commonOptions}},
);
</pre></td>
<td>  =>  </td><td><pre>{{transforms}} </pre></td><td>  =>  </td>
<td><pre>
{{result}}
</pre></td>
</tr>
</tbody>
</table>
</div>
`,
    setup(_, { parent }) {
        const items = [
            ['vm_id', 'COMMON.ID'],
            ['vm_name', 'COMMON.NAME', { copyFlag: false }],
            ['platform_type', 'COMMON.PLATFORM', { vbind: { class: { btn_dark: true,btn:false } } }],
            ['image', 'COMMON.IMAGE'],
        ];
        const commonOptions = {
            copyFlay: true,
            vbind: {
                class: { btn: true },
            },
        };
        const args = [items, parent, commonOptions];
        return {
            items,
            commonOptions: JSON.stringify(commonOptions, undefined, 2),
            transforms: JSON.stringify(makeMockTrItems(...args), undefined, 2),
            result: JSON.stringify(makeTrItems(...args), undefined, 2),
        };
    },
});
