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

  def start_repo(config, create_database?) do
    case repo_opts(config) do
      {:ok, opts} ->
        :ets.insert(__MODULE__, {:config, Keyword.merge(LogAnalyzer.Repo.config(), opts)})

        if create_database? do
          create_database()
        end

        case DynamicSupervisor.start_child(__MODULE__, {LogAnalyzer.Repo, opts}) do
          ok when elem(ok, 0) == :ok ->
            Logger.debug("LogAnalyzer.Repo started successfully")
            :ets.insert(__MODULE__, {:pid, elem(ok, 1)})
            {:ok, elem(ok, 1)}

          {:error, reason} = error ->
            Logger.error("Dynamic supervisor start child error: #{inspect(reason)}")
            error
        end

      {:error, reason} = error ->
        Logger.error("Database config error: #{inspect(reason)}")
        error
    end
  end

  def stop_repo(drop_database?) do
    [{_, pid}] = :ets.lookup(__MODULE__, :pid)

    case DynamicSupervisor.terminate_child(__MODULE__, pid) do
      :ok ->
        Logger.debug("LogAnalyzer.Repo stoped successfully")
        :ok

      {:error, reason} = error ->
        Logger.error("Dynamic supervisor terminate_child child error: #{inspect(reason)}")
        error
    end

    if drop_database? do
      drop_database()
    end
  end

  defp create_database() do
    repo = LogAnalyzer.Repo

    case repo.__adapter__.storage_up(repo.config) do
      :ok ->
        Logger.debug("Database #{Keyword.get(repo.config, :database)} created successfully")

      {:error, :already_up} ->
        Logger.error("Database #{Keyword.get(repo.config, :database)} has already been created")

      {:error, reason} ->
        Logger.error(
          "Database #{Keyword.get(repo.config, :database)} create error: #{inspect(reason)}"
        )
    end
  end

  defp drop_database() do
    repo = LogAnalyzer.Repo

    case repo.__adapter__.storage_down(repo.config) do
      :ok ->
        Logger.debug("Database #{Keyword.get(repo.config, :database)} dropped successfully")

      {:error, :already_down} ->
        Logger.error("Database #{Keyword.get(repo.config, :database)} has already been dropped")

      {:error, reason} ->
        Logger.error(
          "Database #{Keyword.get(repo.config, :database)} drop error: #{inspect(reason)}"
        )
    end
  end

  defp repo_opts(%LogAnalyzer.DBConfig{driver: "postgres"} = config) do
    {:ok,
     [
       adapter: Ecto.Adapters.Postgres,
       database: config.database,
       username: config.username,
       password: config.password,
       hostname: "localhost"
     ]}
  end

  defp repo_opts(_config) do
    {:error, :unsupported_driver}
  end
end
