defmodule LogAnalyzer.Repo.Supervisor do
  require Logger
  use DynamicSupervisor

  def start_link(_opts) do
    DynamicSupervisor.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def init(:ok) do
    :ets.new(__MODULE__, [:named_table, :public, read_concurrency: true])
    DynamicSupervisor.init(strategy: :one_for_one)
  end

  def start_repo(config, create_database? \\ false)

  def start_repo(config, true) do
    with {:ok, opts} <- get_repo_opts(config),
         :ok <- create_database(),
         :ok <- start_child(opts) do
      :ok
    end
  end

  def start_repo(config, false) do
    with {:ok, opts} <- get_repo_opts(config),
         :ok <- start_child(opts) do
      :ok
    end
  end

  def stop_repo(drop_database? \\ true)

  def stop_repo(true) do
    with :ok <- terminate_child(),
         :ok <- drop_database() do
      :ok
    end
  end

  def stop_repo(false) do
    terminate_child()
  end

  defp get_repo_opts(%LogAnalyzer.DBConfig{driver: "postgres"} = config) do
    opts = [
      adapter: Ecto.Adapters.Postgres,
      database: config.database,
      username: config.username,
      password: config.password,
      hostname: "localhost"
    ]

    :ets.insert(__MODULE__, {:config, Keyword.merge(LogAnalyzer.Repo.config(), opts)})
    {:ok, opts}
  end

  defp get_repo_opts(_config) do
    {:error, "Database config error: unsupported driver"}
  end

  defp create_database() do
    repo = LogAnalyzer.Repo

    case repo.__adapter__.storage_up(repo.config) do
      :ok ->
        Logger.info("Database #{Keyword.get(repo.config, :database)} created successfully")
        :ok

      {:error, :already_up} ->
        {:error, "Database #{Keyword.get(repo.config, :database)} has already been created"}

      {:error, reason} ->
        {:error, "Database #{Keyword.get(repo.config, :database)} create error: #{reason}"}
    end
  end

  defp start_child(opts) do
    case DynamicSupervisor.start_child(__MODULE__, {LogAnalyzer.Repo, opts}) do
      ok when elem(ok, 0) == :ok ->
        Logger.info("LogAnalyzer.Repo started successfully")
        :ets.insert(__MODULE__, {:pid, elem(ok, 1)})
        :ok

      {:error, reason} ->
        {:error, "Dynamic supervisor start child error: #{reason}"}
    end
  end

  defp terminate_child() do
    case :ets.lookup(__MODULE__, :pid) do
      [{_, pid}] ->
        :ets.delete(__MODULE__, :pid)
        case DynamicSupervisor.terminate_child(__MODULE__, pid) do
          :ok ->
            Logger.info("LogAnalyzer.Repo stoped successfully")
            :ok

          {:error, reason} ->
            {:error, "Dynamic supervisor terminate_child child error: #{reason}"}
        end

      [] ->
        # TODO: error?
        :ok
    end
  end

  defp drop_database() do
    repo = LogAnalyzer.Repo

    case repo.__adapter__.storage_down(repo.config) do
      :ok ->
        Logger.info("Database #{Keyword.get(repo.config, :database)} dropped successfully")
        :ok

      {:error, :already_down} ->
        {:error, "Database #{Keyword.get(repo.config, :database)} has already been dropped"}

      {:error, reason} ->
        {:error, "Database #{Keyword.get(repo.config, :database)} drop error: #{reason}"}
    end
  end
end
