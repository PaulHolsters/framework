import {push, spliceOne} from "../general/general.js"
import {EngineHelper} from "./engine-helpers.js";

class Engine extends EngineHelper {

    // this engine processes commands EXPLICITLY given by other components to this component
    // these commands are ALWAYS given by means of an event that holds the command inside its detail property
    // the engine processes these events captured by the components system and then dispatches the execution
    // of the processed command to some other component or to the part of the component's system responsible
    // for executing (processed) commands. To make it real clear this engine does NOT execute commands,
    // it processes them and then dispatches the processed command.

    // Processing a command can mean one of two things:
    // 1. dispatching an event on another component that may hold some command for that component to execute
    // 2. dispatching the processed command to another part of the system that handles the execution

    // sometimes events that do not hold explicit commands enters the system and get processed by the engine too
    // when an event is captured by the component's system (hereafter simply called 'system') it enters the engine
    // by the eventHandler function: this is where the processing begins

    // this method is called from within createActionObjects when an event on the component has taken place
    // such an event is called a command, a command is every event that is captured, because if a component captures an event
    // it is to actively process the event which in turn could lead to some action performed within the component
    // it is through these kind of events that components or external (to the component) systems can give commands
    // of course it is in the end just a message, it is the way it is captured and processed which makes it command
    // if you think about it: what else is given a command than passing a message to someone to execute a certain task?
    async processCommands(actionObjects) {
        /***************  variables and functions  ***************/
        const self = this
        // the globallyDefinedAttributes property gives us beside normal attributes also all
        // defined attribute commands=events
        const performAction = async function (actionObject) {
            // an actionObject has this format:
            // {target:'targetString',actionName:'actionNameString', value:'some value-string that is needed to perform the action correctly'}
            // 1. use the actionName to target the correct action-function
            // 2. pass the actionObject as a parameter for this action-function
            const actionFound = self.globallyDefinedActions.find(actionFound => {
                if (actionFound.name === actionObject.actionName) {
                    return true
                }
            })
            if (actionFound) {
                actionFound.fun.apply(self, [actionObject])
            }
        }
        // this method puts the freshly created actionObject onto the queue
        const putAction = function (actionObject) {
            self.queue = push(self.queue, actionObject)
        }
        // in this method the action is considered performed and will be removed from the queue, so the next actionObject,
        // if any, gets available
        const moveAction = function () {
            let index = 0
            while (index < self.queue.length) {
                if (self.queue[index].status === 'processing') {
                    const spliceResponse = spliceOne(self.queue, index)
                    const newQueue = spliceResponse[0]
                    const executedAction = spliceResponse[1]
                    self.queue = newQueue
                    self.heap = push(self.heap, executedAction)
                    break
                } else {
                    index++
                }
            }
        }
        const hasNextAction = function () {
            let index = 0
            while (index < self.queue.length) {
                if (self.queue[index].status === 'created') {
                    return true
                } else {
                    index++
                }
            }
            return false
        }
        // this method gets the first in line actionObject from the queue by copying it
        const getNextAction = function () {
            let index = 0
            while (index < self.queue.length) {
                if (self.queue[index].status === 'created') {
                    // not functional!
                    self.queue[index].status = 'processing'
                    return {...self.queue[index]}
                } else {
                    index++
                }
            }
        }
        /*******************  method execution  *******************/
        const actions = [...actionObjects]
        actions.forEach(actionObject => {
            putAction(actionObject)
        })
        while (hasNextAction()) {
            const actionToPerform = getNextAction()
            await performAction(actionToPerform)
            moveAction()
        }
    }

    // returns the actionObjects to processCommands
    async createActionObjects(event) {
        /***************  variables and functions  ***************/
        const refactorCommands = function (commands) {
            const commandsCopy = commands.slice()
            const refactoredArray = []
            if (commandsCopy[0].name.indexOf('q-on') !== -1 && commandsCopy[0].name.indexOf('-1') !== -1) {
                commandsCopy.forEach(command => {
                    const startIndex = command.name.indexOf('-', command.name.indexOf('-') + 1)
                    const index = Number(command.name.substr(startIndex + 1)) - 1
                    refactoredArray[index] = {
                        name: command.name.substring(command.name.indexOf('n') + 1, startIndex),
                        value: command.value
                    }
                })
                return refactoredArray
            } else if (commandsCopy[0].name.indexOf('q-on') !== -1) {
                commandsCopy[0] = {name: commandsCopy[0].name.substr(4), value: commandsCopy[0].value}
                return commandsCopy
            } else if (commandsCopy[0].name.indexOf('-') !== -1) {
                commandsCopy.forEach(command => {
                    const index = Number(command.name.substr(command.name.indexOf('-') + 1)) - 1
                    refactoredArray[index] = {
                        name: command.name.substr(0, command.name.indexOf('-')),
                        value: command.value
                    }
                })
                return refactoredArray
            } else {
                return commandsCopy
            }
        }
        const actionObjectsFrom = function (source,commands) {
            let actionObjects = []
            commands.forEach(command => {
                const action = command.value
                const target = action.indexOf('=>') !== -1 ? action.substring(0, action.indexOf('=>')) : 'this'
                const actionName =
                    action.indexOf('=>') !== -1 ?
                        action.substring(action.indexOf('>') + 1,
                            action.indexOf(':') !== -1 ?
                                action.indexOf(':')
                                :
                                action.length
                        )
                        :
                        action.substring(0,
                            action.indexOf(':') !== -1 ?
                                action.indexOf(':')
                                :
                                action.length
                        )
                // values has keys AND/OR key-value pairs like so color=red: these pairs need to be processed inside the function that will be called when processed by the engine
                const values = action.indexOf(':') === -1 ? null : action.substr(action.indexOf(':') + 1).split(';')
                const actionObject = {target: target, source:source, actionName: actionName, values: values, status: 'created',detail:event.detail}
                actionObjects = push(actionObjects, actionObject)
            })
            return actionObjects
        }
        /*******************  method execution  *******************/
            // 1. grab the attributes associated with the command
            // commands = [{name:'nameOfAttribute',value:'valueOfAttribute'},...]
        const conditions = this.getDOMAttributes().filter(DOMAttr => {
                return (DOMAttr.name.indexOf('condition') !== -1)
            })
        if (conditions.length > 0) {
            // check conditie en laat het verdere gebeuren in deze tak afspelen

        } else {
            // the getDomAttributes method only returns the attribute if it is a valid one
            const commands = this.getDOMAttributes().filter(DOMAttr => {
                return (DOMAttr.name.indexOf(event.type) !== -1)
            })
            if (commands.length === 0) {
                // ! slotchange, set, get : events without a defined attribute!
                // create the correct actionObject: target/actionName/value and put it in commands
                switch (event.type){
                    case 'slotchange':
                        await this.processCommands([{target: 'this',source:this, actionName: event.type, values: null, status: 'created'}])
                        break;
                    case 'set':
                        //{detail:{source:this,target:target,values:actionObject.values,properties:actionObject.detail.properties}}))
                        await this.processCommands([{target: 'this', source:event.detail.source, actionName: event.type,
                            values: event.detail.values, detail:event.detail.properties, status: 'created'}])
                        break;
                    case 'get':
                        await this.processCommands([{target: 'this',source:event.detail.source, actionName: event.type, values: event.detail.values, status: 'created'}])
                        break;
                    case 'oninput':
                        await this.processCommands([{target: 'this',source:this, actionName: 'set', values: ['value'], detail:[{value:event.detail}], status: 'created'}])
                        break;
                }
            } else {
                // 2. sort the commands so numbered commands are processed in the correct order and get rid of the numbers and the q-on prefix
                    const refactoredCommands = refactorCommands(commands)
                    // 3. for each creation determine the : target, actionName, value
                    const actionObjects = actionObjectsFrom(this,refactoredCommands)
                    // 4. call processCommands with the result as parameter
                    await this.processCommands(actionObjects)
            }
        }
    }

    // the queue is an array holding all the actionObjects that need to be processed and eventually performed
    // the element with index 0 is the actionObject that will be processed first and actually is the object
    // that the getNextAction method will grab, this is also the object the moveAction method will remove from the array
    queue = []
    get queue() {
        return this.queue.slice()
    }

    set queue(newQueue) {
        this.queue = newQueue
    }

    // actionObjects that are processed will be moved from the queue to the heap of processed actionObjects
    // the heap serves as a history of all actions performed by the component and in which order
    // the element with an index smaller than the index of another element represents an action that was performed
    // earlier.
    heap = []
    get heap() {
        return this.heap.slice()
    }

    set heap(newHeap) {
        this.heap = newHeap
    }

}

export {Engine}
