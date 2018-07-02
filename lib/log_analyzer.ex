defmodule LogAnalyzer do
  use Application

  def start(_type, _args) do
    LogAnalyzer.Supervisor.start_link()
  end
end
