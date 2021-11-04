export interface GTapElement extends HTMLElement {
    $appendCSS(className: string): void;
    $removeCSS(className: string): void;
    $style(cssStyle?: string): string;
    $hasClass(className: string): boolean;
    remove(): void;
}

export type EpicID = string;
export type TeamID = string;
export type XYOnly = { x: number, y: number };
export type SizeOnly = {
    width: number;
    height: number;
}

export type PathInfo = {
    p: any,
    start: XYOnly,
    end: XYOnly,
    upstreamEpicID: EpicID,
    downstreamEpicID: EpicID,
};

export enum EpicSizes {
    XSmall = 0.5, // 1/4 Sprint, 2-ish Days?
    Small = 1, // 1/2 Sprint, 5 Days
    Medium = 2, // 1 Sprint, 10 Days
    Large = 3, // 2 Sprints, 20 Days
    XLarge = 5, // 4 Sprints, 40 Days
    Unknown = 11 // at least Sprints, 60 Days
}

export type Epic = {
    ID: EpicID;
    TeamID: string;
    Name: string;
    Size: EpicSizes;
    /**
     * ExpectedStartPeriod: Week-based increment, with half increment resolution.
     * Valid input:
     *  - 1, 1.5, 2, 2.5, etc...
     * */
    ExpectedStartPeriod: number;
    // Upstreams?: string[];
}

export type EpicConnection = {
    UpstreamEpicID: EpicID;
    DownstreamEpicID: EpicID;
}

export type EpicViewSVGNode = {
    svgRectNode: any;
    svgTextNode: any;
    parentNode: any;
}

export type SelectedEpicInfo = {
    epic: Epic;
    selectedEpicViewSVGNode: EpicViewSVGNode;
    activePeriods: DateMonthPeriod[];
}

export type Team = {
    ID: string;
    Name: string
}

export type TeamEpics = {
    Team: Team;
    Epics: Epic[];
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

export type WeekDetail = {
    weekIndex: number;
    startDate: Date;
    endDate: Date;
}

export type DateMonthPeriod = {
    startMonth: Date;
    endMonth: Date;
    weekDetails: WeekDetail[];
}

/**
 * Used in the SelectedEpicDetails side pandel
 */
export type EpicDateInfo = {
    date: Date;
    quarterWeekIndex: number;
    text: string;
}

/** The data has been fetched and processed */
export const OSubjectDataStoreReady = "data-store-data-ready";

export const OSubjectWillUpdateTeamName = "will-update-team-name";
export const OSubjectWillUpdateEpicName = "will-update-epic-name";

/** The user wants to create a new team epic */
export const OSubjectCreateNewEpicRequest = "request-create-new-epic";

/** The height of an epics countroller changed */
export const OSubjectChangedTeamEpicHeightBounds = "did-update-team-epic-height-bounds"

/** Unhighlighted and unselect all epics*/
export const OSubjectUnHighlightAllEpic = "unhighlight-all-epics";

/** Highlight epic if it is an upstream epic of the selected epic */
export const OSubjectHighlightUpstreamEpic = "highlight-upstream-epic";

/** Highlight epic if it is a downstream epic of the selected epic */
export const OSubjectHighlightDownstreamEpic = "highlight-downstream-epic";

/** Dim the epics that are related to, impacted by, or impacting, the selected epic */
export const OSubjectDimUnhighlightedEpics = "dim-unhighlighted-epics";

/** Notifies listeners that the epic size changed. */
export const OSubjectDidChangeEpicSize = "did-change-epic-size";