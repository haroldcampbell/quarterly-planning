import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";

/** @jsx gtap.$jsx */

import "./dependencyTableView.css"

export class DependencyTableView extends lib.BaseView {
    private content = <div className='dependency-table-view-container' />

    private tbody = <tbody></tbody>;
    private table = <table>
        <thead>
            <tr>
                <th className="epic-connection"></th>
                <th className="team-names"><label>TEAMS</label></th>
                <th className="epic-names"><label>EPICS</label></th>
            </tr>
        </thead>
        {this.tbody}
    </table>;

    viewContent() {
        return this.content;
    }

    initView() {
        this.content.appendChild(this.table);
        super.initView();
    }

    clearTableRows() {
        this.tbody.innerText = "";
    }

    addTableRows(directConnection: boolean, teamName: string, epicName: string) {
        const connection = directConnection ? "@" : "";

        const tableRow = <tr>
            <td className="epic-connection">{connection}</td>
            <td className="team-names"><div>{teamName}</div></td>
            <td className="epic-names"><div>{epicName}</div></td>
        </tr>;

        this.tbody.appendChild(tableRow);
    }
}
