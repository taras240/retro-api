import { APIWorker } from "./apiWorker.js";
import { Config } from "./config.js";
import { UI } from "./ui-mobile.js";
import { generateContextMenu } from "./ui/components/contextMenu.js";

const config = new Config();
const apiWorker = new APIWorker();
const ui = new UI();

window.ui = ui;
window.generateContextMenu = generateContextMenu;



export { config, apiWorker, ui }