receivers = []

App.game = App.cable.subscriptions.create "GameChannel",
  connected: ->
# Called when the subscription is ready for use on the server

  disconnected: (data) ->
# Called when the subscription has been terminated by the server

  received: (data) ->
    receivers.forEach (receiver) ->
      receiver(data)

  register_receiver: (receiver) ->
    receivers.push receiver

  unregister_receiver: (receiver) ->
    index = receivers.findIndex(receiver)
    receivers.splice(index, 1) if index >= 0

  create_game_object: (meta_id) ->
    @perform 'create_game_object', meta_id: meta_id

  update_game_object: (id, attrs) ->
    @perform 'update_game_object', id: id, attrs: attrs

window.addEventListener 'beforeunload', ->
  App.game.unsubscribe()
  return