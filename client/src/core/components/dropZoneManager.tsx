import * as gtap from "../../../www/dist/js/gtap";
import * as lib from "../lib";
import { $onEvent } from "./fileUpload/file-uploader-utils";

import { wireDragDrop, DropContext } from "./dragging";
// import { IHTMLNode } from "../_common";

/** @jsx gtap.$jsx */

export class DropZoneManager {
    private static readonly singleton = new DropZoneManager();

    private contexts: { [key: string]: DropContext } = {};

    wireDropZoneEvents(target: HTMLElement, context: DropContext) {
        $onEvent(
            target,
            "drag dragstart dragend dragover dragenter dragleave drop",
            (e: DragEvent) => {
                e.preventDefault();
                e.stopPropagation();
            }
        );

        $onEvent(target, "drop", (e: DragEvent) => {
            context.callback(e);
            this.postDragEvent(context);
        });

        $onEvent(target, "dragend drop", () => {
            if (context.node === undefined) {
                return;
            }
            context.node.remove();
            context.node = undefined;
        });
    }

    wireTargetEvents(target: EventTarget | null, context: DropContext) {
        $onEvent(
            target,
            "drag dragstart dragend dragover dragenter dragleave drop",
            (e: DragEvent) => {
                e.stopPropagation();
            }
        );

        $onEvent(target, "dragend drop", () => {
            if (context.node === undefined) {
                return;
            }
            context.node.remove();
            context.node = undefined;
            this.postDragEvent(context);
        });
    }

    preDragEvent(context: DropContext) {
        if (context.preDragCallback) {
            context.preDragCallback(context);
        }
    }

    postDragEvent(context: DropContext) {
        if (context.postDragCallback) {
            context.postDragCallback(context);
        }
    }

    wireOnDragStart(e: DragEvent, dragEventName: string, data: any) {
        const context = DropZoneManager.singleton.contexts[dragEventName];
        if (context === undefined) {
            return;
        }

        e.dataTransfer?.setData("text/plain", JSON.stringify(data));
        if (context.node === undefined) {
            context.node = DropZoneManager.createDropZone();
        }
        context.parentNode!.appendChild(context.node);

        this.preDragEvent(context);
        this.wireDropZoneEvents(context.node, context);
        this.wireTargetEvents(e.target, context);
    }

    static onDragStart(e: DragEvent, dragEventName: string, data: any) {
        DropZoneManager.singleton.wireOnDragStart(e, dragEventName, data);
    }

    static createDropZone(): HTMLElement {
        return <div className='drop-zone-container'></div>;
    }

    static registerDropZone(dragEventName: string, context: DropContext) {
        DropZoneManager.singleton.contexts[dragEventName] = context;
    }

    static dumpDropZones() {
        console.log("[dumpDropZones] ", DropZoneManager.singleton.contexts)
    }
}
