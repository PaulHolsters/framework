import {Engine} from '../core/engine.js'

class QBorder extends Engine {
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
        value: {for: 'css', type: 'string', fun: this._setBorder},
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
    // border-radius: ${attributeValue.split(' ')[3]} !important;
    // css methods
    _setBorder(self,attributeValue) {
        if(attributeValue){
            if(attributeValue.split(' ').length===4){
                const radius = attributeValue.split(' ')[3].toString()
                return self._css
                    `<style>
                :host{
                    border: ${attributeValue.substr(0,attributeValue.indexOf(attributeValue.split(' ')[3]))} !important;
                    border-radius: `+radius+` !important;
                }
            </style>
            `
            } else{
                return self._css
                    `<style>
                :host{
                    border: ${attributeValue} !important;
                }
            </style>
            `
            }
        }
    }
    _setStaticCss(self){
        return self._css
            `<style>
                :host{
                    background: none !important;
                    display: inline-block !important;
                    width: fit-content !important;
                    overflow: hidden !important;
                    float:left !important;
                }
            </style>
            `
    }
}

customElements.define('q-border', QBorder)
export {QBorder}
