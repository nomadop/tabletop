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

  create_game_objects: (ids) ->
    @perform 'create_game_objects', ids: ids

  create_and_pack_game_objects: (ids) ->
    @perform 'create_and_pack_game_objects', ids: ids

  update_game_object: (id, attrs) ->
    @perform 'update_game_object', id: id, attrs: attrs

  update_game_objects: (gameObjects, keys) ->
    @perform 'update_game_objects', keys: keys, objects: gameObjects

  create_deck: (ids) ->
    @perform 'create_deck', ids: ids

  join_deck: (deck_id, ids) ->
    @perform 'join_deck', deck_id: deck_id, ids: ids

  draw: (deck_id, target_id) ->
    @perform 'draw', deck_id: deck_id, target_id: target_id

  toggle_deck: (deck_id, is_expanded) ->
    @perform 'toggle_deck', deck_id: deck_id, is_expanded: if is_expanded then 't' else 'f'

  destroy_game_objects: (ids) ->
    @perform 'destroy_game_objects', ids: ids if ids.length > 0

  lock_game_object: (id) ->
    return if window.requiringLock
    window.requiringLock = true;
    @perform 'lock_game_objects', ids: if Array.isArray(id) then id else [id]

  release_game_objects: (ids) ->
    @perform 'release_game_objects', ids: ids if ids.length > 0

  create_player_area: (area) ->
    @perform 'create_player_area', area: area

  destroy_player_area: ->
    @perform 'destroy_player_area'

  send_message: (content, mp3) ->
    @perform 'send_message', content: content, mp3: mp3

  destroy_meta: (ids) ->
    @perform 'destroy_meta', ids: ids

  add_role: (role) ->
    @perform 'add_role', role: role

  remove_role: (role) ->
    @perform 'remove_role', role: role

  start_flow: (arg) ->
    restart = if arg == 'restart' then 'true' else 'false'
    @perform 'start_flow', restart: restart

  confirm_vote: (vote) ->
    @perform 'confirm_vote', vote: vote

window.addEventListener 'beforeunload', ->
  App.game.unsubscribe()
  return