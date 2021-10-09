import * as gtap from "../../../www/dist/js/gtap";
import * as lib from "../../core/lib";

/** @jsx gtap.$jsx */

import "./homeScreen.css"
import { ScreenNavController } from "./nav/screenNavController";
import { BodyController } from "./body/bodyController";
import { SelectedEpicDetailsController } from "./selectedEpicDetails/selectedEpicDetailsViewController";

class MainPanelView extends lib.BaseView {
    viewContent() {
        return <div className='screen-main-panel-container' />;
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

class DetailsPanelView extends lib.BaseView {
    viewContent() {
        return <div className='screen-details-panel-container' />;
    }

    loadSubviews(viewContent: any) {
        this.views.forEach((v) => {
            const vContent = v.viewContent();

            v.loadSubviews(vContent);
            viewContent.appendChild(vContent);
        });
    }
}

class HomeScreen extends lib.BaseScreen {
    screenContent() {
        return <div className='home-screen' />;
    }

    loadSubviews(viewContent: any) {
        this.views.forEach((v) => {
            const vContent = v.viewContent();

            v.loadSubviews(vContent);
            viewContent.appendChild(vContent);
        });
    }
}

export class HomeScreenController extends lib.BaseScreenController {
    protected _screen: lib.IScreen = new HomeScreen(this);

    private screenNavController = new ScreenNavController(this);
    private bodyController = new BodyController(this);
    private selectedEpicDetails = new SelectedEpicDetailsController(this);

    initScreen() {
        const mainPanelView = new MainPanelView(this)
        const detailsPanelView = new DetailsPanelView(this)

        this.screenNavController.initController();
        this.bodyController.initController();
        mainPanelView.addView(this.screenNavController.view);
        mainPanelView.addView(this.bodyController.view);
        this._screen.addView(mainPanelView);

        this.selectedEpicDetails.initController();
        detailsPanelView.addView(this.selectedEpicDetails.view);
        this._screen.addView(detailsPanelView);

        super.initScreen();
    }

    initController() {
        window.history.pushState({}, "", "/");
        super.initController();
    }
}