import * as lib from "../../core/lib";
import { Epic } from "../home_screen/_defs";
import { addEpic } from "./epics";
import { addEpicToTeamEpic } from "./teamEpics";

export * from "./teams"
export * from "./epics"
export * from "./teamEpics"
export * from "./connections"

export function addNewEpicAtIndex(epic: Epic) {
    addEpicToTeamEpic(epic.TeamID, epic);
    addEpic(epic);
}

export function initWeekSlots(): string[] {
    return "a".split(",");
}