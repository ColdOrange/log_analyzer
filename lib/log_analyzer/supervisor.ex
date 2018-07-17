defmodule LogAnalyzer.Supervisor do
  use Supervisor

  def start_link() do
    Supervisor.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def init(:ok) do
    children = [
      {LogAnalyzer.Repo.Supervisor, []},
      {LogAnalyzer.DBConfig, []},
      {LogAnalyzer.LogConfig, []},
      {LogAnalyzer.Server, port: 4000}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
