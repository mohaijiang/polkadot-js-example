import { Keyring } from '@polkadot/keyring';
import * as fs from 'fs';

// tslint:disable-next-line:no-console
console.log("hello TypeScript")

// ## 1: 准备链节点websocket地址
// const wsProvider = new WsProvider('ws://183.66.65.205:9944');
// // ## 2：声明api client
// const api = await ApiPromise.create({
//     provider:wsProvider,
// });

// Construct our Code helper. The abi is an Abi object, an unparsed JSON string
// or the raw JSON data (after doing a JSON.parse). The wasm is either a hex
// string (0x prefixed), an Uint8Array or a Node.js Buffer object

// ## 3: 读取合约文件
// const json =　JSON.parse(fs.readFileSync('src/contract/flipper.contract','utf8'));

// ## 4: 创建abi 对象
// const contractAbi = new Abi(json,api.registry.getChainProperties())

/// ===========  call ink contract  ==================//
// ## 5: 声明账号
// ## 5.1 通过Seed
// ## 5.2 通过 backup 文件（需要密码）
// ## 5.3 通过浏览器插件
const keyring = new Keyring({ type: 'sr25519',ss58Format: 42 });
// 0xcfee9141c47cbc46c36de6c5b1dc0e80bf5fe15795079e10946f66cd985b977f
// ### pair对象是交易的公私钥对
// const pair = keyring.addFromUri('0x18cf643fe8f8187e8743e38c2cab076b04a1c727987300709b06b2e93e21419e');
// const pair = keyring.addFromUri('0x18cf643fe8f8187e8743e38c2cab076b04a1c727987300709b06b2e93e211234');
//
// // seed: roast double swamp expand around element conduct table prize stomach brief meat
const backupJson =　JSON.parse(fs.readFileSync('src/contract/5DUQrTMDdCukEptpUpHxWobT3ZsrhwQqSLhnX8p9Xp1nSNay.json','utf8'));
const krp = keyring.addFromJson(backupJson);

krp.decodePkcs8("123456")

