import {Engine} from '../core/engine.js'

class QData extends Engine {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this._rendered = false
        this._shadowSet = false
        this._toRender = true
    }

    connectedCallback() {
        this.initializeState()
        this.render()
        this.addEventListeners()
        this.removeEmptySlot()
    }

    _stateObjectDefinition = {
        html: {for: 'html', type: 'string', fun: this.getHtml},
        value: {for: 'html', type: 'string', fun: this._setValue},
        fontStyle: {for: 'css', type: 'array', fun: this._setFontStyle},
        weight: {for: 'css', type: 'array', fun: this._setFontWeight},
        font: {for: 'css', type: 'string', fun: this._setFontFamily},
        size: {for: 'css', type: 'string', fun: this._setFontSize},
        type: {for: 'calc', type: 'string', fun: this._convertToType},
        decimals: {for: 'calc', type: 'int', fun: this._adjustNumberOfDecimals},
        money: {for: 'calc', type: 'string', fun: this._convertToMoneyType},
        letterSpacing: {for: 'css', type: 'string', fun: this._setLetterSpacing},
        wordSpacing: {for: 'css', type: 'string', fun: this._setWordSpacing},
        color: {for: 'css', type: 'string', fun: this._setColor},
        range: {for: 'calc', type: 'string', fun: this._convertToRange},
        subtype: {for: 'calc', type: 'string', fun: this._convertToSubtype},
        comma: {for: 'calc', type: 'bool', fun: this._replacePointWithComma},
        staticCss:{for: 'css', type: 'string', fun: this._setStaticCss}
    }
    get stateObjectDefinition() {
        return Object.assign({},this._stateObjectDefinition)
    }

    // html methods
    getHtml(self,value){
        if(value !==undefined && value.length===0){
            // if you are in here a slotchange event has taken place
            // when initializing the component
            // this event fills in the value property with the slotted content
            // and the function below will remove the slot tags from the html
            // if you want to change the output of this component you will have to use the value property
            // from then on
            return self._html
                ``
        } else{
            return self._html
                `<slot></slot>`
        }
    }
    _setValue(self,value) {
        return value
    }
    _convertToType(self,attributeValue) {
        switch (attributeValue) {
            case 'float':
                return '_float,value'
            case 'int':
                return '_int,value'
        }
    }
    _float(value){
        return isNaN(parseFloat(value)) ? '' : parseFloat(value)
    }
    _int(value){
        return isNaN(parseInt(value)) ? '' : parseInt(value)
    }

    _convertToSubtype(self,attributeValue) {
        switch (attributeValue) {
            case 'percentage':
                return '_percentage,value'
            case 'fraction':
                return '_fraction,value'
        }
    }
    _percentage(value){
        if(!isNaN(parseInt(value))){
            return value*100+'%'
        } else{
            return ''
        }
    }
    _fraction(value){
        if(!isNaN(parseInt(value))){
            let decimals = value
            let N = 1
            while(decimals!==0 && decimals*N-Math.floor(decimals*N)>0){
                N=N*10
                decimals = decimals*10
            }
            return parseInt(decimals)+'/'+N
        } else{
            return ''
        }
    }

    _adjustNumberOfDecimals(self,attributeValue) {
        if(!isNaN(parseInt(attributeValue))){
            return '_decimals('+attributeValue+'),value'
        }
    }
    _decimals(nod,value){
        return value.toFixed(nod)
    }

    _replacePointWithComma(self,attributeValue) {
        return '_comma,value'
    }
    _comma(value){
        return value.toString().replace('.',',')
    }

    _convertToMoneyType(self,attributeValue) {
        if(attributeValue){
            switch (attributeValue) {
                case 'euro':
                    return '_money('+attributeValue+'),value'
                case 'dollar':
                    return '_money('+attributeValue+'),value'
            }
        }
    }
    _money(valuta,value){
        switch(valuta){
            case 'euro':
                return '&euro;'+value.toFixed(2).toString().replace('.',',')
            case 'dollar':
                return '&dollar;'+value.toFixed(2).toString().replace('.',',')
        }
    }

    _convertToRange(self,attributeValue) {

    }

    // css methods
    _setFontStyle(self,attributeValue) {
        // possible attributeValues are: italic
        if(attributeValue){
            return self._css
                `<style>
                :host{
                    font-style: ${attributeValue} !important;
                }
            </style>
            `
        }

    }
    _setFontWeight(self,attributeValue) {
        // possible attributeValues are: italic
        if(attributeValue){
            return self._css
                `<style>
                :host{
                    font-weight: ${attributeValue} !important;
                }
            </style>
            `
        }

    }
    _setFontFamily(self,attributeValue) {
        // possible attributeValues are: Arial, roboto, ...
        if(attributeValue){
            return self._css
                `<style>
                :host{
                    font-family: ${attributeValue} !important;
                }
            </style>
            `
        }
    }
    _setFontSize(self,attributeValue) {
        if(attributeValue){
            let value = '16px'
            switch (attributeValue){
                case 'tiny':
                    value='4px'
                    break;
                case 'small':
                    value='8px'
                    break;
                case 'normal':
                    value='16px'
                    break;
                case 'big':
                    value='24px'
                    break;
                case 'bigger':
                    value='36px'
                    break;
                case 'huge':
                    value='48px'
                    break;
            }
            return self._css
                `<style>
                :host{
                    font-size: ${value} !important;
                }
            </style>
            `
        }
    }
    _setLetterSpacing(self,attributeValue) {
        if (attributeValue) {
            let value = '0px'
            switch (attributeValue) {
                case 'normal':
                    value = '0px'
                    break;
                case 'big':
                    value = '1px'
                    break;
                case 'bigger':
                    value = '2px'
                    break;
                case 'huge':
                    value = '4px'
                    break;
                case 'gigantic':
                    value = '8px'
                    break;
                case 'galactic':
                    value = '16px'
                    break;
            }
            return self._css
                `<style>
                :host{
                    letter-spacing: ${value} !important;
                }
            </style>
            `
        }
    }
    _setWordSpacing(self,attributeValue) {
        if (attributeValue) {
            let value = '0px'
            switch (attributeValue) {
                case 'normal':
                    value = '0px'
                    break;
                case 'big':
                    value = '2px'
                    break;
                case 'bigger':
                    value = '4px'
                    break;
                case 'huge':
                    value = '8px'
                    break;
                case 'gigantic':
                    value = '16px'
                    break;
                case 'galactic':
                    value = '32px'
                    break;
            }
            return self._css
                `<style>
                :host{
                    word-spacing: ${value} !important;
                }
            </style>
            `
        }
    }
    _setColor(self,attributeValue) {
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
                case 'white':
                    value = 'white'
                    break;
            }
            return self._css
                `<style>
                :host{
                    color: ${value} !important;
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
                    display: inline-block !important;
                    width: fit-content !important;
                    float:left !important;
                }
            </style>
            `
    }

}

customElements.define('q-data', QData)
export {QData}
