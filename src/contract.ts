import {ApiPromise} from "@polkadot/api";
import {Abi, BlueprintPromise, CodePromise, ContractPromise} from "@polkadot/api-contract";
import {BN_ZERO} from "@polkadot/util";
import {BlueprintSubmittableResult} from "@polkadot/api-contract/base/Blueprint";
import {SubmittableExtrinsic} from "@polkadot/api/types";
import {CodeSubmittableResult} from "@polkadot/api-contract/promise/types";
import {KeyringPair} from "@polkadot/keyring/types";

const gasLimit = 200000000000;

const createContract = async (api :ApiPromise, abi:Abi,codeHash: string, pair: KeyringPair) => {
    const blueprint = new BlueprintPromise(api, abi, codeHash);
    const constructorIndex = 0;
    const params: any[] = [true]
    const value = BN_ZERO ;
    let contract;
    const contractUnsub = await blueprint.tx[abi.constructors[constructorIndex].method]({
        gasLimit,
        salt: "random",
        storageDepositLimit: null,
        value: abi?.constructors[constructorIndex].isPayable ? value : undefined
    }, ...params)
        .signAndSend(pair, (result: BlueprintSubmittableResult<any>) => {
            console.log(`===${result.status}===`)
            if (result.status.isInBlock || result.status.isFinalized) {
                // here we have an additional field in the result, containing the contract
                contract = result.contract;
                if( result.dispatchError) {
                    console.log(result.dispatchError.toJSON())
                }
                if(contract) {
                    console.log("contractAddress: "+ contract.address.toHuman())
                }
                contractUnsub();
            }
        });
};


// ## 6: 智能合约code
// tslint:disable-next-line:no-shadowed-variable
const createCode = async (api: ApiPromise,abi: Abi,pair: KeyringPair,json: any) => {
    const code = new CodePromise(api, json, abi.info.source.wasm);
    // tslint:disable-next-line:no-shadowed-variable
    const constructorIndex : number = 0
    console.log(abi.constructors[constructorIndex].method)

    let contract: SubmittableExtrinsic<'promise'> | null = null;
    let error: string | null = null;
    const value = BN_ZERO ;

    // tslint:disable-next-line:no-shadowed-variable
    const params: any[] = [true]
    try {
        contract = code && abi?.constructors[constructorIndex]?.method && value
            ? code.tx[abi.constructors[constructorIndex].method]({
                gasLimit: 200000000000,
                storageDepositLimit: null,
                value: abi?.constructors[constructorIndex].isPayable ? value : undefined
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
            console.log(`===hash is ${result.txHash.toHuman()}`)
            if (result.status.isInBlock || result.status.isFinalized) {
                if(result.status.isInBlock){
                    console.log(`inBlock hash is : ${result.status.asInBlock}`)
                }
                if(result.status.isFinalized){
                    console.log(`finalized hash is : ${result.status.asFinalized}`)
                }
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
const getValue  = async (api :ApiPromise, abi :Abi, address: string,pair: KeyringPair) => {

    const contract = new ContractPromise(api, abi, address);
    const value = 0;
    const { gasConsumed, result, output } = await contract.query.get(pair.address, { value, gasLimit });
// The actual result from RPC as `ContractExecResult`
    console.log(result.toHuman());

// gas consumed
    console.log(gasConsumed.toHuman());

// check if the call was successful
    if (result.isOk) {
        // should output 123 as per our initial set (output here is an i32)
        // @ts-ignore
        console.log('Success', output.toHuman());
    } else {
        console.error('Error', result.asErr);
    }
} ;

// tslint:disable-next-line:no-shadowed-variable
const setValue = async (api :ApiPromise, abi :Abi, address: string,pair: KeyringPair) => {
    const contract = new ContractPromise(api, abi, address);
    const value = 0;
    const incValue = 1;
    const methodName = "flip"
    await contract.tx
        .flip({ value, gasLimit },) // 方法名({value,gasLimit}, ...params )  此处flip 是合约方法名
        .signAndSend(pair, (result) => {
            if (result.status.isInBlock) {
                console.log('in a block');
            } else if (result.status.isFinalized) {
                console.log('finalized');
            }
        });
};

const transform = async (api :ApiPromise,pair: KeyringPair) => {

    // Make a transfer from Alice to BOB, waiting for inclusion
    try {
        const unsub = await api.tx.balances
            .transfer("5D4zqbagezn64JfwKkjJkiNLDwu2MF4wCGgWU8Muzu6C8FAL", 10000000)
            .signAndSend(pair, (result) => {
                console.log(`Current status is ${result.status}`);

                if (result.status.isInBlock) {
                    console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
                } else if (result.status.isFinalized) {
                    console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
                    unsub();
                }
            });
    } catch (e){
        console.log(e)
    }
}
