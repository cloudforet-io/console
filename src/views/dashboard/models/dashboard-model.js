/* eslint-disable */
import casual from '@/lib/casual';

casual.define('serverStates', () => ({
    INSERVICE: casual.integer(0, 1000),
    MAINTENANCE: casual.integer(0, 1000),
    CLOSED: casual.integer(0, 1000),
}));

export default casual;
