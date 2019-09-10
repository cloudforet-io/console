export default {
    inserted: function(el, binding) {
        console.log('width inserted', binding);
    },
    componentUpdated: function(el, binding) {
        console.log('width componentUpdated', el);
        debugger;
        console.log('width componentUpdated', binding);
    }
};
