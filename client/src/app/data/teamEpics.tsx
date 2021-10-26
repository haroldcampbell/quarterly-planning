import { Epic } from "../home_screen/_defs";
import { getEpics } from "./epics";
import { getTeams } from "./teams";

const _epicsByTeamID = new Map<string, Epic[]>();

function ensureTeamEpic(teamID: string) {
    if (!_epicsByTeamID.has(teamID)) {
        _epicsByTeamID.set(teamID, []);
    }
}

export function getEpicsByTeamID(teamID: string): Epic[] | undefined {
    return _epicsByTeamID.get(teamID);
}

export function initEpicsByTeamID(teamID: string): Epic[] {
    const epics: Epic[] = []
    _epicsByTeamID.set(teamID, epics);

    return epics;
}

export function addEpicToTeamEpic(teamID: string, epic: Epic) {
    // TODO: sync with server
    ensureTeamEpic(epic.TeamID);
    _epicsByTeamID.get(teamID)!.push(epic);
}

export function setTeamEpics(teamEpics: { [key: string]: { TeamID: string, Epics: Epic[] } }) {
    for (let TeamID in teamEpics) {
        const teamEpic = teamEpics[TeamID]
        _epicsByTeamID.set(teamEpic.TeamID, teamEpic.Epics)
    }
}

export function createTeamEpics() {
    const teams = getTeams();
    const epics = getEpics();

    epics.forEach(epic => {
        addEpicToTeamEpic(epic.TeamID, epic);
    })

    teams.forEach(team => {
        if (!_epicsByTeamID.has(team.ID)) {
            initEpicsByTeamID(team.ID)
        }
    })
}