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

export type InputChangeCallback = (e: Event, dataOptionKey: string) => void;

export enum SelectedEpicDetailsDataOptions {
    TeamName = "selected-epic-details[team-name]",
    EpicName = "selected-epic-details[epic-name]",
}

export const OSubjectWillUpdateTeamName = "will-update-team-name";
export const OSubjectWillUpdateEpicName = "will-update-epic-name";