/**
 * Created by UI/UX Team on 2018. 2. 14..
 */

const chalk = require('chalk');
const process = require('process');

/**
 *
 * @type {{log, warn, error, fatal}}
 */
module.exports = {

    /**
     *
     * @param msg
     */
    log(msg = '', color = 'white') {
        console.log(chalk[color](msg));
    },

    /**
     *
     * @param msg
     */
    warn(msg = '') {
        console.log(chalk.yellow(msg));
    },

    /**
     *
     * @param msg
     */
    error(msg = '') {
        console.log(chalk.red(msg));
    },

    /**
     *
     * @param msg
     */
    fatal(msg = ''){
        this.error(msg);
        process.exit(1);
    }
};
