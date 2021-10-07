export type Epic = {
    Name: string;
    // Upstreams:
    // Downstreams:
}

export type Team = {
    Name: string
}

export type TeamEpics = {
    Team: Team;
    Epics: Epic[];
}