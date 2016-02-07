class GameObjectMetaController < ApplicationController
  before_action :set_game_object_metum, only: [:show, :edit, :update, :destroy]

  # GET /game_object_meta
  # GET /game_object_meta.json
  def index
    @game_object_meta = GameObjectMetum.all
  end

  # GET /game_object_meta/1
  # GET /game_object_meta/1.json
  def show
  end

  # GET /game_object_meta/new
  def new
    @game_object_metum = GameObjectMetum.new
  end

  # GET /game_object_meta/1/edit
  def edit
  end

  # POST /game_object_meta
  # POST /game_object_meta.json
  def create
    @game_object_metum = GameObjectMetum.new(game_object_metum_params)

    respond_to do |format|
      if @game_object_metum.save
        format.html { redirect_to @game_object_metum, notice: 'Game object metum was successfully created.' }
        format.json { render :show, status: :created, location: @game_object_metum }
      else
        format.html { render :new }
        format.json { render json: @game_object_metum.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /game_object_meta/1
  # PATCH/PUT /game_object_meta/1.json
  def update
    respond_to do |format|
      if @game_object_metum.update(game_object_metum_params)
        format.html { redirect_to @game_object_metum, notice: 'Game object metum was successfully updated.' }
        format.json { render :show, status: :ok, location: @game_object_metum }
      else
        format.html { render :edit }
        format.json { render json: @game_object_metum.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /game_object_meta/1
  # DELETE /game_object_meta/1.json
  def destroy
    @game_object_metum.destroy
    respond_to do |format|
      format.html { redirect_to game_object_meta_url, notice: 'Game object metum was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_game_object_metum
      @game_object_metum = GameObjectMetum.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def game_object_metum_params
      params.require(:game_object_metum).permit(:name, :sub_type, :front_img, :back_img, :width, :height, :description)
    end
end
