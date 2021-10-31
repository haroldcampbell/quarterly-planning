import * as lib from "../../core/lib";
import { OSubjectWillUpdateTeamName, Team } from "../home_screen/_defs";
import { URLUpdateTeam } from "../home_screen/_defsServerResponses";

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
    return _teamsMap.get(teamID)!
}

// export function UpdateTeamName(teamID: string, value: string) {
//     const team = getTeamByID(teamID);

//     team.Name = value;
//     lib.Observable.notify(OSubjectWillUpdateTeamName, {
//         source: undefined,
//         value: { team: team },
//     });
// }

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
                alert("Error update team. Please try again.");
                return;
            }

            console.log(">>>[] data.jsonBody", data.jsonBody)

            onTeamUpdatedCallback(team);
        },
    );
}