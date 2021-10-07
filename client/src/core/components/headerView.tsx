import * as gtap from "../../../www/dist/js/gtap";
import * as lib from "../lib";

/** @jsx gtap.$jsx */

export class HeaderView extends lib.BaseView {
    text?: string;
    private _css: string = "";

    constructor(
        parent: lib.IViewController | lib.IScreenController,
        text: string
    ) {
        super(parent);
        this.text = text;
    }

    set css(newCss: string) {
        this._css = newCss;
    }

    viewContent() {
        return <h1 className={"h1 " + this._css}>{this.text}</h1>;
    }
}
