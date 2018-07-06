defmodule LogAnalyzer.Parser do
  require Logger
  import Ecto.Query
  alias LogAnalyzer.{LogConfig, Repo}
  alias LogAnalyzer.Repo.Migrator

  def parse(id) do
    log_config = LogConfig.get()
    Logger.info("Starting parsing log file <#{log_config.log_file}>")
    zero = System.monotonic_time()

    case Regex.compile(log_config.log_pattern) do
      {:ok, pattern} ->
        # case Migrator.create_report_table() do
        #   {:ok, _result} ->
        #     File.stream!(log_config.log_file)
        #     |> Stream.map(&String.trim_trailing/1)
        #     |> Stream.with_index()
        #     |> Stream.map(fn {line, index} -> IO.puts("#{index + 1} #{line}") end)
        #     |> Stream.run()

        #   {:error, exception} ->
        #     error_message = "Create report table error: #{exception.message}"
        #     Logger.error(error_message)
        #     {:error, error_message}
        # end
        Migrator.create_report_table()

        File.stream!(log_config.log_file)
        |> Stream.map(&String.trim_trailing/1)
        |> Stream.with_index()
        |> Stream.map(fn {line, index} ->
          case parse_line(line, index + 1, pattern, log_config.log_format, log_config.time_format) do
            {:ok, values} ->
              Repo.insert_all()

            _ ->
              :noop
          end
        end)
        |> Stream.run()

      {:error, reason} ->
        error_message = "Log pattern compile error: #{reason}"
        Logger.error(error_message)
        {:error, error_message}
    end

    Logger.debug("Finished inserting into DB")

    diff = System.monotonic_time() - zero
    seconds = System.convert_time_unit(diff, :native, :milli_seconds) / 1000
    Logger.info("Finished parsing log file in #{seconds}s")
    :ok
  end

  def parse_line(line, index, pattern, formats, time_format) do
    case Regex.run(pattern, line) do
      [_ | fields] when length(fields) == length(formats) ->
        parse_fields(fields, formats, Keyword.new(), index, time_format)

      _ ->
        error_message = "Log format error at line #{index}"
        Logger.warn(error_message)
        {:error, error_message}
    end
  end

  def parse_fields([], [], values, _, _) do
    {:ok, values}
  end

  def parse_fields([field | fields], [format | formats], values, index, time_format) do
    case parse_field(field, format, index, time_format) do
      {:ok, value} ->
        parse_fields(fields, formats, Keyword.merge(values, value), index, time_format)

      {:error, _} = error ->
        error
    end
  end

  def parse_field(field, "IP", index, _) do
    if length = String.length(field) > 46 do
      error_message = "[IP] exceed max length (46, got #{length}) at line #{index}"
      Logger.warn(error_message)
      {:error, error_message}
    else
      {:ok, [ip: field]}
    end
  end

  def parse_field(field, "Time", index, time_format) do
    case Timex.Parse.DateTime.Parser.parse(field, time_format) do
      {:ok, %DateTime{} = datetime} ->
        # drop timezone
        {:ok, [time: DateTime.to_naive(datetime)]}

      {:ok, %NaiveDateTime{} = datetime} ->
        {:ok, [time: datetime]}

      {:error, reason} ->
        error_message = "[Time] format error at line #{index}: #{inspect(reason)}"
        Logger.warn(error_message)
        {:error, error_message}
    end
  end

  def parse_field(field, "RequestMethod", index, _) do
    if length = String.length(field) > 10 do
      error_message = "[RequestMethod] exceed max length (10, got #{length}) at line #{index}"
      Logger.warn(error_message)
      {:error, error_message}
    else
      {:ok, [request_method: field]}
    end
  end

  def parse_field(field, "RequestURL", index, _) do
    url = URI.parse(field)

    if url.path == nil do
      error_message = "[RequestURL] format error at line #{index}"
      Logger.warn(error_message)
      {:error, error_message}
    else
      {:ok,
       [
         url_path: url.path,
         url_query: if(url.query == nil, do: "", else: url.query),
         url_is_static: is_static(url.path)
       ]}
    end
  end

  def parse_field(field, "HTTPVersion", index, _) do
    if length = String.length(field) > 10 do
      error_message = "[HTTPVersion] exceed max length (10, got #{length}) at line #{index}"
      Logger.warn(error_message)
      {:error, error_message}
    else
      {:ok, [http_version: field]}
    end
  end

  def parse_field(field, "ResponseCode", index, _) do
    case Integer.parse(field) do
      {code, ""} ->
        try do
          Plug.Conn.Status.reason_atom(code)
          {:ok, [response_code: code]}
        rescue
          e in ArgumentError ->
            error_message = "[ResponseCode] format error at line #{index}: #{e.message}"
            Logger.warn(error_message)
            {:error, error_message}
        end

      _ ->
        error_message = "[ResponseCode] format error at line #{index}: invalid integer"
        Logger.warn(error_message)
        {:error, error_message}
    end
  end

  def parse_field(field, "ResponseTime", index, _) do
    if field == "-" do
      # TODO: maybe {:ok, []}?
      {:ok, [response_time: 0]}
    else
      case Integer.parse(field) do
        {time, _} ->
          {:ok, [response_time: time]}

        :error ->
          error_message = "[ResponseTime] format error at line #{index}: invalid number"
          Logger.warn(error_message)
          {:error, error_message}
      end
    end
  end

  def parse_field(field, "ContentSize", index, _) do
    if field == "-" do
      # TODO: maybe {:ok, []}?
      {:ok, [content_size: 0]}
    else
      case Integer.parse(field) do
        {size, _} ->
          {:ok, [content_size: size]}

        :error ->
          error_message = "[ContentSize] format error at line #{index}: invalid number"
          Logger.warn(error_message)
          {:error, error_message}
      end
    end
  end

  def parse_field(field, "UserAgent", _index, _) do
    result = UAInspector.parse(field)

    {:ok,
     [
       ua_browser: ua_browser(result),
       ua_os: ua_os(result),
       ua_device: ua_device(result)
     ]}
  end

  def parse_field(field, "Referrer", _index, _) do
    if field == "-" do
      # TODO: maybe {:ok, []}?
      {:ok, [referrer_site: "", referrer_path: "", referrer_query: ""]}
    else
      referrer = URI.parse(field)

      if referrer.scheme == nil || referrer.path == nil do
        # TODO: maybe {:ok, []}?
        {:ok, [referrer_site: "", referrer_path: "", referrer_query: ""]}
      else
        {:ok,
         [
           referrer_site: referrer.scheme <> referrer.path,
           referrer_path: referrer.path,
           referrer_query: if(referrer.query == nil, do: "", else: referrer.query)
         ]}
      end
    end
  end

  defp is_static(url_path) do
    if String.contains?(url_path, ".") do
      Enum.any?(
        non_static_exts(),
        fn ext ->
          url_path
          |> String.split(".")
          |> List.last()
          |> String.split()
          |> List.first()
          |> String.downcase()
          |> String.starts_with?(ext)
        end
      )
    else
      false
    end
  end

  defp non_static_exts() do
    [
      "html",
      "htm",
      "shtml",
      "shtm",
      "xml",
      "php",
      "jsp",
      "asp",
      "aspx",
      "cgi",
      "perl",
      "do"
    ]
  end

  defp ua_browser(result) do
    case result do
      %UAInspector.Result{} ->
        if result.client != :unknown && result.client.name != :unknown,
          do: result.client.name,
          else: "Unkonwn"

      %UAInspector.Result.Bot{} ->
        if result.name != :unknown, do: result.name, else: "Unknown"
    end
  end

  defp ua_os(result) do
    case result do
      %UAInspector.Result{} ->
        if result.os != :unknown && result.os.name != :unknown,
          do: result.os.name,
          else: "Unkonwn"

      %UAInspector.Result.Bot{} ->
        "Unknown"
    end
  end

  defp ua_device(result) do
    case result do
      %UAInspector.Result{} ->
        if result.device != :unknown && result.device.type != :unknown,
          do: result.device.type,
          else: "Unkonwn"

      %UAInspector.Result.Bot{} ->
        "Unknown"
    end
  end
end
