export type Epic = {
    ID: string;
    TeamID: string;
    Name: string;
    Upstreams?: string[];
}

export type Team = {
    ID: string;
    Name: string
}

export type TeamEpics = {
    Team: Team;
    Epics: Epic[] | undefined;
}

export const SVGContainerID = "dependency-connections";
