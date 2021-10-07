import * as lib from "../lib";
import { EventCallback } from "../_common";
import { getXCSRFToken } from "../xcsrft";

type bodyTypes =
    | string
    | Document
    | Blob
    | ArrayBufferView
    | ArrayBuffer
    | FormData
    | URLSearchParams
    // | ReadableStream<Uint8Array>
    | XMLHttpRequestBodyInit
    | null
    | undefined;

export type ConfigCallback = (ajax: XMLHttpRequest) => bodyTypes;
export type ConfigPostCallback = (
    formData: FormData,
    ajax: XMLHttpRequest
) => void;

export function apiRequest(
    url: string,
    onLoad: (ajax: XMLHttpRequest, ...data: any) => void = () => {},
    onError: (ajax: XMLHttpRequest) => void = () => {},
    configBodyDataCallback?: ConfigCallback,
    method = "GET"
) {
    let ajax = new XMLHttpRequest();
    ajax.open(method, url, true);
    ajax.setRequestHeader("X-CSRF-Token", getXCSRFToken());
    ajax.onload = (e: any) => {
        if (ajax.status >= 200 && ajax.status < 400) {
            const data = JSON.parse(ajax.responseText);
            onLoad(e, data);
        } else {
            onError(ajax);
        }
    };
    ajax.onerror = () => {
        onError(ajax);
    };

    let ajaxBody: bodyTypes = "";

    if (configBodyDataCallback) {
        ajaxBody = configBodyDataCallback(ajax);
    }

    ajax.send(ajaxBody);
}

export function apiPostRequest(
    url: string,
    onFormData: ConfigPostCallback,
    onLoad: (ajax: XMLHttpRequest, ...data: any) => void = () => {},
    onError: (ajax: XMLHttpRequest) => void = () => {}
) {
    const method = "POST";
    let ajaxData = new FormData();
    let ajax = new XMLHttpRequest();

    ajax.open(method, url, true);
    ajax.setRequestHeader("X-CSRF-Token", getXCSRFToken());

    onFormData(ajaxData, ajax);

    ajax.onload = (e: any) => {
        if (ajax.status >= 200 && ajax.status < 400) {
            try {
                const data = JSON.parse(ajax.responseText);
                onLoad(e, data);
            }catch (err) {
                if (err instanceof SyntaxError) {
                    printError(url, err, true, ajax.responseText);
                } else {
                    printError(url, err, false, ajax.responseText);
                }
                onError(ajax);
            }
        } else {
            onError(ajax);
        }
    };

    ajax.onerror = () => {
        onError(ajax);
    };

    ajax.send(ajaxData);
}

export function apiPostRequestWithCache(
    cacheKey: string,
    url: string,
    onFormData: ConfigPostCallback,
    onLoad: (data: any, didUseCache:boolean, ajax?: XMLHttpRequest) => void = () => {},
    onError: (ajax: XMLHttpRequest) => void = () => {}
) {
    const cachedDatastoreCells = lib.Cache.get(cacheKey);
    if (cachedDatastoreCells == undefined) {
        const ajaxOnLoad = (ajax: XMLHttpRequest, data: any) => {
            lib.Cache.set(cacheKey, data);

            onLoad(data, false, ajax);
        }
        apiPostRequest(url, onFormData, ajaxOnLoad, onError);
    } else {
        onLoad(cachedDatastoreCells, true);
    }
}

var printError = function(url:string, error:any, explicit:any, rawText:string) {
    console.trace(`[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${url} ${error.name}: ${error.message}`);
    console.log("rawText:", rawText)
}
