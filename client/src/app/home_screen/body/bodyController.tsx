
import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";

/** @jsx gtap.$jsx */

import "./body.css"
import { DependencyViewController } from "./dependencyView/dependencyViewController";

class BodyView extends lib.BaseView {
    private content = <div className='body-container' />;

    viewContent() {
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

export class BodyController extends lib.BaseViewController {
    protected _view: lib.IView = new BodyView(this);

    private teamsViewController = new DependencyViewController(this);

    initView() {
        this.teamsViewController.initController();
        this.view.addView(this.teamsViewController.view);

        super.initView();
    }
}

