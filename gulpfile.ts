import { src, dest, series } from 'gulp';
import through2 from 'through2';
import { spawn } from 'child_process';
import * as File from 'vinyl';
import solc from '@frugal-wizard/solidity-compiler-wrapper';
import log from 'fancy-log';
import { abi2ts } from './src/abi2ts';
import rimraf from 'rimraf';
import { promisify } from 'util';

const promisifiedRimraf = promisify(rimraf);

export async function clean() {
    await promisifiedRimraf('dist/**');
}

export function compileTypescript() {
    return spawn('npx tsc -p src', { shell: true, stdio: 'inherit' });
}

export default function build(done: () => void) {
    void series(clean, compileTypescript)(done);
}

export async function cleanTest() {
    await promisifiedRimraf('test/artifacts/**');
    await promisifiedRimraf('test/contracts-ts/**');
}

export function compileTestContracts() {
    return src('test/contracts/**/*.sol')
        .pipe(through2.obj(function(file: File, _, callback) {
            file.contents = Buffer.from(JSON.stringify(solc(file.base, file.relative, file.contents as Buffer, { optimizer: { enabled: true } }), null, 2));
            log(`>>> Compiled test/contracts/${file.relative}`);
            file.extname = '.json';
            callback(null, file);
        }))
        .pipe(dest('test/artifacts'));
}

export function createTestContractsTS() {
    return src([ 'test/artifacts/**/*.json' ])
        .pipe(through2.obj(function(file: File, _, callback) {
            file.contents = abi2ts(file.contents as Buffer);
            file.extname = '.ts';
            log(`>>> Created test/contracts-ts/${file.relative}`);
            callback(null, file);
        }))
        .pipe(dest('test/contracts-ts'));
}

export function runMocha() {
    return spawn('npx mocha', { shell: true, stdio: 'inherit' });
}

export function test(done: () => void) {
    void series(cleanTest, compileTestContracts, createTestContractsTS, runMocha)(done);
}
