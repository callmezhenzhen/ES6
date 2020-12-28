class Subject {
    constructor () {
        this.state = 1
        this.observers = []
    }

    setState (nv) {
        this.state = nv
        this.notifyObserver()
    }

    addObserver (observer) {
        this.observers.push(observer)
    }

    notifyObserver () {
        this.observers.forEach(observer => {observer.handler(this.state)})
    }
}

class Observer {
    constructor (handler) {
        this.handler = handler
    }
}

const subject = new Subject()
const observer1 = new Observer((value) => {console.log('observer1 is listenning subject.state: ', value)})
const observer2 = new Observer((value) => {console.log('observer2 is listenning subject.state: ', value)})
subject.addObserver(observer1)
subject.addObserver(observer2)
subject.setState(2)



