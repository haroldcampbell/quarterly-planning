import { ScreenTransitions } from "../core/lib";

import { HomeScreenController } from "./home_screen/homeScreenController";

export enum Screens {
    AppStartScreen = "AppStart",
    // CreateNewProjectScreen = "CreateNewProject",
}
export function initScreens() {
    // ScreenTransitions.addTransition(Screens.CreateNewProjectScreen, {
    //     locationPrefix: "/project/",
    //     screenController: EditorScreenController,
    // });

    ScreenTransitions.addTransition(Screens.AppStartScreen, {
        location: "/",
        screenController: HomeScreenController,
    });
}
