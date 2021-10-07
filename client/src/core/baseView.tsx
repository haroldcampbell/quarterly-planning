import * as gtap from "../../www/dist/js/gtap";
import { IView, IViewController, IScreenController } from "./_common";

/** @jsx gtap.$jsx */

export type BaseViewParent = IViewController | IScreenController;
export abstract class BaseView implements IView {
    readonly parentController: IViewController | IScreenController;
    readonly views: IView[] = [];

    constructor(parent: BaseViewParent) {
        this.parentController = parent;
    }

    initView() {
        this.views.forEach((v) => {
            v.initView();
        });
    }

    viewContent(): HTMLElement {
        return <div className=''> </div>;
    }

    loadSubviews(viewContent: any) {}

    addView(subView: IView) {
        this.views.push(subView);
    }
}
