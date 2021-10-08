export type Epic = {
    ID: any;
    Name: string;
    Upstreams?: any[];
}

export type Team = {
    Name: string
}

export type TeamEpics = {
    Team: Team;
    Epics: Epic[];
}