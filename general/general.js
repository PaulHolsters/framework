function reduceObject(obj, keys) {
    // keys is an array
    const copy = Object.assign({}, obj)
    const keysToDelete = Object.keys(copy).filter(key => {
        return !keys.includes(key)
    })
    keysToDelete.forEach(key => {
        delete copy[key]
    })
    return copy
}

function push(array, element) {
    const newArr = array.slice()
    newArr.push(element)
    return newArr
}

function convertToObject(arrayWithKeyValuePairs){
    const obj = {}
    arrayWithKeyValuePairs.forEach(pair=>{
        const key = Object.keys(pair)[0]
        obj[key]=pair[key]
    })
    return obj
}

function shift(array) {
    const newArr = array.slice()
    const shiftedElement = newArr.shift()
    return [newArr,shiftedElement]
}

function spliceOne(array,index) {
    const newArr = array.slice()
    const splicedElement = newArr.splice(index,1)[0]
    return [newArr,splicedElement]
}

function replaceProperties(sourceObject, targetObject) {
    const reducedTarget = reduceObject(targetObject, Object.keys(sourceObject))
    return Object.assign(sourceObject, reducedTarget)
}

function removeKeys(targetObj,keys){
    const newObject = Object.assign({},targetObj)
    Object.keys(newObject).forEach(key=>{
        if (keys.includes(key)){
            delete newObject[key]
        }
    })
    return newObject
}

function extractObject(targetObj, listOfProperties) {
    const newObj = {}
    listOfProperties.forEach(prop => {
        if (Object.keys(targetObj).includes(prop)) {
            newObj[prop] = targetObj[prop]
        }
    })
    return newObj
}

function trim(string) {
    if (typeof string === 'string') {
        return string.trim()
    }
    return null
}

function trimSides(string){

}
/*    removeSlot() {
        if (this.currentState.html.search('<slot></slot>') !== -1) {
            // create new state without a slot in the html
            // using the current state
            const newState = {}
            Object.keys(this.currentState).forEach(key => {
                if (key !== 'html') {
                    newState[key] = this.currentState[key]
                } else {
                    const partOne = this.currentState[key].substring(0, this.currentState[key].indexOf('<slot>'))
                    const partTwo = this.currentState[key].substr(this.currentState[key].indexOf('</slot>') + 7)
                    newState[key] = partOne + partTwo
                }
            })
            this.state = push(this.state, newState)
            this.render()
        }
    }*/
export {reduceObject,trim,replaceProperties,extractObject,push,shift,removeKeys,spliceOne,convertToObject}



