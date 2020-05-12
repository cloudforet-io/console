export default {
    mockup: [
        { title: 'sampleLeaf1', isLeaf: true },
        { title: 'sampleLeaf2', isLeaf: true, data: { visible: false } },
        { title: 'sampleNode1' },
        {
            title: 'sampleNode2',
            isExpanded: true,
            children: [
                { title: 'sampleLeaf3', isLeaf: true },
                { title: 'sampleLeaf4', isLeaf: true },
                {
                    title: 'sampleNode5',
                    children: [
                        { title: 'sampleLeaf5', isLeaf: true },
                    ],
                },
            ],
        },
        { title: 'sampleNode6', isExpanded: false },
        { title: 'sampleLeaf6', isLeaf: true },
        { title: 'sampleLeaf7', isLeaf: true, data: { visible: false } },
        {
            title: 'sampleNode7',
            children: [
                {
                    title: 'sampleNode8',
                    children: [
                        { title: 'sampleLeaf8', isLeaf: true },
                        { title: 'sampleLeaf9', isLeaf: true },
                    ],
                },
            ],
        },
    ],
};
