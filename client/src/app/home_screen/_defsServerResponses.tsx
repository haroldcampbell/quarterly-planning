import { Epic, EpicConnection, EpicID, Team, TeamEpics, TeamID } from "./_defs";

/** Teams */
export const URLAllTeams = "/teams";
export type AllTeamsResponse = {
    Teams: Team[];
    Epics: Epic[];
    EpicConnections: EpicConnection[];
}
export const URLUpdateTeam = "/team/update";
export const URLDeleteTeam = "/team/delete";

/** Epics */
export const URLCreateEpic = "/epic/create";
export type CreateTeamResponse = {
    EpicID: EpicID
}

export const URLUpdateEpic = "/epic/update";
export const URLDeleteEpic = "/epic/delete";
export type DeleteEpicResonse = {
    EpicID: EpicID;
    TeamID: TeamID;
    EpicsDeleted: number;
    DownstreamConnectionsDeleted: number;
}

/** Connections */
export const URLCreateDependencyConnetions = "/dependency/create";
export type CreateDependencyConnetionsResponse = {}

