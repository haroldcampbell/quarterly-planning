export type Epic = {
    ID: string;
    Name: string;
    Upstreams?: string[];
}

export type Team = {
    Name: string
}

export type TeamEpics = {
    Team: Team;
    Epics: Epic[];
}

export const SVGContainerID = "dependency-connections";
