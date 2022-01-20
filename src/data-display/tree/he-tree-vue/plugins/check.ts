import * as ut from '../utils';

export default {
    props: {},
    methods: {
        afterCheckChanged(node, path) {
            // update parent
            // @ts-ignore
            const nodes = this.getAllNodesByPath(path);
            const reversedParents = nodes.slice(0, nodes.length - 1);
            reversedParents.reverse();
            // eslint-disable-next-line no-restricted-syntax
            for (const parent of reversedParents) {
                // @ts-ignore
                this.$set(parent, '$checked', parent.children.every(child => child.$checked));
            }
            // update children
            if (node.children && node.children.length > 0) {
                // @ts-ignore
                ut.walkTreeData(node.children, (childNode) => {
                    // @ts-ignore
                    this.$set(childNode, '$checked', node.$checked);
                });
            }
        },
        check(node, path) {
            // @ts-ignore
            this.$set(node, '$checked', true);
            this.afterCheckChanged(node, path);
        },
        uncheck(node, path) {
            // @ts-ignore
            this.$set(node, '$checked', false);
            this.afterCheckChanged(node, path);
        },
        toggleCheck(node, path) {
            // @ts-ignore
            this.$set(node, '$checked', !node.$checked);
            this.afterCheckChanged(node, path);
        },
    },
};
