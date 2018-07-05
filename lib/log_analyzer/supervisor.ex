defmodule LogAnalyzer.Supervisor do
  use Supervisor

  def start_link() do
    Supervisor.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def init(:ok) do
    children = [
      {LogAnalyzer.DBConfig, []},
      {LogAnalyzer.LogConfig, []},
      {LogAnalyzer.RepoSupervisor, []}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end