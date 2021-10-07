import * as gtap from "../../www/dist/js/gtap";
import { IView, IViewController, IScreen, IScreenController } from "./_common";

/** @jsx gtap.$jsx */

export abstract class BaseScreen implements IScreen {
    readonly parentController: IScreenController;
    readonly views: IView[] = [];

    constructor(parent: IScreenController) {
        this.parentController = parent;
    }

    abstract screenContent(): any;

    initScreen(contextData?: any) {
        this.views.forEach((v) => {
            v.initView();
        });
    }

    loadSubviews(viewContent: any) {}

    addView(subView: IView) {
        this.views.push(subView);
    }
}
