import * as lib from "../../core/lib";
import { Epic, EpicID } from "../home_screen/_defs";
import { URLCreateEpic, CreateEpicResponse, URLUpdateEpic, URLDeleteEpic, DeleteEpicResonse } from "../home_screen/_defsServerResponses";
import { UnlinkEpicConnection } from "./connections";

/** Contains epicID -> Epic mapping */
let _epicsByID: Map<string, Epic>;

export function getEpicByID(epicID: string): Epic | undefined {
    return _epicsByID.get(epicID);
}

export function getEpics(): Epic[] {
    return [..._epicsByID.values()];
}

export function addEpic(epic: Epic) {
    _epicsByID.set(epic.ID, epic);
}

export function setEpics(epics: Epic[]) {
    _epicsByID = new Map<string, Epic>()

    epics.forEach(epic => {
        // epic.Upstreams = epic.Upstreams === null ? [] : epic.Upstreams;
        _epicsByID.set(epic.ID, epic)
    })

    // processDownstreamEpics()
}

/** Creates the epic on the remote sever */
export function RequestCreateTeamEpics(epic: Epic, onEpicCreatedCallback: (newEpic: Epic) => void): void {
    lib.apiPostRequest(
        URLCreateEpic,
        (formData: FormData) => {
            formData.append("epic-json-data", JSON.stringify(epic));
        },
        (ajax, data) => {
            if (data.successStatus == false) {
                alert("Error creating epic. Please try again.");
                return;
            }

            const response: CreateEpicResponse = data.jsonBody
            epic.ID = response.EpicID;

            onEpicCreatedCallback(epic);
        },
    );
}

/** Updates epic on the remote sever */
// export function RequestUpdateEpic(epicID: string, value: string, onEpicUpdatedCallback: (newEpic: Epic) => void): void {
export function RequestUpdateEpic(epicID: string, value: { [key: string]: any }, onEpicUpdatedCallback: (newEpic: Epic) => void): void {
    const epic = getEpicByID(epicID)!;
    epic.Name = value.Name ?? epic.Name;
    epic.Size = value.Size ?? epic.Size;
    epic.ExpectedStartPeriod = value.ExpectedStartPeriod ?? epic.ExpectedStartPeriod;

    lib.apiPostRequest(
        URLUpdateEpic,
        (formData: FormData) => {
            formData.append("epic-json-data", JSON.stringify(epic));
        },
        (ajax, data) => {
            if (data.successStatus == false) {
                alert("Error updating epic. Please try again.");
                return;
            }

            onEpicUpdatedCallback(epic);
        },
    );
}

export function RequestDeleteEpic(epicID: EpicID, onEpicDeletedCallback: () => void) {
    lib.apiPostRequest(
        URLDeleteEpic,
        (formData: FormData) => {
            formData.append("epic-id", epicID);
        },
        (ajax, data) => {
            if (data.successStatus == false) {
                alert("Error removing epic. Please try again.");
                return;
            }

            DeleteEpicByEpicID(epicID);
            onEpicDeletedCallback();
        },
    );
}

export function DeleteEpicByEpicID(epicID: EpicID) {
    UnlinkEpicConnection(epicID);

    // remove the epic for the list of epics
    _epicsByID.delete(epicID);
}