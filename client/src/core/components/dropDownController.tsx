import * as gtap from "../../../www/dist/js/gtap";
import { GTapElement } from "../../app/home_screen/_defs";
import * as lib from "../lib";

/** @jsx gtap.$jsx */

import "./dropDown.css"

const hiddenClassName = "drop-down-options-hidden";

class DropDownView extends lib.BaseView {
    private textContentInnerNode = <div></div>
    private textContentNode = <div className="drop-down-text-content">
        {this.textContentInnerNode}
    </div>
    private optionContentContainer = <div className="drop-down-option-content-container drop-down-options-hidden"></div>

    private content = <div className="drop-down-outer-container">
        {this.textContentNode}
        {this.optionContentContainer}
    </div>;

    onTextContentNodeClicked?: (e: MouseEvent) => void;

    set textContent(text: string) {
        this.textContentInnerNode.innerText = text;
    }

    viewContent(): HTMLElement {
        return this.content;
    }

    initView() {
        this.textContentNode.onclick = (e: MouseEvent) => {
            gtap.$stopMouseDefaults(e);

            if (this.onTextContentNodeClicked !== undefined) {
                this.toggleOptionsVisibility();
                this.onTextContentNodeClicked(e);
            }
        }

        this.wireKeyboardEvent();
        super.initView();
    }

    addTextContentClassName(cssClassName: string) {
        this.textContentInnerNode.$appendCSS(cssClassName);
    }

    wireKeyboardEvent() {
        const _this = this;
        document.addEventListener("keydown", function (event) {
            switch (event.which) {
                case 27: {
                    _this.hideOptions(true);
                    break;
                }
            }
        });
    }

    addOptionContent(optionContent: GTapElement) {
        this.optionContentContainer.innerText = "";
        this.optionContentContainer.appendChild(optionContent);
    }

    hideOptions(status: boolean) {
        if (status) {
            this.optionContentContainer.$appendCSS(hiddenClassName);
        } else {
            this.optionContentContainer.$removeCSS(hiddenClassName);
        }
    }

    toggleOptionsVisibility() {
        if (this.optionContentContainer.$hasClass(hiddenClassName)) {
            this.optionContentContainer.$removeCSS(hiddenClassName);
        } else {
            this.optionContentContainer.$appendCSS(hiddenClassName);
        }
    }
}

export class DropDownController extends lib.BaseViewController {
    protected _view: lib.IView = new DropDownView(this);

    onTextContentNodeClicked?: (e: MouseEvent) => void;

    get dropdownView(): DropDownView {
        return this._view as DropDownView;
    }

    set TextContentClassName(cssClassName: string) {
        this.dropdownView.addTextContentClassName(cssClassName);
    }

    initController() {
        this.dropdownView.onTextContentNodeClicked = (e) => {
            if (this.onTextContentNodeClicked !== undefined) {
                this.onTextContentNodeClicked(e);
            }
        }

        this.dropdownView.initView();
        super.initController();
    }

    addOptionContent(optionContent: GTapElement) {
        this.dropdownView.addOptionContent(optionContent);
    }

    onTextContentChanged(text: string) {
        this.dropdownView.textContent = text;
    }

    showDropdownOptions() {
        this.dropdownView.hideOptions(false);
    }

    hideDropdownOptions() {
        this.dropdownView.hideOptions(true);
    }
}
