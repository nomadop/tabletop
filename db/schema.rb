# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160307051213) do

  create_table "decks", force: :cascade do |t|
    t.string   "sub_type",                    null: false
    t.float    "width"
    t.float    "height"
    t.boolean  "is_expanded", default: false
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.integer  "room_id"
  end

  create_table "game_object_meta", force: :cascade do |t|
    t.string   "name"
    t.string   "sub_type"
    t.string   "front_img"
    t.string   "back_img"
    t.float    "width"
    t.float    "height"
    t.text     "description"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "game_id"
  end

  create_table "game_objects", force: :cascade do |t|
    t.integer  "meta_id",                        null: false
    t.string   "meta_type",                      null: false
    t.float    "center_x",       default: 0.0
    t.float    "center_y",       default: 0.0
    t.float    "rotate",         default: 0.0
    t.boolean  "is_locked",      default: false
    t.boolean  "is_fliped",      default: false
    t.integer  "lock_version",   default: 0
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.integer  "container_id"
    t.string   "container_type"
    t.integer  "deck_index"
    t.integer  "room_id"
    t.integer  "player_id"
  end

  create_table "games", force: :cascade do |t|
    t.string   "name"
    t.string   "module",      null: false
    t.float    "start_scale"
    t.string   "max_player"
    t.text     "description"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "messages", force: :cascade do |t|
    t.integer  "room_id"
    t.integer  "from_id"
    t.integer  "to_id"
    t.string   "level"
    t.string   "content"
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
    t.integer  "msg_type",   default: 0
    t.string   "mp3"
  end

  create_table "player_areas", force: :cascade do |t|
    t.integer  "room_id"
    t.integer  "player_id"
    t.float    "center_x"
    t.float    "center_y"
    t.float    "width"
    t.float    "height"
    t.float    "rotate"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["player_id"], name: "index_player_areas_on_player_id", unique: true
  end

  create_table "players", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "room_id"
    t.integer  "number"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["room_id", "number"], name: "index_players_on_room_id_and_number", unique: true
    t.index ["user_id"], name: "index_players_on_user_id", unique: true
  end

  create_table "rooms", force: :cascade do |t|
    t.integer  "game_id"
    t.integer  "host_id"
    t.string   "name"
    t.string   "password"
    t.integer  "max_player", default: 8
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
    t.boolean  "dev"
    t.index ["game_id", "dev"], name: "index_rooms_on_game_id_and_dev", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.string   "nickname"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["nickname"], name: "index_users_on_nickname", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

end
