import {Engine} from '../core/engine.js'

class QInput extends Engine {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this._shadowSet = false
        this._toRender = false
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
        type: {for: 'shadow', type: 'string', fun: this._setType},
        required: {for: 'shadow', type: 'string', fun: this._setRequired},
        pattern: {for: 'shadow', type: 'string', fun: this._setPattern},
        title: {for: 'shadow', type: 'string', fun: this._setTitle},
        step: {for: 'shadow', type: 'string', fun: this._setStep},
        min: {for: 'shadow', type: 'string', fun: this._setMin},
        max: {for: 'shadow', type: 'string', fun: this._setMax},
        value: {for: 'get-set', type: 'string', fun: this._value},
        staticCss: {for: 'css', type: 'string', fun: this._setStaticCss},
        display: {for: 'css', type: 'string', fun: this._setDisplay}
    }
    get stateObjectDefinition() {
        return Object.assign({}, this._stateObjectDefinition)
    }

    // html methods
    getHtml(self, value) {
        return self._html
            `<input onchange="this.dispatchEvent(new CustomEvent('onchange',{bubbles:true,composed:true,detail:this.value}))" oninput="this.dispatchEvent(new CustomEvent('oninput',{bubbles:true,composed:true,detail:this.value}))">`
    }

    _value(self,attributeValue){
        if(attributeValue && attributeValue === self.shadowRoot.querySelector('input').value) {
            return attributeValue
        } else if(attributeValue){
            self.shadowRoot.querySelector('input').value = attributeValue
            return attributeValue
        }
    }

    _setType(self,attributeValue){
        if(attributeValue) return 'typeInnerInput,'+attributeValue
    }
    typeInnerInput(self,value){
        if(self.shadowRoot.querySelector('input') && !self.shadowRoot.querySelector('input').hasAttribute('type')){
            self.shadowRoot.querySelector('input').setAttribute('type',value)
        }
    }

    _setTitle(self,attributeValue){
        if(attributeValue) return 'titleInnerInput,'+attributeValue
    }
    titleInnerInput(self,value){
        if(self.shadowRoot.querySelector('input') && !self.shadowRoot.querySelector('input').hasAttribute('title')){
            self.shadowRoot.querySelector('input').setAttribute('title',value)
        }
    }

    _setRequired(self,attributeValue){
        if(attributeValue && (attributeValue==='number'||attributeValue==='text')) return 'requiredInnerInput,'+attributeValue
    }
    requiredInnerInput(self){
        if(self.shadowRoot.querySelector('input') && !self.shadowRoot.querySelector('input').hasAttribute('required')){
            self.shadowRoot.querySelector('input').setAttribute('required','true')
        }
    }

    _setPattern(self,attributeValue){
        if(attributeValue && (attributeValue==='number'||attributeValue==='text')) return 'patternInnerInput,'+attributeValue
    }
    patternInnerInput(self,value){
        if(self.shadowRoot.querySelector('input') && !self.shadowRoot.querySelector('input').hasAttribute('pattern')){
            self.shadowRoot.querySelector('input').setAttribute('pattern',value)
        }
    }

    _setMin(self,attributeValue){
        if(attributeValue) return 'minInnerInput('+attributeValue+')'
    }
    minInnerInput(self,value){
        if(self.shadowRoot.querySelector('input') && !self.shadowRoot.querySelector('input').hasAttribute('min')){
            self.shadowRoot.querySelector('input').setAttribute('min',value)
        }
    }
    _setMax(self,attributeValue){
        if(attributeValue) return 'maxInnerInput('+attributeValue+')'
    }
    maxInnerInput(self,value){
        if(self.shadowRoot.querySelector('input') && !self.shadowRoot.querySelector('input').hasAttribute('max')){
            self.shadowRoot.querySelector('input').setAttribute('max',value)
        }
    }
    _setStep(self,attributeValue){
        if(attributeValue) return 'stepInnerInput('+attributeValue+')'
    }
    stepInnerInput(self,value){
        if(self.shadowRoot.querySelector('input') && !self.shadowRoot.querySelector('input').hasAttribute('step')){
            self.shadowRoot.querySelector('input').setAttribute('step',value)
        }
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

customElements.define('q-input', QInput)
export {QInput}

/*
*                 input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
* */