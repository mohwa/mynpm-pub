
const fs = require('fs');
const path = require('path');

const fse = require('fs-extra');
const _ = require('lodash');
const yaml = require('js-yaml');
const chalk = require('chalk');
const log = require('./lib/log');
const { execSync, spawnSync } = require('child_process');

// 공용 npm registry url
const NPMJS_URL = 'http://registry.npmjs.org';

/**
 * MyNPMPub 클래스
 */
class MyNPMPub{

    constructor({
        config = '',
        packages = [],
        force = false
    } = {}){

        // config.yaml file path
        this.configPath = config;
        // 개별 패키지명
        this.packages = packages;

        // 개별 패키지명 사용 여부
        this.isPackages = !_.isEmpty(this.packages) ? true : false;
        // force 설치 여부
        this.force = force;

        // config.yaml 파일에 정의된 storage path
        this.storage = '';
        // npm registry url
        this.registryUrl = '';
    }
    publish(){

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

        const packageRootPath = _.trim(spawnSync('npm', ['root'], {shell: true, encoding: 'utf8'}).stdout);
        const srcPath = path.join(packageRootPath);
        const destPath = path.join(packageRootPath.replace('node_modules', ''), 'node_modules_bak');

        // 전체 또는 개별 패키지들을 설치한다.
        _packageInstall.call(this, srcPath, destPath);

        const npmList = JSON.parse(spawnSync('npm', ['ls', '--json'], {shell: true, encoding: 'utf8'}).stdout);

        if (!_.size(npmList.dependencies)) log.log('Not exists dependencies.');

        _publish.call(this, _createDependencyList(npmList.dependencies));

        // 백업했던 node_modules 폴더를 복구시킨다.
        if (this.isPackages){

            log.log('Restore the node_modules folder. ...', 'green');

            fse.removeSync(srcPath);
            fse.moveSync(destPath, srcPath);
        }
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
        if (fs.existsSync(packagePath) && this.force) fse.removeSync('-rf', packagePath);

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
 *
 * @param srcPath
 * @param destPath
 * @private
 */
function _packageInstall(srcPath = '', destPath = ''){

    const args = ['i'];

    // 개별 패키지명이 있는 경우
    if (this.isPackages){

        if (!fs.existsSync(srcPath)){
            log.fatal('not exists node_modules path.(run command `npm i`)');
        }

        log.log('Move the node_modules folder. ...', 'yellow');

        fse.moveSync(srcPath, destPath);

        args.push(this.packages.join(' '));
        args.push('--no-save');
    }

    args.push(`--registry ${NPMJS_URL}`);

    console.log(`command: ${chalk.yellow(`npm ${args.join(' ')}`)}`);

    spawnSync('npm', args, {stdio: 'inherit', shell: true});
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