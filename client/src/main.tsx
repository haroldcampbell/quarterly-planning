import { appStart } from "./app/appDelegate";
import * as gtap from "../www/dist/js/gtap";

const rootContainer = gtap.$class("app")[0];

appStart(rootContainer);