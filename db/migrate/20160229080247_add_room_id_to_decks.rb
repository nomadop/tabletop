class AddRoomIdToDecks < ActiveRecord::Migration[5.0]
  def change
    add_column :decks, :room_id, :integer, null: false
  end
end
