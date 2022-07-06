export interface SolidityCompilerOutput {
    [contractName: string]: {
        abi: ABI,
        evm: {
            bytecode: {
                object: string,
                linkReferences: LinkReferences
            }
        }
    }
}

export interface LinkReferences {
    [sourceFile: string]: {
        [libraryName: string]: unknown
    }
}

export type ABI = ABIDefinition[]

export interface ABIDefinition {
    type:             'constructor' | 'error' | 'event' | 'function',
    name?:            string,
    inputs?:          ABITypeDefinition[],
    outputs?:         ABITypeDefinition[],
    stateMutability?: 'pure' | 'view' | 'payable' | 'nonpayable',
}

export interface ABITypeDefinition {
    type:          string,
    name?:         string,
    internalType?: string,
    components?:   ABITypeDefinition[],
    indexed?:      boolean,
}

export function parseCompiledSolidity(compiledSolidity: string): SolidityCompilerOutput {
    return JSON.parse(compiledSolidity) as SolidityCompilerOutput;
}
