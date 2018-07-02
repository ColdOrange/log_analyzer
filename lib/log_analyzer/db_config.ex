defmodule LogAnalyzer.DBConfig do
  require Logger
  use Agent

  @project_path File.cwd!()
  @db_config_file Path.join(~w(#{@project_path} priv config db_config.json))

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

  def set(config) do
    Agent.update(__MODULE__, fn _config -> config end)
  end

  defp load() do
    case File.read(@db_config_file) do
      {:ok, data} ->
        case Poison.decode(data, %__MODULE__{}) do
          {:ok, config} ->
            config

          {:error, reason} ->
            Logger.error("Decode DBConfig file error: #{inspect(reason)}, uninitialized")
            %__MODULE__{}
        end

      {:error, reason} ->
        if reason == :enoent do
          Logger.debug("DBConfig file not found, uninitialized")
        else
          Logger.error("Read DBConfig file error: #{inspect(reason)}, uninitialized")
        end

        %__MODULE__{}
    end
  end
end
