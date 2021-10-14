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