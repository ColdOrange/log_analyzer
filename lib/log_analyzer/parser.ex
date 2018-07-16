defmodule LogAnalyzer.Parser do
  require Logger
  alias LogAnalyzer.{LogConfig, Repo}
  alias LogAnalyzer.Repo.{Migrator, Report}

  def parse(%LogConfig{
        log_file: log_file,
        log_pattern: log_pattern,
        log_format: log_format,
        time_format: time_format
      }) do
    with {:ok, pattern} <- compile_log_pattern(log_pattern),
         :ok <- validate_log_file(log_file),
         {:ok, id} <- insert_report_table(log_file),
         :ok <- Migrator.create_log_table(id) do
      parse_file(id, log_file, pattern, log_format, time_format)
    else
      {:error, message} ->
        Logger.error(message)
        {:error, message}
    end
  end

  defp compile_log_pattern(log_pattern) do
    case Regex.compile(log_pattern) do
      {:ok, pattern} -> {:ok, pattern}
      {:error, reason} -> {:error, "Log pattern compile error: #{reason}"}
    end
  end

  defp validate_log_file(log_file) do
    case File.open(log_file) do
      {:ok, file} ->
        File.close(file)
        :ok

      {:error, reason} ->
        {:error, "Open log file error: #{reason}"}
    end
  end

  defp insert_report_table(log_file) do
    case Repo.insert(%Report{file: log_file}) do
      {:ok, report} -> {:ok, report.id}
      {:error, _} -> {:error, "Insert report table error"}
    end
  end

  defp parse_file(log_id, log_file, log_pattern, log_format, time_format) do
    Logger.info("Starting parsing log file [#{log_file}]")
    zero = System.monotonic_time()

    File.stream!(log_file)
    |> Stream.map(&String.trim_trailing/1)
    |> Stream.with_index()
    |> Stream.chunk_every(100)
    |> Stream.each(fn batch ->
      Repo.insert_all(
        "log_#{log_id}",
        batch
        |> Stream.map(fn {line, index} ->
          case parse_line(line, log_pattern, log_format, time_format) do
            {:ok, values} ->
              values

            {:error, reason} ->
              Logger.warn(reason <> " at line #{index + 1}")
              []
          end
        end)
        |> Enum.to_list()
      )
    end)
    |> Stream.run()

    diff = System.monotonic_time() - zero
    seconds = System.convert_time_unit(diff, :native, :milli_seconds) / 1000
    Logger.info("Finished parsing log file in #{seconds}s")
    :ok
  end

  defp parse_line(line, pattern, formats, time_format) do
    case Regex.run(pattern, line) do
      [_ | fields] when length(fields) == length(formats) ->
        parse_fields(fields, formats, Keyword.new(), time_format)

      _ ->
        {:error, "Log format error: regex not match"}
    end
  end

  defp parse_fields([], [], values, _) do
    {:ok, values}
  end

  defp parse_fields([field | fields], [format | formats], values, time_format) do
    case parse_field(field, format, time_format) do
      {:ok, value} ->
        parse_fields(fields, formats, Keyword.merge(values, value), time_format)

      {:error, _} = error ->
        error
    end
  end

  defp parse_field(field, "IP", _) do
    if length = String.length(field) > 46 do
      {:error, "[IP] format error: exceed max length (46, got #{length})"}
    else
      {:ok, [ip: field]}
    end
  end

  # TODO: remove time_format
  defp parse_field(field, "Time", time_format) do
    case Timex.Parse.DateTime.Parser.parse(field, time_format) do
      {:ok, %DateTime{} = datetime} ->
        # drop timezone
        {:ok, [time: DateTime.to_naive(datetime)]}

      {:ok, %NaiveDateTime{} = datetime} ->
        {:ok, [time: datetime]}

      {:error, reason} ->
        {:error, "[Time] format error: #{reason}"}
    end
  end

  defp parse_field(field, "RequestMethod", _) do
    if length = String.length(field) > 10 do
      {:error, "[RequestMethod] format error: exceed max length (10, got #{length})"}
    else
      {:ok, [request_method: field]}
    end
  end

  defp parse_field(field, "RequestURL", _) do
    url = URI.parse(field)

    if url.path == nil do
      {:error, "[RequestURL] format error: url path not found"}
    else
      {:ok,
       [
         url_path: url.path,
         url_query: url.query,
         url_is_static: url_is_static(url.path)
       ]}
    end
  end

  defp parse_field(field, "HTTPVersion", _) do
    if length = String.length(field) > 10 do
      {:error, "[HTTPVersion] format error: exceed max length (10, got #{length})"}
    else
      {:ok, [http_version: field]}
    end
  end

  defp parse_field(field, "ResponseCode", _) do
    case Integer.parse(field) do
      {code, ""} ->
        try do
          Plug.Conn.Status.reason_atom(code)
          {:ok, [response_code: code]}
        rescue
          _ -> {:error, "[ResponseCode] format error: unknown status code"}
        end

      _ ->
        {:error, "[ResponseCode] format error: invalid integer"}
    end
  end

  defp parse_field(field, "ResponseTime", _) do
    if field == "-" do
      {:ok, []}
    else
      case Integer.parse(field) do
        {time, _} ->
          {:ok, [response_time: time]}

        :error ->
          {:error, "[ResponseTime] format error: invalid number"}
      end
    end
  end

  defp parse_field(field, "ContentSize", _) do
    if field == "-" do
      {:ok, []}
    else
      case Integer.parse(field) do
        {size, _} ->
          {:ok, [content_size: size]}

        :error ->
          {:error, "[ContentSize] format error: invalid number"}
      end
    end
  end

  defp parse_field(field, "UserAgent", __) do
    result = UAInspector.parse(field)

    {:ok,
     [
       ua_browser: ua_browser(result),
       ua_os: ua_os(result),
       ua_device: ua_device(result)
     ]}
  end

  defp parse_field(field, "Referrer", _) do
    if field == "-" do
      {:ok, []}
    else
      referrer = URI.parse(field)

      {:ok,
       [
         referrer_site: referrer_site(referrer.scheme, referrer.host),
         referrer_path: referrer.path,
         referrer_query: referrer.query
       ]}
    end
  end

  defp url_is_static(url_path) do
    if String.contains?(url_path, ".") do
      not Enum.member?(
        non_static_exts(),
        url_path
        |> String.split(".")
        |> List.last()
        |> String.downcase()
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
          else: "Unknown"

      %UAInspector.Result.Bot{} ->
        if result.name != :unknown, do: result.name, else: "Unknown"
    end
  end

  defp ua_os(result) do
    case result do
      %UAInspector.Result{} ->
        if result.os != :unknown && result.os.name != :unknown,
          do: result.os.name,
          else: "Unknown"

      %UAInspector.Result.Bot{} ->
        nil
    end
  end

  defp ua_device(result) do
    case result do
      %UAInspector.Result{} ->
        if result.device != :unknown && result.device.type != :unknown,
          do: result.device.type,
          else: "Unknown"

      %UAInspector.Result.Bot{} ->
        nil
    end
  end

  defp referrer_site(_, nil), do: nil
  defp referrer_site(nil, host), do: "http://" <> host
  defp referrer_site(scheme, host), do: scheme <> "://" <> host
end
