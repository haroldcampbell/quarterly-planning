import * as gtap from "../../../../www/dist/js/gtap";
import * as lib from "../../../core/lib";
import * as dataStore from "../../data/dataStore";

import { epicSizeInDays, MilliSecondsInDay, EpicSizes } from "../../common/nodePositions";
import { DateMonthPeriod, Epic, EpicDateInfo, InputChangeCallback, OSubjectDidChangeEpic, SelectedEpicDetailsDataOptions } from "../_defs";
import { DropDownController } from "../../../core/components/dropDownController";

/** @jsx gtap.$jsx */

export class EpicDetailsView extends lib.BaseView {
    private epicSizeOptions = <select name="epicSizes">
        <option value="0.5">XSmall</option>
        <option value="1">Small</option>
        <option value="2">Medium</option>
        <option value="3">Large</option>
        <option value="5">XLarge</option>
        <option value="11">Unknown</option>
    </select>;

    private epicSizeNode = <div>{this.epicSizeOptions}</div>;
    private epicStartWeekContainerNode = <div className="start-date-container"></div>

    private epicNameElm = <input data-option={SelectedEpicDetailsDataOptions.EpicName} type='text' />;
    private expectedEndWeekNode = <h3></h3>;

    private content = <div className='selected-epic-details-container__epic rows' >
        <div className="row-cell">
            <div className="cell">
                <label>SELECTED EPIC</label>
                {this.epicNameElm}
            </div>
        </div>
        <div className="row-cell">
            <div className="cell">
                <label>ESTIMATED SIZE</label>
                {this.epicSizeNode}
            </div>
        </div>
        <div className="row-cell-2">
            <div className="cell">
                <label>EXPECTED STARTED</label>
                {this.epicStartWeekContainerNode}
            </div>
            <div className="cell">
                <label>PROJECTED END</label>
                {this.expectedEndWeekNode}
            </div>
        </div>
    </div>;

    private selectedEpic?: Epic;
    private activePeriods?: DateMonthPeriod[];
    public onInputChanged?: InputChangeCallback;
    private dropDown = new DropDownController(this.parentController);

    viewContent() {
        return this.content;
    }

    initView() {

        this.epicNameElm.onchange = (e: Event) => {
            this.onInputChanged?.(e, SelectedEpicDetailsDataOptions.EpicName);
        };

        this.epicSizeOptions.onchange = () => {
            var selectedInput = this.epicSizeOptions.options[this.epicSizeOptions.selectedIndex].value;
            this.onEpicSizeChanged(selectedInput);
        }

        this.initStartDateContent()
        super.initView();
    }

    initStartDateContent() {
        const btnClick = (weekNum: number) => {
            this.onStartWeekOptionSelected(weekNum);
        }

        const optionContent = <div className="start-date-options-container">
            <div className="month-name">Oct</div>
            <div className="weeks-container">
                <ul>
                    <li><button onclick={() => btnClick(1)}>W1</button></li>
                    <li><button onclick={() => btnClick(2)}>W2</button></li>
                    <li><button onclick={() => btnClick(3)}>W3</button></li>
                    <li><button onclick={() => btnClick(4)}>W4</button></li>
                </ul>
            </div>
            <div className="month-name">Nov</div>
            <div className="weeks-container">
                <ul>
                    <li><button onclick={() => btnClick(5)}>W5</button></li>
                    <li><button onclick={() => btnClick(6)}>W6</button></li>
                    <li><button onclick={() => btnClick(7)}>W7</button></li>
                    <li><button onclick={() => btnClick(8)}>W8</button></li>
                </ul>
            </div>
            <div className="month-name">DeC</div>
            <div className="weeks-container">
                <ul>
                    <li><button onclick={() => btnClick(9)}>W9</button></li>
                    <li><button onclick={() => btnClick(10)}>W10</button></li>
                    <li><button onclick={() => btnClick(11)}>W11</button></li>
                    <li><button onclick={() => btnClick(12)}>W12</button></li>
                </ul>
            </div>
        </div>

        this.dropDown.TextContentClassName = "selected-start-date-text";
        this.dropDown.addOptionContent(optionContent);
        this.dropDown.initController();
        this.epicStartWeekContainerNode.appendChild(this.dropDown.dropdownView.viewContent())
    }

    onStartWeekOptionSelected(weekNum: number) {
        this.dropDown.hideDropdownOptions();

        dataStore.RequestUpdateEpic(this.selectedEpic!.ID, { ExpectedStartPeriod: weekNum }, (newEpic: Epic) => {
            lib.Observable.notify(OSubjectDidChangeEpic, {
                source: this,
                value: { epic: newEpic },
            });

            this.onEpicSelected(newEpic, this.activePeriods!);
        });
    }

    onEpicSelected(epic: Epic, activePeriods: DateMonthPeriod[]) {
        const startDateInfo = getExpectedStartWeekInfo(epic, activePeriods);

        this.selectedEpic = epic;
        this.activePeriods = activePeriods;
        (this.epicNameElm as HTMLInputElement).value = epic.Name;

        this.epicSizeOptions.value = this.selectedEpic!.Size
        this.dropDown.onTextContentChanged(startDateInfo.text);
        this.expectedEndWeekNode.innerText = calProjectedEndWeek(epic, startDateInfo);
    }

    onEpicSizeChanged(newEpicSize: EpicSizes) {
        dataStore.RequestUpdateEpic(this.selectedEpic!.ID, { Size: Number(newEpicSize) }, (newEpic: Epic) => {
            lib.Observable.notify(OSubjectDidChangeEpic, {
                source: this,
                value: { epic: newEpic },
            });
        });
    }
}

function calProjectedEndWeek(epic: Epic, startDateInfo: EpicDateInfo): string {
    const startDate = startDateInfo.date;
    let numDaysInEpic = epicSizeInDays(epic.Size);

    let endDate = startDate;

    for (let offset = 0; offset < numDaysInEpic; offset++) {
        endDate = new Date(startDate.getTime() + offset * MilliSecondsInDay);

        if (endDate.getDay() == 0 || endDate.getDay() == 6) {
            numDaysInEpic++; // I don't want the weekends to count as work days.
            continue;
        }

    }

    const endDatetext = `${endDate.toLocaleString('default', { month: 'short', day: '2-digit' })} `
    return endDatetext;
}

function getExpectedStartWeekInfo(epic: Epic, activePeriods: DateMonthPeriod[]): EpicDateInfo {
    let periodIndex: number;
    const quarterWeekIndex = Math.floor(epic.ExpectedStartPeriod); // Index range 1 - 12

    if (quarterWeekIndex <= 4) {
        periodIndex = 0;
    } else if (quarterWeekIndex <= 8) {
        periodIndex = 1;
    } else {
        periodIndex = 2;
    }

    const activePeriod = activePeriods[periodIndex]
    const monthWeekIndex = (quarterWeekIndex - 1) % 4; // Index range 0 - 3;
    const week = activePeriod.weekDetails[monthWeekIndex];

    let epicStartDate = week.startDate;

    if (!Number.isInteger(epic.ExpectedStartPeriod)) {
        // Deal with the fractional epic.ExpectedStartPeriods (eg. 1.5, 2.5, 3.5)...
        if (epicStartDate.getDay() == 4 || epicStartDate.getDay() == 5) {
            // Thursday or Friday, shift by 5 days to cover the weekends
            epicStartDate = new Date(epicStartDate.getTime() + 4 * MilliSecondsInDay);
        } else {
            // Mon - Wed, shift by 3 days.
            epicStartDate = new Date(epicStartDate.getTime() + 2 * MilliSecondsInDay);
        }
    }

    return {
        date: epicStartDate,
        quarterWeekIndex: quarterWeekIndex,
        text: `${epicStartDate.toLocaleString('default', { month: 'short', day: '2-digit' })}`
        // / W${quarterWeekIndex
        // }`
    }

}