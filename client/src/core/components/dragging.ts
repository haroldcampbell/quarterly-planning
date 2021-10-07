// import { IHTMLNode } from "../_common";
import { $onEvent } from "./fileUpload/file-uploader-utils";

export type DropContext = {
    parentNode?: HTMLElement;
    node?: HTMLElement;
    callback: (e: DragEvent) => void;
    preDragCallback?: (context: DropContext) => void;
    postDragCallback?: (context: DropContext) => void;
};

export function wireDragDrop(
    node: HTMLElement,
    dropContext: DropContext,
    dropEnterContext?: DropContext,
    dropEndContext?: DropContext
) {
    $onEvent(
        node,
        "drag dragstart dragend dragover dragenter dragleave drop",
        (e: any) => {
            e.preventDefault();
            e.stopPropagation();
        }
    );
    $onEvent(dropContext.node || node, "drop", dropContext.callback);

    if (dropEnterContext) {
        $onEvent(
            dropEnterContext.node || node,
            "dragover dragenter",
            dropEnterContext.callback
        );
    }

    if (dropEndContext) {
        $onEvent(
            dropEndContext.node || node,
            "dragleave dragend drop",
            dropEndContext.callback
        );
    }
}
