import * as lib from "../../core/lib";
import { Epic, EpicID, OSubjectWillUpdateEpicName } from "../home_screen/_defs";
import { URLCreateEpic, CreateTeamResponse, URLUpdateEpic } from "../home_screen/_defsServerResponses";
import { getEpicsByTeamID } from "./teamEpics";
import { processDownstreamEpics } from "./connections";

/** Contains epicID -> Epic mapping */
let _epicsByID: Map<string, Epic>;

export function getEpicByID(epicID: string): Epic | undefined {
    return _epicsByID.get(epicID);
}

export function getEpics(): Epic[] {
    return [..._epicsByID.values()].flat();
}

export function addEpic(epic: Epic) {
    _epicsByID.set(epic.ID, epic);
}

export function setEpics(epics: Epic[]) {
    _epicsByID = new Map<string, Epic>()

    epics.forEach(epic => {
        epic.Upstreams = epic.Upstreams === null ? [] : epic.Upstreams;
        _epicsByID.set(epic.ID, epic)
    })

    processDownstreamEpics()
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

            const response: CreateTeamResponse = data.jsonBody
            epic.ID = response.EpicID;

            onEpicCreatedCallback(epic);
        },
    );
}

/** Updates epic on the remote sever */
export function RequestUpdateEpic(epicID: string, value: string, onEpicUpdatedCallback: (newEpic: Epic) => void): void {
    const epic = getEpicByID(epicID)!;
    epic.Name = value;

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

            console.log(">>>[RequestUpdateEpic] data.jsonBody", data.jsonBody)

            onEpicUpdatedCallback(epic);
        },
    );
}