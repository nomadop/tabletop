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

ActiveRecord::Schema.define(version: 20160208125009) do

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
    t.integer  "user_id"
    t.integer  "meta_id",                      null: false
    t.string   "meta_type",                    null: false
    t.float    "center_x",     default: 0.0
    t.float    "center_y",     default: 0.0
    t.float    "rotate",       default: 0.0
    t.boolean  "is_locked",    default: false
    t.boolean  "is_fliped",    default: false
    t.integer  "lock_version", default: 0
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
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
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

end
