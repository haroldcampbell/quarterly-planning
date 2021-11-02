import * as lib from "../../core/lib";
import { Epic, EpicID, OSubjectWillUpdateTeamName, Team, TeamID } from "../home_screen/_defs";
import { URLDeleteTeam, URLUpdateTeam } from "../home_screen/_defsServerResponses";
import { DeleteEpicByEpicID, getEpics } from "./epics";

const _teamIDs: string[] = [];
const _teamsMap = new Map<string, Team>();
let _teams: Team[] | undefined = undefined;

/** Sets the data for the teams */
export function setTeams(teams: Team[]) {
    teams.forEach((team) => {
        _teamsMap.set(team.ID, team)
        _teamIDs.push(team.ID);
    })
}

function buildTeams() {
    _teams = [];
    _teamIDs.forEach((teamID) => {
        _teams!.push(getTeamByID(teamID))
    })
}

export function getTeams(): Team[] {
    if (_teams !== undefined) {
        return _teams;
    }

    buildTeams();

    return _teams!;
}

export function getTeamByID(teamID: string): Team {
    return _teamsMap.get(teamID)!
}

export function getTeamIDs(): string[] {
    return Array.from(_teamIDs);
}

/** Updates a team on the remote sever */
export function RequestUpdateTeam(teamID: string, value: string, onTeamUpdatedCallback: (newTeam: Team) => void): void {
    const team = getTeamByID(teamID);
    team.Name = value;

    lib.apiPostRequest(
        URLUpdateTeam,
        (formData: FormData) => {
            formData.append("team-json-data", JSON.stringify(team));
        },
        (ajax, data) => {
            if (data.successStatus == false) {
                alert("Error updating team. Please try again.");
                return;
            }
            onTeamUpdatedCallback(team);
        },
    );
}

export function RequestDeleteTeam(teamID: TeamID, onTeamDeletedCallback: (deletedEpicIDs: EpicID[]) => void) {
    lib.apiPostRequest(
        URLDeleteTeam,
        (formData: FormData) => {
            formData.append("team-id", teamID);
        },
        (ajax, data) => {
            if (data.successStatus == false) {
                alert("Error removing team. Please try again.");
                return;
            }

            const deletedEpicIDs = deleteTeamByTeamID(teamID)
            onTeamDeletedCallback(deletedEpicIDs);
        },
    );
}

function deleteTeamByTeamID(teamID: TeamID): EpicID[] {
    const deletedEpicIDs = getEpics().filter(epic => epic.TeamID == teamID).map(epic => epic.ID)

    deletedEpicIDs.forEach(epicID => {
        DeleteEpicByEpicID(epicID);
    });

    _teamsMap.delete(teamID);
    _teamIDs.splice(_teamIDs.indexOf(teamID), 1);
    buildTeams();

    return deletedEpicIDs;// Epics that need to be deleted
}