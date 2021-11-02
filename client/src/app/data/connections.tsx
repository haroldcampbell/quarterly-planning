
import * as lib from "../../core/lib";
import { Epic, EpicConnection, EpicID } from "../home_screen/_defs";
import { CreateDependencyConnetionsResponse, URLCreateDependencyConnetions } from "../home_screen/_defsServerResponses";

import { getEpics } from "./epics"

/** Contains a map of epicID to array of downstream epicIDs */
let _epicConnections: EpicConnection[];

export function SetEpicConnections(connections: EpicConnection[]) {
    _epicConnections = connections;
}

export function GetEpicConnections(): EpicConnection[] {
    return _epicConnections;
}

/**
 * Returns the list of connections where the epicID is a DownstreamEpicID
 * @param epicID
 */
export function GetUpstreamConnections(epicID: EpicID): EpicConnection[] {
    return _epicConnections.filter((connection) => connection.DownstreamEpicID == epicID);
}

/**
 * Returns the list of connections where the epicID is an UpstreamEpicID
 * @param epicID
 * @returns
 */
export function GetDownstreamConnections(epicID: EpicID): EpicConnection[] {
    return _epicConnections.filter((connection) => connection.UpstreamEpicID == epicID);
}

/**
 * Removes connections that have the specified epicID as either a downstream or an upstream epicID
 * @param epicID
 */
export function UnlinkEpicConnection(epicID: EpicID) {
    _epicConnections = _epicConnections.filter((connection) => connection.UpstreamEpicID != epicID);
    _epicConnections = _epicConnections.filter((connection) => connection.DownstreamEpicID != epicID);
}

export function RequestCreateDependencyConnections(activeEpicID: EpicID, upstreamEpicIDs: EpicID[], downstreamEpicIDs: EpicID[], callback: () => void) {
    lib.apiPostRequest(
        URLCreateDependencyConnetions,
        (formData: FormData) => {
            formData.append("active-epic-id", activeEpicID);
            formData.append("upstream-connection-epic-ids", JSON.stringify(upstreamEpicIDs));
            formData.append("downstream-connection-epic-ids", JSON.stringify(downstreamEpicIDs));
        },
        (ajax, data) => {
            if (data.successStatus == false) {
                alert("Error creating epic. Please try again.");
                return;
            }

            callback()
        },
    );
}

export function UpdateUpstreamConnections(upstreamEpicIDs: EpicID[], downstreamEpicID: EpicID) {
    // Remove all connections that have downstreamEpicID as a downstream.
    // This essentially removes all of the upstreams <- downstreamEpicID relationships
    _epicConnections = _epicConnections.filter((connection) => connection.DownstreamEpicID != downstreamEpicID);

    upstreamEpicIDs.forEach(upstreamEpicID => {
        const epicConnection: EpicConnection = {
            UpstreamEpicID: upstreamEpicID,
            DownstreamEpicID: downstreamEpicID
        };

        _epicConnections.push(epicConnection)
    })
}

export function UpdateDownstreamConnections(upstreamEpicID: EpicID, downstreamEpicIDs: EpicID[]) {
    // Remove all connections that have downstreamEpicID as a downstream.
    // This essentially removes all of the upstreams <- downstreamEpicID relationships
    _epicConnections = _epicConnections.filter((connection) => connection.UpstreamEpicID != upstreamEpicID);

    downstreamEpicIDs.forEach(downstreamEpicID => {
        const epicConnection: EpicConnection = {
            UpstreamEpicID: upstreamEpicID,
            DownstreamEpicID: downstreamEpicID
        };

        _epicConnections.push(epicConnection)
    })
}
