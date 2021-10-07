import * as gtap from "../../../www/dist/js/gtap";
import * as lib from "../../core/lib";

/** @jsx gtap.$jsx */

import "./homeScreen.css"
import { ScreenNavController } from "./nav/screenNavController";
import { BodyController } from "./body/bodyController";

class Screen extends lib.BaseScreen {
    private content = (<div className='home-screen' />);

    screenContent() {
        return this.content;
    }

    loadSubviews(viewContent: any) {
        const wrapper = (
            <div className='view-container home-view-container'></div>
        );

        this.views.forEach((v) => {
            const vContent = v.viewContent();

            v.loadSubviews(vContent);
            wrapper.appendChild(vContent);
        });

        viewContent.appendChild(wrapper);
    }
}

export class HomeScreenController extends lib.BaseScreenController {
    protected _screen: lib.IScreen = new Screen(this);

    private screenNavController = new ScreenNavController(this);
    private bodyController = new BodyController(this);

    initScreen() {
        this.screenNavController.initController();
        this.bodyController.initController();

        this._screen.addView(this.screenNavController.view);
        this._screen.addView(this.bodyController.view);

        super.initScreen();
    }

    initController() {
        window.history.pushState({}, "", "/");
        super.initController();
    }
}