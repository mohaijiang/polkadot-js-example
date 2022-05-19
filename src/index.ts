import {ApiPromise, SubmittableResult, WsProvider} from '@polkadot/api';
import {Abi, CodePromise,BlueprintPromise,ContractPromise,} from '@polkadot/api-contract';
import { Keyring } from '@polkadot/keyring';
import * as fs from 'fs';
import { BN_MILLION, BN_TEN, BN_ZERO } from '@polkadot/util';
import type { Weight } from '@polkadot/types/interfaces';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { CodeSubmittableResult } from '@polkadot/api-contract/promise/types';
import {BlueprintSubmittableResult} from "@polkadot/api-contract/base/Blueprint";
import { randomAsU8a }  from '@polkadot/util-crypto';

import testKeyring from '@polkadot/keyring/testing';

// tslint:disable-next-line:no-console
console.log("hello TypeScript")

const gasLimit = 200000000000;

// tslint:disable-next-line:no-shadowed-variable
// const getValue  = async (api :ApiPromise, abi :Abi, address: string) => {
//
//
//     const contract = new ContractPromise(api, contractAbi, address);
//     const value = 0;
//     const { gasConsumed, result, output } = await contract.query.get(pair.address, { value, gasLimit });
// // The actual result from RPC as `ContractExecResult`
//     console.log(result.toHuman());
//
// // gas consumed
//     console.log(gasConsumed.toHuman());
//
// // check if the call was successful
//     if (result.isOk) {
//         // should output 123 as per our initial set (output here is an i32)
//         // @ts-ignore
//         console.log('Success', output.toHuman());
//     } else {
//         console.error('Error', result.asErr);
//     }
// } ;

// tslint:disable-next-line:no-shadowed-variable
// const setValue = async (api :ApiPromise, abi :Abi, address: string) => {
//     const contract = new ContractPromise(api, contractAbi, address);
//     const value = 0;
//     const incValue = 1;
//     await contract.tx
//         .flip({ value, gasLimit },) // 方法名({value,gasLimit}, ...params )  此处flip 是合约方法名
//         .signAndSend(pair, (result) => {
//             if (result.status.isInBlock) {
//                 console.log('in a block');
//             } else if (result.status.isFinalized) {
//                 console.log('finalized');
//             }
//         });
// };

// tslint:disable-next-line:no-shadowed-variable
const createCode = async (api: ApiPromise,abi: Abi) => {
    const code = new CodePromise(api, json, contractAbi.info.source.wasm);
    // tslint:disable-next-line:no-shadowed-variable
    const constructorIndex : number = 0
    console.log(contractAbi.constructors[constructorIndex].method)

    let contract: SubmittableExtrinsic<'promise'> | null = null;
    let error: string | null = null;
    const value = BN_ZERO ;

    // tslint:disable-next-line:no-shadowed-variable
    const params: any[] = [true]
    try {
        contract = code && contractAbi?.constructors[constructorIndex]?.method && value
            ? code.tx[contractAbi.constructors[constructorIndex].method]({
                gasLimit: 200000000000,
                storageDepositLimit: null,
                value: contractAbi?.constructors[constructorIndex].isPayable ? value : undefined
            }, ...params)
            : null;
    } catch (e) {
        error = (e as Error).message;
        console.error(error)
    }
    console.log(contract)

    if( contract) {
        const codeUnsub =  await contract.signAndSend(pair, (result: CodeSubmittableResult) => {
            console.log(`===${result.status}===`)
            if (result.status.isInBlock || result.status.isFinalized) {
                console.log(result.contract)
                if(result.contract) {
                     console.log("contractAddress: ",result.contract.address.toHuman())
                }

                if(result.blueprint){
                    console.log("codeHash: ",result.blueprint.codeHash.toHex())
                }

                codeUnsub()
            }
        });
    }
}

// tslint:disable-next-line:no-shadowed-variable
// const createContract = async (api :ApiPromise, abi:Abi,codeHash: string) => {
//     const blueprint = new BlueprintPromise(api, abi, codeHash);
//     const constructorIndex = 0;
//     const params: any[] = [true]
//     const value = BN_ZERO ;
//     let contract;
//     const unsub = await blueprint.tx[contractAbi.constructors[constructorIndex].method]({
//         gasLimit,
//         salt: "random",
//         storageDepositLimit: null,
//         value: contractAbi?.constructors[constructorIndex].isPayable ? value : undefined
//     }, ...params)
//         .signAndSend(pair, (result: BlueprintSubmittableResult<any>) => {
//             console.log(`===${result.status}===`)
//             if (result.status.isInBlock || result.status.isFinalized) {
//                 // here we have an additional field in the result, containing the contract
//                 contract = result.contract;
//                 if( result.dispatchError) {
//                     console.log(result.dispatchError.toJSON())
//                 }
//                 if(contract) {
//                     console.log("contractAddress: "+ contract.address.toHuman())
//                 }
//                 unsub();
//             }
//         });
// };

// Construct the API as per the API sections
// (as in all examples, this connects to a local chain)
const wsProvider = new WsProvider('ws://183.66.65.205:9944');
const api = await ApiPromise.create({
    provider:wsProvider,
});

// Construct our Code helper. The abi is an Abi object, an unparsed JSON string
// or the raw JSON data (after doing a JSON.parse). The wasm is either a hex
// string (0x prefixed), an Uint8Array or a Node.js Buffer object

const json =　JSON.parse(fs.readFileSync('src/contract/flipper.contract','utf8'));

const contractAbi = new Abi(json,api.registry.getChainProperties())

/// ===========  call ink contract  ==================//
const keyring = new Keyring({ type: 'sr25519',ss58Format: 42 });
// 0xcfee9141c47cbc46c36de6c5b1dc0e80bf5fe15795079e10946f66cd985b977f
const pair = keyring.addFromUri('0xcfee9141c47cbc46c36de6c5b1dc0e80bf5fe15795079e10946f66cd985b977f');
//
// const contract = new ContractPromise(api, contractAbi, "some-address");
// const value = 0;
// const incValue = 1;
// await contract.tx
//     .flip({ value, gasLimit },) // 方法名({value,gasLimit}, ...params )  此处flip 是合约方法名
//     .signAndSend(pair, (result) => {
//         if (result.status.isInBlock) {
//             console.log('in a block');
//         } else if (result.status.isFinalized) {
//             console.log('finalized');
//         }
//     });


/// ======      call ink contract end  ==============  //



// const contractAddress = "5CXm8Z4YJfFkBAx4ShaPDZ3w3yhbiq5gMZNbd3RGagSoXjNr"

// const codeHash = "0x7e27ccfeb205f082f0c1c9c915ab282799805b2042e1f25c48ee81b623af6340"

/// 创建code
await createCode(api,contractAbi)

/// Create a contract, 测试过程中发现一个codeHash只能创建一次， 如需要重复创建，必须修改salt值
// await createContract(api,contractAbi,codeHash)

///  查询合约的存储的值
// await getValue(api,contractAbi, contractAddress)

/// 合约方法调用
// await setValue(api,contractAbi,contractAddress)

const ALICE = '5D2i5RSmQyeRkggJAM9XimvWprDxqxZZLF9MXMPpApPr9PcW';
const AMOUNT = 10000;

// Create an instance of our testing keyring
// If you're using ES6 module imports instead of require, just change this line to:
// const keyring = testKeyring.createTestKeyring()

// Get the nonce for the admin key
const nonce = await api.query.system.account(ALICE);

// Find the actual keypair in the keyring
// const alicePair = keyring.getPair(ALICE);

// Create a new random recipient
const recipient = keyring.addFromSeed(randomAsU8a(32)).address;

// console.log('Sending', AMOUNT, 'from', alicePair.address, 'to', recipient, 'with nonce', nonce.toString());

// Do the transfer and track the actual status
// Create alice (carry-over from the keyring section)

// Make a transfer from Alice to BOB, waiting for inclusion
// let unsub = await api.tx.balances
//     .transfer("5D4zqbagezn64JfwKkjJkiNLDwu2MF4wCGgWU8Muzu6C8FAL", 10000000)
//     .signAndSend(pair, (result) => {
//         console.log(`Current status is ${result.status}`);
//
//         if (result.status.isInBlock) {
//             console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
//         } else if (result.status.isFinalized) {
//             console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
//             unsub();
//         }
//     });

// Show the hash
