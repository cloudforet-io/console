export const useRoute = () => ({
    path: '',
    hash: '',
    query: {},
    params: {},
    fullPath: '',
    matched: [],
});

export const useRouter = () => ({
    resolve() {
        return {
            resolved: {
                path: '/',
                hash: '#',
                matched: [],
                name: '',
                params: {},
            },
        };
    },
});
