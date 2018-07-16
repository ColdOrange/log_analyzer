defmodule LogAnalyzer.DBConfig do
  require Logger
  use Agent
  alias LogAnalyzer.Repo.{Migrator, Supervisor}

  @project_path File.cwd!()
  @db_config_file Path.join(~w(#{@project_path} priv config db_config.json))

  @derive [Poison.Encoder]
  defstruct initialized: false,
            driver: nil,
            username: nil,
            password: nil,
            database: nil

  def start_link(_opts) do
    Agent.start_link(fn -> load() end, name: __MODULE__)
  end

  def get() do
    Agent.get(__MODULE__, fn config -> config end)
  end

  def set(json_config) do
    with {:ok, config} = decode_json(json_config),
         :ok <- Supervisor.stop_repo(get().initialized),
         :ok <- Supervisor.start_repo(config, true),
         :ok <- Migrator.create_report_table(),
         :ok <- write_file(json_config) do
      Agent.update(__MODULE__, fn _ -> %{config | initialized: true} end)
    else
      {:error, message} ->
        Logger.error(message)
        {:error, message}
    end
  end

  defp load() do
    with {:ok, data} <- read_file(),
         {:ok, config} <- decode_json(data) do
      Supervisor.start_repo(config)
      %{config | initialized: true}
    else
      {level, message} ->
        Logger.log(level, message <> ", uninitialized")
        %__MODULE__{}
    end
  end

  defp read_file() do
    case File.read(@db_config_file) do
      {:ok, data} ->
        {:ok, data}

      {:error, reason} ->
        if reason == :enoent do
          {:info, "DBConfig file not found"}
        else
          {:error, "Read DBConfig file error: #{reason}"}
        end
    end
  end

  defp decode_json(data) do
    case Poison.decode(data, as: %__MODULE__{}) do
      {:ok, config} ->
        {:ok, config}

      {:error, reason} ->
        {:error, "Decode DBConfig json error: #{reason}"}
    end
  end

  defp write_file(data) do
    case File.write(@db_config_file, data) do
      :ok ->
        :ok

      {:error, reason} ->
        {:error, "Write DBConfig file error: #{reason}"}
    end
  end
end
