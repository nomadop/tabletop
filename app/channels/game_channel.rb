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

  def update_game_object(data)
    object = GameObject.find(data['id'])
    object.update(data['attrs'])

    ActionCable.server.broadcast(game_stream, action: :update_game_object, object: serialize(object))
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def update_game_objects(data)
    unserialzed_objects = data['objects'].map(&unserializer)
    GameObject.transaction do
      objects = GameObject.includes(:meta).where(id: unserialzed_objects.map{ |obj| obj['id'] })
      objects.find_each do |object|
        json = unserialzed_objects.find { |obj| obj['id'] == object.id.to_s }
        object.update(json)
      end

      ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: objects.map(&serializer))
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def create_deck(data)
    game_objects = GameObject.includes(:meta).where(id: data['ids'])

    if (deck = Deck.create_deck(current_user.room, game_objects))
      ActionCable.server.broadcast(game_stream, action: :create_deck, deck: deck, object: serialize(deck.game_object))
      ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: game_objects.map(&serializer))
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def join_deck(data)
    game_objects = GameObject.find(data['ids'])
    deck = Deck.find(data['deck_id'])

    deck.join(game_objects)
    ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: game_objects.map(&serializer))
    ActionCable.server.broadcast(game_stream, action: :update_deck, deck: deck.reload)
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def draw(data)
    deck = Deck.find(data['deck_id'])
    return ActionCable.server.broadcast(user_stream, action: :draw_failed, message: 'invalid deck id') unless deck

    game_object = deck.draw(player_id: current_user.player_id, target_id: data['target_id'])
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
    Deck.transaction do
      GameObject.transaction do
        deck.update(is_expanded: is_expanded)
        deck.game_object.update(is_fliped: !is_expanded)
      end
    end

    ActionCable.server.broadcast(game_stream, action: :update_deck, deck: deck)
    ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: Array(serialize(deck.game_object)))
  end

  def destroy_game_objects(data)
    decks = Deck.joins(:game_object).where(game_objects: {id: data['ids']})
    inner_object_ids = decks.flat_map(&:inner_object_ids)

    Deck.transaction do
      GameObject.transaction do
        decks.destroy_all
        GameObject.where(id: data['ids']).delete_all
      end
    end

    if inner_object_ids.any?
      inner_objects = GameObject.find(inner_object_ids)
      ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: inner_objects.map(&serializer))
    end
    ActionCable.server.broadcast(game_stream, action: :remove_game_objects, object_ids: data['ids'])
  end
end
