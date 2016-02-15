# Be sure to restart your server when you modify this file. Action Cable runs in an EventMachine loop that does not support auto reloading.
class GameChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'game'
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def create_game_object(data)
    meta = GameObjectMetum.find(data['meta_id'])
    object = meta.game_object.create

    ActionCable.server.broadcast('game', action: :create_game_object, object: object)
  end

  def update_game_object(data)
    object = GameObject.find(data['id'])
    object.update(data['attrs'])

    ActionCable.server.broadcast('game', action: :update_game_object, object: object)
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
  end
end
