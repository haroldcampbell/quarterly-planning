import * as lib from "../../core/lib";
import { Epic, EpicID, OSubjectWillUpdateEpicName } from "../home_screen/_defs";
import { getEpicsByTeamID } from "./teamEpics";
import { getTeamIDs } from "./teams";

/** Contains epicID -> Epic mapping */
let _epicsByID: Map<string, Epic>;

/** Contains a map of epicID to array of downstream epicIDs */
let _downStreamsByEpicID: Map<EpicID, EpicID[]>;

export function getEpicByID(epicID: string): Epic | undefined {
    return _epicsByID.get(epicID);
}

export function getEpics(): Epic[] {
    // let epics: Epic[] = [];
    // const teamIDs = getTeamIDs();

    // teamIDs.forEach((teamID) => {
    //     const teamEpics = getEpicsByTeamID(teamID);

    //     if (teamEpics !== undefined) {
    //         epics = epics.concat(teamEpics);
    //     }
    // });

    return [..._epicsByID.values()].flat();
    // return epics;
}

export function addEpic(epic: Epic) {
    // TODO: sync with server
    _epicsByID.set(epic.ID, epic);
}

export function UpdateEpicName(epicID: string, value: string) {
    const epic = getEpicByID(epicID);

    epic!.Name = value;
    lib.Observable.notify(OSubjectWillUpdateEpicName, {
        source: undefined,
        value: { epic: epic },
    });
}

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
    for (let e of _epicsByID.values()) {
        if (e.Upstreams === undefined) {
            continue;
        }

        const index = e.Upstreams.indexOf(upstreamEpic.ID);

        if (index != -1) {
            e.Upstreams?.splice(index!, 1);
        }
    }

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

function processDownstreamEpics() {
    const downStreamsEpicIDsMap = new Map<EpicID, EpicID[]>();

    for (let downstreamEpic of _epicsByID.values()) {
        if (downstreamEpic.Upstreams) {
            downstreamEpic.Upstreams?.forEach((upstreamEpicID) => {
                addDownstreamEpic(downStreamsEpicIDsMap, upstreamEpicID, downstreamEpic.ID);
            });
        }
    }
    _downStreamsByEpicID = downStreamsEpicIDsMap;
}

export function setEpics(epics: Epic[]) {
    _epicsByID = new Map<string, Epic>()

    epics.forEach(epic => {
        epic.Upstreams = epic.Upstreams === null ? [] : epic.Upstreams;
        _epicsByID.set(epic.ID, epic)
    })

    processDownstreamEpics()
}