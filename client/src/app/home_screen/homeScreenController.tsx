import * as gtap from "../../../www/dist/js/gtap";
import * as lib from "../../core/lib";

/** @jsx gtap.$jsx */

import "./homeScreen.css"
import { HomeNavController } from "./nav/homeNavController";
import { BodyController } from "./body/bodyController";
import { SelectedEpicDetailsController } from "./selectedEpicDetails/selectedEpicDetailsViewController";
import { Epic, EpicID, OSubjectUnHighlightAllEpic, TeamEpicDependency } from "./_defs";
import { AddDependencyDialogController, OSubjectViewAddDependencyDialog } from "./selectedEpicDetails/addDependencyDialogController";

class MainPanelView extends lib.BaseView {
    private content = <div className='screen-main-panel-container' />

    viewContent() {
        /** So that a new Instance is not created each time viewContent is called */
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

class DetailsPanelView extends lib.BaseView {
    private content = <div className='screen-details-panel-container' />;

    viewContent() {
        /** So that a new Instance is not created each time viewContent is called */
        return this.content;
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
    private content = <div className='home-screen' />;

    screenContent() {
        /** So that a new Instance is not created each time viewContent is called */
        return this.content;
    }

    loadSubviews(viewContent: any) {
        this.views.forEach((v) => {
            const vContent = v.viewContent();

            v.loadSubviews(vContent);
            viewContent.appendChild(vContent);
        });
    }
}

export class HomeScreenController extends lib.BaseScreenController implements lib.IObserver {
    protected _screen: lib.IScreen = new HomeScreen(this);

    private homeNavController = new HomeNavController(this);
    private bodyController = new BodyController(this);
    private selectedEpicDetails = new SelectedEpicDetailsController(this);

    initScreen() {
        const mainPanelView = new MainPanelView(this)
        const detailsPanelView = new DetailsPanelView(this)

        this.homeNavController.initController();
        this.bodyController.initController();
        mainPanelView.addView(this.homeNavController.view);
        mainPanelView.addView(this.bodyController.view);
        this._screen.addView(mainPanelView);

        this.selectedEpicDetails.initController();
        detailsPanelView.addView(this.selectedEpicDetails.view);
        this._screen.addView(detailsPanelView);

        super.initScreen();

        lib.Observable.subscribe(OSubjectViewAddDependencyDialog, this);
    }

    initController() {
        window.history.pushState({}, "", "/");
        this.wireKeyboardEvent();
        super.initController();
    }

    wireKeyboardEvent() {
        const _this = this;
        document.addEventListener("keydown", function (event) {
            switch (event.which) {
                case 27: {
                    _this.onEscapeKeyPressed();
                    break;
                }
            }
        });
    }

    onEscapeKeyPressed() {
        if (this.selectedEpicDetails.isSidePandelActive) {
            this.selectedEpicDetails.onHideEpicDetails();
            return;
        }
        lib.Observable.notify(OSubjectUnHighlightAllEpic, {
            source: this,
            value: {}
        });
    }

    onUpdate(subject: string, state: lib.ObserverState): void {
        switch (subject) {
            case OSubjectViewAddDependencyDialog: {
                const { selectedEpic, upstreamEpics, downstreamEpics } = state.value;
                this.onShowDependencyDialog(selectedEpic, upstreamEpics, downstreamEpics);
                break;
            }
        }
    }

    onShowDependencyDialog(selectedEpic: Epic, upstreamEpics: Map<EpicID, TeamEpicDependency>, downstreamEpics: Map<EpicID, TeamEpicDependency>) {
        const detailsController = new AddDependencyDialogController(this);

        detailsController.DownstreamEpic = selectedEpic;
        detailsController.ExistingUpstreamDetails = upstreamEpics;
        detailsController.ExistingDownstreamDetails = downstreamEpics;
        detailsController.initController();
        detailsController.showDialog();
    }
}