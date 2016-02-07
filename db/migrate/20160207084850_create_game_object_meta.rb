class CreateGameObjectMeta < ActiveRecord::Migration[5.0]
  def change
    create_table :game_object_meta do |t|
      t.string :name
      t.string :sub_type
      t.string :front_img
      t.string :back_img
      t.float :width
      t.float :height
      t.text :description

      t.timestamps
    end
  end
end
