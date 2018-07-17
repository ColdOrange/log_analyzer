defmodule LogAnalyzer.Server.API.Reports.Response do
  require Logger
  alias LogAnalyzer.Repo
  import Plug.Conn
  import Ecto.Query, only: [from: 2]

  def get_status_code(conn, id) do
    query =
      from log in "log_#{id}",
        select: %{
          statusCode: log.response_code,
          count: count(log.id)
        },
        group_by: log.response_code,
        order_by: [desc: count(log.id)]

    send_resp(
      conn,
      200,
      query
      |> Repo.all()
      |> Enum.map(fn map ->
        %{
          map
          | statusCode: "#{map[:statusCode]} #{Plug.Conn.Status.reason_phrase(map[:statusCode])}"
        }
      end)
      |> Poison.encode!()
    )
  end

  # def get_response_time(conn, id) do
  #   case_when_fragment = """
  #   CASE
  #   WHEN ? < 50               THEN '<50ms'
  #   WHEN ? >= 50  AND ? < 100 THEN '50~100ms'
  #   WHEN ? >= 100 AND ? < 200 THEN '100~200ms'
  #   WHEN ? >= 200 AND ? < 300 THEN '200~300ms'
  #   WHEN ? >= 300 AND ? < 400 THEN '300~400ms'
  #   WHEN ? >= 400 AND ? < 500 THEN '400~500ms'
  #   ELSE                           '>500ms'
  #   END
  #   """

  #   query =
  #     from log in "log_#{id}",
  #       select: %{
  #         timeRange: fragment(case_when_fragment, log.response_time),
  #         count: count(log.id)
  #       },
  #       group_by: fragment(case_when_fragment, log.response_time),
  #       order_by: [desc: count(log.id)]

  #   send_resp(conn, 200, Poison.encode!(Repo.all(query)))
  # end

  def get_response_time(conn, id) do
    result = [
      %{timeRange: "<50ms", count: count_response_time_range(id, 0, 50)},
      %{timeRange: "50~100ms", count: count_response_time_range(id, 50, 100)},
      %{timeRange: "100~200ms", count: count_response_time_range(id, 100, 200)},
      %{timeRange: "200~300ms", count: count_response_time_range(id, 200, 300)},
      %{timeRange: "300~400ms", count: count_response_time_range(id, 300, 400)},
      %{timeRange: "400~500ms", count: count_response_time_range(id, 400, 500)},
      %{timeRange: ">500ms", count: count_response_time_range(id, 500, nil)}
    ]

    send_resp(conn, 200, Poison.encode!(result))
  end

  defp count_response_time_range(id, left, nil) do
    Repo.one(
      from log in "log_#{id}",
        select: count(log.id),
        where: log.response_time >= ^left
    )
  end

  defp count_response_time_range(id, left, right) do
    Repo.one(
      from log in "log_#{id}",
        select: count(log.id),
        where: log.response_time >= ^left and log.response_time < ^right
    )
  end

  def get_response_url(conn, id) do
    query =
      from log in "log_#{id}",
        select: %{
          url: log.url_path,
          pv: count(log.id),
          avg: avg(log.response_time),
          stdDev: fragment("stddev(?)", log.response_time)
        },
        where: log.url_is_static == false,
        group_by: log.url_path,
        order_by: [desc: count(log.id)]

    send_resp(
      conn,
      200,
      query
      |> Repo.all()
      |> Enum.map(fn map ->
        %{
          map
          | avg: map[:avg] |> Decimal.to_float() |> Float.floor(2),
            stdDev:
              unless(
                map[:stdDev] == nil,
                do: map[:stdDev] |> Decimal.to_float() |> Float.floor(2),
                else: 0
              )
        }
      end)
      |> Poison.encode!()
    )
  end
end
