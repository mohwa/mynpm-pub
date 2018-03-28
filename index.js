/**
 * Created by UI/UX Team on 2018. 3. 21..
 */

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const yaml = require('js-yaml');
const chalk = require('chalk');
const log = require('./lib/log');
const { execSync, spawnSync } = require('child_process');

require('shelljs/global');

const NPMJS_URL = 'http://registry.npmjs.org';

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
        this.registryUrl = '';
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
        _.isEmpty(config.uplinks.mynpmpub) ||
        _.isEmpty(config.uplinks.mynpmpub.url)){
            log.fatal('not found `uplinks.mynpmpub.url` property.');
        }

        this.registryUrl = config.uplinks.mynpmpub.url;

        if (this.force && _.isEmpty(this.storage)) log.fatal('not found storage property.');

        let command = `npm i --registry ${NPMJS_URL}`;

        console.log(`command: ${chalk.yellow(command)}`);

        execSync(command, {stdio: 'inherit', shell: true});

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

        const version = v.version;

        if (version){

            let _dependencie = _.isArray(_dependencies[k]) ? _dependencies[k] : [];

            if (_dependencie.indexOf(version) === -1){
                _dependencie.push(version);
            }

            _dependencies[k] = _dependencie;
        }
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

        // 버전 리스트
        let versions = v;
        // 패키지명
        let _k = k;

        const packagePath = path.join(this.storage, k);

        // `storage` 디렉토리의 기존 패키지 폴더를 삭제한다(파일 존재 여부에 상관없이, 무조건 재설치 되도록 강제시킨다)
        if (fs.existsSync(packagePath) && this.force) rm('-rf', packagePath);

        _.forEach(versions, v => {

            let resolved = `${NPMJS_URL}/${k}/-/${k}-${v}.tgz`;

            // @scope 패키지일 경우
            if (_isScopePackage(k)) _k = k.split('/')[1];

            const tarballPath = path.join(packagePath, `${_k}-${v}.tgz`);

            // tarball 파일이 존재할 경우...
            if (fs.existsSync(tarballPath)){
                log.log(`Cannot publish over existing version. - ${k}(${v})`, 'gray');
                return;
            }

            const command = `npm publish ${resolved} --registry ${this.registryUrl}`;

            log.log(command, 'yellow');

            execSync(command, {stdio: 'inherit', shell: true});
        });
    });
}

/**
 * @scope 패키지 여부를 반환한다.
 *
 * @param v
 * @returns {boolean}
 * @private
 */
function _isScopePackage(v = ''){
    return /^\@/.test(v);
}

module.exports = MyNPMPub;