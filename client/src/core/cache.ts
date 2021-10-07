// import { DatastoreCell } from "../app/editor_screen/_defs";

export class Cache {
    private static readonly singleton = new Cache();

    private readonly cachedObjects: { [name: string]: any } = {};

    private constructor() {}

    static get(key: string): any {
        return Cache.singleton.cachedObjects[key];
    }

    static set(key: string, object: any) {
        Cache.singleton.cachedObjects[key] = object;
    }

    static cacheInfo() {
        console.trace(Cache.singleton.cachedObjects)
    }
}

// const datastoreCellCacheKeyStub = "CACHE-KEY-DATASTORE-CELL";
// export function WithCacheSetDatastoreCell(datastoreCellGUID:string, object:DatastoreCell) {
//     const cacheKey = `${datastoreCellCacheKeyStub}-${datastoreCellGUID}`
//     Cache.set(cacheKey, object);
// }

// export function WithCacheGetDatastoreCell(datastoreCellGUID:string ):DatastoreCell {
//     const cacheKey = `${datastoreCellCacheKeyStub}-${datastoreCellGUID}`

//     return Cache.get(cacheKey);
// }
