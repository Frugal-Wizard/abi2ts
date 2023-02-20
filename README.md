# README

## What is this?

This is a code generator that takes the JSON produced by the solidity compiler and creates typescript code for interacting with the corresponding smart contracts.

The generated code requires the library [abi2ts-lib](https://github.com/Frugal-Wizard/abi2ts-lib) as a dependency to work.

Currently it depends on [ethers](https://github.com/ethers-io/ethers.js/) but eventually this dependency will be dropped (or at least that is the intention).

## What functionality does it provide?

* A class for each smart contract.
* A class method for each smart contract function (overloading not yet supported).
* Method arguments are mapped to appropriate javascript types.
* Additional methods for calling contract functions statically.
* Additional methods for estimating gas of a contract function.
* Additional methods for encoding or creating the transaction for a contract function.
* An Error class for each smart contract defined error.
* Throws the appropriate error on a static call if the error type is known at runtime.
* A class for each smart contract defined event.
* Transaction events are provided in their respective class if the event type is known at runtime.

## Should I use this?

Currently it's not to be considered stable.

Use at your own discretion and don't rely on its interface staying backward compatible.

## How do I use this?

```typescript
// builing the code

import { abi2ts } from '@frugalwizard/abi2ts';
import { readFileSync, writeFileSync } from 'fs';

writeFileSync('Contract.ts', abi2ts(readFileSync('Contract.json')));

// using the code

import { Contract, CustomError, CustomEvent } from './Contract';

(async () => {
    const deployedContract = await Contract.deploy(...args);

    const contract = Contract.at(deployedContract.address);

    try {
        const returnValue = await contract.staticCall.writeMethod(...args);
    } catch (error) {
        if (error instanceof CustomError) {
            // handle error
        }
    }

    const { events } = await contract.writeMethod(...args);
    for (const event of events) {
        if (event instanceof CustomEvent) {
            // handle event
        }
    }

    const returnValue = await contract.readMethod(...args);
})();
```
