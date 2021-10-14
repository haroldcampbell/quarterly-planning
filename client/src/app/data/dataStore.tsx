import * as lib from "../../core/lib";
import { Epic, EpicID, OSubjectDataStoreReady, OSubjectWillUpdateEpicName, OSubjectWillUpdateTeamName, Team } from "../home_screen/_defs";

const _teamsMap: { [key: string]: Team } = {
    // "A0": { ID: "A0", Name: "Team 0" },
    "A1": { ID: "A1", Name: "Team 1" },
    "A2": { ID: "A2", Name: "Team 2" },
    "A3": { ID: "A3", Name: "Team 3" },
    "A4": { ID: "A4", Name: "Team 4" },
    "A5": { ID: "A5", Name: "Team 5" },
    "A6": { ID: "A6", Name: "Team 6" },
    "A7": { ID: "A7", Name: "Team 7" },
    "A8": { ID: "A8", Name: "Team 8" }
}

const _teamIDs: string[] = [
    // "A0",
    "A1",
    "A2",
    "A3",
    "A4",
    "A5",
    "A6",
    "A7",
    "A8",
];

const _epicsByTeamID = new Map<string, Epic[]>([
    ["A1", [
        { ID: "1", TeamID: "A1", Name: "Epic IL1" },
        // { ID: "2", TeamID: "A1", Name: "Epic IL2", Upstreams: ["1"] },
        { ID: "3", TeamID: "A1", Name: "Epic IL3" },
        { ID: "4", TeamID: "A1", Name: "Epic IL4" },
    ]],
    ["A2", [
        { ID: "5", TeamID: "A2", Name: "Epic P1" },
        { ID: "6", TeamID: "A2", Name: "Epic P2" },
    ]],
    ["A3", [
        { ID: "7", TeamID: "A3", Name: "Epic SME1" },
        { ID: "8", TeamID: "A3", Name: "Epic SME2" },
        // { ID: "9", TeamID: "A3", Name: "Epic SME3", Upstreams: ["2", "6", "18", "22", "23"] },
        { ID: "10", TeamID: "A3", Name: "Epic SME4" },
    ]],
    ["A4", [
        { ID: "11", TeamID: "A4", Name: "Epic M1" },
        { ID: "12", TeamID: "A4", Name: "Epic M2" },
        { ID: "13", TeamID: "A4", Name: "Epic M3" },
    ]],
    ["A5", [
        { ID: "14", TeamID: "A5", Name: "Epic DW1" },
    ]],
    ["A6", [
        { ID: "15", TeamID: "A6", Name: "Epic CRM1" },
        { ID: "16", TeamID: "A6", Name: "Epic CRM2" },
        // { ID: "17", TeamID: "A6", Name: "Epic CRM3", Upstreams: ["6"] },
        { ID: "18", TeamID: "A6", Name: "Epic CMR4" },
        { ID: "19", TeamID: "A6", Name: "Epic CRM5" },
        { ID: "20", TeamID: "A6", Name: "Epic CRM6" },
        // { ID: "21", TeamID: "A6", Name: "Epic CRM7", Upstreams: ["9"] },
    ]],
    ["A7", [
        { ID: "22", TeamID: "A7", Name: "Epic ACO1" },
        // { ID: "23", TeamID: "A7", Name: "Epic ACO2", Upstreams: ["11", "15"] },
        { ID: "24", TeamID: "A7", Name: "Epic ACO3" },
        { ID: "25", TeamID: "A7", Name: "Epic ACO4" },
    ]],
    ["A8", [
        // { ID: "26", TeamID: "A8", Name: "Epic CN1", Upstreams: ["11", "15"] },
        { ID: "27", TeamID: "A8", Name: "Epic CN2" },
    ]],
]);

let _teams: Team[] | undefined = undefined;

export function getTeams(): Team[] {
    if (_teams !== undefined) {
        return _teams;
    }

    _teams = [];
    _teamIDs.forEach((teamID) => {
        _teams!.push(getTeamByID(teamID))
    })

    return _teams;
}

export function getTeamByID(teamID: string): Team {
    return _teamsMap[teamID]
}

/** Contains epicID -> Epic mapping */
let _epicsByID: Map<string, Epic>;

export function getEpicsByTeamID(teamID: string): Epic[] {
    return _epicsByTeamID.get(teamID)!;
}

export function addNewEpicAtIndex(epic: Epic, insertionIndex: number) {
    _epicsByTeamID.get(epic.TeamID)!.splice(insertionIndex, 0, epic);
    _epicsByID.set(epic.ID, epic);
}

export function getEpicByID(epicID: string): Epic | undefined {
    return _epicsByID.get(epicID);
}

export function getEpics(): Epic[] {
    let epics: Epic[] = [];

    _teamIDs.forEach((teamID) => {
        const teamEpics = _epicsByTeamID.get(teamID);

        if (teamEpics !== undefined) {
            epics = epics.concat(teamEpics);
        }
    });

    return epics;
}

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

export function UpdateTeamName(teamID: string, value: string) {
    const team = getTeamByID(teamID);

    team.Name = value;
    lib.Observable.notify(OSubjectWillUpdateTeamName, {
        source: undefined,
        value: { team: team },
    });
}

export function UpdateEpicName(epicID: string, value: string) {
    const epic = getEpicByID(epicID);

    epic!.Name = value;
    lib.Observable.notify(OSubjectWillUpdateEpicName, {
        source: undefined,
        value: { epic: epic },
    });
}

/** Populates a map with epics[epicID]*/
function processTeamEpics(): Map<string, Epic> {
    const epicsByIDMap = new Map<string, Epic>()

    for (let epics of _epicsByTeamID.values()) {
        epics.forEach(epic => {
            epicsByIDMap.set(epic.ID, epic)
        })
    }
    return epicsByIDMap;
}

/** Builds the downstream epics by walking the epic.upstreams  */
function addDownstreamEpic(map: Map<EpicID, EpicID[]>, upstreamEpicID: EpicID, downstreamEpicID: EpicID) {
    if (!map.has(upstreamEpicID)) {
        map.set(upstreamEpicID, []);
    }
    const downstreamEpics = map.get(upstreamEpicID)!
    if (downstreamEpics.indexOf(downstreamEpicID) != -1) {
        console.log(">>addDownstreamEpic: Attempted to add duplicated downstream epic", `${upstreamEpicID}<-${downstreamEpicID}`);
        return;
    }
    downstreamEpics.push(downstreamEpicID);
}

function processDownstreamEpics(): Map<EpicID, EpicID[]> {
    const downStreamsEpicIDsMap = new Map<EpicID, EpicID[]>();

    for (let downstreamEpic of _epicsByID.values()) {
        if (downstreamEpic.Upstreams) {
            downstreamEpic.Upstreams?.forEach((upstreamEpicID) => {
                addDownstreamEpic(downStreamsEpicIDsMap, upstreamEpicID, downstreamEpic.ID);
            });
        }
    }

    return downStreamsEpicIDsMap;
}

function onDataStoreReady() {
    lib.Observable.notify(OSubjectDataStoreReady, {
        source: undefined,
        value: undefined,
    });
}

async function wireServerData() {
    _epicsByID = await processTeamEpics();
    _downStreamsByEpicID = await processDownstreamEpics();

    // await processEpicsByTeamID();
    await onDataStoreReady();
}

wireServerData();