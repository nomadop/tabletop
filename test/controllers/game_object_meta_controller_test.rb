require 'test_helper'

class GameObjectMetaControllerTest < ActionDispatch::IntegrationTest
  setup do
    @game_object_metum = game_object_meta(:one)
  end

  test "should get index" do
    get game_object_meta_url
    assert_response :success
  end

  test "should get new" do
    get new_game_object_metum_url
    assert_response :success
  end

  test "should create game_object_metum" do
    assert_difference('GameObjectMetum.count') do
      post game_object_meta_url, params: { game_object_metum: { back_img: @game_object_metum.back_img, description: @game_object_metum.description, front_img: @game_object_metum.front_img, height: @game_object_metum.height, name: @game_object_metum.name, sub_type: @game_object_metum.sub_type, width: @game_object_metum.width } }
    end

    assert_redirected_to game_object_metum_path(GameObjectMetum.last)
  end

  test "should show game_object_metum" do
    get game_object_metum_url(@game_object_metum)
    assert_response :success
  end

  test "should get edit" do
    get edit_game_object_metum_url(@game_object_metum)
    assert_response :success
  end

  test "should update game_object_metum" do
    patch game_object_metum_url(@game_object_metum), params: { game_object_metum: { back_img: @game_object_metum.back_img, description: @game_object_metum.description, front_img: @game_object_metum.front_img, height: @game_object_metum.height, name: @game_object_metum.name, sub_type: @game_object_metum.sub_type, width: @game_object_metum.width } }
    assert_redirected_to game_object_metum_path(@game_object_metum)
  end

  test "should destroy game_object_metum" do
    assert_difference('GameObjectMetum.count', -1) do
      delete game_object_metum_url(@game_object_metum)
    end

    assert_redirected_to game_object_meta_path
  end
end
