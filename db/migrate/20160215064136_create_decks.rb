class CreateDecks < ActiveRecord::Migration[5.0]
  def change
    create_table :decks do |t|
      t.string :sub_type, null: false
      t.float :width
      t.float :height
      t.boolean :is_expanded, default: false

      t.timestamps
    end
  end
end
