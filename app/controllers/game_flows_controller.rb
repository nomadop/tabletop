class GameFlowsController < ApplicationController
  before_action :set_game
  before_action :set_game_flow, only: [:show, :edit, :update, :destroy]

  # GET /game/1/flows
  # GET /game/1/flows.json
  def index
    @game_flows = @game.flows.order(:id)
  end

  # GET /game/1/flows/1
  # GET /game/1/flows/1.json
  def show
  end

  # GET /game/1/flows/new
  def new
    @game_flow = @game.flows.new
  end

  # GET /game/1/flows/1/edit
  def edit
  end

  # POST /game/1/flows
  # POST /game/1/flows.json
  def create
    @game_flow = @game.flows.new(game_flow_params)
    @game_flow.to_transitions.each { |transition| transition.from_flow = @game_flow }

    respond_to do |format|
      if @game_flow.save
        format.html { redirect_to [@game, @game_flow], notice: 'Game flow was successfully created.' }
        format.json { render :show, status: :created, location: [@game, @game_flow] }
      else
        format.html { render :new }
        format.json { render json: @game_flow.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /game/1/flows/1
  # PATCH/PUT /game/1/flows/1.json
  def update
    @game_flow.to_transitions.destroy_all
    respond_to do |format|
      if @game_flow.update(game_flow_params)
        format.html { redirect_to [@game, @game_flow], notice: 'Game flow was successfully updated.' }
        format.json { render :show, status: :ok, location: [@game, @game_flow] }
      else
        format.html { render :edit }
        format.json { render json: @game_flow.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /game/1/flows/1
  # DELETE /game/1/flows/1.json
  def destroy
    @game_flow.destroy
    respond_to do |format|
      format.html { redirect_to game_game_flows_path(@game), notice: 'Game flow was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_game
    @game = Game.find(params[:game_id])
  end

  def set_game_flow
    @game_flow = GameFlow.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def game_flow_params
    game_flow_params = params.require(:game_flow).permit(:name, :actions, :to_transitions)
    game_flow_params[:actions] = JSON.parse(game_flow_params[:actions])
    transition_creater = instance_variable_defined?(:@game_flow) ? @game_flow.to_transitions : FlowTransition
    game_flow_params[:to_transitions] = transition_creater.create JSON.parse(game_flow_params[:to_transitions])
    game_flow_params
  end
end
