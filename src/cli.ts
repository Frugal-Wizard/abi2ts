#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import glob from 'glob';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { abi2ts } from './abi2ts';

yargs(hideBin(process.argv))
    .command('$0 <inputDir>', 'create typescript from ABI', yargs => {
        yargs
            .positional('inputDir', {
                describe: 'Input folder',
            })
            .options({
                outputDir: {
                    describe: 'Output folder',
                    defaultDescription: '<inputDir>',
                },
            });
    }, (argv) => {
        const {
            inputDir,
            outputDir = inputDir,
        } = argv as unknown as {
            inputDir: string;
            outputDir?: string;
        };
        for (const inputFile of glob.sync('**/*.json', { cwd: inputDir, ignore: '**/*.input.json' })) {
            console.log(`Creating typescript for ${join(inputDir, inputFile)}...`);
            const outputFile = join(outputDir, dirname(inputFile), basename(inputFile, '.json'));
            mkdirSync(dirname(outputFile), { recursive: true });
            const output = abi2ts(readFileSync(join(inputDir, inputFile)));
            writeFileSync(`${outputFile}.ts`, output);
        }
    }).parseSync();
