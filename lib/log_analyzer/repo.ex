defmodule LogAnalyzer.Repo do
  @opt_app :log_analyzer
  use Ecto.Repo, otp_app: @opt_app

  defoverridable config: 0

  def config() do
    dynamic_config =
      case :ets.lookup(LogAnalyzer.Repo.Supervisor, :config) do
        [{_, config}] -> config
        [] -> []
      end

    {:ok, config} =
      Ecto.Repo.Supervisor.runtime_config(:dry_run, __MODULE__, @otp_app, dynamic_config)

    config
  end
end
