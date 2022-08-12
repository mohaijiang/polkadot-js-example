import {Base64} from "js-base64";

function Uint8ToBase64(data:Uint8Array):string{

    const chunks = [];
    const block = 0x8000;
    for( let i = 0; i< data.length; i += block){
        // @ts-ignore
        chunks.push( String.fromCharCode.apply(null, data.subarray(i, i + block)));
    }
    return Base64.encode(chunks.join(""));

}


function Uint8ArrayToString (fileData: Uint8Array){
    let dataString = "";
    for (const dataStringElement of fileData) {
        dataString += String.fromCharCode(dataStringElement);
    }
    return dataString
}

