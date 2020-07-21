interface DefaultItem {
    name: string;
    label?: string;
}

export function makeItem<Item extends DefaultItem = DefaultItem>(
    name: string,
    label?: string,
    extra?: Item,
): Item {
    const item: Item = extra ? { ...extra, name } : { name } as Item;

    if (label) item.label = label;

    return item;
}

type Param<Item> = [string, string, Item|undefined];


export function makeItems<Item extends DefaultItem = DefaultItem>(
    items: Param<Item>[], commonOptions: Item = {} as Item,
): Array<Item> {
    const res: Array<Item> = [];
    items.forEach((item) => {
        const extra = item[2] || {};
        res.push(makeItem(item[0], item[1], { ...commonOptions, ...extra }));
    });
    return res;
}
