/**
 * Created by UI/UX Team on 2018. 3. 21..
 */

const fs = require('fs');
const _ = require('lodash');
const yaml2json = require('yaml-to-json');

require('shelljs/global');

//const publicUri = 'http://registry.npmjs.org';
//const privateUri = 'http://192.168.43.197:4873';

//rm('-rf', '/Users/sgjeon/.local/share/verdaccio/storage/*');


class NPNS{

    constructor({
        configPath = ''
    } = {}){
        this.configPath = configPath;
    }
    start(){

        const configPath = this.configPath;

        if (_.isEmpty(configPath)) throw new Error('');
        if (!fs.existsSync(configPath)) throw new Error('');

        //const config = require(configFilePath);
        const config = yaml2json(require(configPath));

        console.log(config);


        //const npmList = JSON.parse(exec('npm ls --json', {silent:true}).stdout);
        //
        //_publish(_createDependencyList(npmList.dependencies));
    }
}


/**
 *
 * @param dependencies
 * @returns {{}}
 */
function _createDependencyList(dependencies = {}, _dependencies = {}){

    _dependencies = _dependencies || {};

    _.map(dependencies, (v, k) => {

        if (v.dependencies){
            _createDependencyList(v.dependencies, _dependencies);
        }

        if (v.resolved || v._resolved) _dependencies[k] = v;
    });

    return _dependencies;
}

/**
 *
 * @param dependencies
 * @constructor
 */
function _publish(dependencies = {}){

    _.map(dependencies, (v, k) => {

        const versions = eval(exec(`npm view ${k} versions --registry ${publicUri}`, {silent:true}).stdout);
        let resolved = v.resolved || v._resolved;

        _.forEach(versions, version => {

            if (resolved.indexOf('git') === -1){
                resolved = `${publicUri}/${k}/-/${k}-${version}.tgz`;
            }

            const command = `npm publish ${resolved} --registry ${privateUri}`;

            console.log(command);

            exec(command);
        });
    });
}

module.exports = NPNS;