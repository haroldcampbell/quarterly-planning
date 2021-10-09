import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";
import { DependencyTableView } from "./dependencyTableView";

/** @jsx gtap.$jsx */

export class DownstreamDetailsView extends lib.BaseView {
    private dependencyWrapper = <div className="dependency-wrapper-container"></div>;

    private content = <div className='selected-epic-details-container__downstream rows' >
        <div className="row-cell">
            <div className="cell">
                <div className="rows">
                    <div className="row-cell-2">
                        <div className="cell dependency-info">
                            <h3>1</h3>
                            <label><span>DOWNSTREAM</span><br /><span>DEPENDENCIES</span></label>
                        </div>
                        <div className="cell-right">
                            <button className="flat-btn add-downstream-dep">+</button>
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

    loadSubviews(viewContent: any) {
        lib.LoadSubviews(this.views, viewContent);
    }

    viewContent() {
        return this.content;
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