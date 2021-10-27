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

export const URLCreateDependencyConnetions = "/dependency/create";
export type CreateDependencyConnetionsResponse = {

}