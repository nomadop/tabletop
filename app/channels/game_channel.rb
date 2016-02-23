# Be sure to restart your server when you modify this file. Action Cable runs in an EventMachine loop that does not support auto reloading.
class GameChannel < ApplicationCable::Channel
  def user_stream
    "game##{current_user.id}"
  end

  def subscribed
    stream_from 'game'
    stream_from user_stream
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def create_game_object(data)
    meta = GameObjectMetum.find(data['meta_id'])
    object = meta.game_objects.create

    ActionCable.server.broadcast('game', action: :create_game_object, object: object)
  rescue StandardError => e
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def update_game_object(data)
    object = GameObject.find(data['id'])
    object.update(data['attrs'])

    ActionCable.server.broadcast('game', action: :update_game_object, object: object)
  rescue StandardError => e
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def update_game_objects(data)
    GameObject.transaction do
      objects = data['objects'].map do |json|
        object = GameObject.find(json['id'])
        object.update(json)
        object
      end

      ActionCable.server.broadcast('game', action: :update_game_objects, objects: objects)
    end
  rescue StandardError => e
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def create_deck(data)
    game_objects = GameObject.includes(:meta).where(id: data['ids'])

    if (deck = Deck.create_deck(game_objects))
      ActionCable.server.broadcast('game', action: :create_deck, deck: deck, object: deck.game_object)
      ActionCable.server.broadcast('game', action: :remove_game_objects, object_ids: game_objects.ids)
    end
  rescue StandardError => e
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end

  def join_deck(data)
    game_objects = GameObject.find(data['ids'])
    deck = Deck.find(data['deck_id'])

    if deck.join(game_objects)
      ActionCable.server.broadcast('game', action: :remove_game_objects, object_ids: data['ids'])
    else
      ActionCable.server.broadcast('game', action: :update_game_objects, objects: game_objects)
    end

    ActionCable.server.broadcast('game', action: :update_deck, deck: deck)
  rescue StandardError => e
    ActionCable.server.broadcast(user_stream, action: :error, error: e)
  end
end
