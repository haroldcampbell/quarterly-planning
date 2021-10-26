import { Epic, Team, TeamEpics } from "./_defs";

export type AllTeamsResponse = {
    Teams: Team[];
    Epics: Epic[];
}