defmodule LogAnalyzer.LogConfig do
  require Logger
  use Agent

  @project_path File.cwd!()
  @log_config_file Path.join(~w(#{@project_path} priv config log_config.json))

  @derive [Poison.Encoder]
  # TODO: use snake_case and convert to camelCase when encoding JSON
  defstruct logFile: nil,
            logPattern: nil,
            logFormat: nil,
            timeFormat: nil

  def start_link(_opts) do
    Agent.start_link(fn -> load() end, name: __MODULE__)
  end

  def get() do
    Agent.get(__MODULE__, fn config -> config end)
  end

  def set(json_config) do
    # TODO: validate time_format
    with {:ok, config} = decode_json(json_config),
         :ok <- LogAnalyzer.Parser.parse(config),
         :ok <- write_file(json_config) do
      Agent.update(__MODULE__, fn _ -> config end)
    else
      {:error, message} ->
        Logger.error(message)
        {:error, message}
    end
  end

  defp load() do
    with {:ok, data} <- read_file(),
         {:ok, config} <- decode_json(data) do
      config
    else
      {level, message} ->
        Logger.log(level, message <> ", use default config")
        defaultLogConfig()
    end
  end

  defp read_file() do
    case File.read(@log_config_file) do
      {:ok, data} ->
        {:ok, data}

      {:error, reason} ->
        if reason == :enoent do
          {:info, "LogConfig file not found"}
        else
          {:error, "Read LogConfig file error: #{reason}"}
        end
    end
  end

  defp decode_json(data) do
    case Poison.decode(data, as: %__MODULE__{}) do
      {:ok, config} ->
        {:ok, config}

      {:error, reason} ->
        {:error, "Decode LogConfig json error: #{reason}"}
    end
  end

  defp defaultLogConfig() do
    %__MODULE__{
      logFile: Path.join(~w(#{@project_path} priv sample sample.log)),
      logPattern: ~s/(.*) - - \\[(.*)\\] "(.*) (.*) (.*)" (.*) (.*) "(.*)" "(.*)" (.*)/,
      logFormat:
        ~w(IP Time RequestMethod RequestURL HTTPVersion ResponseCode ContentSize Referrer UserAgent ResponseTime),
      timeFormat: "{0D}/{Mshort}/{YYYY}:{h24}:{m}:{s} {Z}"
    }
  end

  defp write_file(data) do
    case File.write(@log_config_file, data) do
      :ok ->
        :ok

      {:error, reason} ->
        {:error, "Write LogConfig file error: #{reason}"}
    end
  end
end
