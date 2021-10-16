export interface GTapElement extends HTMLElement {
    $appendCSS(className: string): void;
    $removeCSS(className: string): void;
}

export type EpicID = string;
export type TeamID = string;
export type XYOnly = { x: number, y: number };
export type PathInfo = {
    p: any,
    start: XYOnly,
    end: XYOnly,
    upstreamEpicID: EpicID,
    downstreamEpicID: EpicID,
};

export enum EpicSizes {
    XSmall = 0.5, // 1/2 Sprint
    Small = 1, // 1 Sprint
    Medium = 2, // 2 Sprints
    Large = 3, // 3 Sprints
    XLarge = 5, // 5 Sprints
    Unknown = 11 // More than 5 Sprints
}
export type Epic = {
    ID: string;
    TeamID: string;
    Name: string;
    Size: EpicSizes;
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

export type TeamEpicDependency = {
    Team: Team;
    Epic: Epic;
}

export const SVGContainerID = "dependency-connections";

export type InputChangeCallback = (e: Event, dataOptionKey: string) => void;

export enum SelectedEpicDetailsDataOptions {
    TeamName = "selected-epic-details[team-name]",
    EpicName = "selected-epic-details[epic-name]",
}

/** The data has been fetched and processed */
export const OSubjectDataStoreReady = "data-store-data-ready";

export const OSubjectWillUpdateTeamName = "will-update-team-name";
export const OSubjectWillUpdateEpicName = "will-update-epic-name";

export const OSubjectCreateNewEpic = "create-new-epic";