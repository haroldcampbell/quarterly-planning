import { ScreenTransitions, contextMenuAppDelegateKeyboardHandler, contextMenuAppDelegateMouseHandler } from "../core/lib";
import {initXCSRFToken} from "../core/xcsrft";
import { initScreens } from "./screens";

export function appStart(rootContainer: any) {
    console.log("Booting...");

    initScreens();
    initXCSRFToken();

    rootContainer.onclick = () => {
        contextMenuAppDelegateMouseHandler();
    }

    document.addEventListener("keydown",  (event:KeyboardEvent) => {
        contextMenuAppDelegateKeyboardHandler(event);
    });

    ScreenTransitions.setRootContainer(rootContainer);
    ScreenTransitions.transitionToLocation();
}
