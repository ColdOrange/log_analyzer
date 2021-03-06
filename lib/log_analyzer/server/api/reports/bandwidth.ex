defmodule LogAnalyzer.Server.API.Reports.Bandwidth do
  require Logger
  alias LogAnalyzer.Repo
  import Plug.Conn
  import Ecto.Query, only: [from: 2]
  import LogAnalyzer.Server.API.Util

  def get_bandwidth_daily(conn, id) do
    query =
      from log in "log_#{id}",
        select: %{
          time: type(fragment("date(?)", log.time), :string),
          bandwidth: sum(log.content_size)
        },
        group_by: fragment("date(?)", log.time),
        order_by: [asc: fragment("date(?)", log.time)]

    send_resp(conn, 200, Poison.encode!(Repo.all(query)))
  end

  def get_bandwidth_hourly(conn, id) do
    case fetch_query_params(conn) do
      %{query_params: %{"date" => date}} ->
        # Plug.Logger doesn't print query string, so add here
        Logger.info("GET #{conn.request_path}?#{conn.query_string}")

        query =
          from log in "log_#{id}",
            select: %{
              time: fragment("date_part('hour', ?)", log.time),
              bandwidth: sum(log.content_size)
            },
            group_by: fragment("date_part('hour', ?)", log.time),
            order_by: [asc: fragment("date_part('hour', ?)", log.time)],
            where: fragment("date(?)", log.time) == type(^date, :date)

        send_resp(conn, 200, Poison.encode!(Repo.all(query)))

      _ ->
        send_error(conn, "'date' query param not found")
    end
  end

  def get_bandwidth_monthly(conn, id) do
    query =
      from log in "log_#{id}",
        select: %{
          time: type(fragment("date_trunc('month', ?)", log.time), :string),
          bandwidth: sum(log.content_size)
        },
        group_by: fragment("date_trunc('month', ?)", log.time),
        order_by: [asc: fragment("date_trunc('month', ?)", log.time)]

    send_resp(
      conn,
      200,
      query
      |> Repo.all()
      |> Enum.map(fn %{time: time, bandwidth: bandwidth} ->
        %{time: String.slice(time, 0, 7), bandwidth: bandwidth}
      end)
      |> Poison.encode!()
    )
  end
end
