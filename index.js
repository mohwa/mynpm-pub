/**
 * Created by UI/UX Team on 2018. 3. 21..
 */

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const yaml = require('js-yaml');
const process = require('process');
const log = require('./lib/log');

require('shelljs/global');

/**
 * MyNPMPub 클래스
 */
class MyNPMPub{

    constructor({
        config = '',
        force = false
    } = {}){
        this.configPath = config;
        this.storage = '';
        this.npmjsUrl = '';
        this.proxy = '';
        this.force = force;
    }
    start(){

        const configPath = this.configPath;

        if (_.isEmpty(configPath)) log.fatal('not found config property.');
        if (!fs.existsSync(configPath)) log.fatal('not exists config file.');

        let config = yaml.safeLoadAll(fs.readFileSync(configPath, 'utf-8'));

        if (!_.isArray(config)) log.fatal('not import configFile info.');

        config = config[0];

        this.storage = config.storage;

        if (
        _.isEmpty(config.uplinks) ||
        _.isEmpty(config.uplinks.npmjs) ||
        _.isEmpty(config.uplinks.npmjs.url)){
            log.fatal('not found `uplinks.npmjs.url` property.');
        }

        if (
        _.isEmpty(config.uplinks.mynpmpub) ||
        _.isEmpty(config.uplinks.mynpmpub.url)){
            log.fatal('not found `uplinks.mynpmpub.url` property.');
        }

        this.npmjsUrl = config.uplinks.npmjs.url;
        this.proxy = config.uplinks.mynpmpub.url;

        if (this.force && _.isEmpty(this.storage)) log.fatal('not found storage property.');

        const npmList = JSON.parse(exec('npm ls --json', {silent:true}).stdout);

        if (!_.size(npmList.dependencies)) log.log('Not exists dependencies.');

        _publish.call(this, _createDependencyList(npmList.dependencies));
    }
}


/**
 *
 * 현재 디렉토리에 있는 의존성 NPM 패키지들을 모두 가져온다.
 *
 * @param dependencies
 * @param _dependencies
 * @returns {{}}
 * @private
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
 * 공용 NPM 서버에서 가져온 tarball 파일을 사설 NPM 서버에 게시한다.
 *
 * @param dependencies
 * @constructor
 */
function _publish(dependencies = {}){

    _.map(dependencies, (v, k) => {

        const versions = eval(exec(`npm view ${k} versions --registry ${this.npmjsUrl}`, {silent:true}).stdout);
        let resolved = v.resolved || v._resolved;

        const packagePath = path.join(this.storage, k);

        // `storage` 디렉토리의 기존 패키지 폴더를 삭제한다(파일 존재 여부에 상관없이, 무조건 재설치 되도록 강제시킨다)
        if (fs.existsSync(packagePath) && this.force) rm('-rf', packagePath);

        _.forEach(versions, version => {

            if (resolved.indexOf('git') === -1){
                resolved = `${this.npmjsUrl}/${k}/-/${k}-${version}.tgz`;
            }

            const command = `npm publish ${resolved} --registry ${this.proxy}`;

            log.log(command, 'yellow');

            exec(command);
        });
    });
}

module.exports = MyNPMPub;
