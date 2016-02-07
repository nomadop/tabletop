receivers = []

App.chat = App.cable.subscriptions.create "ChatChannel",
  connected: ->
    # Called when the subscription is ready for use on the server

  disconnected: (data) ->
    # Called when the subscription has been terminated by the server

  received: (data) ->
    receivers.forEach (receiver) ->
      receiver(data)

  speak: (msg) ->
    @perform 'speak', message: msg

  register_receiver: (receiver) ->
    receivers.push receiver


  unregister_receiver: (receiver) ->
    index = receivers.findIndex(receiver)
    receivers.splice(index, 1) if index >= 0

window.addEventListener 'beforeunload', ->
  App.chat.unsubscribe()
  return