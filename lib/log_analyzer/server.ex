defmodule LogAnalyzer.Server do
  use GenServer

  def start_link(_opts) do
    Plug.Adapters.Cowboy2.http(LogAnalyzer.Server.Router, [])
  end

  def init(args) do
    {:ok, args}
  end
end
