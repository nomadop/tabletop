# Be sure to restart your server when you modify this file. Action Cable runs in an EventMachine loop that does not support auto reloading.
class GameChannel < ApplicationCable::Channel
  def game_stream
    "game@#{current_user.room_id}"
  end

  def user_stream
    "game##{current_user.id}"
  end

  def serializer
    GameObject.method(:serialize_game_object)
  end

  def serialize(object)
    GameObject.serialize_game_object(object)
  end

  def unserializer
    GameObject.method(:unserialize_game_object)
  end

  def unserialize(serial)
    GameObject.unserialize_game_object(serial)
  end

  def subscribed
    stream_from game_stream
    stream_from user_stream
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def create_game_object(data)
    meta = GameObjectMetum.find(data['meta_id'])
    room = current_user.room
    object = room.game_objects.create(meta: meta)

    ActionCable.server.broadcast(game_stream, action: :create_game_object, object: serialize(object))
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def create_game_objects(data)
    meta = GameObjectMetum.where(id: data['ids'])
    room = current_user.room
    create_script = meta.map { |metum| { room: room, meta: metum } }
    GameObject.transaction do
      objects = GameObject.create(create_script)

      room.messages.create(level: :info, content: "玩家#{current_user.player_num}(#{current_user.username})创建了#{meta.first(3).map(&:name)}等#{meta.count}个物件.")
      ActionCable.server.broadcast(game_stream, action: :create_game_objects, objects: objects.map(&serializer))
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def create_and_pack_game_objects(data)
    meta = GameObjectMetum.where(id: data['ids'])
    room = current_user.room
    create_script = meta.map { |metum| { room: room, meta: metum } }
    Deck.transaction do
      GameObject.transaction do
        objects = GameObject.create(create_script)
        deck = Deck.create_deck(room, objects)

        ActionCable.server.broadcast(game_stream, action: :create_deck, deck: deck, object: serialize(deck.game_object))
        ActionCable.server.broadcast(game_stream, action: :create_game_objects, objects: objects.map(&serializer))
      end
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def update_game_objects(data)
    unserialzed_objects = data['objects'].map(&unserializer)
    object_ids = unserialzed_objects.map { |obj| obj['id'] }
    GameObject.transaction do
      objects = GameObject.includes(:meta).where(id: object_ids, is_locked: true, player: current_user.player)
      objects.find_each do |object|
        json = unserialzed_objects.find { |obj| obj['id'] == object.id.to_s }
        object.update(json)
      end

      ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: GameObject.where(id: object_ids).map(&serializer))
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def create_deck(data)
    game_objects = GameObject.includes(:meta).where(id: data['ids'])
    unless game_objects.all? { |o| o.require_lock(current_user.player_id) }
      return ActionCable.server.broadcast(user_stream, action: :error, error: { message: 'no access' })
    end

    if (deck = Deck.create_deck(current_user.room, game_objects))
      ActionCable.server.broadcast(game_stream, action: :create_deck, deck: deck, object: serialize(deck.game_object))
      ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: game_objects.map(&serializer))
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def join_deck(data)
    game_objects = GameObject.where(id: data['ids'])
    unless game_objects.all? { |o| o.require_lock(current_user.player_id) }
      return ActionCable.server.broadcast(user_stream, action: :error, error: { message: 'no access' })
    end

    deck = Deck.find(data['deck_id'])

    if game_objects.any? && deck.game_object.require_lock(current_user.player_id)
      deck.join(game_objects)
      deck.game_object.release_lock
      ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: game_objects.map(&serializer))
      ActionCable.server.broadcast(game_stream, action: :update_deck, deck: deck.reload)
    else
      ActionCable.server.broadcast(user_stream, action: :join_failed, objects: game_objects.map(&serializer))
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def draw(data)
    deck = Deck.find(data['deck_id'])
    return ActionCable.server.broadcast(user_stream, action: :draw_failed, message: 'invalid deck id') unless deck
    return ActionCable.server.broadcast(user_stream, action: :error, error: { message: 'no access' }) unless deck.game_object.require_lock(current_user.player_id)

    game_object = deck.draw(player_id: current_user.player_id, target_id: data['target_id'])
    deck.game_object.release_lock
    if game_object
      ActionCable.server.broadcast(game_stream, action: :update_deck, deck: deck.reload)
      ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: Array(serialize(deck.game_object)))
      ActionCable.server.broadcast(user_stream, action: :draw_success, object: serialize(game_object))
    else
      ActionCable.server.broadcast(user_stream, action: :draw_failed, message: 'no target')
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :draw_failed, message: 'system error')
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def toggle_deck(data)
    deck = Deck.find(data['deck_id'])
    is_expanded = data['is_expanded'] == 't' ? true : false
    if deck.game_object.require_lock(current_user.player_id)
      Deck.transaction do
        GameObject.transaction do
          deck.update(is_expanded: is_expanded)
          deck.game_object.update(is_fliped: !is_expanded)
        end
      end

      ActionCable.server.broadcast(game_stream, action: :update_deck, deck: deck)
      ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: Array(serialize(deck.game_object)))
    else
      ActionCable.server.broadcast(user_stream, action: :error, error: { message: 'no access' })
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def destroy_game_objects(data)
    objects = GameObject.where(id: data['ids'])
    unless objects.all? { |o| o.require_lock(current_user.player_id) }
      return ActionCable.server.broadcast(user_stream, action: :error, error: { message: 'no access' })
    end

    decks = Deck.joins(:game_object).where(game_objects: { id: data['ids'] })
    inner_object_ids = decks.flat_map(&:inner_object_ids)

    Deck.transaction do
      GameObject.transaction do
        decks.destroy_all
        objects.delete_all
      end
    end

    if inner_object_ids.any?
      inner_objects = GameObject.find(inner_object_ids)
      ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: inner_objects.map(&serializer))
    end
    ActionCable.server.broadcast(game_stream, action: :remove_game_objects, object_ids: data['ids'])
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def lock_game_object(data)
    object = GameObject.find(data['id'])

    if object.require_lock(current_user.player_id)
      ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: [serialize(object)])
    else
      ActionCable.server.broadcast(user_stream, action: :lock_failed, object: serialize(object))
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def release_game_objects(data)
    objects = GameObject.includes(:player).where(id: data['ids'])

    if objects.all? { |o| o.is_locked && o.player == current_user.player }
      objects.update_all(is_locked: false, player_id: nil)
      ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: objects.reload.map(&serializer))
    else
      ActionCable.server.broadcast(user_stream, action: :release_failed, objects: objects.map(&serializer))
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def create_player_area(data)
    if PlayerArea.where(player: current_user.player).any?
      return ActionCable.server.broadcast(game_stream, action: :error, error: { message: 'Player area exist' })
    end

    area = PlayerArea.new(data['area'].merge(room: current_user.room, player: current_user.player))

    if area.save
      ActionCable.server.broadcast(game_stream, action: :create_player_area, area: area)
      ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: area.inner_objects.map(&serializer))
    else
      ActionCable.server.broadcast(game_stream, action: :error, error: { message: 'Create area failed' })
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def destroy_player_area()
    area = PlayerArea.where(player: current_user.player).take
    if area.nil?
      return ActionCable.server.broadcast(game_stream, action: :error, error: { message: 'No area exist' })
    end

    inner_object_ids = area.inner_object_ids
    if area.destroy
      ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: GameObject.where(id: inner_object_ids).map(&serializer))
      ActionCable.server.broadcast(game_stream, action: :destroy_player_area, area_id: area.id)
    else
      ActionCable.server.broadcast(game_stream, action: :error, error: { message: 'Destroy area failed' })
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def send_message(data)
    if (body = data['mp3'])
      base64 = body[22..-1]
      blob = Base64.decode64(base64)
      t = Tempfile.new(%w(voice .mp3))
      t.binmode
      t.write(blob)
      msg = current_user.room.messages.audio.create(from: current_user, level: :normal, mp3: t)
      ActionCable.server.broadcast(game_stream, action: :new_message, message: msg)
    else
      current_user.room.messages.create(from: current_user, level: :normal, content: data['content'])
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def destroy_meta(data)
    meta = GameObjectMetum.includes(:game).where(id: data['ids'])
    if meta.all? { |metum| metum.game.dev_room == current_user.room }
      a_meta = meta.to_a
      meta.destroy_all
      current_user.room.messages.create(level: :info, content: "#{current_user.username}移除了#{a_meta.first(3).map(&:name)}等#{a_meta.size}个元物件.")
      ActionCable.server.broadcast(game_stream, action: :destroy_meta, meta_ids: data['ids'])
    else
      ActionCable.server.broadcast(user_stream, action: :error, error: {message: 'no access'})
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end
end
