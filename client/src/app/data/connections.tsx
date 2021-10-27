
import * as lib from "../../core/lib";
import { Epic, EpicID } from "../home_screen/_defs";
import { CreateDependencyConnetionsResponse, URLCreateDependencyConnetions } from "../home_screen/_defsServerResponses";

import { getEpics } from "./epics"

/** Contains a map of epicID to array of downstream epicIDs */
let _downStreamsByEpicID: Map<EpicID, EpicID[]>;

/** Returns an array of downstream epicIDs for the specified upstream epic */
export function getDownstreamEpicsByID(upstreamEpicID: EpicID): EpicID[] | undefined {
    return _downStreamsByEpicID.get(upstreamEpicID);
}

/** Add depdency on upstream epics */
export function updateUpstreamEpics(downstreamEpic: Epic, upstreamEpics: Epic[]) {
    if (downstreamEpic.Upstreams === undefined) {
        downstreamEpic.Upstreams = [];
    }

    /** Remove the existing downstreams that contain them as its upstream */
    downstreamEpic.Upstreams?.forEach((epicID) => {
        const downstreamEpicIDs = getDownstreamEpicsByID(epicID);
        const index = downstreamEpicIDs?.indexOf(downstreamEpic.ID);
        if (index != -1) {
            downstreamEpicIDs?.splice(index!, 1);
        }
    })

    downstreamEpic.Upstreams = [];
    upstreamEpics.forEach((epic) => {
        downstreamEpic.Upstreams!.push(epic.ID);
        //
        addDownstreamEpic(_downStreamsByEpicID, epic.ID, downstreamEpic.ID);
    });
}

/** Add dependency from downstream epics */
export function updateDownstreamEpics(upstreamEpic: Epic, downstreamEpics: Epic[]) {
    const epics = getEpics();

    epics.forEach((e) => {
        if (e.Upstreams === undefined) {
            return;
        }

        const index = e.Upstreams.indexOf(upstreamEpic.ID);

        if (index != -1) {
            e.Upstreams?.splice(index!, 1);
        }
    })

    downstreamEpics.forEach((downstreamEpic) => {
        if (downstreamEpic.Upstreams === undefined) {
            downstreamEpic.Upstreams = [];
        }

        if (downstreamEpic.Upstreams.indexOf(upstreamEpic.ID) != -1) {
            return;
        }

        downstreamEpic.Upstreams.push(upstreamEpic.ID);
        addDownstreamEpic(_downStreamsByEpicID, upstreamEpic.ID, downstreamEpic.ID);
    });
}

/** Builds the downstream epics by walking the epic.upstreams  */
function addDownstreamEpic(map: Map<EpicID, EpicID[]>, upstreamEpicID: EpicID, downstreamEpicID: EpicID) {
    if (!map.has(upstreamEpicID)) {
        map.set(upstreamEpicID, []);
    }
    const downstreamEpics = map.get(upstreamEpicID)!
    if (downstreamEpics.indexOf(downstreamEpicID) != -1) {
        console.trace(">>addDownstreamEpic: Attempted to add duplicated downstream epic", `${upstreamEpicID}<-${downstreamEpicID}`);
        return;
    }
    downstreamEpics.push(downstreamEpicID);
}

export function processDownstreamEpics() {
    const downStreamsEpicIDsMap = new Map<EpicID, EpicID[]>();
    const epics = getEpics();

    epics.forEach((downstreamEpic) => {
        if (downstreamEpic.Upstreams) {
            downstreamEpic.Upstreams?.forEach((upstreamEpicID) => {
                addDownstreamEpic(downStreamsEpicIDsMap, upstreamEpicID, downstreamEpic.ID);
            });
        }
    })
    _downStreamsByEpicID = downStreamsEpicIDsMap;
}

export function RequestCreateDependencyConnections(activeEpicID: EpicID,
    upstreamEpicIDs: EpicID[],
    downstreamEpicIDs: EpicID[]) {

    lib.apiPostRequest(
        URLCreateDependencyConnetions,
        (formData: FormData) => {
            formData.append("active-epic-id", activeEpicID);
            formData.append("downstream-connection-epic-ids", JSON.stringify(upstreamEpicIDs));
            formData.append("upstream-connection-epic-ids", JSON.stringify(downstreamEpicIDs));
        },
        (ajax, data) => {
            if (data.successStatus == false) {
                alert("Error creating epic. Please try again.");
                return;
            }

            console.log(">>data", data)

            const response: CreateDependencyConnetionsResponse = data.jsonBody
            // epic.ID = response.EpicID;

            // onEpicCreatedCallback(epic);
        },
    );
}
