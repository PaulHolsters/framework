import {Engine} from '../core/engine.js'

class QButton extends Engine {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this._shadowSet = false
        this._toRender = true
        this._rendered = false
    }

    connectedCallback() {
        this.initializeState()
        this.render()
        this.addEventListeners()
        this.removeEmptySlot()
    }

    _stateObjectDefinition = {
        html: {for: 'html', type: 'string', fun: this.getHtml},
        display: {for: 'css', type: 'string', fun: this._setDisplay},
        hover: {for: 'css', type: 'string', fun: this._setHover},
        staticCss: {for: 'css', type: 'string', fun: this._setStaticCss}
    }
    get stateObjectDefinition() {
        return Object.assign({}, this._stateObjectDefinition)
    }

    // html methods
    getHtml(self, value) {
        return self._html
            `<q-wrapper hover="pointer" display="inline-block" clear="left">
                <q-border value="2px solid darkgreen 10px" >
                    <q-background color="green" padding="5px">
                        <q-data slot color="white" font="Arial"><slot></slot></q-data>
                    </q-background>
                </q-border>
            </q-wrapper>`
    }

    // css methods
    _setDisplay(self, attributeValue) {
        if (attributeValue) {
            return self._css
                `<style>
                :host{
                    display: ${attributeValue} !important;
                }
            </style>
            `
        }
    }
    _setHover(self,attributeValue) {
        if(attributeValue){
            return self._css
                `<style>
                :host{
                    cursor: ${attributeValue} !important;
                }
            </style>
            `
        }
    }
    _setStaticCss(self) {
        return self._css
            `<style>
                :host{
                    display: inline-block !important;
                }
            </style>
            `
    }
}

customElements.define('q-button', QButton)
export {QButton}
