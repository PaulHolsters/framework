import {Engine} from '../core/engine.js'

class QWrapper extends Engine {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
    }

    connectedCallback() {
        this.initializeState()
        this.render()
        this.addEventListeners()
        this.removeEmptySlot()
    }

    _stateObjectDefinition = {
        html: {for: 'html', type: 'string', fun: this.getHtml},
        float: {for: 'css', type: 'string', fun: this._setFloat},
        clear: {for: 'css', type: 'string', fun: this._setClear},
        display: {for: 'css', type: 'string', fun: this._setDisplay},
        staticCss:{for: 'css', type: 'string', fun: this._setStaticCss}
    }
    get stateObjectDefinition() {
        return Object.assign({},this._stateObjectDefinition)
    }

    // html methods
    getHtml(self){
        return self._html
            `<slot></slot>`
    }

    // css methods
    _setFloat(self,attributeValue) {
        if(attributeValue){
            return self._css
                `<style>
                :host{
                    float: ${attributeValue} !important;
                }
            </style>
            `
        }
    }
    _setClear(self,attributeValue) {
        if(attributeValue){
            return self._css
                `<style>
                :host{
                    clear: ${attributeValue} !important;
                }
            </style>
            `
        }
    }

    _setDisplay(self,attributeValue) {
        if(attributeValue){
            return self._css
                `<style>
                :host{
                    display: ${attributeValue} !important;
                }
            </style>
            `
        }
    }
    _setStaticCss(self){
        return self._css
            `<style>
                :host{
                    background: none !important;
                    border: none !important;
                    display: block;
                    width: fit-content;
                    overflow: auto !important;
                }
            </style>
            `
    }
}

customElements.define('q-wrapper', QWrapper)
export {QWrapper}
