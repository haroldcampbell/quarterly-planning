import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";
import { DependencyTableView } from "./dependencyTableView";

/** @jsx gtap.$jsx */

export class UpstreamDetailsView extends lib.BaseView {
    private dependencyWrapper = <div className="dependency-wrapper-container"></div>;

    private content = <div className='selected-epic-details-container__upstream rows' >
        <div className="row-cell">
            <div className="cell">

                <div className="rows">
                    <div className="row-cell-2">
                        <div className="cell dependency-info">
                            <h3>7</h3>
                            <label><span>UPSTERAM</span><br /><span>DEPENDENCIES</span></label>
                        </div>
                        <div className="cell-right">
                            <button className="flat-btn add-upstream-dep">+</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <div className="row-cell">
            <div className="cell">
                {this.dependencyWrapper}
            </div>
        </div>
    </div>;

    viewContent() {
        return this.content;
    }

    loadSubviews(viewContent: any) {
        lib.LoadSubviews(this.views, viewContent);
    }

    initView() {
        const dependencyTableView = new DependencyTableView(this.parentController);
        dependencyTableView.initView();

        this.dependencyWrapper.appendChild(<div>
            {dependencyTableView.viewContent()}
        </div>)

        super.initView();
    }
}