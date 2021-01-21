const matcher = require('../src/matcher')
const _ = require('fauxdash')

function on (topics, topic, fn) {
    var m = matcher.create(topic)
    var obj = {
        test: m.test,
        calls: [fn]
    }
    if (!topics[topic]) {
        topics[topic] = obj
    } else {
        topics[topic].calls.push(fn)
    }
}

function dispatch (topics, topic, event) {
    _.each(topics, (v, k) => {
        if (v.test(topic)) {
            _.each(v.calls, c => {
                try {
                    c.call(null, topic, event)
                } catch (e) {
                    console.error(`exception caught dispatching event to topic '${topic}':\n  ${e.stack}`)
                }
            })
        }
    })
}

function remove (topics, topic, fn) {
    var m = matcher.create(topic)
    let list = topics[m.topic].calls
    list.splice(list.indexOf(fn), 1)
    if (list.length == 0) {
        delete topics[m.topic]
    }
}

function removeAll(topics, topic) {
    var m = matcher.create(topic)
    delete topics[m.topic]
}

module.exports = function() {
    const topics = {}
    return {
        dispatch: dispatch.bind(null, topics),
        on: on.bind(null, topics),
        remove: remove.bind(null, topics),
        removeAll: removeAll.bind(null, topics)
    }
}