# Be sure to restart your server when you modify this file. Action Cable runs in an EventMachine loop that does not support auto reloading.
class GameChannel < ApplicationCable::Channel
  def game_stream
    'game'
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
    object = meta.game_objects.create

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

    if (deck = Deck.create_deck(game_objects))
      ActionCable.server.broadcast(game_stream, action: :create_deck, deck: deck, object: serialize(deck.game_object))
      ActionCable.server.broadcast(game_stream, action: :remove_game_objects, object_ids: game_objects.ids)
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def join_deck(data)
    game_objects = GameObject.find(data['ids'])
    deck = Deck.find(data['deck_id'])

    if deck.join(game_objects)
      ActionCable.server.broadcast(game_stream, action: :remove_game_objects, object_ids: data['ids'])
    else
      ActionCable.server.broadcast(game_stream, action: :update_game_objects, objects: game_objects.map(&serializer))
    end

    ActionCable.server.broadcast(game_stream, action: :update_deck, deck: deck)
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def draw(data)
    deck = Deck.find(data['deck_id'])
    return ActionCable.server.broadcast(user_stream, action: :draw_failed, message: 'invalid deck id') unless deck

    game_object = deck.draw(user_id: current_user.id, target_id: data['target_id'])
    if game_object
      ActionCable.server.broadcast(game_stream, action: :update_deck, deck: deck)
      ActionCable.server.broadcast(user_stream, action: :draw_success, object: serialize(game_object))
    else
      ActionCable.server.broadcast(user_stream, action: :draw_failed, message: 'no target')
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    ActionCable.server.broadcast(user_stream, action: :draw_failed, message: 'system error')
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end
end
