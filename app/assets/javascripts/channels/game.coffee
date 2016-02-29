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

  update_game_objects: (gameObjects) ->
    @perform 'update_game_objects', objects: gameObjects

  create_deck: (ids) ->
    @perform 'create_deck', ids: ids

  join_deck: (deck_id, ids) ->
    @perform 'join_deck', deck_id: deck_id, ids: ids

  draw: (deck_id, target_id) ->
    @perform 'draw', deck_id: deck_id, target_id: target_id

  toggle_deck: (deck_id, is_expanded) ->
    @perform 'toggle_deck', deck_id: deck_id, is_expanded: if is_expanded then 't' else 'f'

window.addEventListener 'beforeunload', ->
  App.game.unsubscribe()
  return