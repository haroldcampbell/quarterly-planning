import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";

/** @jsx gtap.$jsx */

import "./dependencyTableView.css"

export class DependencyTableView extends lib.BaseView {
    private content = <div className='dependency-table-view-container' />

    viewContent() {
        return this.content;
    }

    initView() {
        const headerRow = <thead>
            <tr>
                <th className="epic-connection"></th>
                <th className="team-names"><label>TEAMS</label></th>
                <th className="epic-names"><label>EPICS</label></th>
            </tr>
        </thead>;

        const tbody = <tbody></tbody>;
        const table = <table>
            {headerRow}
            {tbody}
        </table>;


        this.addTableRows(tbody, true, "XXX1", "AAA");
        this.addTableRows(tbody, true, "XXaaaaass cccc dd ddd X2", "ABB");
        this.addTableRows(tbody, false, "XXX3", "ACC");
        this.addTableRows(tbody, false, "XXX4", "DDD");
        this.addTableRows(tbody, true, "XXX5", "ASD");
        this.addTableRows(tbody, true, "XXX6", "ATSD");

        this.content.appendChild(table);
        super.initView();
    }

    addTableRows(tableNode: HTMLElement, directConnection: boolean, teamName: string, epicName: string) {
        const connection = directConnection ? "@" : "";

        const tableRow = <tr>
            <td className="epic-connection">{connection}</td>
            <td className="team-names"><div>{teamName}</div></td>
            <td className="epic-names"><div>{epicName}</div></td>
        </tr>;

        tableNode.appendChild(tableRow);
    }
}
