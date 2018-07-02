defmodule LogAnalyzer.LogConfig do
  require Logger
  use Agent

  @project_path File.cwd!()
  @log_config_file Path.join(~w(#{@project_path} priv config log_config.json))

  defstruct initialized: false,
            log_file: nil,
            log_pattern: nil,
            log_format: nil,
            time_format: nil

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
    case File.read(@log_config_file) do
      {:ok, data} ->
        case Poison.decode(data, %__MODULE__{}) do
          {:ok, config} ->
            config

          {:error, reason} ->
            Logger.error("Decode LogConfig file error: #{inspect(reason)}, uninitialized")
            defaultLogConfig()
        end

      {:error, reason} ->
        if reason == :enoent do
          Logger.debug("LogConfig file not found, uninitialized")
        else
          Logger.error("Read LogConfig file error: #{inspect(reason)}, uninitialized")
        end

        defaultLogConfig()
    end
  end

  defp defaultLogConfig() do
    %__MODULE__{
      initialized: true,
      log_file: Path.join(~w(#{@project_path} priv sample sample.log)),
      log_pattern: ~r/(.*) - - \[(.*)\] "(.*) (.*) (.*)" (.*) (.*) "(.*)" "(.*)" (.*)/,
      log_format:
        ~w(IP Time RequestMethod RequestURL HTTPVersion ResponseCode ContentSize Referrer UserAgent ResponseTime),
      time_format: "{0D}/{MShort}/{YYYY}:{h24}:{m}:{s} {Z}"
    }
  end
end
