import { CalcEpicWeekPosition, EpicSizeToWidth, PlaceTextWithEllipsis, EpicWeekPosition, XYOnly, EpicSizes, NodePos } from "../common/nodePositions";

export interface GTapElement extends HTMLElement {
    $appendCSS(className: string): void;
    $removeCSS(className: string): void;
    $style(cssStyle?: string): string;
    $hasClass(className: string): boolean;
    remove(): void;
}

export type EpicID = string;
export type TeamID = string;


export type PathInfo = {
    p: any,
    start: XYOnly,
    end: XYOnly,
    upstreamEpicID: EpicID,
    downstreamEpicID: EpicID,
};

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

const shapeCornerRadius = 5;

export const ShapeHeight = 20;
export const InterRowGap = 10; /** The horizontal space between epics for the same team */


export class EpicViewSVGNode {
    svgRectNode: any;
    svgTextNode: any;
    parentNode: any;

    constructor(pNode: any, r: any, t: any) {
        this.parentNode = pNode;
        this.svgRectNode = r;
        this.svgTextNode = t;
    }

    textNodeWidth(): number {
        return this.svgTextNode.$textBoundingBox().width;
    }

    sizeSVGNodes(epic: Epic) {
        const width = EpicSizeToWidth(epic.Size)!

        this.svgRectNode.$width(width);
        this.svgRectNode.$height(ShapeHeight);
        this.svgRectNode.$rxy(shapeCornerRadius);

        PlaceTextWithEllipsis(this.svgTextNode, epic.Name, width);
    }

    calcPositionInfo(epic: Epic, boundsY: number): EpicWeekPosition {
        return CalcEpicWeekPosition(epic.ExpectedStartPeriod,
            boundsY,
            epic.Size,
            this.textNodeWidth());
    }

    updateNodePos(nodePos: NodePos) {
        this.svgRectNode.$x(nodePos.rectPos.x);
        this.svgRectNode.$y(nodePos.rectPos.y);

        this.svgTextNode.$x(nodePos.textPos.x);
        this.svgTextNode.$y(nodePos.textPos.y);
    }
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

/** Notifies listeners that the epic changed. */
export const OSubjectDidChangeEpic = "did-change-epic-attributes";

/** Notifies listeners that a new team was added */
export const OSubjectDidCreateNewTeam = "did-create-new-team";