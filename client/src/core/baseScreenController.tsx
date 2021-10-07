import * as gtap from "../../www/dist/js/gtap";
import { IView, IScreen, IScreenController } from "./_common";

/** @jsx gtap.$jsx */

export abstract class BaseScreenController implements IScreenController {
    protected abstract _screen: IScreen;

    readonly parentContainer: any;

    constructor(container: any) {
        this.parentContainer = container;
    }

    get screen(): IScreen {
        return this._screen;
    }

    initScreen(contextData?: any) {
        this.screen.initScreen(contextData);
    }

    loadScreen() {
        const screenContent = this.screen.screenContent();

        this.screen.loadSubviews(screenContent);
        this.parentContainer.appendChild(screenContent);
    }

    initController(contextData?: any) {
        this.initScreen(contextData);
        this.loadScreen();
    }
}
