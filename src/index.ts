import './index.css';
import { init, SDK } from 'dc-extensions-sdk';
import * as showdown from 'showdown';
import * as xssFilter from 'showdown-xss-filter';
import testData from './test-data';
import { HelpData } from './model/help-data';

let sdkInst: SDK;
let height: number;
let containerHeight = 0;
let expanded: boolean = false;

// where it all starts
// if we can't connect, just use some default testing parameters.
init().then(sdk => loadData(sdk)).catch(err => loadParams(testData));

/**
 * Loads data using an instance of the DC Extensions SDK.
 * @param sdk The DC Extensions SDK instance.
 */
function loadData(sdk: SDK) {
    sdkInst = sdk;
    heightLoop();
    loadParams(sdk.params.instance as HelpData);
}

/**
 * A loop that checks if the help block's size has changed each browser animation frame.
 * If it has changed, the new height is uploaded to the UI extension host.
 */
function heightLoop() {
    if (expanded) {
        const bodyDOM = document.getElementsByClassName('helpBody')[0] as HTMLElement;

        const bodyHeight = bodyDOM.clientHeight;
        const newContainerHeight = (45 + bodyHeight);
        if (newContainerHeight !== containerHeight) {
            containerHeight = newContainerHeight;
            const containerDOM = document.getElementsByClassName('helpContainer')[0] as HTMLElement;
            containerDOM.style.height = containerHeight + 'px';
        }
    }
    const targHeight = document.body.scrollHeight + 7;
    if (height !== targHeight) {
        height = targHeight;
        if (sdkInst != null) {
            height = targHeight;
            sdkInst.frame.setHeight(height);
        }
    }

    requestAnimationFrame(heightLoop);
}

/**
 * Prepares the help block using the given parameters.
 * @param params Parameters for the extension - should have a title and message.
 */
function loadParams(params: HelpData): void {
    const title = params.title || 'Untitled Help Block';
    const message = params.message || 'No Message';

    const converter = new showdown.Converter({ emoji: true, strikethrough: true, parseImgDimensions: true, tables: true, extensions: [xssFilter] });
    const converted = converter.makeHtml(message);


    const titleDOM = document.getElementsByClassName('helpTitle')[0];
    titleDOM.textContent = title;

    const bodyDOM = document.getElementsByClassName('helpBody')[0];
    bodyDOM.innerHTML = converted;

    const headerDOM = document.getElementsByClassName('helpHeader')[0];
    headerDOM.addEventListener('click', (event) => toggleExpand());
}

/**
 * Toggles the help block to be opened or closed.
 */
function toggleExpand(): void {
    const containerDOM = document.getElementsByClassName('helpContainer')[0] as HTMLElement;
    const expandDOM = document.getElementsByClassName('expand')[0] as HTMLElement;

    expanded = !expanded;
    if (expanded) {
        const bodyDOM = document.getElementsByClassName('helpBody')[0] as HTMLElement;
        containerDOM.className = 'helpContainer helpExpanded';
        expandDOM.className = 'icon expand buttonExpanded';

        const bodyHeight = bodyDOM.clientHeight;

        containerHeight = (45 + bodyHeight);
        containerDOM.style.height = containerHeight + 'px';
    } else {
        containerDOM.className = 'helpContainer';
        expandDOM.className = 'icon expand';

        containerHeight = 0;
        containerDOM.style.height = null; // default in css
    }
}