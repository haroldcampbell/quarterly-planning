import { Epic, EpicID, Team, TeamEpics } from "./_defs";

export const URLAllTeams = "/teams";
export type AllTeamsResponse = {
    Teams: Team[];
    Epics: Epic[];
}

export const URLCreateEpic = "/epic/create";
export type CreateTeamResponse = {
    EpicID: EpicID
}

export const URLUpdateEpic = "/epic/update";


export const URLCreateDependencyConnetions = "/dependency/create";
export type CreateDependencyConnetionsResponse = {}

export const URLUpdateTeam = "/team/update";
