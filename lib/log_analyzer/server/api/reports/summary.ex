defmodule LogAnalyzer.Server.API.Reports.Summary do
  require Logger
  alias LogAnalyzer.Repo
  import Plug.Conn
  import Ecto.Query, only: [from: 2]
  import LogAnalyzer.Server.API.Util

  def get_summary(conn, id) do
    with {:ok, file_name} <- file_name(id),
         {:ok, file_size} <- file_size(file_name),
         {:ok, start_time} <- start_time(id),
         {:ok, end_time} <- end_time(id),
         {:ok, page_views} <- page_views(id),
         {:ok, user_views} <- user_views(id),
         {:ok, bandwidth} <- bandwidth(id) do
      send_resp(
        conn,
        200,
        Poison.encode!(%{
          fileName: file_name,
          fileSize: file_size,
          startTime: start_time,
          endTime: end_time,
          pageViews: page_views,
          userViews: user_views,
          bandwidth: bandwidth
        })
      )
    else
      {:error, message} ->
        Logger.error(message)
        send_error(conn, message)
    end
  end

  defp file_name(id) do
    query =
      from r in "report",
        select: r.file,
        where: r.id == type(^id, :id)

    case Repo.one(query) do
      nil -> {:error, "Invalid report id"}
      file -> {:ok, file}
    end
  end

  defp file_size(file_name) do
    case File.stat(file_name) do
      {:ok, %{size: size}} -> {:ok, size}
      {:error, reason} -> {:error, "Get log file stat error: #{reason}"}
    end
  end

  defp start_time(id) do
    query =
      from log in "log_#{id}",
        select: type(log.time, :string),
        order_by: [asc: log.id],
        limit: 1

    case Repo.one(query) do
      nil -> {:error, "Query start_time error"}
      time -> {:ok, time}
    end
  end

  defp end_time(id) do
    query =
      from log in "log_#{id}",
        select: type(log.time, :string),
        order_by: [desc: log.id],
        limit: 1

    case Repo.one(query) do
      nil -> {:error, "Query end_time error"}
      time -> {:ok, time}
    end
  end

  defp page_views(id) do
    query =
      from log in "log_#{id}",
        select: count(log.id)

    case Repo.one(query) do
      nil -> {:error, "Query page_views error"}
      count -> {:ok, count}
    end
  end

  defp user_views(id) do
    query =
      from log in "log_#{id}",
        select: count(log.ip, :distinct)

    case Repo.one(query) do
      nil -> {:error, "Query user_views error"}
      count -> {:ok, count}
    end
  end

  defp bandwidth(id) do
    query =
      from log in "log_#{id}",
        select: sum(log.content_size)

    case Repo.one(query) do
      nil -> {:error, "Query bandwidth error"}
      sum -> {:ok, sum}
    end
  end
end
