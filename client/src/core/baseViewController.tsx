import * as gtap from "../../www/dist/js/gtap";
import { IView, IViewController, IScreenController } from "./_common";

/** @jsx gtap.$jsx */

export abstract class BaseViewController implements IViewController {
    protected abstract _view: IView;

    readonly parentController: IViewController | IScreenController;

    constructor(parentController: IViewController | IScreenController) {
        this.parentController = parentController;
    }

    get view(): IView {
        return this._view;
    }

    initView() {}

    initController() {
        this.initView();
    }
}
