import {Engine} from '../core/engine.js'

class QBackground extends Engine {
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
        color: {for: 'css', type: 'string', fun: this._setBackgroundColor},
        padding: {for: 'css', type: 'string', fun: this._setPadding},
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
    _setBackgroundColor(self,attributeValue) {
        if(attributeValue){
            let value = 'black'
            switch (attributeValue) {
                case 'black':
                    value = 'black'
                    break;
                case 'yellow':
                    value = 'yellow'
                    break;
                case 'red':
                    value = 'red'
                    break;
                case 'green':
                    value = 'green'
                    break;
                case 'blue':
                    value = 'blue'
                    break;
                case 'orange':
                    value = 'orange'
                    break;
                case 'brown':
                    value = 'brown'
                    break;
                case 'pink':
                    value = 'pink'
                    break;
                case 'purple':
                    value = 'purple'
                    break;
            }
            return self._css
                `<style>
                :host{
                    background-color: ${value} !important;
                }
            </style>
            `
        }
    }
    _setPadding(self,attributeValue) {
        if(attributeValue){
            return self._css
                `<style>
                :host{
                    padding: ${attributeValue} !important;
                }
            </style>
            `
        }
    }
    _setStaticCss(self){
        return self._css
            `<style>
                :host{
                    border: none !important;
                    display: inline-block !important;
                    width: fit-content !important;
                    float:left !important;
                }
            </style>
            `
    }
}

customElements.define('q-background', QBackground)
export {QBackground}
