import {push, removeKeys, trim, convertToObject} from "../general/general.js";

class EngineHelper extends HTMLElement {

    _rendered
    _shadowSet
    _toRender

    // events + methods
    _globallyDefinedEvents = [
        {name: 'click', subscribedComponents: ['q-button']},
        {name: 'oninput', subscribedComponents: ['q-input']},
        {name: 'onchange', subscribedComponents: ['q-input']},
        {
            name: 'load',
            subscribedComponents: ['q-input', 'q-button', 'q-data', 'q-wrapper', 'q-background', 'q-border']
        },
        {
            name: 'response',
            subscribedComponents: ['q-input', 'q-button', 'q-data', 'q-wrapper', 'q-background', 'q-border']
        },
        {name: 'get', subscribedComponents: ['q-input', 'q-button', 'q-data', 'q-wrapper', 'q-background', 'q-border']},
        {name: 'set', subscribedComponents: ['q-input', 'q-button', 'q-data', 'q-wrapper', 'q-background', 'q-border']},
        {
            name: 'trigger',
            subscribedComponents: ['q-input', 'q-button', 'q-data', 'q-wrapper', 'q-background', 'q-border']
        },
        {name: 'slotchange', subscribedComponents: ['q-data', 'q-wrapper', 'q-background', 'q-border']},
    ]
    get globallyDefinedEvents() {
        return this._globallyDefinedEvents.slice()
    }

    getComponentDefinedEvents() {
        let componentEvents = []
        this.globallyDefinedEvents.forEach(evt => {
            if (evt.subscribedComponents.includes(this.tagName.toLowerCase())) {
                componentEvents = push(componentEvents, evt.name)
            }
        })
        return componentEvents
    }

    addEventListeners() {
        this.getComponentDefinedEvents().forEach(evt => {
            if (evt === 'slotchange') {
                const slot = this.shadowRoot.querySelector('slot')
                slot.addEventListener('slotchange', this.createActionObjects.bind(this))
            } else if (evt === 'load') {
                window.addEventListener(evt, this.createActionObjects.bind(this))
            } else {
                this.addEventListener(evt, this.createActionObjects)
            }
        })
    }

    // this method uses calculateHTML and calculateCSS which use the state to render the component properly
    render() {
        // todo handle components with slots so they don't get rendered prematurely: or set display to none until then!
        // before render
        this.adjustCurrentState()
        if(this._toRender || !this._rendered){
            this.shadowRoot.innerHTML = this.calculateCSS() + this.calculateHTML()
            this._rendered = true
        }
        // after render
        if(!this._shadowSet && this._rendered){
            this.setShadow()
            this._shadowSet = true
        }
    }

    setShadow() {
        Object.keys(this.stateObjectDefinition).forEach(key => {
            if (this.stateObjectDefinition[key].for === 'shadow'
                && this.currentState[key] !== undefined
                && this.currentState[key] !== '') {
                if (this.currentState[key].indexOf(",") !== -1) {
                    const params = this.currentState[key].split(",").slice(1)
                    const fun = trim(this.currentState[key].split(",")[0])
                    params.forEach(param => {
                        this[fun](this,param)
                    })
                } else if(this.currentState[key].indexOf("(") !== -1){
                    const param = this.currentState[key].substring(this.currentState[key].indexOf("(")+1,this.currentState[key].indexOf(")"))
                    const fun = this.currentState[key].substr(0,this.currentState[key].indexOf("("))
                    this[fun](this,param)
                }
            }
        })
    }

    adjustCurrentState() {
        Object.keys(this.stateObjectDefinition).forEach(key => {
            if (this.stateObjectDefinition[key].for === 'calc'
                && this.currentState[key] !== undefined
                && this.currentState[key] !== ''
                && this.getDOMAttributes().find(attr => {
                    return this.getStatePropertyName(attr.name) === key
                })) {
                if (this.currentState[key].indexOf(",") !== -1) {
                    const params = this.currentState[key].split(",").slice(1)
                    const fun = trim(this.currentState[key].split(",")[0])
                    params.forEach(property => {
                        if (this.currentState[property] !== undefined && this.currentState[property] !== '') {
                            if (fun.indexOf('(') !== -1) {
                                const funAdjust = fun.substr(0, fun.indexOf('('))
                                const param = fun.substring(fun.indexOf('(') + 1, fun.indexOf(')'))
                                this.currentState[property] = this[funAdjust](param, this.currentState[property])
                            } else {
                                this.currentState[property] = this[fun](this.currentState[property])
                            }
                        }
                    })
                }
            }
        })
    }

    calculateHTML() {
        // up until this point there is a new CurrentState to be rendered and to be trusted that it
        // will render properly when using the stateObject definition
        let html = ''
        Object.keys(this.stateObjectDefinition).forEach(key => {
            if (this.stateObjectDefinition[key].for === 'html'
                && this.currentState[key] !== undefined
                && this.currentState[key] !== '') {
                html += this.currentState[key]
            }
        })
        return html
    }

    calculateCSS() {
        let css = ''
        Object.keys(this.stateObjectDefinition).forEach(key => {
            if (this.stateObjectDefinition[key].for === 'css'
                && this.currentState[key] !== undefined
                && this.currentState[key] !== '') {
                css += this.currentState[key]
            }
        })
        return css
    }

    // these methods simply are to make it possible to use a tagged template to create the html and css for this component
    _html(strings) {
        return strings[0]
    }

    _css(strings, ...values) {
        if (strings.length > 1) {
            return strings[0] + values[0] + strings[1]
        } else return strings[0]
    }

    // actions + methods
    _globallyDefinedActions = [
        {name: 'trigger', fun: this.trigger},
        {name: 'get', fun: this.get},
        {name: 'set', fun: this.set},
        {name: 'log', fun: this.log},
        {name: 'alert', fun: this.alert},
        {name: 'concat', fun: this.concat},
        {name: 'slotchange', fun: this.slotChange}
    ]
    get globallyDefinedActions() {
        return this._globallyDefinedActions.slice()
    }

    set(actionObject) {
        if (actionObject.target === 'this') {
            // properties where the value was directly given like color=red
            const pairs = actionObject.values.filter(value => {
                if (value.indexOf("=") !== -1) {
                    return true
                }
            }).map(value => {
                const pair = Object.assign({})
                if (trim(value.split("=")[1]) === '$event') {
                    pair[trim(value.split("=")[0])] = actionObject.detail
                } else {
                    pair[trim(value.split("=")[0])] = trim(value.split("=")[1])
                }
                return pair
            })
            const pairsObject = convertToObject(pairs)
            // properties where some external value has been get
            if (typeof actionObject.detail === 'object') {
                const valueObject = convertToObject(actionObject.detail)
                const validKeys = Object.keys(valueObject).filter(key => {
                    return actionObject.values.includes(key) === true
                }).map(key => {
                    const value = Object.assign({})
                    value[key] = valueObject[key]
                    return value
                })
                const filteredObject = convertToObject(validKeys)
                this.updateDOM(Object.assign(filteredObject, pairsObject))
            } else {
                this.updateDOM(Object.assign({}, pairsObject))
            }
        } else {
            // this branch is called because a response event happened
            // make (an)other component(s) set its/their new state
            document.querySelectorAll(actionObject.target).forEach(target => {
                target.dispatchEvent(new CustomEvent('set', {
                    detail: {
                        source: this,
                        target: target,
                        values: actionObject.values,
                        properties: actionObject.detail
                    }
                }))
            })
        }
    }

    get(actionObject) {
        if (actionObject.target === 'this') {
            // a response event needs to be dispatched on the source component
            const properties = Object.keys(this.currentState).filter(key => {
                return actionObject.values.includes(key) === true
            }).map(key => {
                const value = Object.assign({})
                value[key] = this.currentState[key]
                return value
            })
            actionObject.source.dispatchEvent(new CustomEvent('response', {detail: properties}))
        } else {
            document.querySelectorAll(actionObject.target).forEach(target => {
                target.dispatchEvent(new CustomEvent('get', {
                    detail: {
                        source: actionObject.source,
                        values: [...actionObject.values]
                    }
                }))
            })
        }
    }

    concat(actionObject) {
        if (actionObject.target === 'this') {

        } else {
            document.querySelectorAll(actionObject.target).forEach(component => {

            })
        }
    }

    trigger(actionObject) {
        const event = new Event('trigger')
        if (actionObject.target === 'this') {
            this.dispatchEvent(event)
        } else {
            document.querySelectorAll(actionObject.target).forEach(component => {
                component.dispatchEvent(event)
            })
        }
    }

    log(actionObject) {
        console.log(actionObject.values[0].replace('$event',actionObject.detail))
    }

    alert(actionObject) {
        window.alert(actionObject.values[0].replace('$event',actionObject.detail))
    }

    slotChange() {
        const slot = this.shadowRoot.querySelector('slot')
        if (slot && slot.assignedNodes()[0] && !this.getDOMAttributes().find(attr => {
                return attr.name === 'slot'
            }) &&
            (this.tagName.toLowerCase() !== 'q-background'
                || this.tagName.toLowerCase() !== 'q-border'
                || this.tagName.toLowerCase() !== 'q-button'
            )) {
            const existingHTML = this.getHtml(this)
            const startIndex = existingHTML.indexOf('<slot>')
            const endIndex = existingHTML.indexOf('</slot>')
            const newHTML = trim(existingHTML.substr(0, startIndex) + existingHTML.substr(endIndex + 7))
            if (this.currentState.value) {
                this.updateDOM({html: newHTML})
            } else {
                const textFromSlot = slot.assignedNodes()[0].textContent
                this.updateDOM({html: newHTML, value: textFromSlot})
            }
        }
    }

    // creates a new state based on the valueObject passed as a parameter
    // then calls the render method which renders the component based upon the new current state
    updateDOM(valueObject) {
        const newStateObjectTemp = {}
        Object.keys(valueObject).forEach(key => {
            if (Object.keys(this.stateObjectDefinition).includes(key)) {
                newStateObjectTemp[key] = this.stateObjectDefinition[key].fun(this, valueObject[key])
            }
        })
        const newObj = removeKeys(this.stateObjectDefinition, Object.keys(newStateObjectTemp))
        Object.keys(newObj).forEach(key => {
            if (this.currentState[key]) {
                newObj[key] = this.currentState[key]
            } else {
                newObj[key] = undefined
            }
        })
        const newStateObject = Object.assign(newObj, newStateObjectTemp)
        // in the next line the current state will likely be different
        this.state = push(this.state, newStateObject)
        this.render()
    }

    removeEmptySlot() {
        if (this.currentState.html.search('<slot></slot>') !== -1) {
            if (this.shadowRoot.querySelector('slot').assignedNodes().length === 0) {
                // create new state without a slot in the html
                // using the current state
                const newState = {}
                Object.keys(this.currentState).forEach(key => {
                    if (key !== 'html') {
                        newState[key] = this.currentState[key]
                    } else {
                        newState[key] = this.currentState[key].replace('<slot></slot>', '')
                    }
                })
                this.state = push(this.state, newState)
                this.render()
            }
        }
    }

    // html attributes + methods
    _globallyDefinedAttributes = [
        {
            name: 'click', subscribedComponents: ['q-button'], numbered: true
        },
        {
            name: 'input', subscribedComponents: ['q-input'], numbered: true
        },
        {
            name: 'change', subscribedComponents: ['q-input'], numbered: true
        },
        {
            name: 'trigger',
            subscribedComponents: ['q-input', 'q-button', 'q-data', 'q-background', 'q-border', 'q-wrapper'],
            numbered: true
        },
        {
            name: 'response',
            subscribedComponents: ['q-input', 'q-button', 'q-data', 'q-background', 'q-border', 'q-wrapper'],
            numbered: true
        },
        {
            name: 'load',
            subscribedComponents: ['q-input', 'q-button', 'q-data', 'q-background', 'q-border', 'q-wrapper'],
            numbered: true
        },
        {
            name: 'decimals', subscribedComponents: ['q-data'], numbered: false
        },
        {
            name: 'comma', subscribedComponents: ['q-data'], numbered: false
        },
        {
            name: 'hover', subscribedComponents: ['q-button'], numbered: false
        },
        {
            name: 'type', subscribedComponents: ['q-data', 'q-input'], numbered: false
        },
        {
            name: 'required', subscribedComponents: ['q-input'], numbered: false
        },
        {
            name: 'title', subscribedComponents: ['q-input'], numbered: false
        },
        {
            name: 'pattern', subscribedComponents: ['q-input'], numbered: false
        },
        {
            name: 'min', subscribedComponents: ['q-input'], numbered: false
        },
        {
            name: 'max', subscribedComponents: ['q-input'], numbered: false
        },
        {
            name: 'step', subscribedComponents: ['q-input'], numbered: false
        },
        {
            name: 'subtype', subscribedComponents: ['q-data'], numbered: false
        },
        {
            name: 'value', subscribedComponents: ['q-data', 'q-border'], numbered: false
        },
        {
            name: 'font-style', subscribedComponents: ['q-data'], numbered: false
        },
        {
            name: 'weight', subscribedComponents: ['q-data'], numbered: false
        },
        {
            name: 'font', subscribedComponents: ['q-data'], numbered: false
        },
        {
            name: 'size', subscribedComponents: ['q-data'], numbered: false
        },
        {
            name: 'money', subscribedComponents: ['q-data'], numbered: false
        },
        {
            name: 'letter-spacing', subscribedComponents: ['q-data'], numbered: false
        },
        {
            name: 'word-spacing', subscribedComponents: ['q-data'], numbered: false
        },
        {
            name: 'range', subscribedComponents: ['q-data'], numbered: false
        },
        {
            name: 'color', subscribedComponents: ['q-data', 'q-background'], numbered: false
        },
        {
            name: 'padding', subscribedComponents: ['q-background'], numbered: false
        },
        {
            name: 'float', subscribedComponents: ['q-wrapper'], numbered: false
        },
        {
            name: 'clear', subscribedComponents: ['q-wrapper'], numbered: false
        },
        {
            name: 'display', subscribedComponents: ['q-wrapper', 'q-button'], numbered: false
        },
        {
            name: 'slot', subscribedComponents: ['q-data'], numbered: false
        },
    ]
    get globallyDefinedAttributes() {
        return this._globallyDefinedAttributes.slice()
    }

    // gives back the attributeObject
    getComponentDefinedAttributes() {
        let componentAttr = []
        this.globallyDefinedAttributes.forEach(attr => {
            if (attr.subscribedComponents.includes(this.tagName.toLowerCase())) {
                componentAttr = push(componentAttr, attr)
            }
        })
        return componentAttr
    }

    getDOMAttributes() {
        const attributes = this.getComponentDefinedAttributes()
        const stateProperties = this.getStateProperties()
        let setAttributes = []
        const setAttributeNames = this.getAttributeNames()
        attributes.forEach(attrObj => {
            if (attrObj.numbered && setAttributeNames.includes('q-on' + attrObj.name + '-1')) {
                // the attribute is used in a numbered way starting from 1 and going as far as the user wants
                let number = 1
                while (this.hasAttribute('q-on' + attrObj.name + '-' + number)) {
                    if (trim(this.getAttribute('q-on' + attrObj.name + '-' + number)).length === 0) {
                        setAttributes = push(setAttributes, {name: 'q-on' + attrObj.name + '-' + number, value: null})
                    } else {
                        const value = trim(this.getAttribute('q-on' + attrObj.name + '-' + number))
                        setAttributes = push(setAttributes, {name: 'q-on' + attrObj.name + '-' + number, value: value})
                    }
                    number++
                }
            } else if (attrObj.numbered && setAttributeNames.includes(attrObj.name + '-1')) {
                stateProperties.forEach(prop => {
                    let number = 1
                    let found = false
                    while (this.hasAttribute(attrObj.name + prop + '-' + number) && !found) {
                        if (trim(this.getAttribute(attrObj.name + prop + '-' + number)).length === 0) {
                            found = true
                            setAttributes = push(setAttributes, {name: attrObj.name + prop + '-' + number, value: null})
                        } else {
                            found = true
                            const value = trim(this.getAttribute(attrObj.name + '-' + number))
                            setAttributes = push(setAttributes, {
                                name: attrObj.name + prop + '-' + number,
                                value: value
                            })
                        }
                        number++
                    }
                })
            } else if (setAttributeNames.includes('q-on' + attrObj.name)) {
                if (trim(this.getAttribute('q-on' + attrObj.name)).length === 0) {
                    setAttributes = push(setAttributes, {name: 'q-on' + attrObj.name, value: null})
                } else {
                    const value = trim(this.getAttribute('q-on' + attrObj.name))
                    setAttributes = push(setAttributes, {name: 'q-on' + attrObj.name, value: value})
                }
            } else {
                if (this.hasAttribute(attrObj.name)) {
                    if (trim(this.getAttribute(attrObj.name)).length === 0) {
                        setAttributes = push(setAttributes, {name: attrObj.name, value: null})
                    } else {
                        const value = trim(this.getAttribute(attrObj.name))
                        setAttributes = push(setAttributes, {name: attrObj.name, value: value})
                    }
                }
            }
        })
        return setAttributes
    }

    // state + methods
    // the _state array is a global property, this property will be REPLACED
    // by a new array every time the state changes!
    _state = []
    get state() {
        return this._state.slice()
    }

    // when the state has changed this is always followed by a rendering of the new state
    set state(newArray) {
        this._state = newArray
    }

    get currentState() {
        return this.state[this.state.length - 1]
    }

    // this method sets the initial state
    initializeState() {
        const firstStateObjectTemp = {}
        this.getDOMAttributes().forEach(attr => {
            const statePropertyName = this.getStatePropertyName(attr.name)
            if (statePropertyName) {
                firstStateObjectTemp[statePropertyName] = this.stateObjectDefinition[statePropertyName].fun(this, attr.value)
            }
        })
        const newObj = removeKeys(this.stateObjectDefinition, Object.keys(firstStateObjectTemp))
        const keys = Object.keys(newObj)
        keys.forEach(key => {
            newObj[key] = this.stateObjectDefinition[key].fun(this)
        })
        const firstStateObject = Object.assign(newObj, firstStateObjectTemp)
        this.state = push(this.state, firstStateObject)
    }

    getStatePropertyName(attributeName) {
        if (attributeName.indexOf('-') !== -1) {
            const index = attributeName.indexOf('-')
            const formattedAttributeName = attributeName.replace('-', '')
            const capitalizedLetter = formattedAttributeName[index].toUpperCase()
            const newAttributeName = formattedAttributeName.substring(0, index) + capitalizedLetter + formattedAttributeName.substr(index + 1)
            return Object.keys(this.stateObjectDefinition).find(key => {
                return key === newAttributeName
            })
        } else {
            return Object.keys(this.stateObjectDefinition).find(key => {
                return key === attributeName
            })
        }
    }

    getStateProperties() {
        return Object.keys(this.stateObjectDefinition)
    }
}

export {EngineHelper}

